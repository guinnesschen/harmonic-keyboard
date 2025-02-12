import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DrumPad {
  key: string;
  sound: string;
  label: string;
  color: string;
  row: number;
  animation: "heartbeat" | "shake" | "bounce" | "pulse" | "ripple";
}

const drumPads: DrumPad[] = [
  { key: "U", sound: "crash", label: "Crash", color: "bg-yellow-100", row: 0, animation: "shake" },
  { key: "I", sound: "hihat", label: "Hi-Hat", color: "bg-yellow-200", row: 0, animation: "pulse" },
  { key: "O", sound: "ride", label: "Ride", color: "bg-yellow-300", row: 0, animation: "ripple" },
  { key: "H", sound: "highTom", label: "Hi Tom", color: "bg-blue-100", row: 1, animation: "bounce" },
  { key: "J", sound: "snare", label: "Snare", color: "bg-blue-200", row: 1, animation: "pulse" },
  { key: "K", sound: "lowTom", label: "Lo Tom", color: "bg-blue-300", row: 1, animation: "bounce" },
  { key: "F", sound: "kick", label: "Kick", color: "bg-red-100", row: 2, animation: "heartbeat" },
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
  shake: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.4 }
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
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 0.3 }
  }
};

export default function DrumMachine({ className = "" }: DrumMachineProps) {
  const [activePads, setActivePads] = useState<Set<string>>(new Set());

  const handlePadTrigger = (pad: DrumPad) => {
    // TODO: Implement sound triggering
    console.log(`Triggered drum pad: ${pad.sound}`);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      const pad = drumPads.find(
        (p) => p.key.toLowerCase() === e.key.toLowerCase()
      );
      if (pad) {
        handlePadTrigger(pad);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
                key={pad.key}
                animate={activePads.has(pad.key) ? animations[pad.animation] : {}}
                className={`
                  w-64 h-24 flex flex-col items-center justify-center
                  ${pad.color} hover:brightness-95
                  rounded-lg shadow-md
                  cursor-pointer
                  transition-colors duration-150
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