/// <reference lib="webworker" />
import pako from 'pako';
import { fromByteArray } from 'base64-js';

export interface CompressRequest {
  id: string;
  content: string;
  origin: string;
  pathname: string;
}

export interface CompressResponse {
  id: string;
  url?: string;
  lastModified?: string;
  error?: string;
}

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (e: MessageEvent<CompressRequest>) => {
  const { id, content, origin, pathname } = e.data;
  try {
    const lastModified = new Date().toISOString();
    const data = { c: content, lm: lastModified };
    const jsonString = JSON.stringify(data);
    const compressed = pako.deflate(new TextEncoder().encode(jsonString));
    const safeUrlString = encodeURIComponent(fromByteArray(compressed));
    const url = `${origin}${pathname}?data=${safeUrlString}`;
    self.postMessage({ id, url, lastModified } as CompressResponse);
  } catch (err) {
    self.postMessage({ id, error: String(err) } as CompressResponse);
  }
};
