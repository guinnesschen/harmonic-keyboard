import { useEffect, useRef, useCallback, useState } from 'react';
import { useKeyboard } from '../state/KeyboardContext';
import { useAudio } from '../state/AudioContext';
import { useStorage } from '../state/StorageContext';
import { parseKeyboardState } from '../domain/keyMapping';
import { generateVoicing } from '../domain/voiceLeading';
import type { ChordVoicing } from '../domain/types';

interface UseChordPlayerOptions {
  enabled: boolean;
}

export function useChordPlayer({ enabled }: UseChordPlayerOptions) {
  const { pressedKeys, addKey, removeKey } = useKeyboard();
  const { initialized, initialize, chordSynth } = useAudio();
  const { settings } = useStorage();

  const prevVoicingRef = useRef<ChordVoicing | null>(null);
  const [currentVoicing, setCurrentVoicing] = useState<ChordVoicing | null>(null);

  // Update voicing when keys change
  useEffect(() => {
    if (!enabled || !initialized) return;

    const intent = parseKeyboardState(pressedKeys, settings.qualityMappings);

    if (!intent) {
      chordSynth.release();
      prevVoicingRef.current = currentVoicing;
      setCurrentVoicing(null);
      return;
    }

    const voicing = generateVoicing(intent, prevVoicingRef.current);
    prevVoicingRef.current = currentVoicing;
    setCurrentVoicing(voicing);
    chordSynth.playChord(voicing.notes);
  }, [pressedKeys, enabled, initialized, settings.qualityMappings, chordSynth, currentVoicing]);

  // Keyboard event handlers
  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!enabled || e.repeat) return;

      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!initialized) {
        await initialize();
      }

      addKey(e.key);
    },
    [enabled, initialized, initialize, addKey]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      removeKey(e.key);
    },
    [enabled, removeKey]
  );

  // Attach listeners
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      chordSynth.release();
    };
  }, [enabled, handleKeyDown, handleKeyUp, chordSynth]);

  return { currentVoicing };
}
