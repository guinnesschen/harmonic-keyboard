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
        <Button variant="ghost" size="icon" className="absolute top-4 right-16 hover:bg-stone-100">
          <HelpCircle className="h-5 w-5 text-gray-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              A New Way to Think About Music
            </h3>
            <p className="text-gray-600">
              This is a radical reimagining of what a musical instrument can be.
              Instead of thinking in terms of individual notes, you think
              directly in harmonic ideas - the building blocks of musical
              progression and emotion.
            </p>
            <p className="text-gray-600">
              Each key press represents a complete harmonic concept - a major
              chord, a dominant seventh, a half-diminished chord in first
              inversion. The instrument handles all the complexity of turning
              these musical intentions into properly voiced notes, letting you
              focus purely on harmonic expression.
            </p>
            <p className="text-gray-600">
              Think of it as conducting harmony itself, rather than individual
              notes. It's an instrument that bridges the gap between musical
              thinking and musical playing.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">How to Play</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Root Notes (Z through M)
                </h4>
                <p className="text-gray-600">
                  The bottom row of your keyboard (Z through M) represents the root notes of your chords. 
                  These keys determine the fundamental pitch of your harmony. For example, pressing 'Z' 
                  might give you a C, 'X' a D, and so on.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Chord Quality Modifiers (Q through U)
                </h4>
                <p className="text-gray-600">
                  Hold down one of these modifier keys while pressing a root note to determine the type of chord:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mt-2">
                  <li>Q - Creates a major triad (bright and stable)</li>
                  <li>W - Adds a major 7th for a jazzy, open sound</li>
                  <li>E - Adds a dominant 7th for tension and movement</li>
                  <li>R - Creates a minor triad (darker, more mysterious)</li>
                  <li>T - Adds a minor 7th for a mellower jazz feel</li>
                  <li>Y - Creates a fully diminished chord (maximum tension)</li>
                  <li>U - Creates a half-diminished chord (subtle tension)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Inversion Modifiers (0 through 3)
                </h4>
                <p className="text-gray-600">
                  While holding your chord quality modifier, add one of these number keys to change how 
                  the notes are stacked:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mt-2">
                  <li>0 - Root position (default arrangement)</li>
                  <li>1 - First inversion (third on bottom)</li>
                  <li>2 - Second inversion (fifth on bottom)</li>
                  <li>3 - Third inversion (seventh on bottom, for seventh chords)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Example Combinations</h4>
                <p className="text-gray-600">
                  To play a C major chord in first inversion: Hold 'Q' (major) + '1' (first inversion), 
                  then press 'Z' (C root). For a G dominant seventh in third inversion: Hold 'E' (dominant) 
                  + '3' (third inversion), then press 'V' (G root).
                </p>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}