import SettingsModal from "@/components/SettingsModal";
import HelpModal from "@/components/HelpModal";
import SoundControlsModal from "@/components/SoundControlsModal";
import { Button } from "@/components/ui/button";
import { Github, BookOpen, BookIcon, Youtube } from "lucide-react";
import type { SynthSettings } from "@/lib/audio";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import type { ChordQualityConfig } from "@/lib/chordConfig";
import Instrument from "@/pages/Instrument";
import InstrumentSwitcher, { InstrumentType } from "./InstrumentSwitcher";

interface HeaderProps {
  chordQualities: ChordQualityConfig;
  onChordQualitiesChange: (config: ChordQualityConfig) => void;
  initialSoundSettings: SynthSettings;
  isTutorialOpen: boolean;
  onTutorialToggle: () => void;
  onVideoOpen: () => void;
  onInstrumentChange: (instrument: InstrumentType) => void;
  currentInstrument: InstrumentType;
}

export default function Header({
  chordQualities,
  onChordQualitiesChange,
  initialSoundSettings,
  isTutorialOpen,
  onTutorialToggle,
  onVideoOpen,
  onInstrumentChange,
  currentInstrument,
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
        await new Promise((resolve) => setTimeout(resolve, 2000));
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

  const buttonClass =
    "text-gray-900 hover:bg-stone-500/10 transition-colors duration-150 [&>svg]:text-gray-900";

  return (
    <div className="flex justify-between items-center p-4 bg-[#fafafa]">
      <div>
        <InstrumentSwitcher
          onInstrumentChange={onInstrumentChange}
          currentInstrument={currentInstrument}
        />
      </div>
      <div>
        <div className="flex gap-2">
          <div className={buttonClass}>
            <SettingsModal
              chordQualities={chordQualities}
              onChordQualitiesChange={onChordQualitiesChange}
            />
          </div>
          <div className={buttonClass}>
            <HelpModal />
          </div>
          <div className={buttonClass}>
            <SoundControlsModal initialSettings={initialSoundSettings} />
          </div>
          <Button variant="ghost" size="icon" asChild className={buttonClass}>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookClick}
            className={buttonClass}
          >
            <motion.div
              animate={controls}
              initial={{ y: 0, rotate: 0 }}
              className="[&>svg]:text-gray-900"
            >
              {isTutorialOpen ? (
                <BookOpen className="h-5 w-5" />
              ) : (
                <BookIcon className="h-5 w-5" />
              )}
            </motion.div>
          </Button>
        </div>
      </div>
    </div>
  );
}
