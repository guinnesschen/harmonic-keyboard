import { useState } from "react";
import Header from "@/components/Header";
import Instrument from "./Instrument";
import SheetMusicPanel from "@/components/SheetMusicPanel";
import { defaultChordQualities, type ChordQualityConfig } from "@/lib/chordConfig";
import type { SynthSettings } from "@/lib/audio";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const defaultSettings: SynthSettings = {
  oscillator: {
    type: "sine",
    spread: 20,
  },
  envelope: {
    attack: 0.05,
    decay: 0.1,
    sustain: 0.3,
    release: 1,
  },
  effects: {
    reverb: {
      decay: 1,
      wet: 0.3,
    },
    chorus: {
      depth: 0.5,
      frequency: 4,
      wet: 0.3,
    },
    eq: {
      low: 0,
      mid: 0,
      high: 1,
    },
    compression: {
      threshold: -20,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
    },
    distortion: {
      distortion: 0.2,
      wet: 0.1,
    },
  },
  volume: -12,
};

export default function MainLayout() {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [chordQualities, setChordQualities] = useState<ChordQualityConfig>(defaultChordQualities);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="flex flex-col h-screen">
        <div className={`flex transition-all duration-300 ease-in-out h-full`}>
          <div className={`flex flex-col transition-all duration-300 ease-in-out ${isTutorialOpen ? 'w-1/2' : 'w-full'}`}>
            <Header
              chordQualities={chordQualities}
              onChordQualitiesChange={setChordQualities}
              initialSoundSettings={defaultSettings}
              isTutorialOpen={isTutorialOpen}
              onTutorialToggle={() => setIsTutorialOpen(!isTutorialOpen)}
              onVideoOpen={() => setIsVideoOpen(true)}
            />
            <div className="flex-1">
              <Instrument
                chordQualities={chordQualities}
                defaultSettings={defaultSettings}
              />
            </div>
          </div>
          <div 
            className={`w-1/2 border-l border-gray-200 transition-all duration-300 ease-in-out transform ${
              isTutorialOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {isTutorialOpen && (
              <SheetMusicPanel 
                onClose={() => setIsTutorialOpen(false)} 
                onVideoOpen={() => setIsVideoOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <iframe
            className="w-full aspect-video"
            src="https://www.youtube.com/embed/EFqt0oD22WA"
            title="Harmonic Keyboard Tutorial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}