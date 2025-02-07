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

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      // Update key state and get new voicing
      handleKeyPress(e);
      const newBasicVoicing = generateVoicingFromKeyState();

      if (newBasicVoicing) {
        // Generate full voicing with proper voice leading
        const fullVoicing = generateVoicing(newBasicVoicing, currentVoicing);
        setCurrentVoicing(fullVoicing);
        playChord(fullVoicing);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const allKeysReleased = handleKeyRelease(e);
      if (allKeysReleased) {
        playChord(null); // Stop all sounds
        setCurrentVoicing(null);
      } else {
        // If some keys are still held, regenerate the voicing
        const newBasicVoicing = generateVoicingFromKeyState();
        if (newBasicVoicing) {
          const fullVoicing = generateVoicing(newBasicVoicing, currentVoicing);
          setCurrentVoicing(fullVoicing);
          playChord(fullVoicing);
        } else {
          playChord(null);
          setCurrentVoicing(null);
        }
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
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Harmonic Instrument
        </h1>

        {!isAudioInitialized ? (
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Welcome to the Harmonic Instrument!</h2>
            <p className="text-gray-600 mb-4">
              Due to browser security requirements, we need your permission to enable audio.
            </p>
            <Button 
              onClick={initializeAudio}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
            >
              Click here to start
            </Button>
          </Card>
        ) : (
          <>
            <Card className="p-6">
              <ChordDisplay voicing={currentVoicing} />
            </Card>

            <Card className="p-6">
              <KeyboardGuide />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
