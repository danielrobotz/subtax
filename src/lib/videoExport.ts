import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { ExportSettings, Project } from '@/types';
import { drawBackground, drawSubtitleFrame } from '@/lib/subtitleRenderer';

export interface ExportProgress {
  phase: 'loading' | 'rendering' | 'encoding' | 'done';
  progress: number; // 0-1 within the current phase
}

const RESOLUTIONS: Record<ExportSettings['resolution'], { width: number; height: number }> = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
};

// Lower is higher quality on the libx264 CRF scale.
const QUALITY_CRF: Record<ExportSettings['quality'], number> = {
  low: 32,
  medium: 26,
  high: 20,
  maximum: 15,
};

let ffmpegSingleton: FFmpeg | null = null;

async function loadFFmpeg(onProgress?: (p: ExportProgress) => void): Promise<FFmpeg> {
  if (ffmpegSingleton?.loaded) return ffmpegSingleton;

  const ffmpeg = ffmpegSingleton ?? new FFmpeg();
  ffmpegSingleton = ffmpeg;

  onProgress?.({ phase: 'loading', progress: 0 });
  await ffmpeg.load({
    // Served unbundled from public/ (see scripts/copy-ffmpeg-core.mjs) so the
    // browser loads them as plain script/module workers rather than having
    // Turbopack try (and fail) to statically bundle worker.js's dynamic import.
    // Absolute URLs, since @ffmpeg/ffmpeg resolves classWorkerURL against
    // `import.meta.url` of its own (bundled) module, which Turbopack does not
    // report as the page origin.
    classWorkerURL: new URL('/ffmpeg/worker.js', window.location.href).toString(),
    coreURL: new URL('/ffmpeg/ffmpeg-core.js', window.location.href).toString(),
    wasmURL: new URL('/ffmpeg/ffmpeg-core.wasm', window.location.href).toString(),
  });
  onProgress?.({ phase: 'loading', progress: 1 });

  return ffmpeg;
}

function waitForEvent<K extends keyof HTMLMediaElementEventMap>(
  el: HTMLMediaElement,
  event: K
): Promise<void> {
  return new Promise((resolve, reject) => {
    const onError = () => {
      el.removeEventListener(event, onSuccess);
      el.removeEventListener('error', onError);
      reject(new Error(`Failed to load media (${event})`));
    };
    const onSuccess = () => {
      el.removeEventListener(event, onSuccess);
      el.removeEventListener('error', onError);
      resolve();
    };
    el.addEventListener(event, onSuccess);
    el.addEventListener('error', onError);
  });
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Failed to encode frame'));
        return;
      }
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, 'image/png');
  });
}

export async function exportVideo(
  project: Project,
  settings: ExportSettings,
  onProgress?: (p: ExportProgress) => void
): Promise<Blob> {
  if (!project.transcription) {
    throw new Error('Transcribe the audio before exporting.');
  }

  const mediaUrl = project.originalMediaUrl || project.audioUrl;
  if (!mediaUrl) {
    throw new Error('No media file to export.');
  }
  const hasVideo = Boolean(project.originalMediaUrl);

  const ffmpeg = await loadFFmpeg(onProgress);

  const media = document.createElement('video');
  media.muted = true;
  media.src = mediaUrl;
  media.preload = 'auto';
  await waitForEvent(media, 'loadedmetadata');

  const duration = media.duration;
  const fps = settings.frameRate;
  const { width, height } = RESOLUTIONS[settings.resolution];
  const totalFrames = Math.max(1, Math.ceil(duration * fps));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas is not supported in this browser.');
  }

  for (let frame = 0; frame < totalFrames; frame++) {
    const time = Math.min(frame / fps, duration);

    if (hasVideo) {
      media.currentTime = time;
      await waitForEvent(media, 'seeked');
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(media, 0, 0, width, height);
    } else {
      drawBackground(ctx, project.backgroundConfig, width, height);
    }

    drawSubtitleFrame(ctx, width, height, time, project.transcription.words, project.subtitleStyle, project.animationStyle);

    const png = await canvasToPng(canvas);
    const frameName = `frame_${String(frame).padStart(6, '0')}.png`;
    await ffmpeg.writeFile(frameName, png);

    onProgress?.({ phase: 'rendering', progress: (frame + 1) / totalFrames });
  }

  const mediaData = await fetchFile(mediaUrl);
  await ffmpeg.writeFile('input.media', mediaData);

  const outputName = 'output.mp4';

  const onFFmpegProgress = ({ progress }: { progress: number }) => {
    onProgress?.({ phase: 'encoding', progress: Math.min(1, Math.max(0, progress)) });
  };
  ffmpeg.on('progress', onFFmpegProgress);

  try {
    await ffmpeg.exec([
      '-framerate', String(fps),
      '-i', 'frame_%06d.png',
      '-i', 'input.media',
      '-map', '0:v:0',
      '-map', '1:a:0?',
      '-c:v', 'libx264',
      '-crf', String(QUALITY_CRF[settings.quality]),
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-shortest',
      outputName,
    ]);
  } finally {
    ffmpeg.off('progress', onFFmpegProgress);
  }

  const data = await ffmpeg.readFile(outputName);
  const bytes = data as Uint8Array;

  // Clean up the virtual filesystem so a later export starts fresh.
  for (let frame = 0; frame < totalFrames; frame++) {
    await ffmpeg.deleteFile(`frame_${String(frame).padStart(6, '0')}.png`).catch(() => {});
  }
  await ffmpeg.deleteFile('input.media').catch(() => {});
  await ffmpeg.deleteFile(outputName).catch(() => {});

  onProgress?.({ phase: 'done', progress: 1 });

  return new Blob([bytes as BlobPart], { type: 'video/mp4' });
}
