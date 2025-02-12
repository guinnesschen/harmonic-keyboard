import { useEffect, useState } from "react";
import ChordDisplay from "@/components/ChordDisplay";
import KeyboardGuide from "@/components/KeyboardGuide";
import DrumMachine from "@/components/DrumMachine";
import {
  generateVoicingFromKeyState,
  handleKeyPress,
  handleKeyRelease,
} from "@/lib/keyboardMapping";
import { initAudio, playChord, type SynthSettings } from "@/lib/audio";
import type { ChordVoicing } from "@shared/schema";
import { generateVoicing } from "@/lib/voiceLeading";
import type { InstrumentType } from "@/components/InstrumentSwitcher";

interface InstrumentProps {
  chordQualities: Record<string, boolean>;
  defaultSettings: SynthSettings;
  sheetMusicPanelOpen?: boolean;
  currentInstrument: InstrumentType;
}

export default function Instrument({
  chordQualities,
  defaultSettings,
  sheetMusicPanelOpen = false,
  currentInstrument,
}: InstrumentProps) {
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

    // Only setup piano key handlers if piano is the current instrument
    if (currentInstrument === "piano") {
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
    } else {
      // If switching away from piano, clear any active chords
      playChord(null);
      setCurrentVoicing(null);
    }
  }, [currentInstrument, currentVoicing, isAudioInitialized]);

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden font-mono text-gray-900">
      <div
        className={`flex-grow flex flex-col max-w-4xl mx-auto px-4 w-full ${
          sheetMusicPanelOpen ? "min-h-[300px] py-2" : "min-h-[400px] py-4"
        }`}
      >
        {currentInstrument === "piano" ? (
          <>
            <div className="min-h-[60px] mb-auto">
              <ChordDisplay
                voicing={currentVoicing}
                sheetMusicPanelOpen={sheetMusicPanelOpen}
              />
            </div>
            <div
              className={`flex-grow flex flex-col justify-center ${
                sheetMusicPanelOpen ? "gap-2" : "gap-4"
              }`}
            >
              <KeyboardGuide activeVoicing={currentVoicing} />
            </div>
          </>
        ) : (
          <DrumMachine 
            className="flex-grow flex items-center" 
            isActive={currentInstrument === "drums"} 
          />
        )}
      </div>
    </div>
  );
}