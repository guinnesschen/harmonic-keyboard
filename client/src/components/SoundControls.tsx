import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { SynthSettings } from "@/lib/audio";
import { updateSynthSettings, soundPresets, type SoundPresetName } from "@/lib/audio";
import { useSettings } from "@/hooks/useSettings";

interface SoundControlsProps {
  initialSettings: SynthSettings;
}

export default function SoundControls({ initialSettings }: SoundControlsProps) {
  const { settings, updateSettings } = useSettings();

  const updateSoundSettings = (path: string[], value: number | string) => {
    const newSettings = { ...settings.soundSettings };
    let current: any = newSettings;

    // Navigate to the correct nested property
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;

    updateSettings({
      soundSettings: newSettings,
      currentPreset: "custom"
    });
    updateSynthSettings(newSettings);
  };

  const loadPreset = (presetName: SoundPresetName) => {
    const preset = soundPresets[presetName];
    updateSettings({
      soundSettings: preset,
      currentPreset: presetName
    });
    updateSynthSettings(preset);
  };

  return (
    <div className="space-y-4 font-mono text-gray-900">
      <div>
        <Label className="text-stone-800 font-semibold">Sound Preset</Label>
        <Select
          value={settings.currentPreset}
          onValueChange={(value) => {
            if (value !== "custom") {
              loadPreset(value as SoundPresetName);
            }
          }}
        >
          <SelectTrigger className="bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(soundPresets).map((presetName) => (
              <SelectItem key={presetName} value={presetName} className="font-mono">
                {presetName}
              </SelectItem>
            ))}
            <SelectItem value="custom" className="font-mono">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="oscillator">
          <AccordionTrigger className="text-stone-800 font-semibold">
            <h2 className="text-xl">Oscillator</h2>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <Label className="text-stone-800">Waveform</Label>
                <Select
                  value={settings.soundSettings.oscillator.type}
                  onValueChange={(value) =>
                    updateSoundSettings(["oscillator", "type"], value)
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["sine", "triangle", "sawtooth", "square"].map((type) => (
                      <SelectItem key={type} value={type} className="font-mono">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-stone-800">Spread</Label>
                <Slider
                  value={[settings.soundSettings.oscillator.spread]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) =>
                    updateSoundSettings(["oscillator", "spread"], value)
                  }
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="envelope">
          <AccordionTrigger className="text-stone-800 font-semibold">Envelope</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <Label className="text-stone-800">Attack</Label>
                <Slider
                  value={[settings.soundSettings.envelope.attack]}
                  min={0}
                  max={2}
                  step={0.01}
                  onValueChange={([value]) =>
                    updateSoundSettings(["envelope", "attack"], value)
                  }
                />
              </div>
              <div>
                <Label className="text-stone-800">Decay</Label>
                <Slider
                  value={[settings.soundSettings.envelope.decay]}
                  min={0}
                  max={2}
                  step={0.01}
                  onValueChange={([value]) =>
                    updateSoundSettings(["envelope", "decay"], value)
                  }
                />
              </div>
              <div>
                <Label className="text-stone-800">Sustain</Label>
                <Slider
                  value={[settings.soundSettings.envelope.sustain]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) =>
                    updateSoundSettings(["envelope", "sustain"], value)
                  }
                />
              </div>
              <div>
                <Label className="text-stone-800">Release</Label>
                <Slider
                  value={[settings.soundSettings.envelope.release]}
                  min={0}
                  max={5}
                  step={0.01}
                  onValueChange={([value]) =>
                    updateSoundSettings(["envelope", "release"], value)
                  }
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="effects">
          <AccordionTrigger className="text-stone-800 font-semibold">Effects</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* Reverb */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-stone-800">Reverb</h3>
                <div>
                  <Label className="text-stone-800">Decay</Label>
                  <Slider
                    value={[settings.soundSettings.effects.reverb.decay]}
                    min={0.1}
                    max={10}
                    step={0.1}
                    onValueChange={([value]) =>
                      updateSoundSettings(["effects", "reverb", "decay"], value)
                    }
                  />
                </div>
                <div>
                  <Label className="text-stone-800">Mix</Label>
                  <Slider
                    value={[settings.soundSettings.effects.reverb.wet]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) =>
                      updateSoundSettings(["effects", "reverb", "wet"], value)
                    }
                  />
                </div>
              </div>

              {/* Chorus */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-stone-800">Chorus</h3>
                <div>
                  <Label className="text-stone-800">Depth</Label>
                  <Slider
                    value={[settings.soundSettings.effects.chorus.depth]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) =>
                      updateSoundSettings(["effects", "chorus", "depth"], value)
                    }
                  />
                </div>
                <div>
                  <Label className="text-stone-800">Frequency</Label>
                  <Slider
                    value={[settings.soundSettings.effects.chorus.frequency]}
                    min={0.1}
                    max={10}
                    step={0.1}
                    onValueChange={([value]) =>
                      updateSoundSettings(["effects", "chorus", "frequency"], value)
                    }
                  />
                </div>
                <div>
                  <Label className="text-stone-800">Mix</Label>
                  <Slider
                    value={[settings.soundSettings.effects.chorus.wet]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) =>
                      updateSoundSettings(["effects", "chorus", "wet"], value)
                    }
                  />
                </div>
              </div>

              {/* Distortion */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-stone-800">Distortion</h3>
                <div>
                  <Label className="text-stone-800">Amount</Label>
                  <Slider
                    value={[settings.soundSettings.effects.distortion.distortion]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) =>
                      updateSoundSettings(
                        ["effects", "distortion", "distortion"],
                        value,
                      )
                    }
                  />
                </div>
                <div>
                  <Label className="text-stone-800">Mix</Label>
                  <Slider
                    value={[settings.soundSettings.effects.distortion.wet]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) =>
                      updateSoundSettings(["effects", "distortion", "wet"], value)
                    }
                  />
                </div>
              </div>

              {/* EQ */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-stone-800">EQ</h3>
                <div>
                  <Label className="text-stone-800">Low</Label>
                  <Slider
                    value={[settings.soundSettings.effects.eq.low]}
                    min={-12}
                    max={12}
                    step={1}
                    onValueChange={([value]) =>
                      updateSoundSettings(["effects", "eq", "low"], value)
                    }
                  />
                </div>
                <div>
                  <Label className="text-stone-800">Mid</Label>
                  <Slider
                    value={[settings.soundSettings.effects.eq.mid]}
                    min={-12}
                    max={12}
                    step={1}
                    onValueChange={([value]) =>
                      updateSoundSettings(["effects", "eq", "mid"], value)
                    }
                  />
                </div>
                <div>
                  <Label className="text-stone-800">High</Label>
                  <Slider
                    value={[settings.soundSettings.effects.eq.high]}
                    min={-12}
                    max={12}
                    step={1}
                    onValueChange={([value]) =>
                      updateSoundSettings(["effects", "eq", "high"], value)
                    }
                  />
                </div>
              </div>

              {/* Compressor */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-stone-800">Compressor</h3>
                <div>
                  <Label className="text-stone-800">Threshold</Label>
                  <Slider
                    value={[settings.soundSettings.effects.compression.threshold]}
                    min={-60}
                    max={0}
                    step={1}
                    onValueChange={([value]) =>
                      updateSoundSettings(
                        ["effects", "compression", "threshold"],
                        value,
                      )
                    }
                  />
                </div>
                <div>
                  <Label className="text-stone-800">Ratio</Label>
                  <Slider
                    value={[settings.soundSettings.effects.compression.ratio]}
                    min={1}
                    max={20}
                    step={1}
                    onValueChange={([value]) =>
                      updateSoundSettings(["effects", "compression", "ratio"], value)
                    }
                  />
                </div>
                <div>
                  <Label className="text-stone-800">Attack</Label>
                  <Slider
                    value={[settings.soundSettings.effects.compression.attack]}
                    min={0.001}
                    max={1}
                    step={0.001}
                    onValueChange={([value]) =>
                      updateSoundSettings(["effects", "compression", "attack"], value)
                    }
                  />
                </div>
                <div>
                  <Label className="text-stone-800">Release</Label>
                  <Slider
                    value={[settings.soundSettings.effects.compression.release]}
                    min={0.01}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) =>
                      updateSoundSettings(["effects", "compression", "release"], value)
                    }
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="master">
          <AccordionTrigger className="text-stone-800 font-semibold">Master</AccordionTrigger>
          <AccordionContent>
            <div>
              <Label className="text-stone-800">Volume</Label>
              <Slider
                value={[settings.soundSettings.volume]}
                min={-60}
                max={0}
                step={1}
                onValueChange={([value]) => updateSoundSettings(["volume"], value)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}