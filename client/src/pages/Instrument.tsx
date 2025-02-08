import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChordDisplay from "@/components/ChordDisplay";
import KeyboardGuide from "@/components/KeyboardGuide";
import { generateVoicingFromKeyState, handleKeyPress, handleKeyRelease } from "@/lib/keyboardMapping";
import { initAudio, playChord } from "@/lib/audio";
import type { ChordVoicing } from "@shared/schema";
import { generateVoicing } from "@/lib/voiceLeading";

export default function Instrument() {
  const [currentVoicing, setCurrentVoicing] = useState<ChordVoicing | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  const initializeAudio = async () => {
    try {
      await initAudio();
      setIsAudioInitialized(true);
      console.log("Audio initialized successfully");
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }
  };

  useEffect(() => {
    if (!isAudioInitialized) return;

    const updateVoicing = () => {
      const newBasicVoicing = generateVoicingFromKeyState();
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
      const allKeysReleased = handleKeyRelease(e);
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
  }, [currentVoicing, isAudioInitialized]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Harmonic Instrument
          </h1>
          <p className="text-lg text-gray-600">
            Create beautiful chord progressions with your keyboard
          </p>
        </div>

        {!isAudioInitialized ? (
          <Card className="p-8 text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
            <p className="text-gray-600 mb-6">
              Due to browser security requirements, we need your permission to enable audio.
            </p>
            <Button 
              onClick={initializeAudio}
              className="text-lg py-6 px-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
            >
              Click here to start
            </Button>
          </Card>
        ) : (
          <>
            <Card className="p-6">
              <ChordDisplay voicing={currentVoicing} />
            </Card>

            <Card className="p-8 bg-white/80 backdrop-blur-sm">
              <KeyboardGuide activeVoicing={currentVoicing} />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}