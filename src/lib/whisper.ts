import { Transcription } from '@/types';

interface WhisperVerboseJsonResponse {
  text?: string;
  words?: Array<{
    word?: string;
    text?: string;
    start?: number;
    end?: number;
    confidence?: number;
  }>;
}

// Pure transform, kept separate from the network call so it can be unit tested
// without hitting the OpenAI API.
export function parseWhisperResponse(response: WhisperVerboseJsonResponse): Transcription {
  const words = (response.words ?? []).map((w) => ({
    text: w.word ?? w.text ?? '',
    start: w.start ?? 0,
    end: w.end ?? 0,
    confidence: w.confidence ?? 1,
  }));

  return {
    words,
    text: response.text || words.map((w) => w.text).join(' '),
  };
}

// Calls our server-side API route, which holds the OpenAI API key. The key
// must never be shipped to the browser, so this file has no OpenAI client.
export async function transcribeAudio(audioBlob: Blob): Promise<Transcription> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.mp3');

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Transcription request failed (${response.status})`);
  }

  return response.json();
}

// Fallback mock transcription for development/testing
export function getMockTranscription(): Transcription {
  const text = "Welcome to Subtax! This is a demo of our dynamic subtitle generation. You can upload any video or audio file and we'll automatically transcribe it with word-level timing. Then you can customize the subtitles with different styles and animations.";

  const words = text.split(/\s+/).map((word, i) => ({
    text: word,
    start: i * 0.3,
    end: (i + 1) * 0.3,
    confidence: 0.95,
  }));

  return { words, text };
}
