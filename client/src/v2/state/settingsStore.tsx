import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { SettingsState } from "./defaults";
import { defaultSettingsState } from "./defaults";
import { loadSettings, saveSettings } from "./storage";

interface SettingsContextValue {
  settings: SettingsState;
  updateSettings: (updates: Partial<SettingsState>) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const stored = loadSettings();
    return stored ?? defaultSettingsState;
  });

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = (updates: Partial<SettingsState>) => {
    setSettings((current) => ({
      ...current,
      ...updates,
    }));
  };

  const value = useMemo(
    () => ({ settings, updateSettings }),
    [settings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
