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

  // Use refs for voicing history (doesn't need to trigger re-renders)
  const prevVoicingRef = useRef<ChordVoicing | null>(null);
  const currentVoicingRef = useRef<ChordVoicing | null>(null);

  // State only for UI display
  const [displayVoicing, setDisplayVoicing] = useState<ChordVoicing | null>(null);

  // Update voicing when keys change
  useEffect(() => {
    if (!enabled || !initialized) return;

    const intent = parseKeyboardState(pressedKeys, settings.qualityMappings);

    if (!intent) {
      // No chord - release and clear
      if (currentVoicingRef.current !== null) {
        chordSynth.release();
        prevVoicingRef.current = currentVoicingRef.current;
        currentVoicingRef.current = null;
        setDisplayVoicing(null);
      }
      return;
    }

    // Generate new voicing with voice leading from previous
    const voicing = generateVoicing(intent, prevVoicingRef.current);

    // Only play if voicing actually changed
    const notesChanged = !currentVoicingRef.current ||
      voicing.notes.join(',') !== currentVoicingRef.current.notes.join(',');

    if (notesChanged) {
      prevVoicingRef.current = currentVoicingRef.current;
      currentVoicingRef.current = voicing;
      setDisplayVoicing(voicing);
      chordSynth.playChord(voicing.notes);
    }
  }, [pressedKeys, enabled, initialized, settings.qualityMappings, chordSynth]);

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

  return { currentVoicing: displayVoicing };
}
