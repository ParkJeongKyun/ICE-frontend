// EXIF 메타데이터 열 타입
export interface ExifRow {
  tag: string;
  // 소속 위치 (IFD0, ExifIFD 등)
  ifd: string;
  // 해석값 (문자열 또는 숫자 등 GO 쪽에서 다양한 타입으로 올 수 있음)
  data: string;
  // 타입 (Ascii, Short, Rational 등)
  type: string;
  // 파일 내 오프셋
  offset: number;
  // 데이터 길이
  length: number;
  // 원격 데이터(Far data) 여부
  isFar: boolean;
}

// IFD 정보
export interface IfdInfo {
  ifdName: string;
  offset: number;
  tagCount: number;
  nextIfdOffset: number;
}

// EXIF 정보
export interface ExifInfo {
  thumbnail: string;
  baseOffset: number;
  dataSize: number;
  endOffset: number;
  byteOrder: string;
  firstIfdOffset: number;
  location: { lat: string; lng: string };
  ifdInfos: IfdInfo[];
  tagInfos: ExifRow[] | null;
}

// JSON.parse 후 타입
export interface TextChunkInfo {
  width: number;
  height: number;
  bitDepth: number;
  colorType: number;
  compression: number;
  filter: number;
  interlace: number;
  chunks: Array<{
    type: string;
    offset: number;
    length: number;
    keyword?: string;
    data: string;
  }>;
}

// PE 정보
export interface PeSection {
  name: string;
  virtualSize: number;
  virtualAddress: number;
  sizeOfRawData: number;
  pointerToRawData: number;
  fileOffset: number;
  characteristics: number;
  entropy: number;
}

export interface DataDirectory {
  name: string;
  virtualAddress: number;
  size: number;
  fileOffset: number;
}

export interface RichHeaderItem {
  id: number;
  version: number;
  count: number;
}

export interface ImportItem {
  name: string;
}

export interface ImportGroup {
  library: string;
  imports: ImportItem[];
}

export interface ExportItem {
  name: string;
  ordinal: number;
  address: number;
  offset: number;
}

export interface PeSecurityInfo {
  aslr: boolean;
  dep: boolean;
  cfg: boolean;
  seh: boolean;
}

export interface PeCertificate {
  subject: string;
  issuer: string;
  serial: string;
  notBefore: string;
  notAfter: string;
}

export interface PeTlsInfo {
  callbacks: string[];
  hasCallbacks: boolean;
}

export interface PeHashInfo {
  impHash: string;
  authentihash: string;
}

export interface PeInfo {
  basic: {
    machine: string;
    magic: string;
    entryPoint: string;
    entryPointOffset: number;
    imageBase: string;
    timeDateStamp: string;
    compiler?: string;
    language?: string;
    totalEntropy: number;
  };
  dosHeader: {
    magic: string;
    lfanew: number;
  };
  richHeader: {
    offset: number;
    items: RichHeaderItem[];
  };
  fileHeader: {
    offset: number;
    machine: number;
    numberOfSections: number;
    characteristics: number;
    sizeOfOptionalHeader: number;
  };
  optionalHeader: Record<string, any>;
  dataDirectories: DataDirectory[];
  sections: PeSection[];
  imports: ImportGroup[];
  exports: ExportItem[];
  debug: {
    pdbPath?: string;
  };
  security: PeSecurityInfo;
  certificates: PeCertificate[];
  versionInfo: Record<string, string>;
  tls: PeTlsInfo;
  hashes: PeHashInfo;
  anomalies?: string[];
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

export interface AnalysisEngines {
  core: boolean;
  image: boolean;
  pe: boolean;
}

export interface TabData {
  [key: TabKey]: {
    window: TabWindow;
    file: File;
    fileInfo: fileinfo;
    exifInfo?: ExifInfo;
    textChunkData?: TextChunkInfo;
    peData?: PeInfo;
    engines?: AnalysisEngines;
  };
}
