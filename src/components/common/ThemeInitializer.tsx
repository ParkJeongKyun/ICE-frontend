'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';

export default function ThemeInitializer() {
  const { config } = useConfig();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const theme = config.theme || 'dark';
      const isDark =
        theme === 'dark' ||
        (theme === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      // ignore
    }
  }, [config.theme, pathname]);

  return null;
}
