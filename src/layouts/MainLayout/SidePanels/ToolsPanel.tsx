import React from 'react';
import Searcher from '@/components/Searcher/Searcher';
import DataInspector from '@/components/DataInspector/DataInspector';

const ToolsPanel: React.FC = () => {
  return (
    <div>
      <Searcher />
      <DataInspector />
    </div>
  );
};

export default ToolsPanel;
