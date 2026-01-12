import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import ChordDisplay from "../components/ChordDisplay";
import KeyboardGuide from "../components/KeyboardGuide";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSettings } from "../../state/settingsStore";
import {
  createKeyboardState,
  DEFAULT_BASS_KEYS,
  DEFAULT_INVERSION_KEYS,
  DEFAULT_QUALITY_KEY_MAPPINGS,
} from "../../input/keyboardMapping";
import { AudioEngine } from "../../audio/engine";
import { generateVoicing } from "../../domain/voicing";
import type { ChordVoicing } from "../../domain/types";

export default function Main() {
  const { settings } = useSettings();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [currentVoicing, setCurrentVoicing] = useState<ChordVoicing | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const prevVoicingRef = useRef<ChordVoicing | null>(null);
  const engineRef = useRef<AudioEngine | null>(null);

  const keyboardState = useMemo(
    () =>
      createKeyboardState({
        bassKeys: DEFAULT_BASS_KEYS,
        inversionKeys: DEFAULT_INVERSION_KEYS,
        qualityKeyMappings: DEFAULT_QUALITY_KEY_MAPPINGS,
      }),
    [],
  );

  useEffect(() => {
    engineRef.current = new AudioEngine();
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    keyboardState.setQualityKeyMappings(settings.keyMappings);
    keyboardState.setChordDefaults(settings.chordDefaults);
  }, [keyboardState, settings.keyMappings, settings.chordDefaults]);

  useEffect(() => {
    if (isAudioInitialized) {
      engineRef.current?.updateSettings(settings.soundSettings);
    }
  }, [settings.soundSettings, isAudioInitialized]);

  useEffect(() => {
    let updateTimeout: NodeJS.Timeout | null = null;
    let lastUpdateTime = 0;
    const DEBOUNCE_TIME = 80;

    const performUpdate = () => {
      lastUpdateTime = Date.now();
      const intent = keyboardState.toIntent();
      if (intent) {
        const voicing = generateVoicing(intent, prevVoicingRef.current);
        prevVoicingRef.current = voicing;
        setCurrentVoicing(voicing);
        engineRef.current?.playVoicing(voicing);
      } else {
        prevVoicingRef.current = null;
        setCurrentVoicing(null);
        engineRef.current?.playVoicing(null);
      }
    };

    const updateVoicing = () => {
      const now = Date.now();
      if (now - lastUpdateTime < DEBOUNCE_TIME) {
        if (updateTimeout) clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
          performUpdate();
        }, DEBOUNCE_TIME);
        return;
      }
      performUpdate();
    };

    const initializeAudio = async () => {
      if (!engineRef.current || isAudioInitialized) return true;
      try {
        await engineRef.current.init(settings.soundSettings);
        setIsAudioInitialized(true);
        return true;
      } catch (error) {
        console.error("Failed to initialize audio:", error);
        return false;
      }
    };

    const onKeyDown = async (event: KeyboardEvent) => {
      if (event.repeat) return;
      const success = await initializeAudio();
      if (!success) return;
      keyboardState.pressKey(event.key);
      updateVoicing();
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keyboardState.releaseKey(event.key);
      if (keyboardState.getPressed().size === 0) {
        if (updateTimeout) clearTimeout(updateTimeout);
        engineRef.current?.playVoicing(null);
        setCurrentVoicing(null);
        prevVoicingRef.current = null;
        return;
      }
      updateVoicing();
    };

    const clearState = () => {
      keyboardState.clear();
      engineRef.current?.playVoicing(null);
      setCurrentVoicing(null);
      prevVoicingRef.current = null;
    };

    const onBlur = () => {
      clearState();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearState();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (updateTimeout) clearTimeout(updateTimeout);
    };
  }, [keyboardState, settings.soundSettings, isAudioInitialized]);

  return (
    <div className="h-screen bg-[#fafafa] flex flex-col overflow-hidden">
      <Header onVideoOpen={() => setIsVideoOpen(true)} />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-between overflow-hidden font-mono text-gray-900">
          <div className="flex-grow flex flex-col max-w-4xl mx-auto px-4 w-full min-h-[400px] py-4">
            <div className="min-h-[60px] mb-auto">
              <ChordDisplay voicing={currentVoicing} />
            </div>
            <div className="flex-grow flex flex-col justify-center gap-4">
              <KeyboardGuide activeVoicing={currentVoicing} />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <iframe
            className="w-full aspect-video"
            src="https://www.youtube.com/embed/EFqt0oD22WA"
            title="Harmonic Keyboard Tutorial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
