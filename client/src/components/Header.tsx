import SettingsModal from "@/components/SettingsModal";
import HelpModal from "@/components/HelpModal";
import SoundControlsModal from "@/components/SoundControlsModal";
import { Button } from "@/components/ui/button";
import { Github, BookOpen, BookIcon } from "lucide-react";
import type { SynthSettings } from "@/lib/audio";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { X } from "lucide-react";
import { useState } from "react";
import type { ChordQualityConfig } from "@/lib/chordConfig";

interface HeaderProps {
  chordQualities: ChordQualityConfig;
  onChordQualitiesChange: (config: ChordQualityConfig) => void;
  initialSoundSettings: SynthSettings;
  isTutorialOpen: boolean;
  onTutorialToggle: () => void;
}

export default function Header({
  chordQualities,
  onChordQualitiesChange,
  initialSoundSettings,
  isTutorialOpen,
  onTutorialToggle,
}: HeaderProps) {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <>
      {showBanner && (
        <div className="relative bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Alert className="relative">
            <AlertTitle>Sheet Music Available!</AlertTitle>
            <AlertDescription>
              Click the book icon in the top right corner to view sheet music and tutorials.
            </AlertDescription>
            <Button
              variant="ghost"
              className="absolute right-2 top-2 px-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100"
              onClick={() => setShowBanner(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        </div>
      )}
      <div className="flex justify-between items-center p-4 bg-[#fafafa]">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onTutorialToggle}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isTutorialOpen ? (
              <BookOpen className="h-5 w-5" />
            ) : (
              <BookIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
}