import { useAudio } from '../../state/AudioContext';
import { Slider } from '../ui/Slider';
import { Select } from '../ui/Select';
import { PRESET_NAMES } from '../../audio/presets';

export function SoundControls() {
  const { synthSettings, setSynthSettings, currentPreset, setPreset } = useAudio();

  const oscillatorOptions = [
    { value: 'sine', label: 'Sine' },
    { value: 'triangle', label: 'Triangle' },
    { value: 'square', label: 'Square' },
    { value: 'sawtooth', label: 'Sawtooth' },
  ];

  const presetOptions = PRESET_NAMES.map((name) => ({ value: name, label: name }));

  return (
    <div className="space-y-6">
      {/* Preset selector */}
      <Select
        label="Preset"
        options={presetOptions}
        value={currentPreset}
        onChange={(e) => setPreset(e.target.value)}
      />

      {/* Oscillator */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-gray-700">Oscillator</h4>
        <Select
          label="Waveform"
          options={oscillatorOptions}
          value={synthSettings.oscillator.type}
          onChange={(e) =>
            setSynthSettings({
              oscillator: { ...synthSettings.oscillator, type: e.target.value as any },
            })
          }
        />
      </div>

      {/* Envelope */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-gray-700">Envelope</h4>
        <Slider
          label="Attack"
          showValue
          min={0}
          max={2}
          step={0.01}
          value={synthSettings.envelope.attack}
          onChange={(e) =>
            setSynthSettings({
              envelope: { ...synthSettings.envelope, attack: parseFloat(e.target.value) },
            })
          }
        />
        <Slider
          label="Decay"
          showValue
          min={0}
          max={2}
          step={0.01}
          value={synthSettings.envelope.decay}
          onChange={(e) =>
            setSynthSettings({
              envelope: { ...synthSettings.envelope, decay: parseFloat(e.target.value) },
            })
          }
        />
        <Slider
          label="Sustain"
          showValue
          min={0}
          max={1}
          step={0.01}
          value={synthSettings.envelope.sustain}
          onChange={(e) =>
            setSynthSettings({
              envelope: { ...synthSettings.envelope, sustain: parseFloat(e.target.value) },
            })
          }
        />
        <Slider
          label="Release"
          showValue
          min={0}
          max={4}
          step={0.01}
          value={synthSettings.envelope.release}
          onChange={(e) =>
            setSynthSettings({
              envelope: { ...synthSettings.envelope, release: parseFloat(e.target.value) },
            })
          }
        />
      </div>

      {/* Volume */}
      <Slider
        label="Volume (dB)"
        showValue
        min={-30}
        max={0}
        step={1}
        value={synthSettings.volume}
        onChange={(e) => setSynthSettings({ volume: parseFloat(e.target.value) })}
      />

      {/* Effects */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-gray-700">Reverb</h4>
        <Slider
          label="Decay"
          showValue
          min={0.1}
          max={10}
          step={0.1}
          value={synthSettings.effects.reverb.decay}
          onChange={(e) =>
            setSynthSettings({
              effects: {
                ...synthSettings.effects,
                reverb: { ...synthSettings.effects.reverb, decay: parseFloat(e.target.value) },
              },
            })
          }
        />
        <Slider
          label="Mix"
          showValue
          min={0}
          max={1}
          step={0.01}
          value={synthSettings.effects.reverb.wet}
          onChange={(e) =>
            setSynthSettings({
              effects: {
                ...synthSettings.effects,
                reverb: { ...synthSettings.effects.reverb, wet: parseFloat(e.target.value) },
              },
            })
          }
        />
      </div>
    </div>
  );
}
