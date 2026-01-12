import {
  ChordInversion,
  ChordQuality,
  type ChordIntent,
  type ChordQualityConfig,
  type QualityKeyMapping,
} from "../domain/types";
import { rootFromBass } from "../domain/chords";
import { defaultChordQualities } from "../domain/defaults";

export const DEFAULT_BASS_KEYS = "zsxdcvgbhnjm,l.;/";
export const DEFAULT_INVERSION_KEYS = "0123";

export const DEFAULT_QUALITY_KEY_MAPPINGS: QualityKeyMapping[] = [
  { key: "Q", quality: ChordQuality.Major, enabled: true },
  { key: "W", quality: ChordQuality.Major7, enabled: true },
  { key: "E", quality: ChordQuality.Dominant7, enabled: true },
  { key: "R", quality: ChordQuality.Minor, enabled: true },
  { key: "T", quality: ChordQuality.Minor7, enabled: true },
  { key: "Y", quality: ChordQuality.Diminished7, enabled: true },
  { key: "U", quality: ChordQuality.HalfDiminished7, enabled: true },
  { key: "I", quality: ChordQuality.DomSus, enabled: true },
  { key: "O", quality: ChordQuality.Sus, enabled: true },
  { key: "P", quality: ChordQuality.Aug, enabled: true },
  { key: "5", quality: ChordQuality.MinMaj7, enabled: true },
  { key: "6", quality: ChordQuality.Add9, enabled: true },
  { key: "7", quality: ChordQuality.MinAdd9, enabled: true },
];

export interface KeyboardLayout {
  bassKeys: string;
  inversionKeys: string;
  qualityKeyMappings: QualityKeyMapping[];
}

export interface KeyboardState {
  pressKey: (key: string) => void;
  releaseKey: (key: string) => void;
  clear: () => void;
  getPressed: () => Set<string>;
  toIntent: () => ChordIntent | null;
  setQualityKeyMappings: (mappings: QualityKeyMapping[]) => void;
  setChordDefaults: (defaults: ChordQualityConfig) => void;
}

export function createKeyboardState(layout: KeyboardLayout): KeyboardState {
  const pressedKeys = new Set<string>();
  let qualityKeyMappings = layout.qualityKeyMappings;
  let chordDefaults = defaultChordQualities;

  const getEnabledQualityKeys = () =>
    qualityKeyMappings
      .filter((mapping) => mapping.enabled)
      .map((mapping) => mapping.key.toLowerCase());

  const getQualityFromKey = (key: string): ChordQuality | null => {
    const mapping = qualityKeyMappings.find(
      (entry) => entry.key.toLowerCase() === key.toLowerCase() && entry.enabled,
    );
    return mapping?.quality ?? null;
  };

  const getPositionFromKey = (key: string): ChordInversion => {
    const positionMap: Record<string, ChordInversion> = {
      "0": ChordInversion.Root,
      "1": ChordInversion.First,
      "2": ChordInversion.Second,
      "3": ChordInversion.Third,
    };
    return positionMap[key] ?? ChordInversion.Root;
  };

  const getDefaultQuality = (
    position: keyof ChordQualityConfig,
    noteIndex: number,
  ): ChordQuality => chordDefaults[position][noteIndex] ?? ChordQuality.Major;

  return {
    pressKey: (key: string) => {
      pressedKeys.add(key.toLowerCase());
    },
    releaseKey: (key: string) => {
      pressedKeys.delete(key.toLowerCase());
    },
    clear: () => {
      pressedKeys.clear();
    },
    getPressed: () => new Set(pressedKeys),
    setQualityKeyMappings: (mappings) => {
      qualityKeyMappings = mappings;
    },
    setChordDefaults: (defaults) => {
      chordDefaults = defaults;
    },
    toIntent: () => {
      const currentKeys = Array.from(pressedKeys);
      if (currentKeys.includes(" ")) {
        return null;
      }

      const bassKey = currentKeys.find((key) =>
        layout.bassKeys.includes(key.toLowerCase()),
      );
      if (!bassKey) {
        return null;
      }

      const positionKey = currentKeys.find((key) =>
        layout.inversionKeys.includes(key),
      );
      const position = positionKey
        ? getPositionFromKey(positionKey)
        : ChordInversion.Root;

      const qualityKey = currentKeys.find((key) =>
        getEnabledQualityKeys().includes(key.toLowerCase()),
      );
      const bassNoteIndex = layout.bassKeys.indexOf(bassKey.toLowerCase());

      const quality = qualityKey
        ? (getQualityFromKey(qualityKey) ?? ChordQuality.Major)
        : getDefaultQuality(
            position === ChordInversion.Root
              ? "root"
              : position === ChordInversion.First
                ? "first"
                : position === ChordInversion.Second
                  ? "second"
                  : "third",
            bassNoteIndex,
          );

      const root = rootFromBass(bassNoteIndex, quality, position);

      return {
        root,
        bass: bassNoteIndex + 48,
        quality,
        inversion: position,
      };
    },
  };
}

export function getMidiNoteKey(midiNote: number): string | null {
  const noteIndex = midiNote % 12;
  const keyMap: Record<number, string> = {
    0: "z",
    1: "s",
    2: "x",
    3: "d",
    4: "c",
    5: "v",
    6: "g",
    7: "b",
    8: "h",
    9: "n",
    10: "j",
    11: "m",
  };

  return keyMap[noteIndex] ?? null;
}
