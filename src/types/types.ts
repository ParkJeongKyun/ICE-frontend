// GO 언어를 컴파일한 웹 어셈블리 파일 적용을 위한 타입 선언
declare global {
  interface Window {
    goFunc: (imageData: Uint8Array) => Promise<any>;
  }
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
}

// EXIF 메타데이터 열 타입
export interface ExifRow {
  id: number;
  meta: string;
  name: string;
  data: string;
  origindata: string;
  type: string;
  unit: string;
  comment: string;
  example: example | null;
}

interface example {
  [key: string]: string;
}
