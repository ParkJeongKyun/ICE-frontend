'use client';
import { NumberBase, EncodingType } from '@/components/HexViewer/hexViewerConstants';
import React, { createContext, useContext, useEffect, useState } from 'react';

// ==================================================================================
// 1. Types & Constants
// ==================================================================================

export interface IceConfig {
  notifications: {
    enabled: boolean;
  };
  analysis: {
    enabled: boolean;
    imageMetadata: boolean;
  };
  // UI/UX 설정
  ui: {
    bytesPerLine: number;
    numberBase: NumberBase;
    encoding: EncodingType;
    dateFormat: 'ISO' | 'US' | 'KO';
  };
}

const DEFAULT_CONFIG: IceConfig = {
  notifications: {
    enabled: true,
  },
  analysis: {
    enabled: true,
    imageMetadata: true,
  },
  ui: {
    bytesPerLine: 16,
    numberBase: 'hexadecimal',
    encoding: 'ansi',
    dateFormat: 'ISO',
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
