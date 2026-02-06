declare module '*.glb';
declare module '*.png';

import type { WasmSearchFunction, WasmExifFunction } from './fileReader.worker';

declare global {
  class Go {
    constructor();
    run(instance: WebAssembly.Instance): Promise<void>;
    importObject: any;
    argv: string[];
    env: any;
    exited: boolean;
    exit(code: number): void;
    _pendingEvent: any;
    _resume(): void;
  }

  interface WasmGlobal {
    searchFunc: WasmSearchFunction;
    exifFunc: WasmExifFunction;
    wasmReady: boolean;
  }
}
