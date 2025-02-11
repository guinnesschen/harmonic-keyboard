import SettingsModal from "@/components/SettingsModal";
import HelpModal from "@/components/HelpModal";
import SoundControlsModal from "@/components/SoundControlsModal";
import { Button } from "@/components/ui/button";
import { Github, BookOpen, BookIcon, Youtube } from "lucide-react";
import type { SynthSettings } from "@/lib/audio";
import {
  Alert,
  AlertDescription,
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
  onVideoOpen: () => void;
}

export default function Header({
  chordQualities,
  onChordQualitiesChange,
  initialSoundSettings,
  isTutorialOpen,
  onTutorialToggle,
  onVideoOpen,
}: HeaderProps) {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <>
      {showBanner && (
        <div className="relative bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Alert className="relative border-none bg-transparent">
            <AlertDescription className="text-sm text-gray-600">
              Click the book icon to view sheet music and tutorials →
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
      <div className="flex justify-end items-center p-4 bg-[#fafafa]">
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
              <Github className="h-5 w-5 text-gray-900" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onVideoOpen}
            className="text-gray-900 hover:text-gray-700 transition-colors"
          >
            <Youtube className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onTutorialToggle}
            className="text-gray-900 hover:text-gray-700 transition-colors"
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