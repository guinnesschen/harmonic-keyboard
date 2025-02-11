import { useEffect, useState } from "react";
import ChordDisplay from "@/components/ChordDisplay";
import KeyboardGuide from "@/components/KeyboardGuide";
import {
  generateVoicingFromKeyState,
  handleKeyPress,
  handleKeyRelease,
} from "@/lib/keyboardMapping";
import { initAudio, playChord, type SynthSettings } from "@/lib/audio";
import type { ChordVoicing } from "@shared/schema";
import { generateVoicing } from "@/lib/voiceLeading";

interface InstrumentProps {
  chordQualities: Record<string, boolean>;
  defaultSettings: SynthSettings;
}

export default function Instrument({ chordQualities, defaultSettings }: InstrumentProps) {
  const [currentVoicing, setCurrentVoicing] = useState<ChordVoicing | null>(null);
  const [prevVoicing, setPrevVoicing] = useState<ChordVoicing | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  const initializeAudio = async () => {
    if (!isAudioInitialized) {
      try {
        await initAudio(defaultSettings);
        setIsAudioInitialized(true);
        console.log("Audio initialized successfully");
        return true;
      } catch (error) {
        console.error("Failed to initialize audio:", error);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    let updateTimeout: NodeJS.Timeout | null = null;
    let lastUpdateTime = 0;
    const DEBOUNCE_TIME = 80;

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

    const performUpdate = () => {
      lastUpdateTime = Date.now();
      const newBasicVoicing = generateVoicingFromKeyState();
      if (newBasicVoicing) {
        const fullVoicing = generateVoicing(newBasicVoicing, prevVoicing);
        setPrevVoicing(currentVoicing);
        setCurrentVoicing(fullVoicing);
        playChord(fullVoicing);
      } else {
        setPrevVoicing(currentVoicing);
        setCurrentVoicing(null);
        playChord(null);
      }
    };

    const onKeyDown = async (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (!isAudioInitialized) {
        const success = await initializeAudio();
        if (!success) return;
      }
      handleKeyPress(e);
      updateVoicing();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (handleKeyRelease(e)) {
        if (updateTimeout) clearTimeout(updateTimeout);
        playChord(null);
        setCurrentVoicing(null);
      } else {
        updateVoicing();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [currentVoicing, isAudioInitialized]);

  return (
    <div className="h-full flex flex-col justify-center overflow-hidden">
      <div className="space-y-8 max-w-4xl mx-auto px-8 -mt-8 mb-12">
        <ChordDisplay voicing={currentVoicing} />
        <KeyboardGuide activeVoicing={currentVoicing} />
      </div>
    </div>
  );
}