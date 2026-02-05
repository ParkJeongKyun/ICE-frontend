// EXIF 메타데이터 열 타입
export interface ExifRow {
  tag: string;
  // 소속 위치
  ifd: string;
  // 해석값 (문자열 또는 숫자 등 GO 쪽에서 다양한 타입으로 올 수 있음)
  data?: string | number | any;
  // 타입
  type?: string;
  // offset
  offset?: number;
  // length
  length?: number;
  // isFar
  isFar?: boolean;
}

// IFD 정보
export interface IfdInfo {
  ifdName: string;
  offset: number;
  tagCount?: number;
  nextIfdOffset?: number;
}

// EXIF 정보
export interface ExifInfo {
  thumbnail: string;
  baseOffset: number;
  dataSize: number;
  endOffset: number;
  byteOrder?: string;
  firstIfdOffset?: number;
  location: { lat: string; lng: string };
  ifdInfos?: IfdInfo[];
  tagInfos: ExifRow[] | null;
}

// 파일 정보
export interface fileinfo {
  name: string;
  lastModified: number;
  size: number;
  mimeType?: string;
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
    file: File;
    fileInfo: fileinfo;
    hasExif: boolean;
    exifInfo: ExifInfo;
  };
}
