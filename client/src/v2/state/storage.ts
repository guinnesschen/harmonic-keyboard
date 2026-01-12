import type { SettingsState } from "./defaults";

const STORAGE_KEY = "harmonic-keyboard-v2-settings";

export function loadSettings(): SettingsState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SettingsState;
  } catch (error) {
    console.warn("Failed to parse settings from storage", error);
    return null;
  }
}

export function saveSettings(settings: SettingsState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
