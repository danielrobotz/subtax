import { describe, it, expect } from 'vitest';
import { parseWhisperResponse, getMockTranscription } from '@/lib/whisper';

describe('parseWhisperResponse', () => {
  it('maps word-level timestamps from a verbose_json response', () => {
    const result = parseWhisperResponse({
      text: 'Hello world',
      words: [
        { word: 'Hello', start: 0, end: 0.5, confidence: 0.9 },
        { word: 'world', start: 0.5, end: 1, confidence: 0.8 },
      ],
    });

    expect(result).toEqual({
      text: 'Hello world',
      words: [
        { text: 'Hello', start: 0, end: 0.5, confidence: 0.9 },
        { text: 'world', start: 0.5, end: 1, confidence: 0.8 },
      ],
    });
  });

  it('falls back to joining words when text is missing', () => {
    const result = parseWhisperResponse({
      words: [{ word: 'foo' }, { word: 'bar' }],
    });

    expect(result.text).toBe('foo bar');
  });

  it('defaults missing timestamps and confidence to safe values', () => {
    const result = parseWhisperResponse({ words: [{ text: 'hi' }] });

    expect(result.words[0]).toEqual({ text: 'hi', start: 0, end: 0, confidence: 1 });
  });

  it('handles a response with no words at all', () => {
    const result = parseWhisperResponse({ text: 'silence' });

    expect(result).toEqual({ text: 'silence', words: [] });
  });
});

describe('getMockTranscription', () => {
  it('produces words that cover the full text in order with increasing timestamps', () => {
    const result = getMockTranscription();

    expect(result.words.length).toBeGreaterThan(0);
    expect(result.words.map((w) => w.text).join(' ')).toBe(result.text);
    for (let i = 1; i < result.words.length; i++) {
      expect(result.words[i].start).toBeGreaterThanOrEqual(result.words[i - 1].end);
    }
  });
});
