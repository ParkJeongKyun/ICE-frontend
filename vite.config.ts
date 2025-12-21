import * as path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
// import fixReactVirtualized from 'esbuild-plugin-react-virtualized';

export default defineConfig({
  plugins: [react(), svgrPlugin()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.glb'], // GLB 파일을 에셋으로 인식하도록 추가
  optimizeDeps: {
    esbuildOptions: {
      // @ts-ignore - esbuild 버전 충돌 무시
      // plugins: [fixReactVirtualized],
    },
  },
  define: {
    // Vue feature flags (Milkdown이 Vue를 사용하기 때문에 필요)
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
});
