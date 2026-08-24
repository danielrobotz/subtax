'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Download, Film, Loader2 } from 'lucide-react';
import { ExportSettings } from '@/types';
import { exportVideo, ExportProgress } from '@/lib/videoExport';

const PHASE_LABEL: Record<ExportProgress['phase'], string> = {
  loading: 'Loading video encoder…',
  rendering: 'Rendering subtitle frames…',
  encoding: 'Encoding video…',
  done: 'Done',
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ExportPanel() {
  const { currentProject, isExporting, exportProgress, setIsExporting, setExportProgress } = useProjectStore();
  const [settings, setSettings] = useState<ExportSettings>({
    resolution: '1080p',
    frameRate: 30,
    format: 'mp4',
    quality: 'high',
  });
  const [phaseLabel, setPhaseLabel] = useState('');

  const handleExport = async () => {
    if (!currentProject) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      const blob = await exportVideo(currentProject, settings, ({ phase, progress }) => {
        setPhaseLabel(PHASE_LABEL[phase]);
        setExportProgress(Math.round(progress * 100));
      });

      downloadBlob(blob, `${currentProject.title || 'subtax-export'}.mp4`);
    } catch (error) {
      console.error('Export error:', error);
      alert(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setPhaseLabel('');
    }
  };

  if (!currentProject) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="w-5 h-5" />
          Export Video
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Resolution</Label>
            <Select
              value={settings.resolution}
              onValueChange={(value: ExportSettings['resolution'] | null) => value && setSettings({ ...settings, resolution: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720p">720p (HD)</SelectItem>
                <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                <SelectItem value="4k">4K (Ultra HD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Frame Rate</Label>
            <Select
              value={settings.frameRate.toString()}
              onValueChange={(value) => value && setSettings({ ...settings, frameRate: parseInt(value) as 24 | 30 | 60 })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 fps (Cinematic)</SelectItem>
                <SelectItem value="30">30 fps (Standard)</SelectItem>
                <SelectItem value="60">60 fps (Smooth)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Quality</Label>
          <Select
            value={settings.quality}
            onValueChange={(value: ExportSettings['quality'] | null) => value && setSettings({ ...settings, quality: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (Fast)</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="maximum">Maximum (Slow)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{phaseLabel}</span>
              <span>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} />
          </div>
        )}

        <Button
          onClick={handleExport}
          disabled={isExporting || !currentProject.transcription}
          size="lg"
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Video
            </>
          )}
        </Button>

        {!currentProject.transcription && (
          <p className="text-sm text-muted-foreground text-center">
            Transcribe your audio first to enable export
          </p>
        )}
      </CardContent>
    </Card>
  );
}
