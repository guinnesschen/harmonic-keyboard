import { useEffect, useState } from "react";
import { getKeyboardLayout, getActiveKeys } from "@/lib/keyboardMapping";
import { ChordQuality, ChordPosition, type ChordVoicing } from "@shared/schema";
import { midiNoteToNoteName } from "@/lib/chords";

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

  // Black key positions and offsets
  const blackKeyPositions = [
    { note: "C#", left: "15%", midiOffset: 1 }, // C# (1 semitone up from C)
    { note: "D#", left: "30%", midiOffset: 3 }, // D# (3 semitones up from C)
    { note: "F#", left: "58.5%", midiOffset: 6 }, // F# (6 semitones up from C)
    { note: "G#", left: "73%", midiOffset: 8 }, // G# (8 semitones up from C)
    { note: "A#", left: "87%", midiOffset: 10 }, // A# (10 semitones up from C)
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

  console.log(activeNotes);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-center">Keyboard Controls</h2>

      <div className="grid gap-8">
        {/* Inversions */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-500">
            Inversions (Number Row)
          </div>
          <div className="flex gap-3">
            {layout.positionKeys.map((key, i) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={`w-12 h-12 flex items-center justify-center border rounded-lg shadow-sm transition-colors text-lg
                    ${
                      getActiveKeys().includes(key.toLowerCase())
                        ? "bg-primary text-primary-foreground"
                        : "bg-white text-gray-700"
                    }`}
                >
                  {key}
                </div>
                <span className="text-sm text-gray-600">
                  {Object.values(ChordPosition)[i]}
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
                      getActiveKeys().includes(key.toLowerCase())
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
