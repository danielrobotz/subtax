'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { drawBackground, drawSubtitleFrame } from '@/lib/subtitleRenderer';

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

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    drawBackground(ctx, backgroundConfig, width, height);

    if (transcription?.words?.length) {
      drawSubtitleFrame(ctx, width, height, currentTimeRef.current, transcription.words, subtitleStyle, animationStyle);
    }
  }, [animationStyle, backgroundConfig, height, subtitleStyle, transcription, width]);

  // Animation loop
  useEffect(() => {
    const startTime = Date.now();

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
