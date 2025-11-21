import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/crepe/theme/common/style.css';
import { useEffect, useRef, useState } from 'react';
import LZString from 'lz-string';
import EditIcon from '@/components/common/Icons/EditIcon';
import ReadIcon from '@/components/common/Icons/ReadIcon';
import ShareIcon from '@/components/common/Icons/ShareIcon';
import { MainContainer, ButtonZone, ToggleButton, ShareButton, Toast, ErrorMessage, StatusIndicator, LastModifiedTime } from './index.styles';
import FlopyIcon from '@/components/common/Icons/FlopyIcon';

// 데이터 구조 인터페이스
interface NoteData {
  c?: string; // 내용
  lm?: string; // 마지막 수정 시간
}

const MAX_URL_LENGTH = 8000; // 크로스 브라우저 호환성을 위한 안전한 길이 (약 5-6페이지 분량)

const CrepeEditor: React.FC = () => {
  const [isReadOnly, setIsReadOnly] = useState(true);
  const editorRef = useRef<Crepe | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastModified, setLastModified] = useState<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReadOnlyRef = useRef(isReadOnly);

  // isReadOnly 상태를 ref에 동기화
  useEffect(() => {
    isReadOnlyRef.current = isReadOnly;
  }, [isReadOnly]);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleShare = () => {
    const url = window.location.href;

    if (url.length > MAX_URL_LENGTH) {
      showToastMessage('내용이 너무 길어 공유할 수 없습니다!');
      return;
    }

    if (navigator.share) {
      navigator
        .share({
          title: 'LinkNote',
          text: '노트를 확인해보세요!',
          url: url,
        })
        .then(() => {
          showToastMessage('공유 완료');
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('공유 오류:', error);
            // 클립보드로 대체
            copyToClipboard(url);
          }
        });
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      showToastMessage('링크가 클립보드에 복사되었습니다!');
    }).catch(() => {
      showToastMessage('링크 복사 실패');
    });
  };

  // URL에서 노트 데이터 추출
  const getNoteDataFromUrl = (): { content: string; lastModified: string } => {
    const urlParams = new URLSearchParams(window.location.search);
    const compressedData = urlParams.get('data');

    if (!compressedData) return { content: '', lastModified: '' };

    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(compressedData);
      if (!decompressed) {
        setError('노트 데이터 압축 해제 실패');
        return { content: '', lastModified: '' };
      }

      const data: NoteData = JSON.parse(decompressed);
      return { 
        content: data.c || '', 
        lastModified: data.lm || '' 
      };
    } catch (error) {
      console.error('URL 데이터 파싱 오류:', error);
      setError('유효하지 않은 노트 데이터입니다');
      return { content: '', lastModified: '' };
    }
  };

  // URL에서 초기 내용 가져오기
  const { content: initialContent, lastModified: initialLastModified } = getNoteDataFromUrl();

  useEffect(() => {
    if (initialLastModified) {
      setLastModified(initialLastModified);
    }
  }, [initialLastModified]);

  const { get } = useEditor((root) => {
    const editor = new Crepe({
      root,
      defaultValue: initialContent,
      featureConfigs: {
        [Crepe.Feature.LinkTooltip]: {
          inputPlaceholder: 'URL을 입력하세요',
        },
        [Crepe.Feature.Placeholder]: {
          text: '입력하세요...',
        },
      }
    });

    // 초기 상태 설정
    editor.setReadonly(isReadOnly);
    editorRef.current = editor;

    // 이벤트 리스너 등록
    editor.on((listener) => {
      listener.updated((ctx) => {
        if (!isReadOnlyRef.current) {
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          if (hideStatusTimeoutRef.current) {
            clearTimeout(hideStatusTimeoutRef.current);
          }
          
          setIsSaving(true);
          
          saveTimeoutRef.current = setTimeout(() => {
            try {
              // 에디터에서 직접 마크다운 가져오기
              const markdown = editor.getMarkdown();
              
              const newUrl = createNoteUrl(markdown);
              
              if (newUrl.length > MAX_URL_LENGTH) {
                setError('내용이 너무 깁니다. URL 최대 길이를 초과했습니다.');
                setIsSaving(false);
                return;
              }
              
              window.history.replaceState({}, '', newUrl);
              setError(null);
              const now = new Date().toISOString();
              setLastModified(now);
              
              hideStatusTimeoutRef.current = setTimeout(() => {
                setIsSaving(false);
              }, 1000);
            } catch (err) {
              console.error('URL 업데이트 오류:', err);
              setError('변경사항 저장 실패');
              setIsSaving(false);
            }
          }, 500);
        }
      });
    });

    return editor;
  });

  // 읽기 모드 상태가 변경될 때마다 에디터 업데이트
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setReadonly(isReadOnly);
    }
  }, [isReadOnly]);

  // 컴포넌트 언마운트 시 타임아웃 정리
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (hideStatusTimeoutRef.current) {
        clearTimeout(hideStatusTimeoutRef.current);
      }
    };
  }, []);

  const formatLastModified = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return "마지막수정: " + date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <MainContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!isReadOnly && isSaving && (
        <StatusIndicator $saving={isSaving}>
          <FlopyIcon />
        </StatusIndicator>
      )}
      <ButtonZone>
        <ToggleButton
          $isReadOnly={isReadOnly}
          onClick={() => setIsReadOnly(!isReadOnly)}
          aria-label={isReadOnly ? '편집모드 전환' : '읽기모드 전환'}
        >
          {isReadOnly ? <EditIcon /> : <ReadIcon />}
        </ToggleButton>
        <ShareButton onClick={handleShare} aria-label="공유">
          <ShareIcon />
        </ShareButton>
      </ButtonZone>
      {lastModified && <LastModifiedTime>{formatLastModified(lastModified)}</LastModifiedTime>}
      <Toast $show={showToast}>{toastMessage}</Toast>
      <div style={{ textAlign: 'start' }}>
        <Milkdown />
      </div>
    </MainContainer>
  );
};

export const LinkNote: React.FC = () => {
  return (
    <MilkdownProvider>
      <CrepeEditor />
    </MilkdownProvider>
  );
};

// 압축된 URL 데이터 생성 유틸리티 함수
export const createNoteUrl = (content: string, password?: string): string => {
  const data: NoteData = {
    c: content, // 단축 키 사용
    lm: new Date().toISOString(), // 현재 날짜를 마지막 수정 시간으로 추가
  };

  const jsonString = JSON.stringify(data);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);

  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?data=${compressed}`;
};

export default LinkNote;
