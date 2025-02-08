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

export default function SoundControlsModal({
  initialSettings,
}: SoundControlsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 right-28">
          <Sliders className="h-5 w-5 text-gray-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Sound Controls</DialogTitle>
          <DialogDescription className="text-gray-600">
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
