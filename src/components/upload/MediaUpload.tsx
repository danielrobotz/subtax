'use client';

import { useCallback, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Video, Music, FileVideo, FileAudio } from 'lucide-react';

export function MediaUpload() {
  const { createProject, setMedia, setIsUploading, isUploading } = useProjectStore();
  const [dragActive, setDragActive] = useState(false);
  const [uploadType, setUploadType] = useState<'video' | 'audio' | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      await handleFile(files[0]);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      // Create object URL for the file
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');
      
      if (!isVideo && !isAudio) {
        alert('Please upload a video or audio file');
        return;
      }

      // Create project
      const project = createProject(file.name);
      
      // Set media
      if (isVideo) {
        setMedia(url, 'video');
        setUploadType('video');
      } else {
        setMedia(url, 'audio');
        setUploadType('audio');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Upload Your Media</h2>
          <p className="text-muted-foreground">
            Upload a video or audio file to generate subtitles
          </p>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Drag and drop your file here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Video className="w-3 h-3" /> MP4, MOV, WebM
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Music className="w-3 h-3" /> MP3, WAV, AAC
              </Badge>
            </div>

            <input
              type="file"
              accept="video/*,audio/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="mt-4">
              <Button variant="outline" type="button">
                Select File
              </Button>
            </label>
          </div>
        </div>

        {isUploading && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Uploading...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
