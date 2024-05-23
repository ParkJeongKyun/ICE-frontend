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
  // 넘버링
  id: number;
  // 영문명
  meta: string;
  // 한글명
  name: string;
  // 해석값
  data: string;
  // 원본 값
  origindata: string;
  // 타입
  type: string;
  // 단위
  unit: string;
  // 설명
  comment: string;
  // 예제값
  example: example | null;
}

// 예제값
interface example {
  [key: string]: string;
}
