'use client';

import React from 'react';
import { HexViewerCacheProvider } from '@/contexts/HexViewerCacheContext/HexViewerCacheContext';
import { ProcessProvider } from '@/contexts/ProcessContext/ProcessContext';
import { RefProvider } from '@/contexts/RefContext/RefContext';
import { TabDataProvider } from '@/contexts/TabDataContext/TabDataContext';
import { WorkerProvider } from '@/contexts/WorkerContext/WorkerContext';
import StyledComponentsRegistry from '@/app/[locale]/StyledComponentsRegistry';

export default function GlobalProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProcessProvider>
      <WorkerProvider>
        <TabDataProvider>
          <RefProvider>
            <HexViewerCacheProvider>
              <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
            </HexViewerCacheProvider>
          </RefProvider>
        </TabDataProvider>
      </WorkerProvider>
    </ProcessProvider>
  );
}
