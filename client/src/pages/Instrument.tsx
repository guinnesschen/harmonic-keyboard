import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ChordDisplay from "@/components/ChordDisplay";
import KeyboardGuide from "@/components/KeyboardGuide";
import HelpModal from "@/components/HelpModal";
import SoundControlsModal from "@/components/SoundControlsModal";
import BackgroundAnimation from "@/components/BackgroundAnimation";
import { generateVoicingFromKeyState, handleKeyPress, handleKeyRelease } from "@/lib/keyboardMapping";
import { initAudio, playChord, type SynthSettings } from "@/lib/audio";
import type { ChordVoicing } from "@shared/schema";
import { generateVoicing } from "@/lib/voiceLeading";
import { InversionMode, StickyMode, BackgroundMode } from "@shared/schema";
import SettingsModal from "@/components/SettingsModal";

const defaultSettings: SynthSettings = {
  oscillator: {
    type: "triangle",
    spread: 20
  },
  envelope: {
    attack: 0.05,
    decay: 0.1,
    sustain: 0.3,
    release: 1
  },
  effects: {
    reverb: {
      decay: 2,
      wet: 0.3
    },
    chorus: {
      depth: 0.5,
      frequency: 4,
      wet: 0.3
    },
    eq: {
      low: 0,
      mid: 0,
      high: 0
    },
    compression: {
      threshold: -20,
      ratio: 4,
      attack: 0.003,
      release: 0.25
    },
    distortion: {
      distortion: 0.4,
      wet: 0.2
    }
  },
  volume: -12
};

export default function Instrument() {
  const [currentVoicing, setCurrentVoicing] = useState<ChordVoicing | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [inversionMode, setInversionMode] = useState<InversionMode>(InversionMode.Traditional);
  const [stickyMode, setStickyMode] = useState<StickyMode>(StickyMode.Off);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>(BackgroundMode.Minimal);

  const initializeAudio = async () => {
    try {
      await initAudio(defaultSettings);
      setIsAudioInitialized(true);
      console.log("Audio initialized successfully");
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }
  };

  useEffect(() => {
    if (!isAudioInitialized) return;

    const updateVoicing = () => {
      const newBasicVoicing = generateVoicingFromKeyState(inversionMode, stickyMode);
      if (newBasicVoicing) {
        const fullVoicing = generateVoicing(newBasicVoicing, currentVoicing);
        setCurrentVoicing(fullVoicing);
        playChord(fullVoicing);
      } else {
        playChord(null);
        setCurrentVoicing(null);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      handleKeyPress(e);
      updateVoicing();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const allKeysReleased = handleKeyRelease(e, stickyMode);
      if (allKeysReleased) {
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
  }, [currentVoicing, isAudioInitialized, inversionMode, stickyMode]);

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      {backgroundMode === BackgroundMode.Animated && (
        <BackgroundAnimation voicing={currentVoicing} />
      )}

      <div className="relative z-10">
        <SettingsModal
          inversionMode={inversionMode}
          stickyMode={stickyMode}
          backgroundMode={backgroundMode}
          onInversionModeChange={setInversionMode}
          onStickyModeChange={setStickyMode}
          onBackgroundModeChange={setBackgroundMode}
        />
        <HelpModal />
        <SoundControlsModal initialSettings={defaultSettings} />

        <div className="max-w-6xl mx-auto p-8 space-y-12">
          {!isAudioInitialized ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
              <Button
                onClick={initializeAudio}
                className="text-lg py-6 px-8 bg-primary/90 hover:bg-primary transition-colors duration-300"
              >
                Enable Audio
              </Button>
            </div>
          ) : null}
          
          <div className="space-y-12 max-w-4xl mx-auto pt-8">
            <ChordDisplay voicing={currentVoicing} />
            <KeyboardGuide
              activeVoicing={currentVoicing}
              inversionMode={inversionMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}