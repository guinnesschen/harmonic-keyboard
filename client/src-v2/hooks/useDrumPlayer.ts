import { useEffect, useCallback, useState, useRef } from 'react';
import { useAudio } from '../state/AudioContext';
import type { DrumSound, DrumEvent, LoopState } from '../audio/types';
import { DRUM_KEY_MAP } from '../domain/constants';

interface UseDrumPlayerOptions {
  enabled: boolean;
}

export function useDrumPlayer({ enabled }: UseDrumPlayerOptions) {
  const { initialized, initialize, drumKit } = useAudio();

  const [loopState, setLoopState] = useState<LoopState>('idle');
  const [recordedEvents, setRecordedEvents] = useState<DrumEvent[]>([]);
  const [loopDuration, setLoopDuration] = useState(0);
  const [activePad, setActivePad] = useState<DrumSound | null>(null);

  const loopIntervalRef = useRef<number | null>(null);
  const loopStartTimeRef = useRef<number>(0);

  // Trigger a drum sound
  const triggerDrum = useCallback(
    (sound: DrumSound) => {
      if (!initialized) return;
      drumKit.trigger(sound);
      setActivePad(sound);
      setTimeout(() => setActivePad(null), 100);
    },
    [initialized, drumKit]
  );

  // Start loop playback
  const startPlayback = useCallback(() => {
    if (recordedEvents.length === 0 || loopDuration === 0) return;

    loopStartTimeRef.current = Date.now();
    drumKit.playEvents(recordedEvents);

    // Set up loop
    loopIntervalRef.current = window.setInterval(() => {
      loopStartTimeRef.current = Date.now();
      drumKit.playEvents(recordedEvents);
    }, loopDuration * 1000);
  }, [recordedEvents, loopDuration, drumKit]);

  // Stop loop playback
  const stopPlayback = useCallback(() => {
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
  }, []);

  // Handle space bar for loop control (Boss-style)
  const handleLoopControl = useCallback(() => {
    switch (loopState) {
      case 'idle':
        drumKit.startRecording();
        setLoopState('recording');
        break;
      case 'recording': {
        const events = drumKit.stopRecording();
        setRecordedEvents(events);
        const duration = events.length > 0 ? Math.max(...events.map((e) => e.time)) + 0.5 : 4;
        setLoopDuration(duration);
        setLoopState('playing');
        // Start playback after a tiny delay
        setTimeout(() => {
          loopStartTimeRef.current = Date.now();
          drumKit.playEvents(events);
          loopIntervalRef.current = window.setInterval(() => {
            loopStartTimeRef.current = Date.now();
            drumKit.playEvents(events);
          }, duration * 1000);
        }, 50);
        break;
      }
      case 'playing':
        drumKit.startRecording();
        setLoopState('overdubbing');
        break;
      case 'overdubbing': {
        const newEvents = drumKit.stopRecording();
        setRecordedEvents((prev) => [...prev, ...newEvents]);
        setLoopState('playing');
        break;
      }
    }
  }, [loopState, drumKit]);

  // Quantize recorded events
  const quantize = useCallback(
    (gridSize: number = 16, bpm: number = 120) => {
      setRecordedEvents((prev) => drumKit.quantize(prev, gridSize, bpm));
    },
    [drumKit]
  );

  // Clear loop
  const clearLoop = useCallback(() => {
    stopPlayback();
    setRecordedEvents([]);
    setLoopDuration(0);
    setLoopState('idle');
  }, [stopPlayback]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!enabled || e.repeat) return;

      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Space bar for loop control
      if (e.key === ' ') {
        e.preventDefault();
        if (!initialized) await initialize();
        handleLoopControl();
        return;
      }

      // Escape to clear
      if (e.key === 'Escape') {
        clearLoop();
        return;
      }

      const sound = DRUM_KEY_MAP[e.key.toLowerCase()] as DrumSound | undefined;
      if (!sound) return;

      if (!initialized) {
        await initialize();
      }

      triggerDrum(sound);
    },
    [enabled, initialized, initialize, triggerDrum, handleLoopControl, clearLoop]
  );

  // Attach listeners
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopPlayback();
    };
  }, [enabled, handleKeyDown, stopPlayback]);

  // Get current playback position (0-1)
  const getPlaybackPosition = useCallback(() => {
    if (loopState !== 'playing' && loopState !== 'overdubbing') return 0;
    if (loopDuration === 0) return 0;
    const elapsed = (Date.now() - loopStartTimeRef.current) / 1000;
    return (elapsed % loopDuration) / loopDuration;
  }, [loopState, loopDuration]);

  return {
    loopState,
    recordedEvents,
    loopDuration,
    activePad,
    triggerDrum,
    quantize,
    clearLoop,
    getPlaybackPosition,
  };
}
