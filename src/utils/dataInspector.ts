import { getDate } from "./exifParser";

// 최소 바이트 수 정의
export const MIN_BYTE_LENGTHS = {
  UInt8: 1,
  Int8: 1,
  UInt16: 2,
  Int16: 2,
  UInt24: 3,
  Int24: 3,
  UInt32: 4,
  Int32: 4,
  UInt64: 8,
  Int64: 8,
  Float32: 4,
  Float64: 8,
  ULEB128: 1, // 가변 길이(Variable length, 최대 10바이트)
  SLEB128: 1, // 가변 길이(Variable length, 최대 10바이트)
  Base64: 3, // 가변 길이(3*N bytes → 4*N chars)
  Utf8: 1, // 가변 길이(Variable length, 1~4 bytes per char)
  Utf16: 2, // 가변 길이(Variable length, 2/4 bytes per char)
  OLETIME: 8,
  FILETIME: 8,
  DOSDATE: 2,
  DOSTIME: 2,
  DOSDATETIME: 4,
  TIMET32: 4,
  TIMET64: 8,
  GUID: 16,
};

export function bytesToUnsigned(
  bytes: Uint8Array,
  size: number,
  littleEndian: boolean
) {
  let val = 0n;
  if (littleEndian) {
    for (let i = 0; i < size && i < bytes.length; ++i) {
      val |= BigInt(bytes[i]) << BigInt(8 * i);
    }
  } else {
    for (let i = 0; i < size && i < bytes.length; ++i) {
      val = (val << 8n) | BigInt(bytes[i]);
    }
  }
  return val;
}

export function bytesToSigned(
  bytes: Uint8Array,
  size: number,
  littleEndian: boolean
) {
  const unsigned = bytesToUnsigned(bytes, size, littleEndian);
  const signBit = 1n << BigInt(size * 8 - 1);
  return unsigned & signBit ? unsigned - (signBit << 1n) : unsigned;
}

export function bytesToFloat32(bytes: Uint8Array, littleEndian: boolean) {
  if (bytes.length < MIN_BYTE_LENGTHS.Float32) return null;
  const buf = new ArrayBuffer(MIN_BYTE_LENGTHS.Float32);
  new Uint8Array(buf).set(bytes.slice(0, MIN_BYTE_LENGTHS.Float32));
  return new DataView(buf).getFloat32(0, littleEndian);
}

export function bytesToFloat64(bytes: Uint8Array, littleEndian: boolean) {
  if (bytes.length < MIN_BYTE_LENGTHS.Float64) return null;
  const buf = new ArrayBuffer(MIN_BYTE_LENGTHS.Float64);
  new Uint8Array(buf).set(bytes.slice(0, MIN_BYTE_LENGTHS.Float64));
  return new DataView(buf).getFloat64(0, littleEndian);
}

export function bytesToUtf16(bytes: Uint8Array, littleEndian: boolean) {
  try {
    return new TextDecoder(littleEndian ? 'utf-16le' : 'utf-16be').decode(
      bytes
    );
  } catch {
    return '';
  }
}

export function bytesToBin(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, '0'))
    .join(' ');
}

export function bytesToBase64(bytes: Uint8Array) {
  if (!bytes.length) return '';
  return btoa(String.fromCharCode(...bytes));
}

// LEB128 (가변 길이, 최대 10바이트)
export function decodeULEB128(bytes: Uint8Array): string {
  let result = 0n;
  let shift = 0n;
  for (let i = 0; i < bytes.length; ++i) {
    const byte = BigInt(bytes[i]);
    result |= (byte & 0x7fn) << shift;
    if ((byte & 0x80n) === 0n) {
      return result.toString();
    }
    shift += 7n;
  }
  return '-';
}

export function decodeSLEB128(bytes: Uint8Array): string {
  let result = 0n;
  let shift = 0n;
  for (let i = 0; i < bytes.length; ++i) {
    const byte = BigInt(bytes[i]);
    result |= (byte & 0x7fn) << shift;
    shift += 7n;
    if ((byte & 0x80n) === 0n) {
      if ((byte & 0x40n) !== 0n) {
        result |= ~0n << shift;
      }
      return result.toString();
    }
  }
  return '-';
}

export function bytesToUnsignedInt24(
  bytes: Uint8Array,
  littleEndian: boolean
): number {
  if (bytes.length < MIN_BYTE_LENGTHS.UInt24) return 0;
  return littleEndian
    ? bytes[0] | (bytes[1] << 8) | (bytes[2] << 16)
    : bytes[2] | (bytes[1] << 8) | (bytes[0] << 16);
}

export function bytesToSignedInt24(
  bytes: Uint8Array,
  littleEndian: boolean
): number {
  let val = bytesToUnsignedInt24(bytes, littleEndian);
  if (val & 0x800000) val |= 0xff000000; // sign extend
  return (val << 8) >> 8; // force sign extension to 32bit
}

// OLE Automation Date (8 bytes)
export function bytesToOLETIME(
  bytes: Uint8Array,
  littleEndian: boolean
): string {
  if (bytes.length < MIN_BYTE_LENGTHS.OLETIME) return '-';
  const buf = new ArrayBuffer(MIN_BYTE_LENGTHS.OLETIME);
  new Uint8Array(buf).set(bytes.slice(0, MIN_BYTE_LENGTHS.OLETIME));
  const days = new DataView(buf).getFloat64(0, littleEndian);
  if (isNaN(days)) return '-';
  const ms = days * 24 * 60 * 60 * 1000;
  const date = new Date(Date.UTC(1899, 11, 30) + ms);
  return isNaN(date.getTime()) ? '-' : getDate(date);
}

// Windows FILETIME (8 bytes)
export function bytesToFILETIME(
  bytes: Uint8Array,
  littleEndian: boolean
): string {
  if (bytes.length < MIN_BYTE_LENGTHS.FILETIME) return '-';
  let low = 0,
    high = 0;
  if (littleEndian) {
    low = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
    high = bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24);
  } else {
    high = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
    low = bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24);
  }
  const filetime = (BigInt(high) << 32n) + BigInt(low);

  // 유효성 검사: 0이거나 음수이면 유효하지 않음
  if (filetime <= 0n) return '-';

  // 합리적인 범위 체크 (1601-01-01 ~ 9999-12-31)
  const MIN_FILETIME = 0n;
  const MAX_FILETIME = 2650467743999999999n; // 9999-12-31 23:59:59.999
  if (filetime < MIN_FILETIME || filetime > MAX_FILETIME) return '-';

  const ms = Number(filetime / 10000n);
  const date = new Date(Date.UTC(1601, 0, 1) + ms);
  return isNaN(date.getTime()) ? '-' : getDate(date);
}

// DOS Date (2 bytes)
export function bytesToDOSDate(
  bytes: Uint8Array,
  littleEndian: boolean
): string {
  if (bytes.length < MIN_BYTE_LENGTHS.DOSDATE) return '-';
  const val = littleEndian
    ? bytes[0] | (bytes[1] << 8)
    : bytes[1] | (bytes[0] << 8);
  const year = ((val >> 9) & 0x7f) + 1980;
  const month = (val >> 5) & 0x0f;
  const day = val & 0x1f;
  if (month < 1 || month > 12 || day < 1 || day > 31) return '-';
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// DOS Time (2 bytes)
export function bytesToDOSTime(
  bytes: Uint8Array,
  littleEndian: boolean
): string {
  if (bytes.length < MIN_BYTE_LENGTHS.DOSTIME) return '-';
  const val = littleEndian
    ? bytes[0] | (bytes[1] << 8)
    : bytes[1] | (bytes[0] << 8);
  const hour = (val >> 11) & 0x1f;
  const min = (val >> 5) & 0x3f;
  const sec = (val & 0x1f) * 2;
  if (hour > 23 || min > 59 || sec > 59) return '-';
  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

// DOS Date & Time (4 bytes)
export function bytesToDOSDateTime(
  bytes: Uint8Array,
  littleEndian: boolean
): string {
  if (bytes.length < MIN_BYTE_LENGTHS.DOSDATETIME) return '-';
  let dateBytes: Uint8Array, timeBytes: Uint8Array;
  if (littleEndian) {
    dateBytes = bytes.slice(2, 4);
    timeBytes = bytes.slice(0, 2);
  } else {
    timeBytes = bytes.slice(0, 2);
    dateBytes = bytes.slice(2, 4);
  }
  const dateStr = bytesToDOSDate(dateBytes, littleEndian);
  const timeStr = bytesToDOSTime(timeBytes, littleEndian);
  if (dateStr === '-' || timeStr === '-') return '-';
  
  const dateTime = new Date(`${dateStr}T${timeStr}`);
  return isNaN(dateTime.getTime()) ? '-' : getDate(dateTime);
}

// time_t 32bit (4 bytes)
export function bytesToTimeT32(
  bytes: Uint8Array,
  littleEndian: boolean
): string {
  if (bytes.length < MIN_BYTE_LENGTHS.TIMET32) return '-';
  const val = littleEndian
    ? bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)
    : bytes[3] | (bytes[2] << 8) | (bytes[1] << 16) | (bytes[0] << 24);
  const date = new Date(val * 1000);
  return isNaN(date.getTime()) ? '-' : getDate(date);
}

// time_t 64bit (8 bytes)
export function bytesToTimeT64(
  bytes: Uint8Array,
  littleEndian: boolean
): string {
  if (bytes.length < MIN_BYTE_LENGTHS.TIMET64) return '-';
  let val: bigint;
  if (littleEndian) {
    val =
      BigInt(bytes[0]) |
      (BigInt(bytes[1]) << 8n) |
      (BigInt(bytes[2]) << 16n) |
      (BigInt(bytes[3]) << 24n) |
      (BigInt(bytes[4]) << 32n) |
      (BigInt(bytes[5]) << 40n) |
      (BigInt(bytes[6]) << 48n) |
      (BigInt(bytes[7]) << 56n);
  } else {
    val =
      BigInt(bytes[7]) |
      (BigInt(bytes[6]) << 8n) |
      (BigInt(bytes[5]) << 16n) |
      (BigInt(bytes[4]) << 24n) |
      (BigInt(bytes[3]) << 32n) |
      (BigInt(bytes[2]) << 40n) |
      (BigInt(bytes[1]) << 48n) |
      (BigInt(bytes[0]) << 56n);
  }
  const date = new Date(Number(val) * 1000);
  return isNaN(date.getTime()) ? '-' : getDate(date);
}

// GUID (16 bytes)
export function bytesToGUID(bytes: Uint8Array, littleEndian: boolean): string {
  if (bytes.length < MIN_BYTE_LENGTHS.GUID) return '-';
  const d1 = littleEndian ? bytes.slice(0, 4).reverse() : bytes.slice(0, 4);
  const d2 = littleEndian ? bytes.slice(4, 6).reverse() : bytes.slice(4, 6);
  const d3 = littleEndian ? bytes.slice(6, 8).reverse() : bytes.slice(6, 8);
  const d4 = bytes.slice(8, 10);
  const d5 = bytes.slice(10, 16);
  const hex = (arr: Uint8Array) =>
    Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  return [hex(d1), hex(d2), hex(d3), hex(d4), hex(d5)].join('-');
}
