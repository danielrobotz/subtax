'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, Edit, Check, Loader2 } from 'lucide-react';
import { transcribeAudio } from '@/lib/whisper';

export function TranscriptionPanel() {
  const {
    currentProject,
    setTranscription,
    updateWord,
    isTranscribing,
    setIsTranscribing,
  } = useProjectStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const handleTranscribe = async () => {
    if (!currentProject?.audioUrl) return;

    setIsTranscribing(true);
    try {
      // Fetch the audio file
      const response = await fetch(currentProject.audioUrl);
      const audioBlob = await response.blob();
      
      // Transcribe using Whisper
      const transcription = await transcribeAudio(audioBlob);
      setTranscription(transcription);
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to transcribe audio. Please check your OpenAI API key.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleEditStart = () => {
    if (currentProject?.transcription) {
      setEditText(currentProject.transcription.text);
      setIsEditing(true);
    }
  };

  const handleEditSave = () => {
    // Parse edited text back into words
    const words = editText.split(/\s+/).filter(w => w.length > 0);
    if (currentProject?.transcription) {
      const originalWords = currentProject.transcription.words;
      const newWords = words.map((text, i) => ({
        text,
        start: originalWords[i]?.start || 0,
        end: originalWords[i]?.end || 0,
        confidence: originalWords[i]?.confidence || 1,
      }));
      
      setTranscription({
        words: newWords,
        text: editText,
      });
    }
    setIsEditing(false);
  };

  if (!currentProject) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Transcription
          </CardTitle>
          {currentProject.transcription && (
            <Badge variant={currentProject.transcriptionEdited ? 'secondary' : 'default'}>
              {currentProject.transcriptionEdited ? 'Edited' : 'Auto'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!currentProject.transcription ? (
          <div className="text-center py-8">
            <Button
              onClick={handleTranscribe}
              disabled={isTranscribing || !currentProject.audioUrl}
              size="lg"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transcribing...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Transcription
                </>
              )}
            </Button>
            {!currentProject.audioUrl && (
              <p className="text-sm text-muted-foreground mt-2">
                Upload audio first to transcribe
              </p>
            )}
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[200px]"
              placeholder="Edit transcription..."
            />
            <div className="flex gap-2">
              <Button onClick={handleEditSave}>
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg max-h-[300px] overflow-y-auto">
              <p className="text-sm leading-relaxed">
                {currentProject.transcription.text}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEditStart}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Text
              </Button>
              <Button variant="outline" onClick={handleTranscribe} disabled={isTranscribing}>
                {isTranscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Retranscribing...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Retranscribe
                  </>
                )}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {currentProject.transcription.words.length} words detected
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
