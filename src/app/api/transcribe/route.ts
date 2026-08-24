import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { parseWhisperResponse } from '@/lib/whisper';

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server is not configured with an OpenAI API key.' },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const audio = formData.get('audio');
  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: 'Missing audio file.' }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });
  const file = new File([audio], 'audio.mp3', { type: audio.type || 'audio/mp3' });

  try {
    const response = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });

    return NextResponse.json(parseWhisperResponse(response));
  } catch (error) {
    console.error('Whisper transcription failed:', error);
    return NextResponse.json({ error: 'Transcription failed.' }, { status: 502 });
  }
}
