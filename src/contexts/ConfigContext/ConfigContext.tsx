'use client';

import { NumberBase, EncodingType } from '@/components/HexViewer/hexViewerConstants';
import React, { createContext, useContext, useEffect, useState } from 'react';

// ==================================================================================
// 1. Types & Constants
// ==================================================================================

export interface IceConfig {
  theme: 'dark' | 'light' | 'system';
  notifications: {
    enabled: boolean;
  };
  analysis: {
    enabled: boolean;
    imageMetadata: boolean;
    locationTracking: boolean;
  };
  // UI/UX 설정
  ui: {
    bytesPerLine: number;
    numberBase: NumberBase;
    encoding: EncodingType;
    dateFormat: 'ISO' | 'US' | 'KO';
    panelVisibility: {
      info: {
        enabled: boolean;
        exifThumbnail: boolean;
        fileInfo: boolean;
        map: boolean;
        exifInfo: boolean;
        ifdInfo: boolean;
        exifTags: boolean;
        textChunks: boolean;
      };
      tools: {
        enabled: boolean;
        searcher: boolean;
        hashCalculator: boolean;
        dataConverter: boolean;
        dataInspector: boolean;
      };
    };
  };
}

const DEFAULT_CONFIG: IceConfig = {
  theme: 'dark',
  notifications: {
    enabled: true,
  },
  analysis: {
    enabled: true,
    imageMetadata: true,
    locationTracking: true,
  },
  ui: {
    bytesPerLine: 16,
    numberBase: 'hexadecimal',
    encoding: 'ansi',
    dateFormat: 'ISO',
    panelVisibility: {
      info: {
        enabled: true,
        exifThumbnail: true,
        fileInfo: true,
        map: true,
        exifInfo: true,
        ifdInfo: true,
        exifTags: true,
        textChunks: true,
      },
      tools: {
        enabled: true,
        searcher: true,
        hashCalculator: true,
        dataConverter: true,
        dataInspector: true,
      },
    },
  },
};

const STORAGE_KEY = 'ice_user_config';

// NumberBase 검증용 객체
export const NUMBER_BASES: Record<NumberBase, NumberBase> = {
  binary: 'binary',
  octal: 'octal',
  decimal: 'decimal',
  hexadecimal: 'hexadecimal',
};

// 타입 가드
export const isValidNumberBase = (base: any): base is NumberBase => {
  return Object.prototype.hasOwnProperty.call(NUMBER_BASES, base);
};

// ==================================================================================
// 2. Helper Functions
// ==================================================================================

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function deepMerge<T extends object>(base: T, override: DeepPartial<T>): T {
  const result = { ...base };
  for (const key in override) {
    const val = override[key as keyof typeof override];
    if (val !== undefined && typeof val === 'object' && !Array.isArray(val)) {
      result[key as keyof T] = deepMerge(
        base[key as keyof T] as object,
        val as DeepPartial<object>
      ) as T[keyof T];
    } else if (val !== undefined) {
      result[key as keyof T] = val as T[keyof T];
    }
  }
  return result;
}

function validateConfig(config: IceConfig): IceConfig {
  const validated = { ...config };

  // theme 검증
  const validThemes = new Set(['dark', 'light', 'system']);
  if (!validThemes.has(config.theme)) {
    validated.theme = DEFAULT_CONFIG.theme;
  }

  // bytesPerLine 검증: 8, 16, 32, 64만 허용
  const validBytesPerLine = new Set([8, 16, 32, 64]);
  if (!validBytesPerLine.has(config.ui.bytesPerLine)) {
    validated.ui.bytesPerLine = DEFAULT_CONFIG.ui.bytesPerLine;
  }

  // numberBase 검증
  if (!isValidNumberBase(config.ui.numberBase)) {
    validated.ui.numberBase = DEFAULT_CONFIG.ui.numberBase;
  }

  // dateFormat 검증
  const validDateFormats = new Set(['ISO', 'US', 'KO']);
  if (!validDateFormats.has(config.ui.dateFormat)) {
    validated.ui.dateFormat = DEFAULT_CONFIG.ui.dateFormat;
  }

  // panelVisibility 검증
  const v = config.ui.panelVisibility;
  if (
    typeof v?.info?.enabled !== 'boolean' ||
    typeof v?.info?.exifThumbnail !== 'boolean' ||
    typeof v?.info?.fileInfo !== 'boolean' ||
    typeof v?.info?.map !== 'boolean' ||
    typeof v?.info?.exifInfo !== 'boolean' ||
    typeof v?.info?.ifdInfo !== 'boolean' ||
    typeof v?.info?.exifTags !== 'boolean' ||
    typeof v?.info?.textChunks !== 'boolean' ||
    typeof v?.tools?.enabled !== 'boolean' ||
    typeof v?.tools?.searcher !== 'boolean' ||
    typeof v?.tools?.hashCalculator !== 'boolean' ||
    typeof v?.tools?.dataConverter !== 'boolean' ||
    typeof v?.tools?.dataInspector !== 'boolean'
  ) {
    validated.ui.panelVisibility = DEFAULT_CONFIG.ui.panelVisibility;
  }

  // notifications.enabled 검증
  if (typeof config.notifications.enabled !== 'boolean') {
    validated.notifications.enabled = DEFAULT_CONFIG.notifications.enabled;
  }

  // analysis 검증
  if (typeof config.analysis.enabled !== 'boolean') {
    validated.analysis.enabled = DEFAULT_CONFIG.analysis.enabled;
  }
  if (typeof config.analysis.imageMetadata !== 'boolean') {
    validated.analysis.imageMetadata = DEFAULT_CONFIG.analysis.imageMetadata;
  }
  if (typeof config.analysis.locationTracking !== 'boolean') {
    validated.analysis.locationTracking =
      DEFAULT_CONFIG.analysis.locationTracking;
  }

  return validated;
}

// ==================================================================================
// 3. Provider & Hook
// ==================================================================================

interface ConfigContextValue {
  config: IceConfig;
  updateConfig: (partial: DeepPartial<IceConfig>) => void;
  resetConfig: () => void;
}

const ConfigContext = createContext<ConfigContextValue>({
  config: DEFAULT_CONFIG,
  updateConfig: () => {},
  resetConfig: () => {},
});

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<IceConfig>(DEFAULT_CONFIG);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DeepPartial<IceConfig>;
        const merged = deepMerge(DEFAULT_CONFIG, parsed);
        const validated = validateConfig(merged);
        setConfig(validated);
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  // Theme 효과 적용
  useEffect(() => {
    if (!isClient) return;

    const applyTheme = (theme: 'dark' | 'light' | 'system') => {
      const root = document.documentElement;
      let isDark = false;

      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(config.theme);

    // 시스템 테마 변경 감지
    if (config.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [config.theme, isClient]);

  const updateConfig = (partial: DeepPartial<IceConfig>) => {
    setConfig((prev) => {
      const updated = deepMerge(prev, partial);
      if (isClient) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore storage errors
        }
      }
      return updated;
    });
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    if (isClient) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
      } catch {
        // ignore storage errors
      }
    }
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
