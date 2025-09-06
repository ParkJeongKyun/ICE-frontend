import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/crepe/theme/common/style.css';

const CrepeEditor: React.FC = () => {
  const { get } = useEditor((root) => {
    return new Crepe({ root });
  });

  return (
    <div style={{ textAlign: 'start' }}>
      <Milkdown />
    </div>
  );
};

export const LinkNote: React.FC = () => {
  return (
    <MilkdownProvider>
      <CrepeEditor />
    </MilkdownProvider>
  );
};

export default LinkNote;
