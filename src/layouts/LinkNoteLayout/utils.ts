import pako from 'pako';
import { fromByteArray } from 'base64-js';

interface NoteData {
  c?: string;
  lm?: string;
}

export const createNoteUrl = (content: string): string => {
  const data: NoteData = {
    c: content,
    lm: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(data);
  const compressed = pako.deflate(new TextEncoder().encode(jsonString));
  const safeUrlString = encodeURIComponent(fromByteArray(compressed));

  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin + window.location.pathname
      : '';
  return `${baseUrl}?data=${safeUrlString}`;
};
