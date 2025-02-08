import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChordDisplay from "@/components/ChordDisplay";
import KeyboardGuide from "@/components/KeyboardGuide";
import SoundControls from "@/components/SoundControls";
import BackgroundAnimation from "@/components/BackgroundAnimation";
import { generateVoicingFromKeyState, handleKeyPress, handleKeyRelease } from "@/lib/keyboardMapping";
import { initAudio, playChord, type SynthSettings } from "@/lib/audio";
import type { ChordVoicing } from "@shared/schema";
import { generateVoicing } from "@/lib/voiceLeading";

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundAnimation voicing={currentVoicing} />

      <div className="relative z-10">
        <div className="max-w-6xl mx-auto p-8 space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-light tracking-tighter bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
              Harmonova
            </h1>
            <p className="text-lg text-muted-foreground font-light">
              A new dimension of harmonic expression
            </p>
          </div>

          {!isAudioInitialized ? (
            <Card className="p-8 text-center max-w-xl mx-auto bg-background/50 backdrop-blur border-primary/10">
              <h2 className="text-2xl font-light mb-4">Welcome to Harmonova</h2>
              <p className="text-muted-foreground mb-6">
                Due to browser security requirements, we need your permission to enable audio.
              </p>
              <Button 
                onClick={initializeAudio}
                className="text-lg py-6 px-8 bg-primary/90 hover:bg-primary transition-colors duration-300"
              >
                Begin Your Journey
              </Button>
            </Card>
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              <Card className="p-6 bg-background/50 backdrop-blur border-primary/10">
                <ChordDisplay voicing={currentVoicing} />
              </Card>

              <Card className="p-8 bg-background/50 backdrop-blur border-primary/10">
                <KeyboardGuide activeVoicing={currentVoicing} />
              </Card>

              <Card className="bg-background/50 backdrop-blur border-primary/10">
                <SoundControls initialSettings={defaultSettings} />
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}