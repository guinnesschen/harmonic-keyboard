import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sliders } from "lucide-react";
import type { SynthSettings } from "@/lib/audio";
import SoundControls from "./SoundControls";

interface SoundControlsModalProps {
  initialSettings: SynthSettings;
}

const buttonClass =
  "text-gray-900 hover:bg-stone-500/10 transition-colors duration-150";

export default function SoundControlsModal({
  initialSettings,
}: SoundControlsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={buttonClass}>
          <Sliders className="h-5 w-5 text-gray-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl font-semibold text-stone-800">
            Sound Controls
          </DialogTitle>
          <DialogDescription className="font-mono text-gray-900 whitespace-pre-wrap">
            Customize your instrument's sound
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <SoundControls initialSettings={initialSettings} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
