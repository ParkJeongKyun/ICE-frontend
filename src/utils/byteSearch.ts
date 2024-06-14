// ASCII 문자열을 바이트 배열로 변환하는 함수
export const asciiToBytes = (text: string): Uint8Array => {
  return new Uint8Array(Array.from(text).map((char) => char.charCodeAt(0)));
};

export function computeLPSArray(pattern: Uint8Array): number[] {
  const lps: number[] = [];
  lps[0] = 0;
  let len = 0;
  let i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else {
      if (len !== 0) {
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        i++;
      }
    }
  }
  return lps;
}

// Knuth-Morris-Pratt(KMP) 알고리즘 이용하여 대소문자 구별 여부를 선택할 수 있는 검색 로직으로 수정
export function findPatternIndices(
  array: Uint8Array,
  pattern: Uint8Array,
  ignoreCase: boolean = false
): number[] {
  const indices: number[] = [];
  if (pattern.length === 0) return indices;

  const lps = computeLPSArray(pattern);
  let i = 0; // index for array[]
  let j = 0; // index for pattern[]
  let count = 0; // count of pattern occurrences
  const maxCount = 1000;
  while (i < array.length) {
    const currentPatternByte = ignoreCase ? pattern[j] | 32 : pattern[j];
    const currentArrayByte = ignoreCase ? array[i] | 32 : array[i];
    if (currentArrayByte === currentPatternByte) {
      i++;
      j++;
    }
    if (j === pattern.length) {
      indices.push(i - j);
      j = lps[j - 1];
      count++;
      if (count === maxCount) break; // Stop searching if maximum occurrences reached
    } else if (i < array.length && currentArrayByte !== currentPatternByte) {
      if (j !== 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }
  return indices;
}
