import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Piano, Drum } from "lucide-react";

export type InstrumentType = "piano" | "drums";

interface InstrumentSwitcherProps {
  currentInstrument: InstrumentType;
  onInstrumentChange: (instrument: InstrumentType) => void;
}

export default function InstrumentSwitcher({
  currentInstrument,
  onInstrumentChange,
}: InstrumentSwitcherProps) {
  const instruments: InstrumentType[] = ["piano", "drums"];
  const currentIndex = instruments.indexOf(currentInstrument);

  return (
    <div className="flex items-center gap-2 px-4">
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-900 hover:bg-stone-500/10 transition-colors duration-150"
        onClick={() => onInstrumentChange(instruments[currentIndex - 1])}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className={`text-gray-900 hover:bg-stone-500/10 transition-colors duration-150 ${
            currentInstrument === "piano" ? "bg-stone-500/10" : ""
          }`}
          onClick={() => onInstrumentChange("piano")}
        >
          <Piano className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`text-gray-900 hover:bg-stone-500/10 transition-colors duration-150 ${
            currentInstrument === "drums" ? "bg-stone-500/10" : ""
          }`}
          onClick={() => onInstrumentChange("drums")}
        >
          <Drum className="h-5 w-5" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="text-gray-900 hover:bg-stone-500/10 transition-colors duration-150"
        onClick={() => onInstrumentChange(instruments[currentIndex + 1])}
        disabled={currentIndex === instruments.length - 1}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}