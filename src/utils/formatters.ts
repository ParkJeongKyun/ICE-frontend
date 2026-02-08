/**
 * 숫자와 단위를 포맷하는 헬퍼 함수들
 */

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
