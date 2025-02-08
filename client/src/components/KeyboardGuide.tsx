import { useEffect, useState } from "react";
import { getKeyboardLayout, getActiveKeys } from "@/lib/keyboardMapping";
import { ChordQuality, ChordPosition, type ChordVoicing } from "@shared/schema";
import { midiNoteToNoteName } from "@/lib/chords";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface KeyboardGuideProps {
  activeVoicing: ChordVoicing | null;
}

export default function KeyboardGuide({ activeVoicing }: KeyboardGuideProps) {
  const layout = getKeyboardLayout();
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

  useEffect(() => {
    const notes = new Set<number>();
    if (activeVoicing) {
      activeVoicing.notes.forEach((note) => {
        notes.add(note);
      });
    }
    setActiveNotes(notes);
  }, [activeVoicing]);

  const isNoteActive = (midiNote: number) => activeNotes.has(midiNote);

  // Define octaves to display (3 octaves starting from C3)
  const octaves = [3, 4, 5];

  const qualityLabels: Record<string, string> = {
    Q: "Major",
    W: "Major 7",
    E: "Dominant 7",
    R: "Minor",
    T: "Minor 7",
    Y: "Diminished 7",
    U: "Half Dim 7",
  };

  // Check if the current chord is a triad
  const isTriad = activeVoicing?.quality === ChordQuality.Major || 
                 activeVoicing?.quality === ChordQuality.Minor;

  // Black key positions and offsets
  const blackKeyPositions = [
    { note: "C#", left: "15%", midiOffset: 1 },
    { note: "D#", left: "30%", midiOffset: 3 },
    { note: "F#", left: "58.5%", midiOffset: 6 },
    { note: "G#", left: "73%", midiOffset: 8 },
    { note: "A#", left: "87%", midiOffset: 10 },
  ];

  // White key data with MIDI offsets
  const whiteKeyData = [
    { note: "C", midiOffset: 0 },
    { note: "D", midiOffset: 2 },
    { note: "E", midiOffset: 4 },
    { note: "F", midiOffset: 5 },
    { note: "G", midiOffset: 7 },
    { note: "A", midiOffset: 9 },
    { note: "B", midiOffset: 11 },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-center">Keyboard Controls</h2>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="motivation">
          <AccordionTrigger className="text-lg font-medium">
            About This Instrument
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 space-y-4">
            <p>
              This is a new type of musical instrument that operates at a higher level of abstraction than traditional keyboards. Instead of playing individual notes, you play chord functions and the instrument automatically generates proper voice leading.
            </p>
            <p>
              Think of it as a "harmonic keyboard" - where each key press represents a musical idea rather than a specific note. This allows you to focus on harmonic progression and musical expression without getting caught up in the technical details of voice leading and chord voicing.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="instructions">
          <AccordionTrigger className="text-lg font-medium">
            How to Play
          </AccordionTrigger>
          <AccordionContent className="text-gray-600">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
              <p>1. Press any bass key (Z-M) to play a chord</p>
              <p>2. Hold a quality key (Q-U) to change the chord quality:</p>
              <ul className="list-disc list-inside pl-4">
                <li>Q - Major</li>
                <li>W - Major 7</li>
                <li>E - Dominant 7</li>
                <li>R - Minor</li>
                <li>T - Minor 7</li>
                <li>Y - Diminished 7</li>
                <li>U - Half Diminished 7</li>
              </ul>
              <p>3. Use number keys (1-4) for inversions:</p>
              <ul className="list-disc list-inside pl-4">
                <li>Root position is default (no key needed)</li>
                <li>1 - First inversion</li>
                <li>2 - Second inversion</li>
                <li>3 - Third/Seventh (for seventh chords)</li>
                <li>4 - Fourth inversion (falls back to root for triads)</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="grid gap-8">
        {/* Inversions */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-500">
            Inversions (Number Row)
          </div>
          <div className="flex gap-3">
            {/* Root Position Box */}
            <div className="flex items-center gap-2">
              <div
                className={`w-12 h-12 flex items-center justify-center border rounded-lg shadow-sm transition-colors text-lg
                  ${
                    activeVoicing?.position === "root"
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-gray-700"
                  }`}
              >
                R
              </div>
              <span className="text-sm text-gray-600">
                Root <span className="text-xs text-gray-400">(default)</span>
              </span>
            </div>

            {/* Numbered Inversions */}
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center gap-2">
                <div
                  className={`w-12 h-12 flex items-center justify-center border rounded-lg shadow-sm transition-colors text-lg
                    ${
                      activeVoicing?.position === 
                      (num === 1 ? "first" : 
                       num === 2 ? "second" : 
                       num === 3 ? "thirdseventh" :
                       num === 4 ? (isTriad ? "root" : "fourth") : null)
                        ? "bg-primary text-primary-foreground"
                        : "bg-white text-gray-700"
                    }`}
                >
                  {num}
                </div>
                <span className="text-sm text-gray-600">
                  {num === 1 ? "First" : 
                   num === 2 ? "Second" : 
                   num === 3 ? "Third" :
                   num === 4 ? (
                     <span>
                       Fourth
                       {isTriad && <span className="text-xs text-gray-400"> (→root)</span>}
                     </span>
                   ) : null}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chord Qualities */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-500">
            Chord Qualities (Letter Keys)
          </div>
          <div className="flex gap-3">
            {layout.qualityKeys.map((key) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={`w-12 h-12 flex items-center justify-center border rounded-lg shadow-sm transition-colors text-lg
                    ${
                      activeVoicing?.quality === 
                      (key === 'Q' ? ChordQuality.Major :
                       key === 'W' ? ChordQuality.Major7 :
                       key === 'E' ? ChordQuality.Dominant7 :
                       key === 'R' ? ChordQuality.Minor :
                       key === 'T' ? ChordQuality.Minor7 :
                       key === 'Y' ? ChordQuality.Diminished7 :
                       key === 'U' ? ChordQuality.HalfDiminished7 : null)
                        ? "bg-primary text-primary-foreground"
                        : "bg-white text-gray-700"
                    }`}
                >
                  {key}
                </div>
                <span className="text-sm text-gray-600">
                  {qualityLabels[key]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Piano Keyboard */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-500">
            Notes Being Played
          </div>
          <div className="relative w-full h-96 border rounded-lg bg-white p-4">
            <div className="flex h-full relative">
              {octaves.map((octave) => (
                <div key={octave} className="flex-1 relative">
                  {/* White Keys */}
                  <div className="flex h-full">
                    {whiteKeyData.map(({ note, midiOffset }) => {
                      const midiNote = (octave + 1) * 12 + midiOffset;
                      return (
                        <div
                          key={`${note}${octave}`}
                          className={`flex-1 flex items-end justify-center border-l last:border-r transition-colors
                            ${isNoteActive(midiNote) ? "bg-primary" : "bg-white"}`}
                        >
                          <span className="absolute bottom-4 text-sm text-gray-600">
                            {note}
                            {octave}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Black Keys */}
                  <div className="absolute top-0 left-0 h-[65%] w-full">
                    {blackKeyPositions.map(({ note, left, midiOffset }) => {
                      const midiNote = (octave + 1) * 12 + midiOffset;
                      return (
                        <div
                          key={`${note}${octave}`}
                          style={{ left }}
                          className={`absolute w-[8%] h-full -ml-[4%] rounded-b-lg shadow-lg z-10 flex items-end justify-center pb-2
                            ${isNoteActive(midiNote) ? "bg-primary" : "bg-gray-900"}`}
                        >
                          <span className="text-[10px] text-white">
                            {note}
                            {octave}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Notes Debug Info */}
          <div className="text-sm text-gray-500 text-center mt-4">
            Active notes:{" "}
            {Array.from(activeNotes)
              .map((note) => midiNoteToNoteName(note))
              .join(", ")}
          </div>
        </div>
      </div>
    </div>
  );
}