import { NumberBase } from '@/components/HexViewer/hexViewerConstants';
import { getRadix, getOffsetPrefix } from './formatters';

/**
 * 오프셋 관련 공통 유틸리티
 */

// 사용자 입력을 설정된 진법에 따라 10진수로 파싱
export const parseOffsetInput = (input: string, numberBase: NumberBase): number => {
  const radix = getRadix(numberBase);
  const cleanInput = input.replace(/^(0x|0o|0b)/i, '');
  return parseInt(cleanInput, radix);
};

// UI 표시용 오프셋 포맷팅 (10진수 (설정진법표기))
export const formatOffsetDisplay = (offset: number, numberBase: NumberBase): string => {
  const radix = getRadix(numberBase);
  const prefix = getOffsetPrefix(numberBase);
  const formatted = `${prefix}${offset.toString(radix).toUpperCase()}`;
  return `${offset} (${formatted})`;
};
