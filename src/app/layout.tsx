// src/app/layout.tsx (최상위)
import { HexViewerCacheProvider } from '@/contexts/HexViewerCacheContext';
import { ProcessProvider } from '@/contexts/ProcessContext';
import { RefProvider } from '@/contexts/RefContext';
import { TabDataProvider } from '@/contexts/TabDataContext';
import { WorkerProvider } from '@/contexts/WorkerContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProcessProvider>
      <WorkerProvider>
        <TabDataProvider>
          <RefProvider>
            <HexViewerCacheProvider>{children}</HexViewerCacheProvider>
          </RefProvider>
        </TabDataProvider>
      </WorkerProvider>
    </ProcessProvider>
  );
}
