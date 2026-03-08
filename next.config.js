const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/locales/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 정적 배포 모드 유지

  images: {
    unoptimized: true, // GitHub Pages는 이미지 최적화 서버가 없으므로 필수
  },

  basePath: '',

  compiler: {
    styledComponents: true,
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
};

module.exports = withNextIntl(nextConfig);
