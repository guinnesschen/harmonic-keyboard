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
import { MiniPianoGuide } from "./ChordDisplay";

export default function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="black-900 hover:bg-transparent"
        >
          <HelpCircle className="h-5 w-5 text-gray-900" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              Design Philosophy
            </h3>
            <p className="text-gray-600">
              This instrument operates at a higher level of abstraction than
              traditional instruments. Instead of working with individual notes,
              you work directly with chord intents - expressing harmony through
              a concise three-dimensional control space of bass notes, chord
              quality, and inversion.
            </p>
            <p className="text-gray-600">
              Similar to how a stenograph abstracts individual letters into
              chord-like key combinations, this instrument lets you think and
              play in the language of harmony directly. The ergonomic design
              makes it possible to achieve fluid chord progressions with minimal
              hand movement, as each chord requires only three keypresses to
              fully specify.
            </p>
            <p className="text-gray-600">
              The control space maps approximately 500 unique chords through
              these three simple parameters, making it highly expressive while
              remaining cognitively manageable.
            </p>
            <p className="text-gray-600">
              What makes this instrument uniquely intuitive is how it aligns
              with natural musical thought. Rather than thinking about
              individual notes, you think in terms of harmony and function - "C
              major", "first inversion", "bass on E". As you explore, you may
              find yourself naturally playing progressions and voicings that
              previously seemed out of reach, because the interface speaks the
              same language as musical imagination.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              Control System
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Bass Notes</h4>
                <p className="text-gray-600">
                  The bottom two rows of your keyboard specify the bass note of
                  your chord. This is always the lowest sounding pitch,
                  regardless of whether it's the root of the chord. The mapping
                  follows the piano layout:
                </p>
                <div style={{ marginBottom: "1.2rem", marginTop: "1.2rem" }}>
                  <MiniPianoGuide />
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Chord Quality Selection (Q through P)
                </h4>
                <p className="text-gray-600">
                  Hold a quality modifier while pressing a bass note to specify
                  the chord type. The quality determines the intervals above the
                  root:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mt-2">
                  <li>Q - Major triad (root, M3, P5)</li>
                  <li>W - Major seventh (root, M3, P5, M7)</li>
                  <li>E - Dominant seventh (root, M3, P5, m7)</li>
                  <li>R - Minor triad (root, m3, P5)</li>
                  <li>T - Minor seventh (root, m3, P5, m7)</li>
                  <li>Y - Diminished seventh (root, m3, d5, d7)</li>
                  <li>U - Half-diminished (root, m3, d5, m7)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Inversions (0 through 3)
                </h4>
                <p className="text-gray-600">
                  Inversions determine the relationship between the bass note
                  and the root of the chord. While commonly explained in terms of fixed intervals,
                  the actual relationship depends on the chord's close position voicing:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mt-2">
                  <li>0 - Root position: The bass note is the root</li>
                  <li>
                    1 - First inversion: The bass note is typically the third, but for extended chords like add9, it could be the 2nd/9th
                  </li>
                  <li>
                    2 - Second inversion: Usually the fifth in the bass, but varies with chord structure
                  </li>
                  <li>
                    3 - Third inversion: Commonly the seventh in the bass for seventh chords
                  </li>
                </ul>
                <p className="text-gray-600 mt-2">
                  For example, to play C/E (C major first inversion): Hold Q
                  (major quality) + 1 (first inversion), then press X (E bass).
                  This creates a C major chord with E in the bass.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              Voice Leading System
            </h3>
            <p className="text-gray-600">
              A chord symbol (like "C major") represents a set of pitch classes,
              but these pitches can be realized in many different octaves,
              creating different voicings. Good voice leading minimizes the
              total movement between consecutive chord voicings while
              maintaining proper spacing and range.
            </p>
            <p className="text-gray-600">
              Our voice leading engine uses an algorithm similar to computing
              the Wasserstein distance (also known as Earth Mover's Distance)
              between two sets of points. It finds the optimal matching between
              voices in consecutive chords that minimizes the total semitone
              movement, while ensuring all chord tones are present and properly
              spaced.
            </p>
            <p className="text-gray-600">
              The engine maintains five voices (bass + four upper voices) and
              can double pitches when needed for triads. This creates full,
              piano-like voicings while ensuring smooth voice leading
              transitions between chords.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
