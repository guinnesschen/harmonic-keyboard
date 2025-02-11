import SettingsModal from "@/components/SettingsModal";
import HelpModal from "@/components/HelpModal";
import SoundControlsModal from "@/components/SoundControlsModal";
import { Button } from "@/components/ui/button";
import { Github, BookOpen, BookIcon, Youtube } from "lucide-react";
import type { SynthSettings } from "@/lib/audio";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useRef } from "react";
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
  const [hasClickedBook, setHasClickedBook] = useState(false);
  const controls = useAnimation();
  const shouldAnimate = useRef(true);

  // Animation sequence for the bouncing effect
  const bounceAnimation = async () => {
    while (shouldAnimate.current && !hasClickedBook) {
      await controls.start({
        y: [-4, 0, -8, 0],
        rotate: [-5, 0, 5, 0],
        transition: {
          duration: 1,
          times: [0, 0.3, 0.6, 1],
          ease: "easeInOut",
        },
      });

      // Wait between bounces, but check if we should continue
      if (shouldAnimate.current && !hasClickedBook) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        break;
      }
    }
  };

  useEffect(() => {
    if (!hasClickedBook) {
      shouldAnimate.current = true;
      // Start animation after 15 seconds
      const timeout = setTimeout(() => {
        if (shouldAnimate.current && !hasClickedBook) {
          bounceAnimation();
        }
      }, 15000);

      return () => {
        clearTimeout(timeout);
        shouldAnimate.current = false;
        controls.stop();
        controls.set({ y: 0, rotate: 0 });
      };
    }
  }, [hasClickedBook]);

  const handleBookClick = () => {
    setHasClickedBook(true);
    shouldAnimate.current = false;
    controls.stop();
    controls.set({ y: 0, rotate: 0 });
    onTutorialToggle();
  };

  return (
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
          onClick={handleBookClick}
          className="text-gray-900 hover:text-gray-700 transition-colors"
        >
          <motion.div animate={controls} initial={{ y: 0, rotate: 0 }}>
            {isTutorialOpen ? (
              <BookOpen className="h-5 w-5" />
            ) : (
              <BookIcon className="h-5 w-5" />
            )}
          </motion.div>
        </Button>
      </div>
    </div>
  );
}