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

// 파일 정보
export interface fileinfo {
  name: string;
  lastModified: number;
  size: number;
  mime_type?: string;
  extension?: string;
}

export type TabKey = string;

export interface TabWindow {
  label: string;
  contents: React.ReactNode;
}

export interface TabData {
  [key: TabKey]: {
    window: TabWindow;
    fileinfo: fileinfo;
    thumbnail: string;
    location: { lat: string; lng: string; address: string };
    rows: ExifRow[] | null;
    file: File; // Uint8Array → File 객체로 변경
  };
}
