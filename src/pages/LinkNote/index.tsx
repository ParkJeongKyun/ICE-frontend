import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/crepe/theme/common/style.css';
import { useEffect, useRef, useState } from 'react';
import LZString from 'lz-string';
import EditIcon from '@/components/common/Icons/EditIcon';
import ReadIcon from '@/components/common/Icons/ReadIcon';
import { MainContainer, ButtonZone, ToggleButton } from './index.styles';

// Interface for our data structure
interface NoteData {
  c?: string; // content
  lm?: string; // lastModified
}

const CrepeEditor: React.FC = () => {
  const [isReadOnly, setIsReadOnly] = useState(true);
  const editorRef = useRef<Crepe | null>(null);

  // Function to extract note data from URL
  const getNoteDataFromUrl = (): string => {
    const urlParams = new URLSearchParams(window.location.search);
    const compressedData = urlParams.get('data');

    if (!compressedData) return '';

    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(compressedData);
      if (!decompressed) return '';

      const data: NoteData = JSON.parse(decompressed);
      return data.c || '';
    } catch (error) {
      console.error('Error parsing URL data:', error);
      return '';
    }
  };

  // Get initial content from URL
  const initialContent = getNoteDataFromUrl();

  const { get } = useEditor((root) => {
    const editor = new Crepe({
      root,
      defaultValue: initialContent,
    });

    // 초기 상태 설정
    editor.setReadonly(isReadOnly);
    editorRef.current = editor;

    // Register event listeners
    editor.on((listener) => {
      listener.blur((ctx) => {
        // Get current content and create URL with compressed data
        const content = editor.getMarkdown();
        const newUrl = createNoteUrl(content);
        // Update the URL without refreshing the page
        window.history.replaceState({}, '', newUrl);
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

  return (
    <MainContainer>
      <ButtonZone>
        <ToggleButton
          isReadOnly={isReadOnly}
          onClick={() => setIsReadOnly(!isReadOnly)}
        >
          {isReadOnly ? <EditIcon /> : <ReadIcon />}
        </ToggleButton>
      </ButtonZone>
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

// Utility function to create compressed URL data
export const createNoteUrl = (content: string, password?: string): string => {
  const data: NoteData = {
    c: content, // Use shortened key
    lm: new Date().toISOString(), // Add current date as lastModified
  };

  const jsonString = JSON.stringify(data);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);

  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?data=${compressed}`;
};

export default LinkNote;
