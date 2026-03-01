// src/types/global.d.ts
export {}; // 이 파일이 모듈임을 선언

declare module '*.glb';
declare module '*.png';

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }

  interface DedicatedWorkerGlobalScope {
    readBlockSync(
      file: File,
      offset: number,
      length: number
    ): Uint8Array | null;
    Go: typeof Go;
    searchFunc: WasmSearchFunction;
    exifFunc: WasmExifFunction;
    textChunkFunc: WasmTextChunkFunction;
  }

  class Go {
    constructor();
    run(instance: WebAssembly.Instance): Promise<void>;
    importObject: WebAssembly.Imports;
    argv: string[];
    env: Record<string, string>;
    exit(code: number): void;
  }
}
