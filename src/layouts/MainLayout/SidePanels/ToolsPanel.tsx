import React from 'react';
import Searcher from '@/components/Searcher/Searcher';
import DataInspector from '@/components/DataInspector/DataInspector';
import HashCalculator from '@/components/HashCalculator/HashCalculator';
import DataConverter from '@/components/DataConverter/DataConverter';

const ToolsPanel: React.FC = () => {
  return (
    <div>
      <Searcher />
      <HashCalculator />
      <DataConverter />
      <DataInspector />
    </div>
  );
};

export default ToolsPanel;
