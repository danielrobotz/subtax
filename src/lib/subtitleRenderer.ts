import { AnimationStyle, BackgroundConfig, SubtitleStyle, Word } from '@/types';

// Shared between the live CanvasPreview (a looping demo clock) and the
// frame-by-frame video export pipeline, so exported video matches the preview.

export function getActiveWords(words: Word[], time: number): Word[] {
  // Show words from 2 seconds before to 2 seconds after current time
  return words.filter((w) => w.start <= time + 2 && w.end >= time - 2);
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  backgroundConfig: BackgroundConfig | undefined,
  width: number,
  height: number
) {
  ctx.fillStyle = backgroundConfig?.type === 'color' ? backgroundConfig.color || '#000000' : '#000000';
  ctx.fillRect(0, 0, width, height);
}

export function drawWord(
  ctx: CanvasRenderingContext2D,
  subtitleStyle: SubtitleStyle,
  animationStyle: AnimationStyle | undefined,
  word: Word,
  time: number,
  x: number,
  y: number
) {
  const isActive = time >= word.start && time <= word.end;
  const progress = Math.min(1, Math.max(0, (time - word.start) / (word.end - word.start)));

  ctx.save();
  ctx.font = `${subtitleStyle.fontWeight} ${subtitleStyle.fontSize}px ${subtitleStyle.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  switch (animationStyle) {
    case 'word-pop':
      if (isActive) {
        const scale = 1 + Math.sin(progress * Math.PI) * 0.1;
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.translate(-x, -y);
        ctx.fillStyle = subtitleStyle.highlightColor;
      } else {
        ctx.fillStyle = subtitleStyle.textColor;
      }
      break;

    case 'karaoke':
      ctx.fillStyle = subtitleStyle.textColor;
      ctx.globalAlpha = 0.3;
      ctx.fillText(word.text, x, y);

      ctx.globalAlpha = 1;
      ctx.fillStyle = subtitleStyle.highlightColor;
      if (isActive) {
        ctx.beginPath();
        ctx.rect(x - 100, y - 50, 200 * progress, 100);
        ctx.clip();
      }
      break;

    case 'fade':
      ctx.globalAlpha = isActive ? 1 : 0.3;
      ctx.fillStyle = isActive ? subtitleStyle.highlightColor : subtitleStyle.textColor;
      break;

    default:
      ctx.fillStyle = isActive ? subtitleStyle.highlightColor : subtitleStyle.textColor;
  }

  if (subtitleStyle.strokeWidth > 0) {
    ctx.strokeStyle = subtitleStyle.strokeColor;
    ctx.lineWidth = subtitleStyle.strokeWidth;
    ctx.strokeText(word.text, x, y);
  }

  if (subtitleStyle.shadowBlur > 0) {
    ctx.shadowColor = subtitleStyle.shadowColor;
    ctx.shadowBlur = subtitleStyle.shadowBlur;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }

  ctx.fillText(word.text, x, y);
  ctx.restore();
}

export function drawSubtitleFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  words: Word[],
  subtitleStyle: SubtitleStyle | undefined,
  animationStyle: AnimationStyle | undefined
) {
  if (!subtitleStyle || !words.length) return;

  const activeWords = getActiveWords(words, time);
  if (!activeWords.length) return;

  let y = height / 2;
  if (subtitleStyle.position === 'top') y = height * 0.15;
  if (subtitleStyle.position === 'bottom') y = height * 0.85;

  const totalWidth = activeWords.reduce((sum, word) => {
    ctx.font = `${subtitleStyle.fontWeight} ${subtitleStyle.fontSize}px ${subtitleStyle.fontFamily}`;
    return sum + ctx.measureText(word.text + ' ').width;
  }, 0);

  let x = (width - totalWidth) / 2;

  activeWords.forEach((word) => {
    drawWord(ctx, subtitleStyle, animationStyle, word, time, x + ctx.measureText(word.text).width / 2, y);
    x += ctx.measureText(word.text + ' ').width;
  });
}
