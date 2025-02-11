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
import SettingsModal from "@/components/SettingsModal";
import { defaultChordQualities } from "@/lib/chordConfig";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const defaultSettings: SynthSettings = {
  oscillator: {
    type: "sine",
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
      decay: 1,
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
      high: 1,
    },
    compression: {
      threshold: -20,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
    },
    distortion: {
      distortion: 0.2,
      wet: 0.1,
    },
  },
  volume: -12,
};

export default function Instrument() {
  const [currentVoicing, setCurrentVoicing] = useState<ChordVoicing | null>(
    null,
  );
  const [prevVoicing, setPrevVoicing] = useState<ChordVoicing | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
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
    let updateTimeout: NodeJS.Timeout | null = null;
    let lastUpdateTime = 0;
    const DEBOUNCE_TIME = 80; // 80ms debounce

    const updateVoicing = () => {
      const now = Date.now();
      if (now - lastUpdateTime < DEBOUNCE_TIME) {
        // Clear existing timeout if it exists
        if (updateTimeout) clearTimeout(updateTimeout);

        // Schedule new update
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

      // Initialize audio on first key press if needed
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
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      <div className="relative z-10 [&:fullscreen]:pt-0 pt-8">
        <div className="flex gap-2 absolute top-4 right-4 [&_button]:hover:bg-transparent [&_button]:hover:opacity-70">
          <SettingsModal
            chordQualities={chordQualities}
            onChordQualitiesChange={setChordQualities}
          />
          <HelpModal />
          <SoundControlsModal initialSettings={defaultSettings} />
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="black-900 hover:bg-transparent"
          >
            <a
              href="https://github.com/guinnesschen/harmonic-keyboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5 text-gray-600" />
            </a>
          </Button>
        </div>

        <div className="max-w-6xl mx-auto p-8 space-y-12">
          <div className="space-y-12 max-w-4xl mx-auto">
            <ChordDisplay voicing={currentVoicing} />
            <KeyboardGuide activeVoicing={currentVoicing} />
          </div>
        </div>
      </div>
    </div>
  );
}