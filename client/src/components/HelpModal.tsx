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
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>About Harmonova</DialogTitle>
          <DialogDescription>
            A new dimension of harmonic expression
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-gray-600">
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-foreground">About This Instrument</h3>
            <p>
              This is a new type of musical instrument that operates at a higher level of abstraction than traditional keyboards. Instead of playing individual notes, you play chord functions and the instrument automatically generates proper voice leading.
            </p>
            <p>
              Think of it as a "harmonic keyboard" - where each key press represents a musical idea rather than a specific note. This allows you to focus on harmonic progression and musical expression without getting caught up in the technical details of voice leading and chord voicing.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-medium text-foreground">How to Play</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Bass Notes (Z-M)</h4>
                <p>Press any bass key to start playing. Each key represents a different root note.</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Chord Qualities (Q-U)</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Q - Major</li>
                  <li>W - Major 7</li>
                  <li>E - Dominant 7</li>
                  <li>R - Minor</li>
                  <li>T - Minor 7</li>
                  <li>Y - Diminished 7</li>
                  <li>U - Half Diminished 7</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Inversions (0-3)</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>0 - Root Position</li>
                  <li>1 - First Inversion</li>
                  <li>2 - Second Inversion</li>
                  <li>3 - Third/Seventh Position</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
