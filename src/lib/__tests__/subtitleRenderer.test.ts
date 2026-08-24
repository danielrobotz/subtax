import { describe, it, expect } from 'vitest';
import { getActiveWords } from '@/lib/subtitleRenderer';
import { Word } from '@/types';

const words: Word[] = [
  { text: 'one', start: 0, end: 1 },
  { text: 'two', start: 1, end: 2 },
  { text: 'three', start: 5, end: 6 },
];

describe('getActiveWords', () => {
  it('includes words within the +/-2s window of the given time', () => {
    expect(getActiveWords(words, 1.5).map((w) => w.text)).toEqual(['one', 'two']);
  });

  it('excludes words entirely outside the window', () => {
    expect(getActiveWords(words, 1.5).map((w) => w.text)).not.toContain('three');
  });

  it('includes a word right at the edge of the window', () => {
    // "three" starts at 5, time 3 is exactly 2s before it
    expect(getActiveWords(words, 3).map((w) => w.text)).toContain('three');
  });

  it('returns an empty array when no words are active', () => {
    expect(getActiveWords(words, 20)).toEqual([]);
  });
});
