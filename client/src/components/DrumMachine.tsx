import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { drumAudioEngine, type DrumSampleMap } from "@/lib/drumAudio";

interface DrumPad {
  key: string;
  sound: keyof DrumSampleMap;
  label: string;
  color: string;
  row: number;
  animation: "heartbeat" | "shake" | "bounce" | "pulse" | "ripple" | "crash" | "hihat" | "snare";
}

const drumPads: DrumPad[] = [
  { key: "U", sound: "crash", label: "Crash", color: "bg-yellow-100", row: 0, animation: "crash" },
  { key: "I", sound: "hihat", label: "Hi-Hat", color: "bg-yellow-200", row: 0, animation: "hihat" },
  { key: "O", sound: "openhat", label: "Open Hat", color: "bg-yellow-300", row: 0, animation: "ripple" },
  { key: "J", sound: "snare", label: "Snare", color: "bg-blue-200", row: 1, animation: "snare" },
  { key: "F", sound: "kick", label: "Kick", color: "bg-red-100", row: 2, animation: "shake" },
  { key: "G", sound: "rimshot", label: "Rim", color: "bg-red-200", row: 2, animation: "ripple" },
  { key: "B", sound: "clap", label: "Clap", color: "bg-red-300", row: 2, animation: "pulse" },
];

interface DrumMachineProps {
  className?: string;
}

const animations = {
  heartbeat: {
    scale: [1, 1.4, 1],
    transition: { duration: 0.3, times: [0, 0.2, 1] }
  },
  crash: {
    rotate: [0, -3, 3, -3, 3, -1.5, 0],
    transition: { duration: 0.4, ease: "easeOut" }
  },
  hihat: {
    x: [0, -2, 2, -2, 2, 0],
    rotate: [0, 1, -1, 1, -1, 0],
    transition: { duration: 0.2 }
  },
  bounce: {
    y: [0, -10, 0],
    transition: { duration: 0.3 }
  },
  pulse: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.2 }
  },
  ripple: {
    y: [0, -5, 0],
    rotate: [0, -3, 3, -3, 3, -1.5, 0],
    transition: { duration: 0.4, ease: "easeOut" }
  },
  snare: {
    scale: [1, 1.1, 1],
    rotate: [0, 2, 0],
    transition: { duration: 0.2, ease: "easeOut" }
  },
  shake: {
    x: [0, -4, 4, -4, 4, 0],
    transition: { duration: 0.2, ease: "linear" }
  }
};

export default function DrumMachine({ className = "" }: DrumMachineProps) {
  const [activePads, setActivePads] = useState<Set<string>>(new Set());
  const [triggerCount, setTriggerCount] = useState<Record<string, number>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAudioContextStarted, setIsAudioContextStarted] = useState(false);

  useEffect(() => {
    // Initialize audio engine
    const initAudio = async () => {
      try {
        await drumAudioEngine.initialize();
        setIsInitialized(true);
        console.log("Drum audio engine initialized");
      } catch (error) {
        console.error("Failed to initialize drum audio:", error);
      }
    };

    initAudio();

    // Cleanup on unmount
    return () => {
      drumAudioEngine.cleanup();
    };
  }, []);

  const startAudioContext = async () => {
    if (!isAudioContextStarted) {
      try {
        await drumAudioEngine.startAudioContext();
        setIsAudioContextStarted(true);
        console.log("Audio context started");
      } catch (error) {
        console.error("Failed to start audio context:", error);
      }
    }
  };

  const handlePadTrigger = async (pad: DrumPad) => {
    if (!isInitialized) return;

    // Start audio context if it hasn't been started yet
    if (!isAudioContextStarted) {
      await startAudioContext();
    }

    // Trigger the sound
    drumAudioEngine.triggerSample(pad.sound);

    // Increment trigger count to force animation restart
    setTriggerCount(prev => ({
      ...prev,
      [pad.key]: (prev[pad.key] || 0) + 1
    }));

    // Visual feedback
    setActivePads((prev) => {
      const next = new Set(prev);
      next.add(pad.key);
      return next;
    });

    setTimeout(() => {
      setActivePads((prev) => {
        const next = new Set(prev);
        next.delete(pad.key);
        return next;
      });
    }, 300);
  };

  useEffect(() => {
    if (!isInitialized) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.repeat) return;

      const pad = drumPads.find(
        (p) => p.key.toLowerCase() === e.key.toLowerCase()
      );
      if (pad) {
        await handlePadTrigger(pad);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInitialized, isAudioContextStarted]);

  // Group pads by row
  const padsByRow = drumPads.reduce((acc, pad) => {
    if (!acc[pad.row]) acc[pad.row] = [];
    acc[pad.row].push(pad);
    return acc;
  }, {} as Record<number, DrumPad[]>);

  return (
    <div className={`p-8 ${className}`}>
      <div className="flex flex-col gap-8">
        {Object.entries(padsByRow).map(([row, pads]) => (
          <div 
            key={row} 
            className="flex justify-center gap-8"
            style={{ 
              paddingLeft: `${parseInt(row) * 40}px` 
            }}
          >
            {pads.map((pad) => (
              <motion.div
                key={`${pad.key}-${triggerCount[pad.key] || 0}`}
                animate={activePads.has(pad.key) ? animations[pad.animation] : {}}
                className={`
                  w-64 h-24 flex flex-col items-center justify-center
                  ${pad.color} hover:brightness-95
                  rounded-lg shadow-md
                  cursor-pointer
                  transition-colors duration-150
                  ${!isInitialized ? 'opacity-50' : ''}
                `}
                onClick={() => handlePadTrigger(pad)}
              >
                <span className="text-2xl font-bold text-gray-900">{pad.label}</span>
                <span className="text-sm text-gray-600 mt-2">{pad.key}</span>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}