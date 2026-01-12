import { soundPresets, type SoundPresetName, type SynthSettings } from "../audio/types";
import type {
  ChordQualityConfig,
  QualityKeyMapping,
} from "../domain/types";
import { defaultChordQualities } from "../domain/defaults";
import { DEFAULT_QUALITY_KEY_MAPPINGS } from "../input/keyboardMapping";

export interface SettingsState {
  soundSettings: SynthSettings;
  currentPreset: SoundPresetName | "custom";
  keyMappings: QualityKeyMapping[];
  chordDefaults: ChordQualityConfig;
}

export const defaultSettingsState: SettingsState = {
  soundSettings: soundPresets["Warm Piano"],
  currentPreset: "Warm Piano",
  keyMappings: DEFAULT_QUALITY_KEY_MAPPINGS,
  chordDefaults: defaultChordQualities,
};
