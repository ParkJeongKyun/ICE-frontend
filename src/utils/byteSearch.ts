const createBadCharacterTable = (pattern: Uint8Array): number[] => {
  const table = new Array(256).fill(pattern.length);
  for (let i = 0; i < pattern.length - 1; i++) {
    table[pattern[i]] = pattern.length - 1 - i;
  }
  return table;
};

const createGoodSuffixTable = (pattern: Uint8Array): number[] => {
  const m = pattern.length;
  const table = new Array(m).fill(m);
  let lastPrefixIndex = m;

  for (let i = m - 1; i >= 0; i--) {
    if (isPrefix(pattern, i + 1)) {
      lastPrefixIndex = i + 1;
    }
    table[m - 1 - i] = lastPrefixIndex - i + m - 1;
  }

  for (let i = 0; i < m - 1; i++) {
    const slen = suffixLength(pattern, i);
    table[slen] = m - 1 - i + slen;
  }

  return table;
};

const isPrefix = (pattern: Uint8Array, p: number): boolean => {
  for (let i = p, j = 0; i < pattern.length - p; i++, j++) {
    if (pattern[i] !== pattern[j]) {
      return false;
    }
  }
  return true;
};

const suffixLength = (pattern: Uint8Array, p: number): number => {
  let len = 0;
  for (
    let i = p, j = pattern.length - 1;
    i >= 0 && pattern[i] === pattern[j];
    i--, j--
  ) {
    len++;
  }
  return len;
};

export const boyerMooreSearchAll = (
  array: Uint8Array,
  pattern: Uint8Array
): number[] => {
  const badCharTable = createBadCharacterTable(pattern);
  const goodSuffixTable = createGoodSuffixTable(pattern);
  const results: number[] = [];
  let i = 0;

  while (i <= array.length - pattern.length) {
    let j = pattern.length - 1;
    while (j >= 0 && pattern[j] === array[i + j]) {
      j--;
    }
    if (j < 0) {
      results.push(i);
      i +=
        i + pattern.length < array.length
          ? pattern.length - goodSuffixTable[0]
          : 1;
    } else {
      i += Math.max(goodSuffixTable[j], j - badCharTable[array[i + j]]);
    }
  }

  return results;
};
