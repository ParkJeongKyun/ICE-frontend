// EXIF 메타데이터 열 타입
export interface ExifRow {
  tag: string;
  // 해석값
  data: string;
  // 타입
  type: string;
  // 단위
  // offset 
  offset: number;
  // length 
  length: number;
  // isFar 
  isFar: boolean;
}

export interface ParsedExifResult {
  rows: ExifRow[] | null;
  thumbnail: string;
  location: {
    lat: string;
    lng: string;
  };
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
    location: { lat: string; lng: string;};
    rows: ExifRow[] | null;
    file: File;
  };
}
