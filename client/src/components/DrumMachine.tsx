import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface DrumPad {
  key: string;
  sound: string;
  label: string;
  color: string;
}

const drumPads: DrumPad[] = [
  { key: "U", sound: "crash", label: "Crash", color: "bg-yellow-100" },
  { key: "I", sound: "hihat", label: "Hi-Hat", color: "bg-yellow-200" },
  { key: "O", sound: "ride", label: "Ride", color: "bg-yellow-300" },
  { key: "H", sound: "highTom", label: "Hi Tom", color: "bg-blue-100" },
  { key: "J", sound: "snare", label: "Snare", color: "bg-blue-200" },
  { key: "K", sound: "lowTom", label: "Lo Tom", color: "bg-blue-300" },
  { key: "F", sound: "kick", label: "Kick", color: "bg-red-100" },
  { key: "G", sound: "rimshot", label: "Rim", color: "bg-red-200" },
  { key: "B", sound: "clap", label: "Clap", color: "bg-red-300" },
];

interface DrumMachineProps {
  className?: string;
  isActive?: boolean;
}

export default function DrumMachine({ className = "", isActive = false }: DrumMachineProps) {
  const [activePads, setActivePads] = useState<Set<string>>(new Set());

  const handlePadTrigger = (pad: DrumPad) => {
    if (!isActive) return;

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
    }, 100);
  };

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      const pad = drumPads.find(
        (p) => p.key.toLowerCase() === e.key.toLowerCase()
      );
      if (pad) {
        e.preventDefault(); // Prevent default to avoid triggering piano
        handlePadTrigger(pad);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  return (
    <div className={`p-8 ${className}`}>
      <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
        {drumPads.map((pad) => (
          <Button
            key={pad.key}
            variant="ghost"
            className={`
              aspect-square flex flex-col items-center justify-center p-4
              ${pad.color} hover:brightness-95
              ${activePads.has(pad.key) ? "brightness-75" : ""}
              transition-all duration-150
              min-h-[200px] min-w-[200px]
              transform perspective-800 hover:-translate-y-1 hover:shadow-xl
              rounded-2xl border-2 border-gray-200/20
            `}
            onClick={() => handlePadTrigger(pad)}
          >
            <span className="text-3xl font-bold text-gray-900">{pad.label}</span>
            <span className="text-xl text-gray-600 mt-4">{pad.key}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}