import { useEffect, useState } from "react";
import { getKeyboardLayout, getActiveKeys } from "@/lib/keyboardMapping";
import { ChordQuality, ChordPosition, type ChordVoicing, InversionMode, ThemeMode } from "@shared/schema";

interface KeyboardGuideProps {
  activeVoicing: ChordVoicing | null;
  inversionMode: InversionMode;
  themeMode: ThemeMode;
}

interface KeyColorConfig {
  whiteKey: (isActive: boolean) => string;
  blackKey: (isActive: boolean) => string;
}

export default function KeyboardGuide({ activeVoicing, inversionMode, themeMode }: KeyboardGuideProps) {
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

  const getDarkModeColors = (): KeyColorConfig => ({
    whiteKey: (isActive: boolean) => isActive ? "bg-slate-500" : "bg-slate-700",
    blackKey: (isActive: boolean) => isActive ? "bg-slate-900" : "bg-slate-950",
  });

  const getLightModeColors = (): KeyColorConfig => ({
    whiteKey: (isActive: boolean) => isActive ? "bg-primary" : "bg-white",
    blackKey: (isActive: boolean) => isActive ? "bg-primary" : "bg-gray-900",
  });

  const colors = themeMode === ThemeMode.Dark ? getDarkModeColors() : getLightModeColors();

  return (
    <div className="space-y-8">
      {/* Keyboard Controls */}
      <div className="flex flex-col items-center gap-6">
        {/* Inversions */}
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map((num) => (
            <div key={num} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg
                  ${
                    activeVoicing?.position === (
                      num === 0 ? "root" :
                      num === 1 ? "first" :
                      num === 2 ? "second" :
                      "thirdseventh"
                    )
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent border border-primary/20 text-foreground"
                  }`}
              >
                {num}
              </div>
            </div>
          ))}
        </div>

        {/* Chord Qualities */}
        <div className="flex justify-center gap-3">
          {layout.qualityKeys.map((key) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg
                  ${
                    activeVoicing?.quality === (
                      key === 'Q' ? ChordQuality.Major :
                      key === 'W' ? ChordQuality.Major7 :
                      key === 'E' ? ChordQuality.Dominant7 :
                      key === 'R' ? ChordQuality.Minor :
                      key === 'T' ? ChordQuality.Minor7 :
                      key === 'Y' ? ChordQuality.Diminished7 :
                      key === 'U' ? ChordQuality.HalfDiminished7 : null
                    )
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent border border-primary/20 text-foreground"
                  }`}
              >
                {key}
              </div>
            </div>
          ))}
        </div>

        {/* Piano Keyboard */}
        <div className="relative w-full max-w-3xl h-48">
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
                          ${colors.whiteKey(isNoteActive(midiNote))}`}
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
                          ${colors.blackKey(isNoteActive(midiNote))}`}
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
  );
}