'use client';

import { useProjectStore } from '@/store/projectStore';
import { MediaUpload } from '@/components/upload/MediaUpload';
import { CanvasPreview } from '@/components/preview/CanvasPreview';
import { TranscriptionPanel } from '@/components/transcribe/TranscriptionPanel';
import { StyleEditor } from '@/components/editor/StyleEditor';
import { ExportPanel } from '@/components/export/ExportPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Film, Type, Mic, Download, ArrowLeft } from 'lucide-react';

export default function EditorPage() {
  const { currentProject, setCurrentProject } = useProjectStore();

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <Film className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">Subtax</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <MediaUpload />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentProject(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Film className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">Subtax</h1>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentProject.title}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Preview */}
          <div className="lg:col-span-2 space-y-6">
            <CanvasPreview width={640} height={360} />
            
            <Tabs defaultValue="transcribe" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transcribe" className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Transcribe
                </TabsTrigger>
                <TabsTrigger value="style" className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Style
                </TabsTrigger>
                <TabsTrigger value="export" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transcribe">
                <TranscriptionPanel />
              </TabsContent>

              <TabsContent value="style">
                <StyleEditor />
              </TabsContent>

              <TabsContent value="export">
                <ExportPanel />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Quick Settings */}
          <div className="space-y-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-4">Project Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="capitalize">{currentProject.status}</span>
                </div>
                {currentProject.transcription && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Words</span>
                    <span>{currentProject.transcription.words.length}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Animation</span>
                  <span className="capitalize">{currentProject.animationStyle.replace('-', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-4">Quick Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>1. Upload your video or audio</li>
                <li>2. Transcribe the audio</li>
                <li>3. Edit transcription if needed</li>
                <li>4. Customize subtitle style</li>
                <li>5. Export your video</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
