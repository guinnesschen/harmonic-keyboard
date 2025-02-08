import { useEffect, useState } from "react";
import { getKeyboardLayout, getQualityKeyMappings } from "@/lib/keyboardMapping";
import { ChordQuality, ChordPosition, type ChordVoicing } from "@shared/schema";

interface KeyboardGuideProps {
  activeVoicing: ChordVoicing | null;
}

interface KeyHintProps {
  keyLabel: string;
  description: string;
  isActive: boolean;
}

function KeyHint({ keyLabel, description, isActive }: KeyHintProps) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-2 min-w-[100px]">
      <span className="text-sm text-gray-600">{description}</span>
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg
          ${
            isActive
              ? "bg-stone-500 text-white"
              : "bg-transparent border border-stone-500/20 text-gray-900"
          }`}
      >
        {keyLabel}
      </div>
    </div>
  );
}

export default function KeyboardGuide({ activeVoicing }: KeyboardGuideProps) {
  const layout = getKeyboardLayout();
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [qualityKeys] = useState(getQualityKeyMappings());

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

  const getInversionDescription = (position: string): string => {
    return (
      {
        "0": "Bass = root",
        "1": "Bass = 3rd",
        "2": "Bass = 5th",
        "3": "Bass = 7th",
      }[position] || ""
    );
  };

  // Determine which quality keys are enabled and their descriptions
  const qualityDescriptions = qualityKeys
    .filter(mapping => mapping.enabled)
    .reduce((acc, mapping) => {
      let description;
      switch (mapping.quality) {
        case ChordQuality.Major:
          description = "Major";
          break;
        case ChordQuality.Minor:
          description = "Minor";
          break;
        case ChordQuality.Major7:
          description = "Major 7";
          break;
        case ChordQuality.Minor7:
          description = "Minor 7";
          break;
        case ChordQuality.Dominant7:
          description = "Dom 7";
          break;
        case ChordQuality.Diminished7:
          description = "Dim 7";
          break;
        case ChordQuality.HalfDiminished7:
          description = "Half-dim 7";
          break;
        case ChordQuality.DomSus:
          description = "Dom Sus";
          break;
        case ChordQuality.Sus:
          description = "Sus";
          break;
        case ChordQuality.Aug:
          description = "Aug";
          break;
        case ChordQuality.MinMaj7:
          description = "Min/Maj7";
          break;
        case ChordQuality.Add9:
          description = "Add 9";
          break;
        default:
          description = mapping.quality;
      }
      return {
        ...acc,
        [mapping.key]: description
      };
    }, {} as Record<string, string>);

  return (
    <div className="space-y-12">
      {/* Keyboard Controls */}
      <div className="flex flex-col items-center gap-8">
        {/* Inversions */}
        <div className="w-full mb-4">
          <div className="flex justify-between">
            {[0, 1, 2, 3].map((num) => (
              <KeyHint
                key={num}
                keyLabel={num.toString()}
                description={getInversionDescription(num.toString())}
                isActive={
                  activeVoicing?.position ===
                  (num === 0
                    ? ChordPosition.Root
                    : num === 1
                      ? ChordPosition.First
                      : num === 2
                        ? ChordPosition.Second
                        : ChordPosition.Third)
                }
              />
            ))}
          </div>
        </div>
        
        <div className="w-full h-px bg-stone-200/50 mb-4" />

        {/* Chord Qualities */}
        <div className="w-full">
          <div className="flex justify-between flex-wrap gap-4">
            {layout.qualityKeys.map((key) => (
              <KeyHint
                key={key}
                keyLabel={key}
                description={qualityDescriptions[key] || ""}
                isActive={
                  activeVoicing?.quality ===
                  qualityKeys.find(m => m.key === key && m.enabled)?.quality
                }
              />
            ))}
          </div>
        </div>

        {/* Piano Keyboard */}
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
                          className={`flex-1 flex items-end justify-center border-l last:border-r transition-colors
                            ${isNoteActive(midiNote) ? "bg-stone-500" : "bg-white"}`}
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
                            ${isNoteActive(midiNote) ? "bg-stone-500" : "bg-gray-900"}`}
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