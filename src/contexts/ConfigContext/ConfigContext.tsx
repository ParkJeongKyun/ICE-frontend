'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface IceConfig {
  // 추후 설정 추가 가능
  _placeholder?: boolean;
}

const DEFAULT_CONFIG: IceConfig = {};

const STORAGE_KEY = 'ice_user_config';

interface ConfigContextValue {
  config: IceConfig;
  updateConfig: (partial: DeepPartial<IceConfig>) => void;
}

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

const ConfigContext = createContext<ConfigContextValue>({
  config: DEFAULT_CONFIG,
  updateConfig: () => {},
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
        setConfig(deepMerge(DEFAULT_CONFIG, parsed));
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

  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
