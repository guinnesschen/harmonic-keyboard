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
            <h3 className="text-lg font-medium text-gray-900">About This Instrument</h3>
            <p className="text-gray-600">
              This is a new type of musical instrument that operates at a higher level of abstraction than traditional keyboards. Instead of playing individual notes, you play chord functions and the instrument automatically generates proper voice leading.
            </p>
            <p className="text-gray-600">
              Think of it as a "harmonic keyboard" - where each key press represents a musical idea rather than a specific note. This allows you to focus on harmonic progression and musical expression without getting caught up in the technical details of voice leading and chord voicing.
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