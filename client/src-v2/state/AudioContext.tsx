import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from 'react';
import { ChordSynth } from '../audio/ChordSynth';
import { DrumKit } from '../audio/DrumKit';
import type { SynthSettings } from '../audio/types';
import { PRESETS, DEFAULT_PRESET } from '../audio/presets';

interface AudioContextValue {
  // Initialization
  initialized: boolean;
  initialize: () => Promise<void>;

  // Chord synth
  chordSynth: ChordSynth;
  synthSettings: SynthSettings;
  setSynthSettings: (settings: Partial<SynthSettings>) => void;
  currentPreset: string;
  setPreset: (name: string) => void;

  // Drum kit
  drumKit: DrumKit;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const chordSynthRef = useRef<ChordSynth>(new ChordSynth());
  const drumKitRef = useRef<DrumKit>(new DrumKit());

  const [initialized, setInitialized] = useState(false);
  const [synthSettings, setSynthSettingsState] = useState<SynthSettings>(PRESETS[DEFAULT_PRESET]);
  const [currentPreset, setCurrentPreset] = useState(DEFAULT_PRESET);

  const initialize = useCallback(async () => {
    if (initialized) return;

    await Promise.all([
      chordSynthRef.current.initialize(synthSettings),
      drumKitRef.current.initialize(),
    ]);

    setInitialized(true);
  }, [initialized, synthSettings]);

  const setSynthSettings = useCallback((settings: Partial<SynthSettings>) => {
    setSynthSettingsState((prev) => {
      const merged = { ...prev, ...settings };
      if (settings.effects) {
        merged.effects = { ...prev.effects, ...settings.effects };
      }
      return merged;
    });
    chordSynthRef.current.updateSettings(settings);
  }, []);

  const setPreset = useCallback((name: string) => {
    const preset = PRESETS[name];
    if (preset) {
      setSynthSettingsState(preset);
      chordSynthRef.current.applyPreset(name);
      setCurrentPreset(name);
    }
  }, []);

  return (
    <AudioContext.Provider
      value={{
        initialized,
        initialize,
        chordSynth: chordSynthRef.current,
        synthSettings,
        setSynthSettings,
        currentPreset,
        setPreset,
        drumKit: drumKitRef.current,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
}
