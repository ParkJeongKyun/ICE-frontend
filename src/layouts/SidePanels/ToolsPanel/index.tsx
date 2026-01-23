import React from 'react';
import Searcher from '@/components/Searcher';
import DataInspector from '@/components/DataInspector';

const ToolsPanel: React.FC = () => {
  return (
    <div>
      <Searcher />
      <DataInspector />
    </div>
  );
};

export default ToolsPanel;
