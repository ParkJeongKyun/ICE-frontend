'use client';

import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/crepe/theme/common/style.css';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import LZString from 'lz-string';
import EditIcon from '@/components/common/Icons/EditIcon';
import ReadIcon from '@/components/common/Icons/ReadIcon';
import ShareIcon from '@/components/common/Icons/ShareIcon';
import {
  MainContainer,
  ButtonZone,
  ToggleButton,
  ShareButton,
  Toast,
  StatusIndicator,
  LastModifiedTime,
  GuideBox,
} from './LinkNoteLayout.styles';
import FlopyIcon from '@/components/common/Icons/FlopyIcon';
import { createNoteUrl } from './utils';

// 데이터 구조 인터페이스
interface NoteData {
  c?: string; // 내용
  lm?: string; // 마지막 수정 시간
}

const MAX_URL_LENGTH = 8000; // 크로스 브라우저 호환성을 위한 안전한 길이 (약 5-6페이지 분량)

const CrepeEditor: React.FC = () => {
  const t = useTranslations('linknote');
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [initialContent, setInitialContent] = useState('');
  const [initialLastModified, setInitialLastModified] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const editorRef = useRef<Crepe | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastModified, setLastModified] = useState<string>('');

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReadOnlyRef = useRef(isReadOnly);

  // isReadOnly 상태를 ref에 동기화
  useEffect(() => {
    isReadOnlyRef.current = isReadOnly;
  }, [isReadOnly]);

  const showToast = (msg: string, duration = 3000) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), duration);
  };

  // URL에서 노트 데이터 추출 함수
  const getNoteDataFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const compressedData = urlParams.get('data');

    if (!compressedData) return { content: '', lastModified: '' };

    try {
      const decompressed =
        LZString.decompressFromEncodedURIComponent(compressedData);
      if (!decompressed) return { content: '', lastModified: '' };

      const data: NoteData = JSON.parse(decompressed);
      return {
        content: data.c || '',
        lastModified: data.lm || '',
      };
    } catch {
      showToast(t('invalidData'));
      return { content: '', lastModified: '' };
    }
  };

  // 초기 하이드레이션
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // URL 데이터 로드 (하이드레이션 후 한 번만)
  useEffect(() => {
    if (!isHydrated) return;

    const { content, lastModified: lm } = getNoteDataFromUrl();
    setInitialContent(content);
    setInitialLastModified(lm);
  }, [isHydrated]);

  const handleShare = () => {
    const url = window.location.href;

    if (url.length > MAX_URL_LENGTH) {
      showToast(t('contentTooLong'));
      return;
    }

    if (navigator.share) {
      navigator
        .share({
          title: t('shareTitle'),
          text: t('shareText'),
          url: url,
        })
        .then(() => showToast(t('shareSuccess')))
        .catch((error) => {
          if (error.name !== 'AbortError') {
            copyToClipboard(url);
          }
        });
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => showToast(t('copiedToClipboard')))
      .catch(() => showToast(t('copyFailed')));
  };

  useEffect(() => {
    if (initialLastModified) setLastModified(initialLastModified);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (hideStatusTimeoutRef.current)
        clearTimeout(hideStatusTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [initialLastModified]);

  const { get } = useEditor(
    (root) => {
      const editor = new Crepe({
        root,
        defaultValue: initialContent,
        featureConfigs: {
          [Crepe.Feature.LinkTooltip]: {
            inputPlaceholder: t('urlPlaceholder'),
          },
          [Crepe.Feature.Placeholder]: {
            text: t('editorPlaceholder'),
          },
        },
      });

      // 초기 상태 설정
      editor.setReadonly(isReadOnly);
      editorRef.current = editor;

      // 이벤트 리스너 등록
      editor.on((listener) => {
        listener.updated(() => {
          if (!isReadOnlyRef.current) {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            if (hideStatusTimeoutRef.current)
              clearTimeout(hideStatusTimeoutRef.current);
            setIsSaving(true);
            saveTimeoutRef.current = setTimeout(() => {
              try {
                // 에디터에서 직접 마크다운 가져오기
                const markdown = editor.getMarkdown();

                const newUrl = createNoteUrl(markdown);

                if (newUrl.length > MAX_URL_LENGTH) {
                  showToast(t('contentTooLongError'));
                  setIsSaving(false);
                  return;
                }

                window.history.replaceState({}, '', newUrl);
                setLastModified(new Date().toISOString());
                hideStatusTimeoutRef.current = setTimeout(
                  () => setIsSaving(false),
                  1000
                );
              } catch {
                showToast(t('saveFailed'));
                setIsSaving(false);
              }
            }, 500);
          }
        });
      });

      return editor;
    },
    [initialContent]
  );

  // 읽기 모드 상태가 변경될 때마다 에디터 업데이트
  useEffect(() => {
    if (editorRef.current) editorRef.current.setReadonly(isReadOnly);
  }, [isReadOnly]);

  const formatLastModified = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return (
      t('lastModified') +
      ': ' +
      date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  // 하이드레이션 전까지 기본 UI만 표시
  if (!isHydrated) {
    return (
      <MainContainer>
        <GuideBox>
          <b>{t('loading')}</b>
        </GuideBox>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      {/* 가이드 메시지: 내용이 비어있을 때만 표시 */}
      {!initialContent && isReadOnly && (
        <GuideBox>
          <b>{t('guide.title')}</b>
          <ul>
            {t.rich('guide.steps.0', {
              b: (chunks) => <b>{chunks}</b>,
            }) && (
              <li>
                {t.rich('guide.steps.0', {
                  b: (chunks) => <b>{chunks}</b>,
                })}
              </li>
            )}
            {t.rich('guide.steps.1', {
              b: (chunks) => <b>{chunks}</b>,
            }) && (
              <li>
                {t.rich('guide.steps.1', {
                  b: (chunks) => <b>{chunks}</b>,
                })}
              </li>
            )}
            {t.rich('guide.steps.2', {
              b: (chunks) => <b>{chunks}</b>,
            }) && (
              <li>
                {t.rich('guide.steps.2', {
                  b: (chunks) => <b>{chunks}</b>,
                })}
              </li>
            )}
            {t.rich('guide.steps.3', {
              b: (chunks) => <b>{chunks}</b>,
            }) && (
              <li>
                {t.rich('guide.steps.3', {
                  b: (chunks) => <b>{chunks}</b>,
                })}
              </li>
            )}
          </ul>
        </GuideBox>
      )}
      {isSaving && !isReadOnly && (
        <StatusIndicator $saving={isSaving}>
          <FlopyIcon />
        </StatusIndicator>
      )}
      <ButtonZone>
        <div className="btn-tooltip-wrap">
          <ToggleButton
            $isReadOnly={isReadOnly}
            $pulse={!initialContent && isReadOnly}
            onClick={() => setIsReadOnly(!isReadOnly)}
            aria-label={isReadOnly ? t('editMode') : t('readMode')}
            tabIndex={0}
          >
            {isReadOnly ? <EditIcon /> : <ReadIcon />}
            <span className="btn-tooltip">
              {isReadOnly ? t('editMode') : t('readMode')}
            </span>
          </ToggleButton>
        </div>
        <div className="btn-tooltip-wrap">
          <ShareButton
            $pulse={!initialContent && isReadOnly}
            onClick={handleShare}
            aria-label={t('share')}
            tabIndex={0}
          >
            <ShareIcon />
            <span className="btn-tooltip">{t('share')}</span>
          </ShareButton>
        </div>
      </ButtonZone>
      {lastModified && (
        <LastModifiedTime>{formatLastModified(lastModified)}</LastModifiedTime>
      )}
      <Toast $show={!!toastMsg}>{toastMsg}</Toast>
      <div style={{ textAlign: 'start' }}>
        <Milkdown />
      </div>
    </MainContainer>
  );
};

export default function LinkNoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MilkdownProvider>
      <CrepeEditor />
      {children}
    </MilkdownProvider>
  );
}
