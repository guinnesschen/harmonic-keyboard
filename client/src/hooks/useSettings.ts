import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SynthSettings, SoundPresetName } from "@/lib/audio";
import type { QualityKeyMapping } from "@shared/schema";
import { soundPresets } from "@/lib/audio";
import { getQualityKeyMappings, updateQualityKeyMappings } from "@/lib/keyboardMapping";

interface GlobalSettings {
  soundSettings: SynthSettings;
  currentPreset: SoundPresetName | "custom";
  keyMappings: QualityKeyMapping[];
}

// Initial state based on defaults
const initialSettings: GlobalSettings = {
  soundSettings: soundPresets["Warm Piano"],
  currentPreset: "Warm Piano",
  keyMappings: getQualityKeyMappings(),
};

export function useSettings() {
  const queryClient = useQueryClient();

  const { data: settings = initialSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => {
      // In a full implementation, this would load from local storage or backend
      return initialSettings;
    },
    staleTime: Infinity, // Keep the data fresh forever since we manually invalidate
  });

  const mutation = useMutation({
    mutationFn: (newSettings: Partial<GlobalSettings>) => {
      const updatedSettings = {
        ...settings,
        ...newSettings,
      };
      // In a full implementation, this would save to local storage or backend
      return Promise.resolve(updatedSettings);
    },
    onSuccess: (newSettings) => {
      queryClient.setQueryData(["settings"], newSettings);
    },
  });

  return {
    settings,
    updateSettings: (newSettings: Partial<GlobalSettings>) => mutation.mutate(newSettings),
  };
}
