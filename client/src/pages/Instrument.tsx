import { useEffect, useState } from "react";
import ChordDisplay from "@/components/ChordDisplay";
import KeyboardGuide from "@/components/KeyboardGuide";
import HelpModal from "@/components/HelpModal";
import SoundControlsModal from "@/components/SoundControlsModal";
import {
  generateVoicingFromKeyState,
  handleKeyPress,
  handleKeyRelease,
} from "@/lib/keyboardMapping";
import { initAudio, playChord, type SynthSettings } from "@/lib/audio";
import type { ChordVoicing } from "@shared/schema";
import { generateVoicing } from "@/lib/voiceLeading";
import { StickyMode } from "@shared/schema";
import SettingsModal from "@/components/SettingsModal";
import { defaultChordQualities } from "@/lib/chordConfig";

const defaultSettings: SynthSettings = {
  oscillator: {
    type: "triangle",
    spread: 20,
  },
  envelope: {
    attack: 0.05,
    decay: 0.1,
    sustain: 0.3,
    release: 1,
  },
  effects: {
    reverb: {
      decay: 2,
      wet: 0.3,
    },
    chorus: {
      depth: 0.5,
      frequency: 4,
      wet: 0.3,
    },
    eq: {
      low: 0,
      mid: 0,
      high: 0,
    },
    compression: {
      threshold: -20,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
    },
    distortion: {
      distortion: 0.4,
      wet: 0.2,
    },
  },
  volume: -12,
};

export default function Instrument() {
  const [currentVoicing, setCurrentVoicing] = useState<ChordVoicing | null>(null);
  const [prevVoicing, setPrevVoicing] = useState<ChordVoicing | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [stickyMode, setStickyMode] = useState<StickyMode>(StickyMode.Off);
  const [chordQualities, setChordQualities] = useState(defaultChordQualities);

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
    const updateVoicing = () => {
      const newBasicVoicing = generateVoicingFromKeyState(stickyMode);
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

      // Initialize audio on first key press if needed
      if (!isAudioInitialized) {
        const success = await initializeAudio();
        if (!success) return;
      }

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
  }, [currentVoicing, isAudioInitialized, stickyMode]);

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      <div className="relative z-10">
        <SettingsModal
          stickyMode={stickyMode}
          chordQualities={chordQualities}
          onStickyModeChange={setStickyMode}
          onChordQualitiesChange={setChordQualities}
        />
        <HelpModal />
        <SoundControlsModal initialSettings={defaultSettings} />

        <div className="max-w-6xl mx-auto p-8 space-y-12">
          <div className="space-y-12 max-w-4xl mx-auto pt-8">
            <ChordDisplay voicing={currentVoicing} />
            <KeyboardGuide
              activeVoicing={currentVoicing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}