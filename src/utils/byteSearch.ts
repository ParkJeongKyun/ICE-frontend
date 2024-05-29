function computeLPSArray(pattern: Uint8Array): number[] {
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

// Knuth-Morris-Pratt(KMP) 알고리즘 이용
export function findPatternIndices(
  array: Uint8Array,
  pattern: Uint8Array
): number[] {
  const indices: number[] = [];
  if (pattern.length === 0) return indices;

  const lps = computeLPSArray(pattern);
  let i = 0; // index for array[]
  let j = 0; // index for pattern[]
  let count = 0; // count of pattern occurrences
  const maxCount = 1000;
  while (i < array.length) {
    if (pattern[j] === array[i]) {
      i++;
      j++;
    }
    if (j === pattern.length) {
      indices.push(i - j);
      j = lps[j - 1];
      count++;
      if (count === maxCount) break; // Stop searching if maximum occurrences reached
    } else if (i < array.length && pattern[j] !== array[i]) {
      if (j !== 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }
  return indices;
}
