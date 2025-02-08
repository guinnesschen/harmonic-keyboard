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
import { HelpCircle } from "lucide-react";

export default function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 right-16">
          <HelpCircle className="h-5 w-5 text-gray-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-gray-900">About Harmonova</DialogTitle>
          <DialogDescription className="text-gray-600">
            A new dimension of harmonic expression
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">A New Way to Think About Music</h3>
            <p className="text-gray-600">
              This is a radical reimagining of what a musical instrument can be. Instead of thinking in terms of individual notes, you think directly in harmonic ideas - the building blocks of musical progression and emotion.
            </p>
            <p className="text-gray-600">
              Each key press represents a complete harmonic concept - a major chord, a dominant seventh, a half-diminished chord in first inversion. The instrument handles all the complexity of turning these musical intentions into properly voiced notes, letting you focus purely on harmonic expression.
            </p>
            <p className="text-gray-600">
              Think of it as conducting harmony itself, rather than individual notes. It's an instrument that bridges the gap between musical thinking and musical playing.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">How to Play</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Bass Notes (Z-M)</h4>
                <p className="text-gray-600">Press any bass key to start playing. Each key represents a different root note.</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Chord Qualities (Q-U)</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Q - Major (1-3-5)</li>
                  <li>W - Major 7th (1-3-5-7)</li>
                  <li>E - Dominant 7th (1-3-5-♭7)</li>
                  <li>R - Minor (1-♭3-5)</li>
                  <li>T - Minor 7th (1-♭3-5-♭7)</li>
                  <li>Y - Diminished 7th (1-♭3-♭5-♭♭7)</li>
                  <li>U - Half Diminished 7th (1-♭3-♭5-♭7)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Inversions (0-3)</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>0 - Root Position (1-3-5)</li>
                  <li>1 - First Inversion (3-5-1)</li>
                  <li>2 - Second Inversion (5-1-3)</li>
                  <li>3 - Third/Seventh in bass</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}