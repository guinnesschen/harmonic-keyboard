import { useEffect, useState } from "react";
import { getKeyboardLayout, getActiveKeys, getMidiNoteKey } from "@/lib/keyboardMapping";
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
          <div className="relative w-full max-w-6xl mx-auto h-72">
            {/* White keys */}
            <div className="flex h-72 w-full relative">
              {octaves.map(octave => (
                whiteKeys.map(note => {
                  const midiNote = (octave + 1) * 12 + ['C', 'D', 'E', 'F', 'G', 'A', 'B'].indexOf(note);
                  return (
                    <div
                      key={`${note}${octave}`}
                      className={`flex-1 flex items-end pb-4 justify-center border-l last:border-r rounded-b-xl shadow-md transition-colors
                        ${isNoteActive(midiNote)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-white text-gray-700'}`}
                    >
                      <span className="text-sm">
                        {note}{octave}
                      </span>
                    </div>
                  );
                })
              ))}
            </div>

            {/* Black keys */}
            <div className="absolute top-0 left-0 w-full">
              {octaves.map((octave, octaveIndex) => (
                blackKeys.map((note, index) => {
                  if (!note) return null;
                  const midiNote = (octave + 1) * 12 + index;
                  const offset = [
                    7,   // C#
                    20,  // D#
                    null,
                    47,  // F#
                    60,  // G#
                    73   // A#
                  ][index % 7];

                  if (!offset) return null;

                  return (
                    <div
                      key={`${note}${octave}`}
                      style={{
                        position: 'absolute',
                        left: `${offset + (octaveIndex * 100)}%`,
                        width: '4%',
                        height: '60%',
                      }}
                      className={`flex items-end pb-4 justify-center rounded-b-xl shadow-lg transition-colors
                        ${isNoteActive(midiNote)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-800 text-white'}`}
                    >
                      <span className="text-xs">
                        {note}{octave}
                      </span>
                    </div>
                  );
                })
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