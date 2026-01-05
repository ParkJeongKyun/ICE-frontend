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
  ASM_X86: 1, // 가변 길이(Variable length, 1~15 bytes)
  ASM_ARM: 4, // 고정 4바이트 (ARM32)
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
  return isNaN(date.getTime()) ? '-' : date.toISOString();
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
  return isNaN(date.getTime()) ? '-' : date.toISOString();
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
  const date = bytesToDOSDate(dateBytes, littleEndian);
  const time = bytesToDOSTime(timeBytes, littleEndian);
  if (date === '-' || time === '-') return '-';
  return `${date} ${time}`;
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
  return isNaN(date.getTime()) ? '-' : date.toISOString();
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
  return isNaN(date.getTime()) ? '-' : date.toISOString();
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

// Assembly Disassembly (간단한 x86/ARM 명령어 표시)
export function bytesToAssembly(bytes: Uint8Array, arch: 'x86' | 'arm', littleEndian: boolean): string {
  if (arch === 'x86') {
    if (bytes.length < MIN_BYTE_LENGTHS.ASM_X86) return '-';
    
    // x86 간단한 명령어 매칭 (1-2바이트)
    const hex = Array.from(bytes.slice(0, Math.min(4, bytes.length)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ');
    
    // 일부 대표적인 x86 명령어 매칭
    const opcode = bytes[0];
    let instruction = '';
    
    if (opcode === 0x90) instruction = 'nop';
    else if (opcode === 0xC3) instruction = 'ret';
    else if (opcode === 0xCC) instruction = 'int3';
    else if (opcode >= 0x50 && opcode <= 0x57) instruction = `push ${['eax','ecx','edx','ebx','esp','ebp','esi','edi'][opcode - 0x50]}`;
    else if (opcode >= 0x58 && opcode <= 0x5F) instruction = `pop ${['eax','ecx','edx','ebx','esp','ebp','esi','edi'][opcode - 0x58]}`;
    else if (opcode >= 0xB0 && opcode <= 0xB7 && bytes.length >= 2) instruction = `mov ${['al','cl','dl','bl','ah','ch','dh','bh'][opcode - 0xB0]}, 0x${bytes[1].toString(16)}`;
    else if (opcode >= 0xB8 && opcode <= 0xBF && bytes.length >= 5) {
      const val = bytes[1] | (bytes[2] << 8) | (bytes[3] << 16) | (bytes[4] << 24);
      instruction = `mov ${['eax','ecx','edx','ebx','esp','ebp','esi','edi'][opcode - 0xB8]}, 0x${val.toString(16)}`;
    }
    else instruction = '(unknown)';
    
    return `${hex} | ${instruction}`;
  } else {
    // ARM 간단한 명령어 매칭 (4바이트)
    if (bytes.length < MIN_BYTE_LENGTHS.ASM_ARM) return '-';
    
    const hex = Array.from(bytes.slice(0, MIN_BYTE_LENGTHS.ASM_ARM))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ');
    
    // ARM 명령어는 4바이트이며 엔디안에 따라 읽기
    let word: number;
    if (littleEndian) {
      word = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
    } else {
      word = bytes[3] | (bytes[2] << 8) | (bytes[1] << 16) | (bytes[0] << 24);
    }
    
    let instruction = '';
    
    // ARM Thumb 또는 ARM 명령어 간단 매칭
    if ((word & 0x0E000000) === 0x0A000000) {
      const offset = (word & 0x00FFFFFF) << 2;
      instruction = `b 0x${offset.toString(16)}`;
    } else if ((word & 0x0FE00000) === 0x01A00000) {
      instruction = 'mov';
    } else if ((word & 0x0FFFFFFF) === 0x012FFF1E) {
      instruction = 'bx lr';
    } else if ((word & 0x0F000000) === 0x0E000000) {
      instruction = 'cdp (coprocessor)';
    } else {
      instruction = '(unknown)';
    }
    
    return `${hex} | ${instruction}`;
  }
}
