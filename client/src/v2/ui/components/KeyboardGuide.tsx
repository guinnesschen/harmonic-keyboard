import type { ChordVoicing } from "../../domain/types";
import {
  ChordInversion,
  ChordQuality,
  type QualityKeyMapping,
} from "../../domain/types";
import MainPianoDisplay from "./MainPianoDisplay";
import { useSettings } from "../../state/settingsStore";

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
        className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg transition-colors duration-150
          ${
            isActive
              ? "bg-stone-500 text-white hover:bg-stone-300 hover:text-gray-900"
              : "bg-transparent border border-stone-500/20 text-gray-900 hover:bg-stone-300"
          }`}
      >
        {keyLabel}
      </div>
    </div>
  );
}

function qualityLabel(quality: ChordQuality): string {
  switch (quality) {
    case ChordQuality.Major:
      return "Major";
    case ChordQuality.Minor:
      return "Minor";
    case ChordQuality.Major7:
      return "Major 7";
    case ChordQuality.Minor7:
      return "Minor 7";
    case ChordQuality.Dominant7:
      return "Dom 7";
    case ChordQuality.Diminished7:
      return "Dim 7";
    case ChordQuality.HalfDiminished7:
      return "HalfDim 7";
    case ChordQuality.DomSus:
      return "DomSus";
    case ChordQuality.Sus:
      return "Sus";
    case ChordQuality.Aug:
      return "Aug";
    case ChordQuality.MinMaj7:
      return "MinMaj 7";
    case ChordQuality.Add9:
      return "Add 9";
    case ChordQuality.MinAdd9:
      return "MinAdd 9";
    default:
      return quality;
  }
}

function getInversionDescription(position: string): string {
  return (
    {
      "0": "Root position",
      "1": "1st inversion",
      "2": "2nd inversion",
      "3": "3rd inversion",
    }[position] || ""
  );
}

function isQualityActive(
  mapping: QualityKeyMapping,
  activeVoicing: ChordVoicing | null,
): boolean {
  return activeVoicing?.intent.quality === mapping.quality;
}

export default function KeyboardGuide({ activeVoicing }: KeyboardGuideProps) {
  const { settings } = useSettings();
  const qualityKeys = settings.keyMappings.filter((mapping) => mapping.enabled);

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-center gap-8">
        <div className="w-full">
          <div className="flex justify-between">
            {[0, 1, 2, 3].map((num) => (
              <KeyHint
                key={num}
                keyLabel={num.toString()}
                description={getInversionDescription(num.toString())}
                isActive={
                  activeVoicing?.intent.inversion ===
                  (num === 0
                    ? ChordInversion.Root
                    : num === 1
                      ? ChordInversion.First
                      : num === 2
                        ? ChordInversion.Second
                        : ChordInversion.Third)
                }
              />
            ))}
          </div>
        </div>

        <div className="w-full">
          <div className="flex justify-between flex-wrap gap-4">
            {qualityKeys.map((mapping) => (
              <KeyHint
                key={mapping.key}
                keyLabel={mapping.key}
                description={qualityLabel(mapping.quality)}
                isActive={isQualityActive(mapping, activeVoicing)}
              />
            ))}
          </div>
        </div>

        <MainPianoDisplay activeVoicing={activeVoicing} />
      </div>
    </div>
  );
}
