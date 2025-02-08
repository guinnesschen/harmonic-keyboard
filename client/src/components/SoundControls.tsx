import { useState } from "react";
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
import { updateSynthSettings } from "@/lib/audio";

interface SoundControlsProps {
  initialSettings: SynthSettings;
}

export default function SoundControls({ initialSettings }: SoundControlsProps) {
  const [settings, setSettings] = useState<SynthSettings>(initialSettings);

  const updateSettings = (path: string[], value: number | string) => {
    const newSettings = { ...settings };
    let current: any = newSettings;

    // Navigate to the correct nested property
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;

    setSettings(newSettings);
    updateSynthSettings(newSettings);
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="oscillator">
        <AccordionTrigger className="text-gray-900">
          Oscillator
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-900">Waveform</Label>
              <Select
                value={settings.oscillator.type}
                onValueChange={(value) =>
                  updateSettings(["oscillator", "type"], value)
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sine">Sine</SelectItem>
                  <SelectItem value="triangle">Triangle</SelectItem>
                  <SelectItem value="sawtooth">Sawtooth</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-900">Spread</Label>
              <Slider
                value={[settings.oscillator.spread]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) =>
                  updateSettings(["oscillator", "spread"], value)
                }
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="envelope">
        <AccordionTrigger className="text-gray-900">Envelope</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-900">Attack</Label>
              <Slider
                value={[settings.envelope.attack]}
                min={0}
                max={2}
                step={0.01}
                onValueChange={([value]) =>
                  updateSettings(["envelope", "attack"], value)
                }
              />
            </div>
            <div>
              <Label className="text-gray-900">Decay</Label>
              <Slider
                value={[settings.envelope.decay]}
                min={0}
                max={2}
                step={0.01}
                onValueChange={([value]) =>
                  updateSettings(["envelope", "decay"], value)
                }
              />
            </div>
            <div>
              <Label className="text-gray-900">Sustain</Label>
              <Slider
                value={[settings.envelope.sustain]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={([value]) =>
                  updateSettings(["envelope", "sustain"], value)
                }
              />
            </div>
            <div>
              <Label className="text-gray-900">Release</Label>
              <Slider
                value={[settings.envelope.release]}
                min={0}
                max={5}
                step={0.01}
                onValueChange={([value]) =>
                  updateSettings(["envelope", "release"], value)
                }
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="effects">
        <AccordionTrigger className="text-gray-900">Effects</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6">
            {/* Reverb */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Reverb</h3>
              <div>
                <Label className="text-gray-900">Decay</Label>
                <Slider
                  value={[settings.effects.reverb.decay]}
                  min={0.1}
                  max={10}
                  step={0.1}
                  onValueChange={([value]) =>
                    updateSettings(["effects", "reverb", "decay"], value)
                  }
                />
              </div>
              <div>
                <Label className="text-gray-900">Mix</Label>
                <Slider
                  value={[settings.effects.reverb.wet]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) =>
                    updateSettings(["effects", "reverb", "wet"], value)
                  }
                />
              </div>
            </div>

            {/* Chorus */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Chorus</h3>
              <div>
                <Label className="text-gray-900">Depth</Label>
                <Slider
                  value={[settings.effects.chorus.depth]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) =>
                    updateSettings(["effects", "chorus", "depth"], value)
                  }
                />
              </div>
              <div>
                <Label className="text-gray-900">Frequency</Label>
                <Slider
                  value={[settings.effects.chorus.frequency]}
                  min={0.1}
                  max={10}
                  step={0.1}
                  onValueChange={([value]) =>
                    updateSettings(["effects", "chorus", "frequency"], value)
                  }
                />
              </div>
              <div>
                <Label className="text-gray-900">Mix</Label>
                <Slider
                  value={[settings.effects.chorus.wet]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) =>
                    updateSettings(["effects", "chorus", "wet"], value)
                  }
                />
              </div>
            </div>

            {/* Distortion */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Distortion</h3>
              <div>
                <Label className="text-gray-900">Amount</Label>
                <Slider
                  value={[settings.effects.distortion.distortion]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) =>
                    updateSettings(
                      ["effects", "distortion", "distortion"],
                      value,
                    )
                  }
                />
              </div>
              <div>
                <Label className="text-gray-900">Mix</Label>
                <Slider
                  value={[settings.effects.distortion.wet]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) =>
                    updateSettings(["effects", "distortion", "wet"], value)
                  }
                />
              </div>
            </div>

            {/* EQ */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">EQ</h3>
              <div>
                <Label className="text-gray-900">Low</Label>
                <Slider
                  value={[settings.effects.eq.low]}
                  min={-12}
                  max={12}
                  step={1}
                  onValueChange={([value]) =>
                    updateSettings(["effects", "eq", "low"], value)
                  }
                />
              </div>
              <div>
                <Label className="text-gray-900">Mid</Label>
                <Slider
                  value={[settings.effects.eq.mid]}
                  min={-12}
                  max={12}
                  step={1}
                  onValueChange={([value]) =>
                    updateSettings(["effects", "eq", "mid"], value)
                  }
                />
              </div>
              <div>
                <Label className="text-gray-900">High</Label>
                <Slider
                  value={[settings.effects.eq.high]}
                  min={-12}
                  max={12}
                  step={1}
                  onValueChange={([value]) =>
                    updateSettings(["effects", "eq", "high"], value)
                  }
                />
              </div>
            </div>

            {/* Compressor */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Compressor</h3>
              <div>
                <Label className="text-gray-900">Threshold</Label>
                <Slider
                  value={[settings.effects.compression.threshold]}
                  min={-60}
                  max={0}
                  step={1}
                  onValueChange={([value]) =>
                    updateSettings(
                      ["effects", "compression", "threshold"],
                      value,
                    )
                  }
                />
              </div>
              <div>
                <Label className="text-gray-900">Ratio</Label>
                <Slider
                  value={[settings.effects.compression.ratio]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={([value]) =>
                    updateSettings(["effects", "compression", "ratio"], value)
                  }
                />
              </div>
              <div>
                <Label className="text-gray-900">Attack</Label>
                <Slider
                  value={[settings.effects.compression.attack]}
                  min={0.001}
                  max={1}
                  step={0.001}
                  onValueChange={([value]) =>
                    updateSettings(["effects", "compression", "attack"], value)
                  }
                />
              </div>
              <div>
                <Label className="text-gray-900">Release</Label>
                <Slider
                  value={[settings.effects.compression.release]}
                  min={0.01}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) =>
                    updateSettings(["effects", "compression", "release"], value)
                  }
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="master">
        <AccordionTrigger className="text-gray-900">Master</AccordionTrigger>
        <AccordionContent>
          <div>
            <Label className="text-gray-900">Volume</Label>
            <Slider
              value={[settings.volume]}
              min={-60}
              max={0}
              step={1}
              onValueChange={([value]) => updateSettings(["volume"], value)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
