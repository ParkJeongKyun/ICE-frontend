'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { preload } from 'react-dom';
import { HexViewerCacheProvider } from '@/contexts/HexViewerCacheContext/HexViewerCacheContext';
import { ProcessProvider } from '@/contexts/ProcessContext/ProcessContext';
import { RefProvider } from '@/contexts/RefContext/RefContext';
import { TabDataProvider } from '@/contexts/TabDataContext/TabDataContext';
import { WorkerProvider } from '@/contexts/WorkerContext/WorkerContext';
import { ConfigProvider } from '@/contexts/ConfigContext/ConfigContext';
import StyledComponentsRegistry from '@/app/[locale]/StyledComponentsRegistry';
import { WASM_MANIFEST } from '@/constants/wasm';

// WASM/Worker가 필요 없는 경량 페이지 경로
const LIGHT_PATHS = ['/linknote', '/about', '/docs'];

export default function GlobalProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLightPage = LIGHT_PATHS.some((p) => pathname.includes(p));

  if (isLightPage) {
    return (
      <ConfigProvider>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </ConfigProvider>
    );
  }

  preload(WASM_MANIFEST.core, { as: 'fetch' });
  preload(WASM_MANIFEST.image, { as: 'fetch' });
  preload(WASM_MANIFEST.pe, { as: 'fetch' });

  return (
    <ConfigProvider>
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
    </ConfigProvider>
  );
}
