/// <reference lib="webworker" />
import pako from 'pako';
import { fromByteArray, toByteArray } from 'base64-js';

export interface CompressRequest {
  id: string;
  type: 'COMPRESS';
  content: string;
  origin: string;
  pathname: string;
}

export interface DecompressRequest {
  id: string;
  type: 'DECOMPRESS';
  data: string;
}

export interface CompressResponse {
  id: string;
  type: 'COMPRESS';
  url?: string;
  lastModified?: string;
  error?: string;
}

export interface DecompressResponse {
  id: string;
  type: 'DECOMPRESS';
  content?: string;
  lastModified?: string;
  error?: string;
}

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (e: MessageEvent<CompressRequest | DecompressRequest>) => {
  const { id, type } = e.data;

  if (type === 'DECOMPRESS') {
    const { data } = e.data as DecompressRequest;
    try {
      const decodedUrl = decodeURIComponent(data);
      const compressed = toByteArray(decodedUrl);
      const jsonString = new TextDecoder().decode(pako.inflate(compressed));
      const parsed = JSON.parse(jsonString);
      self.postMessage({
        id,
        type: 'DECOMPRESS',
        content: parsed.c || '',
        lastModified: parsed.lm || '',
      } as DecompressResponse);
    } catch (err) {
      self.postMessage({
        id,
        type: 'DECOMPRESS',
        error: String(err),
      } as DecompressResponse);
    }
    return;
  }

  // type === 'COMPRESS'
  const { content, origin, pathname } = e.data as CompressRequest;
  try {
    const lastModified = new Date().toISOString();
    const data = { c: content, lm: lastModified };
    const jsonString = JSON.stringify(data);
    const compressed = pako.deflate(new TextEncoder().encode(jsonString));
    const safeUrlString = encodeURIComponent(fromByteArray(compressed));
    const url = `${origin}${pathname}?data=${safeUrlString}`;
    self.postMessage({
      id,
      type: 'COMPRESS',
      url,
      lastModified,
    } as CompressResponse);
  } catch (err) {
    self.postMessage({
      id,
      type: 'COMPRESS',
      error: String(err),
    } as CompressResponse);
  }
};
