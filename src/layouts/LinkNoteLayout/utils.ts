import LZString from 'lz-string';

interface NoteData {
  c?: string; // 내용
  lm?: string; // 마지막 수정 시간
}

export const createNoteUrl = (content: string): string => {
  const data: NoteData = {
    c: content, // 단축 키 사용
    lm: new Date().toISOString(), // 현재 날짜를 마지막 수정 시간으로 추가
  };

  const jsonString = JSON.stringify(data);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);

  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?data=${compressed}`;
};
