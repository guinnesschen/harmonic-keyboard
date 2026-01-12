import { Button } from "@/components/ui/button";
import { Github, Youtube } from "lucide-react";
import SettingsModal from "./SettingsModal";
import SoundControlsModal from "./SoundControlsModal";

interface HeaderProps {
  onVideoOpen: () => void;
}

const buttonClass =
  "text-gray-900 hover:bg-stone-500/10 transition-colors duration-150 [&>svg]:text-gray-900";

export default function Header({ onVideoOpen }: HeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#fafafa]">
      <div className="text-sm uppercase tracking-[0.2em] text-stone-500">
        Harmonic Keyboard v2
      </div>
      <div className="flex gap-2 items-center">
        <div className={buttonClass}>
          <SettingsModal />
        </div>
        <div className={buttonClass}>
          <SoundControlsModal />
        </div>
        <Button variant="ghost" size="icon" className={buttonClass} asChild>
          <a
            href="https://github.com/guinnesschen/harmonic-keyboard"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="h-5 w-5" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onVideoOpen}
          className={buttonClass}
        >
          <Youtube className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
