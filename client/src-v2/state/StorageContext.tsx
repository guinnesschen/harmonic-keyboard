import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { QualityKeyMapping } from '../domain/types';
import type { SynthSettings } from '../audio/types';
import { createDefaultQualityMappings } from '../domain/keyMapping';
import { PRESETS, DEFAULT_PRESET } from '../audio/presets';

interface StoredSettings {
  qualityMappings: QualityKeyMapping[];
  synthSettings: SynthSettings;
  currentPreset: string;
}

const STORAGE_KEY = 'harmonic-keyboard-settings';

const DEFAULT_SETTINGS: StoredSettings = {
  qualityMappings: createDefaultQualityMappings(),
  synthSettings: PRESETS[DEFAULT_PRESET],
  currentPreset: DEFAULT_PRESET,
};

interface StorageContextValue {
  settings: StoredSettings;
  updateSettings: (update: Partial<StoredSettings>) => void;
  updateQualityMappings: (mappings: QualityKeyMapping[]) => void;
  resetSettings: () => void;
}

const StorageContext = createContext<StorageContextValue | null>(null);

function loadSettings(): StoredSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // Ignore errors
  }
  return DEFAULT_SETTINGS;
}

export function StorageProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoredSettings>(loadSettings);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore errors
    }
  }, [settings]);

  const updateSettings = useCallback((update: Partial<StoredSettings>) => {
    setSettings((prev) => ({ ...prev, ...update }));
  }, []);

  const updateQualityMappings = useCallback((mappings: QualityKeyMapping[]) => {
    setSettings((prev) => ({ ...prev, qualityMappings: mappings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <StorageContext.Provider value={{ settings, updateSettings, updateQualityMappings, resetSettings }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) throw new Error('useStorage must be used within StorageProvider');
  return context;
}
