export {};

declare module '*.glb';
declare module '*.png';

declare module 'meshline' {
  export const MeshLineGeometry: any;
  export const MeshLineMaterial: any;
}

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
    searchFunc: (data: Uint8Array, pattern: Uint8Array, options?: any) => any;
    exifFunc: (data: Uint8Array) => any;
    wasmReady: boolean;
  }

  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}
