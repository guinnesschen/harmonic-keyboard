import type { DrumSound } from '../../audio/types';
import { cn } from '../../lib/utils';

interface DrumPadProps {
  sound: DrumSound;
  keyLabel: string;
  active: boolean;
  onTrigger: () => void;
}

const DRUM_LABELS: Record<DrumSound, string> = {
  kick: 'Kick',
  snare: 'Snare',
  hihat: 'Hi-Hat',
  openhat: 'Open Hat',
  crash: 'Crash',
  rimshot: 'Rimshot',
  clap: 'Clap',
};

const DRUM_COLORS: Record<DrumSound, string> = {
  kick: 'bg-red-500',
  snare: 'bg-orange-500',
  hihat: 'bg-yellow-500',
  openhat: 'bg-green-500',
  crash: 'bg-blue-500',
  rimshot: 'bg-indigo-500',
  clap: 'bg-purple-500',
};

export function DrumPad({ sound, keyLabel, active, onTrigger }: DrumPadProps) {
  return (
    <button
      onClick={onTrigger}
      className={cn(
        'relative w-24 h-24 rounded-xl border-2 transition-all duration-75',
        'flex flex-col items-center justify-center gap-1',
        'hover:scale-105 active:scale-95',
        active
          ? `${DRUM_COLORS[sound]} border-white text-white shadow-lg`
          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
      )}
    >
      <span className="text-xs font-bold uppercase tracking-wide opacity-60">{keyLabel}</span>
      <span className="text-sm font-semibold">{DRUM_LABELS[sound]}</span>
    </button>
  );
}
