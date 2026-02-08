import React from 'react';
import Searcher from '@/components/Searcher/Searcher';
import DataInspector from '@/components/DataInspector/DataInspector';
import HashCalculator from '@/components/Hash/HashCalculator';

const ToolsPanel: React.FC = () => {
  return (
    <div>
      <Searcher />
      <HashCalculator />
      <DataInspector />
    </div>
  );
};

export default ToolsPanel;
