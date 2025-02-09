import { useState } from "react";
import {
  getKeyboardLayout,
  getQualityKeyMappings,
} from "@/lib/keyboardMapping";
import { ChordQuality, ChordPosition, type ChordVoicing } from "@shared/schema";
import MainPianoDisplay from "./MainPianoDisplay";

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
  const [qualityKeys] = useState(getQualityKeyMappings());

  const getInversionDescription = (position: string): string => {
    return (
      {
        "0": "Root position",
        "1": "1st inversion",
        "2": "2nd inversion",
        "3": "3rd inversion",
      }[position] || ""
    );
  };

  // Determine which quality keys are enabled and their descriptions
  const qualityDescriptions = qualityKeys
    .filter((mapping) => mapping.enabled)
    .reduce(
      (acc, mapping) => {
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
          [mapping.key]: description,
        };
      },
      {} as Record<string, string>,
    );

  return (
    <div className="space-y-12">
      {/* Keyboard Controls */}
      <div className="flex flex-col items-center gap-16">
        {/* Inversions */}
        <div className="w-full">
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
                  qualityKeys.find((m) => m.key === key && m.enabled)?.quality
                }
              />
            ))}
          </div>
        </div>

        {/* Piano Keyboard */}
        <MainPianoDisplay activeVoicing={activeVoicing} />
      </div>
    </div>
  );
}