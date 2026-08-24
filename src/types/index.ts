export interface Word {
  text: string;
  start: number;
  end: number;
  confidence?: number;
}

export interface Transcription {
  words: Word[];
  text: string;
}

export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  textColor: string;
  highlightColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  strokeWidth: number;
  strokeColor: string;
  shadowBlur: number;
  shadowColor: string;
  position: 'top' | 'center' | 'bottom';
  alignment: 'left' | 'center' | 'right';
  padding: number;
  borderRadius: number;
}

export type AnimationStyle = 'word-pop' | 'karaoke' | 'fade';

export interface BackgroundConfig {
  type: 'color' | 'image';
  color: string;
  imageUrl?: string;
}

export interface AudioConfig {
  originalVolume: number;
  replacedAudioUrl?: string;
  useReplacedAudio: boolean;
}

export interface Project {
  id: string;
  title: string;
  status: 'draft' | 'processing' | 'ready' | 'error';
  originalMediaUrl?: string;
  audioUrl?: string;
  outputVideoUrl?: string;
  transcription?: Transcription;
  transcriptionEdited: boolean;
  subtitleStyle: SubtitleStyle;
  animationStyle: AnimationStyle;
  backgroundConfig: BackgroundConfig;
  audioConfig: AudioConfig;
  aspectRatio: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportSettings {
  resolution: '720p' | '1080p' | '4k';
  frameRate: 24 | 30 | 60;
  // WebM (libvpx-vp9) is not offered: it crashes the single-threaded
  // ffmpeg.wasm core with a wasm runtime trap regardless of encoding flags.
  format: 'mp4';
  quality: 'low' | 'medium' | 'high' | 'maximum';
}
