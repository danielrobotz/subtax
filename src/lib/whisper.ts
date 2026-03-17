import OpenAI from 'openai';
import { Transcription } from '@/types';

// Initialize OpenAI client
// In production, this should use an environment variable
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export async function transcribeAudio(audioBlob: Blob): Promise<Transcription> {
  const file = new File([audioBlob], 'audio.mp3', { type: 'audio/mp3' });
  
  const response = await openai.audio.transcriptions.create({
    file: file,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['word'],
  });

  // Parse the response
  const words = response.words?.map((w: any) => ({
    text: w.word || w.text || '',
    start: w.start || 0,
    end: w.end || 0,
    confidence: w.confidence || 1,
  })) || [];

  return {
    words,
    text: response.text || words.map(w => w.text).join(' '),
  };
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
