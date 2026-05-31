import dayjs from 'dayjs';
import { NumberBase } from '@/components/HexViewer/hexViewerConstants';

/**
 * 숫자와 단위를 포맷하는 헬퍼 함수들
 */

export const formatOffset = (
  offset: number,
  numberBase: NumberBase
): string => {
  const radix = getRadix(numberBase);
  const prefix = getOffsetPrefix(numberBase);
  const formatted = `${prefix}${offset.toString(radix).toUpperCase()}`;
  return numberBase === 'decimal' ? `${offset}` : `${offset}(${formatted})`;
};

export const getRadix = (numberBase: NumberBase): number => {
  switch (numberBase) {
    case 'binary':
      return 2;
    case 'octal':
      return 8;
    case 'decimal':
      return 10;
    case 'hexadecimal':
      return 16;
    default:
      return 16;
  }
};

export const getOffsetPrefix = (numberBase: NumberBase): string => {
  switch (numberBase) {
    case 'binary':
      return '0b';
    case 'octal':
      return '0o';
    case 'decimal':
      return 'De';
    case 'hexadecimal':
      return '0x';
    default:
      return '0x';
  }
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatSpeed = (mbps: number, decimals = 2): string => {
  return `${mbps.toFixed(decimals)} MB/s`;
};

export const formatTime = (seconds: number, decimals = 2): string => {
  return `${seconds.toFixed(decimals)}s`;
};

// Byte 포매터
export const getBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

  return `${formattedSize} ${sizes[i]} (${bytes.toLocaleString()} Byte)`;
};

// 날짜 포맷 패턴 매핑
export const getDateFormat = (format: 'ISO' | 'US' | 'KO'): string => {
  switch (format) {
    case 'ISO':
      return 'YYYY-MM-DD HH:mm:ss';
    case 'US':
      return 'MM/DD/YYYY HH:mm:ss';
    case 'KO':
      return 'YYYY년 MM월 DD일 HH:mm:ss';
    default:
      return 'YYYY-MM-DD HH:mm:ss';
  }
};

// 날짜 포매터
export const getDate = (
  dateStr: string | number | Date,
  format: 'ISO' | 'US' | 'KO' = 'ISO'
): string => {
  const formattedDate = dayjs(dateStr);
  if (formattedDate.isValid()) {
    return formattedDate.format(getDateFormat(format));
  } else {
    return '';
  }
};
