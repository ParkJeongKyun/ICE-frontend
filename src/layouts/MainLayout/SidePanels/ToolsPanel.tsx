import React from 'react';
import Searcher from '@/components/Searcher/Searcher';
import DataInspector from '@/components/DataInspector/DataInspector';
import HashCalculator from '@/components/HashCalculator/HashCalculator';
import DataConverter from '@/components/DataConverter/DataConverter';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';

const ToolsPanel: React.FC = () => {
  const { config } = useConfig();
  const v = config.ui.panelVisibility.tools;

  if (!v.enabled) return null;

  return (
    <div>
      {v.searcher && <Searcher />}
      {v.hashCalculator && <HashCalculator />}
      {v.dataConverter && <DataConverter />}
      {v.dataInspector && <DataInspector />}
    </div>
  );
};

export default ToolsPanel;
