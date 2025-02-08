import { useEffect, useState } from "react";
import { getKeyboardLayout, getActiveKeys } from "@/lib/keyboardMapping";
import {
  ChordQuality,
  ChordPosition,
  type ChordVoicing,
  InversionMode,
} from "@shared/schema";

interface KeyboardGuideProps {
  activeVoicing: ChordVoicing | null;
  inversionMode: InversionMode;
}

interface KeyHintProps {
  keyLabel: string;
  description: string;
  isActive: boolean;
}

function KeyHint({ keyLabel, description, isActive }: KeyHintProps) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-2 min-w-[80px]">
      <span className="text-sm text-gray-600">{description}</span>
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg
          ${
            isActive
              ? "bg-red-600/90 text-white"
              : "bg-transparent border border-red-600/20 text-gray-900"
          }`}
      >
        {keyLabel}
      </div>
    </div>
  );
}

export default function KeyboardGuide({
  activeVoicing,
  inversionMode,
}: KeyboardGuideProps) {
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

  const qualityDescriptions: Record<string, string> = {
    Q: "Maj",
    W: "Maj7",
    E: "Dom7",
    R: "Min",
    T: "Min7",
    Y: "Dim7",
    U: "Half-dim7",
  };

  const getInversionDescription = (position: string): string => {
    if (inversionMode === InversionMode.Traditional) {
      return {
        "0": "Root position",
        "1": "1st inversion",
        "2": "2nd inversion",
        "3": "3rd inversion"
      }[position] || "";
    } else {
      return {
        "0": "Bass = root",
        "1": "Bass = 3rd",
        "2": "Bass = 5th",
        "3": "Bass = 7th"
      }[position] || "";
    }
  };

  // Black key positions and offsets
  const blackKeyPositions = [
    { left: "15%", midiOffset: 1 },
    { left: "30%", midiOffset: 3 },
    { left: "58.5%", midiOffset: 6 },
    { left: "73%", midiOffset: 8 },
    { left: "87%", midiOffset: 10 },
  ];

  // White key data with MIDI offsets
  const whiteKeyData = [
    { midiOffset: 0 },
    { midiOffset: 2 },
    { midiOffset: 4 },
    { midiOffset: 5 },
    { midiOffset: 7 },
    { midiOffset: 9 },
    { midiOffset: 11 },
  ];

  return (
    <div className="space-y-12">
      {/* Keyboard Controls */}
      <div className="flex flex-col items-center gap-10">
        {/* Inversions */}
        <div className="space-y-3 w-full max-w-xl">
          <h3 className="text-sm font-medium text-gray-900 text-center">Inversions (0-3)</h3>
          <div className="flex justify-between">
            {[0, 1, 2, 3].map((num) => (
              <KeyHint
                key={num}
                keyLabel={num.toString()}
                description={getInversionDescription(num.toString())}
                isActive={activeVoicing?.position === (
                  num === 0 ? "root" :
                  num === 1 ? "first" :
                  num === 2 ? "second" :
                  "thirdseventh"
                )}
              />
            ))}
          </div>
        </div>

        {/* Chord Qualities */}
        <div className="space-y-3 w-full max-w-xl">
          <h3 className="text-sm font-medium text-gray-900 text-center">Chord Qualities (Q-U)</h3>
          <div className="flex justify-between">
            {layout.qualityKeys.map((key) => (
              <KeyHint
                key={key}
                keyLabel={key}
                description={qualityDescriptions[key]}
                isActive={activeVoicing?.quality === (
                  key === 'Q' ? ChordQuality.Major :
                  key === 'W' ? ChordQuality.Major7 :
                  key === 'E' ? ChordQuality.Dominant7 :
                  key === 'R' ? ChordQuality.Minor :
                  key === 'T' ? ChordQuality.Minor7 :
                  key === 'Y' ? ChordQuality.Diminished7 :
                  key === 'U' ? ChordQuality.HalfDiminished7 : null
                )}
              />
            ))}
          </div>
        </div>

        {/* Piano Keyboard */}
        <div className="space-y-3 w-full">
          <h3 className="text-sm font-medium text-gray-900 text-center">Bass Notes (Z-M)</h3>
          <div className="relative w-full max-w-3xl h-48 mx-auto">
            <div className="flex h-full relative">
              {octaves.map((octave) => (
                <div key={octave} className="flex-1 relative">
                  {/* White Keys */}
                  <div className="flex h-full">
                    {whiteKeyData.map(({ midiOffset }) => {
                      const midiNote = (octave + 1) * 12 + midiOffset;
                      return (
                        <div
                          key={midiNote}
                          className={`flex-1 flex items-end justify-center border-l last:border-r transition-colors
                            ${isNoteActive(midiNote) ? "bg-slate-500" : "bg-white"}`}
                        />
                      );
                    })}
                  </div>

                  {/* Black Keys */}
                  <div className="absolute top-0 left-0 h-[65%] w-full">
                    {blackKeyPositions.map(({ left, midiOffset }) => {
                      const midiNote = (octave + 1) * 12 + midiOffset;
                      return (
                        <div
                          key={midiNote}
                          style={{ left }}
                          className={`absolute w-[8%] h-full -ml-[4%] rounded-b-lg shadow-lg z-10
                            ${isNoteActive(midiNote) ? "bg-slate-500" : "bg-gray-900"}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}