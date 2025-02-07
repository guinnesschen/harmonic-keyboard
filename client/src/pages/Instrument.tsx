import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import ChordDisplay from "@/components/ChordDisplay";
import KeyboardGuide from "@/components/KeyboardGuide";
import { handleKeyPress, handleKeyRelease } from "@/lib/keyboardMapping";
import { initAudio, playChord } from "@/lib/audio";
import type { ChordVoicing } from "@shared/schema";
import { generateVoicing } from "@/lib/voiceLeading";

export default function Instrument() {
  const [currentVoicing, setCurrentVoicing] = useState<ChordVoicing | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initAudio();
      setIsAudioInitialized(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isAudioInitialized) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const newVoicing = handleKeyPress(e, currentVoicing);
      if (newVoicing) {
        const voicing = generateVoicing(newVoicing, currentVoicing);
        setCurrentVoicing(voicing);
        playChord(voicing);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      handleKeyRelease(e);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [currentVoicing, isAudioInitialized]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Harmonic Instrument
        </h1>
        
        <Card className="p-6">
          <ChordDisplay voicing={currentVoicing} />
        </Card>

        <Card className="p-6">
          <KeyboardGuide />
        </Card>

        {!isAudioInitialized && (
          <div className="text-center text-gray-600">
            Click anywhere to start audio...
          </div>
        )}
      </div>
    </div>
  );
}
