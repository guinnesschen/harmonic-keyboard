import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { LFOConfig } from "@/lib/audio";
import { Plus, Trash2 } from "lucide-react";

interface LFOTableProps {
  lfos: LFOConfig[];
  onLFOsChange: (lfos: LFOConfig[]) => void;
}

const availableTargets = [
  { value: "volume", label: "Master Volume" },
  { value: "filter.frequency", label: "Filter Cutoff" },
  { value: "chorus.frequency", label: "Chorus Rate" },
  { value: "reverb.decay", label: "Reverb Decay" },
  { value: "distortion.distortion", label: "Distortion Amount" },
];

export default function LFOTable({ lfos, onLFOsChange }: LFOTableProps) {
  const addLFO = () => {
    const newLFO: LFOConfig = {
      id: crypto.randomUUID(),
      frequency: 1,
      depth: 0.5,
      target: "volume",
      waveform: "sine",
      enabled: true,
    };
    onLFOsChange([...lfos, newLFO]);
  };

  const removeLFO = (id: string) => {
    onLFOsChange(lfos.filter(lfo => lfo.id !== id));
  };

  const updateLFO = (id: string, updates: Partial<LFOConfig>) => {
    onLFOsChange(
      lfos.map(lfo => (lfo.id === id ? { ...lfo, ...updates } : lfo))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-medium">LFO Modulators</Label>
        <Button
          onClick={addLFO}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add LFO
        </Button>
      </div>

      <div className="space-y-4">
        {lfos.map((lfo) => (
          <div
            key={lfo.id}
            className="border rounded-lg p-4 space-y-4 bg-white/50"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Switch
                  checked={lfo.enabled}
                  onCheckedChange={(enabled) =>
                    updateLFO(lfo.id, { enabled })
                  }
                />
                <Label>Active</Label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeLFO(lfo.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target Parameter</Label>
                <Select
                  value={lfo.target}
                  onValueChange={(target) =>
                    updateLFO(lfo.id, { target })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTargets.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Waveform</Label>
                <Select
                  value={lfo.waveform}
                  onValueChange={(waveform) =>
                    updateLFO(lfo.id, { waveform })
                  }
                >
                  <SelectTrigger>
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
                <Label>Frequency (Hz)</Label>
                <Slider
                  value={[lfo.frequency]}
                  min={0.1}
                  max={10}
                  step={0.1}
                  onValueChange={([frequency]) =>
                    updateLFO(lfo.id, { frequency })
                  }
                />
              </div>

              <div>
                <Label>Depth</Label>
                <Slider
                  value={[lfo.depth]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([depth]) =>
                    updateLFO(lfo.id, { depth })
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
