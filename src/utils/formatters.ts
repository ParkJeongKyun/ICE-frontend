import dayjs from 'dayjs';

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

// Byte 포매터
export const getBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

  return `${formattedSize} ${sizes[i]} (${bytes.toLocaleString()} Byte)`;
};

// 날짜 포맷 지정
export const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// 날짜 포매터
export const getDate = (dateStr: string | number | Date): string => {
  const formattedDate = dayjs(dateStr);
  if (formattedDate.isValid()) {
    return formattedDate.format(DATE_FORMAT);
  } else {
    return '';
  }
};

export const calculateExperience = (startDate: Date, endDate: Date): string => {
  const diffYear = endDate.getFullYear() - startDate.getFullYear();
  const diffMonth = endDate.getMonth() - startDate.getMonth();
  const diffDay = endDate.getDate() - startDate.getDate();

  let years = diffYear;
  let months = diffMonth;

  if (diffDay < 0) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years ? years + '년 ' : ''}${months}개월`;
};
