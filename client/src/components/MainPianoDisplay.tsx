import { type ChordVoicing } from "@shared/schema";

interface MainPianoDisplayProps {
  activeVoicing: ChordVoicing | null;
}

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

export default function MainPianoDisplay({ activeVoicing }: MainPianoDisplayProps) {
  const activeNotes = new Set(activeVoicing?.notes || []);
  const isNoteActive = (midiNote: number) => activeNotes.has(midiNote);

  // Define octaves to display (3 octaves starting from C3)
  const octaves = [3, 4, 5];

  return (
    <div className="w-full">
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
                      className={`flex-1 flex items-end justify-center border-l last:border-r transition-colors duration-150
                        ${isNoteActive(midiNote)
                        ? "bg-stone-500 hover:bg-stone-400"
                        : "bg-white hover:bg-stone-200"}`}
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
                      className={`absolute w-[8%] h-full -ml-[4%] rounded-b-lg shadow-lg z-10 transition-colors duration-150
                        ${isNoteActive(midiNote)
                        ? "bg-stone-500 hover:bg-stone-400"
                        : "bg-gray-900 hover:bg-gray-600"}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}