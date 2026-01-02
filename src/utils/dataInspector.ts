export function bytesToUnsigned(bytes: Uint8Array, size: number, littleEndian: boolean) {
  if (littleEndian) {
    let val = 0n;
    for (let i = 0; i < size && i < bytes.length; ++i) {
      val |= BigInt(bytes[i]) << BigInt(8 * i);
    }
    return val;
  } else {
    let val = 0n;
    for (let i = 0; i < size && i < bytes.length; ++i) {
      val = (val << 8n) | BigInt(bytes[i]);
    }
    return val;
  }
}

export function bytesToSigned(bytes: Uint8Array, size: number, littleEndian: boolean) {
  const unsigned = bytesToUnsigned(bytes, size, littleEndian);
  const signBit = 1n << BigInt(size * 8 - 1);
  return (unsigned & signBit) ? unsigned - (signBit << 1n) : unsigned;
}

export function bytesToFloat32(bytes: Uint8Array, littleEndian: boolean) {
  if (bytes.length < 4) return null;
  const buf = new ArrayBuffer(4);
  const view = new Uint8Array(buf);
  if (littleEndian) {
    view.set(bytes.slice(0, 4));
    return new DataView(buf).getFloat32(0, true);
  } else {
    view.set(bytes.slice(0, 4));
    return new DataView(buf).getFloat32(0, false);
  }
}

export function bytesToFloat64(bytes: Uint8Array, littleEndian: boolean) {
  if (bytes.length < 8) return null;
  const buf = new ArrayBuffer(8);
  const view = new Uint8Array(buf);
  if (littleEndian) {
    view.set(bytes.slice(0, 8));
    return new DataView(buf).getFloat64(0, true);
  } else {
    view.set(bytes.slice(0, 8));
    return new DataView(buf).getFloat64(0, false);
  }
}

export function bytesToUtf16(bytes: Uint8Array, littleEndian: boolean) {
  try {
    return new TextDecoder(littleEndian ? 'utf-16le' : 'utf-16be').decode(bytes);
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
