import SettingsModal from "@/components/SettingsModal";
import HelpModal from "@/components/HelpModal";
import SoundControlsModal from "@/components/SoundControlsModal";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import type { SynthSettings } from "@/lib/audio";
import { type ChordQuality } from "@shared/schema";

interface HeaderProps {
  chordQualities: Record<string, boolean>;
  onChordQualitiesChange: (qualities: Record<string, boolean>) => void;
  initialSoundSettings: SynthSettings;
  onTutorialClick: () => void;
}

export default function Header({
  chordQualities,
  onChordQualitiesChange,
  initialSoundSettings,
  onTutorialClick,
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center p-4 bg-[#fafafa]">
      <Button
        variant="ghost"
        className="text-gray-600 hover:bg-transparent hover:text-gray-700"
        onClick={onTutorialClick}
      >
        Tutorial
      </Button>
      <div className="flex gap-2 [&_button]:hover:bg-transparent [&_button]:hover:opacity-70">
        <SettingsModal
          chordQualities={chordQualities}
          onChordQualitiesChange={onChordQualitiesChange}
        />
        <HelpModal />
        <SoundControlsModal initialSettings={initialSoundSettings} />
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="black-900 hover:bg-transparent"
        >
          <a
            href="https://github.com/guinnesschen/harmonic-keyboard"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="h-5 w-5 text-gray-600" />
          </a>
        </Button>
      </div>
    </div>
  );
}
