'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Word, AnimationStyle, SubtitleStyle } from '@/types';

interface CanvasPreviewProps {
  width?: number;
  height?: number;
}

export function CanvasPreview({ width = 640, height = 360 }: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const currentTimeRef = useRef<number>(0);
  
  const { currentProject } = useProjectStore();
  const { transcription, subtitleStyle, animationStyle, backgroundConfig } = currentProject || {};

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    if (backgroundConfig?.type === 'color') {
      ctx.fillStyle = backgroundConfig.color || '#000000';
      ctx.fillRect(0, 0, width, height);
    } else if (backgroundConfig?.imageUrl) {
      // Image background would be drawn here
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
    }
  }, [backgroundConfig, width, height]);

  const getActiveWords = useCallback((words: Word[], time: number): Word[] => {
    // Get words that should be visible at current time
    // Show words from 2 seconds before to 2 seconds after current time
    return words.filter(w => w.start <= time + 2 && w.end >= time - 2);
  }, []);

  const drawSubtitleBackground = useCallback((ctx: CanvasRenderingContext2D, text: string, x: number, y: number) => {
    const { subtitleStyle } = currentProject || {};
    if (!subtitleStyle) return;

    ctx.save();
    ctx.font = `${subtitleStyle.fontWeight} ${subtitleStyle.fontSize}px ${subtitleStyle.fontFamily}`;
    const metrics = ctx.measureText(text);
    const padding = subtitleStyle.padding;
    const boxWidth = metrics.width + padding * 2;
    const boxHeight = subtitleStyle.fontSize + padding * 2;

    // Draw background box
    ctx.fillStyle = subtitleStyle.backgroundColor;
    ctx.globalAlpha = subtitleStyle.backgroundOpacity;
    ctx.beginPath();
    ctx.roundRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, subtitleStyle.borderRadius);
    ctx.fill();
    ctx.restore();
  }, [currentProject]);

  const drawWord = useCallback((ctx: CanvasRenderingContext2D, word: Word, time: number, x: number, y: number) => {
    const { subtitleStyle, animationStyle } = currentProject || {};
    if (!subtitleStyle) return;

    const isActive = time >= word.start && time <= word.end;
    const progress = Math.min(1, Math.max(0, (time - word.start) / (word.end - word.start)));

    ctx.save();
    ctx.font = `${subtitleStyle.fontWeight} ${subtitleStyle.fontSize}px ${subtitleStyle.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Apply animation styles
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
        // Draw background text
        ctx.fillStyle = subtitleStyle.textColor;
        ctx.globalAlpha = 0.3;
        ctx.fillText(word.text, x, y);
        
        // Draw highlighted portion
        ctx.globalAlpha = 1;
        ctx.fillStyle = subtitleStyle.highlightColor;
        if (isActive) {
          // Clip to show only portion of text based on progress
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

    // Draw stroke
    if (subtitleStyle.strokeWidth > 0) {
      ctx.strokeStyle = subtitleStyle.strokeColor;
      ctx.lineWidth = subtitleStyle.strokeWidth;
      ctx.strokeText(word.text, x, y);
    }

    // Draw shadow
    if (subtitleStyle.shadowBlur > 0) {
      ctx.shadowColor = subtitleStyle.shadowColor;
      ctx.shadowBlur = subtitleStyle.shadowBlur;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    ctx.fillText(word.text, x, y);
    ctx.restore();
  }, [currentProject]);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    drawBackground(ctx);

    // Draw subtitles
    if (transcription?.words?.length) {
      const activeWords = getActiveWords(transcription.words, currentTimeRef.current);
      
      if (activeWords.length > 0) {
        // Calculate position based on subtitle style
        let y = height / 2;
        if (subtitleStyle?.position === 'top') y = height * 0.15;
        if (subtitleStyle?.position === 'bottom') y = height * 0.85;

        // Draw words
        const totalWidth = activeWords.reduce((sum, word) => {
          ctx.font = `${subtitleStyle?.fontWeight || 700} ${subtitleStyle?.fontSize || 48}px ${subtitleStyle?.fontFamily || 'Inter'}`;
          return sum + ctx.measureText(word.text + ' ').width;
        }, 0);

        let x = (width - totalWidth) / 2;
        
        activeWords.forEach((word) => {
          drawWord(ctx, word, currentTimeRef.current, x + ctx.measureText(word.text).width / 2, y);
          x += ctx.measureText(word.text + ' ').width;
        });
      }
    }
  }, [drawBackground, drawWord, getActiveWords, height, subtitleStyle?.position, transcription?.words, width]);

  // Animation loop
  useEffect(() => {
    let startTime = Date.now();
    
    const animate = () => {
      // Simulate time progression for preview (loop every 10 seconds)
      const elapsed = (Date.now() - startTime) / 1000;
      currentTimeRef.current = elapsed % 10;
      
      drawFrame();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawFrame]);

  // Redraw when styles change
  useEffect(() => {
    drawFrame();
  }, [subtitleStyle, animationStyle, backgroundConfig, drawFrame]);

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto bg-black"
      />
      {currentProject?.originalMediaUrl && (
        <video
          src={currentProject.originalMediaUrl}
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          muted
          loop
          autoPlay
        />
      )}
    </div>
  );
}
