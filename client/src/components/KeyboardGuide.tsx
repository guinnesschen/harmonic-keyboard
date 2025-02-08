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
    const updateActiveNotes = () => {
      const notes = new Set<number>();

      // Add notes from the current voicing
      if (activeVoicing) {
        activeVoicing.notes.forEach(note => {
          notes.add(note);
        });
      }

      setActiveNotes(notes);
    };

    updateActiveNotes();
  }, [activeVoicing]);

  const isNoteActive = (midiNote: number) => activeNotes.has(midiNote);

  // Define octaves to display (3 octaves starting from C3)
  const octaves = [3, 4, 5];
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeys = ['C#', 'D#', null, 'F#', 'G#', 'A#', null];

  const qualityLabels: Record<string, string> = {
    'Q': 'Major',
    'W': 'Major 7',
    'E': 'Dominant 7',
    'R': 'Minor',
    'T': 'Minor 7',
    'Y': 'Diminished 7',
    'U': 'Half Dim 7'
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-center">Keyboard Controls</h2>

      <div className="grid gap-8">
        {/* Inversions */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-500">Inversions (Number Row)</div>
          <div className="flex gap-3">
            {layout.positionKeys.map((key, i) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={`w-12 h-12 flex items-center justify-center border rounded-lg shadow-sm transition-colors text-lg
                    ${getActiveKeys().includes(key.toLowerCase())
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white text-gray-700'}`}
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
          <div className="text-sm font-medium text-gray-500">Chord Qualities (Letter Keys)</div>
          <div className="flex gap-3">
            {layout.qualityKeys.map((key) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={`w-12 h-12 flex items-center justify-center border rounded-lg shadow-sm transition-colors text-lg
                    ${getActiveKeys().includes(key.toLowerCase())
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white text-gray-700'}`}
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

        {/* Multi-octave Piano */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-500">Notes Being Played</div>
          <div className="relative w-full h-96">
            {/* White keys container */}
            <div className="flex h-full">
              {octaves.map(octave => (
                whiteKeys.map(note => {
                  const midiNote = (octave + 1) * 12 + ['C', 'D', 'E', 'F', 'G', 'A', 'B'].indexOf(note);
                  return (
                    <div
                      key={`${note}${octave}`}
                      className={`relative flex-1 flex items-end justify-center border-l last:border-r bg-white hover:bg-gray-50 transition-colors
                        ${isNoteActive(midiNote) ? 'bg-primary/20' : ''}`}
                      style={{ height: '100%' }}
                    >
                      <span className="absolute bottom-4 text-sm text-gray-600">
                        {note}{octave}
                      </span>
                    </div>
                  );
                })
              ))}
            </div>

            {/* Black keys overlay */}
            <div className="absolute top-0 left-0 w-full">
              {octaves.map(octave => (
                <div key={octave} className="absolute" style={{ width: `${100/3}%`, left: `${(octave-3) * (100/3)}%` }}>
                  {/* C# */}
                  <div className={`absolute w-[7%] h-[65%] -ml-[3.5%] left-[14.3%] rounded-b-lg
                    ${isNoteActive((octave + 1) * 12 + 1) ? 'bg-primary' : 'bg-gray-900'}`}>
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white">C#{octave}</span>
                  </div>
                  {/* D# */}
                  <div className={`absolute w-[7%] h-[65%] -ml-[3.5%] left-[28.6%] rounded-b-lg
                    ${isNoteActive((octave + 1) * 12 + 3) ? 'bg-primary' : 'bg-gray-900'}`}>
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white">D#{octave}</span>
                  </div>
                  {/* F# */}
                  <div className={`absolute w-[7%] h-[65%] -ml-[3.5%] left-[57.2%] rounded-b-lg
                    ${isNoteActive((octave + 1) * 12 + 6) ? 'bg-primary' : 'bg-gray-900'}`}>
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white">F#{octave}</span>
                  </div>
                  {/* G# */}
                  <div className={`absolute w-[7%] h-[65%] -ml-[3.5%] left-[71.5%] rounded-b-lg
                    ${isNoteActive((octave + 1) * 12 + 8) ? 'bg-primary' : 'bg-gray-900'}`}>
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white">G#{octave}</span>
                  </div>
                  {/* A# */}
                  <div className={`absolute w-[7%] h-[65%] -ml-[3.5%] left-[85.8%] rounded-b-lg
                    ${isNoteActive((octave + 1) * 12 + 10) ? 'bg-primary' : 'bg-gray-900'}`}>
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white">A#{octave}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Show active notes for debugging */}
          <div className="text-sm text-gray-500 text-center mt-4">
            Active notes: {Array.from(activeNotes).map(note => midiNoteToNoteName(note)).join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
}