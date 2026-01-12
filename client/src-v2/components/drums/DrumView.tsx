import { useDrumPlayer } from '../../hooks/useDrumPlayer';
import { DrumPad } from './DrumPad';
import { LoopControls } from './LoopControls';
import { DRUM_KEY_MAP, DRUM_SOUNDS } from '../../domain/constants';
import type { DrumSound } from '../../audio/types';

interface DrumViewProps {
  enabled: boolean;
}

// Reverse mapping: sound -> key
const SOUND_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(DRUM_KEY_MAP).map(([k, v]) => [v, k.toUpperCase()])
);

export function DrumView({ enabled }: DrumViewProps) {
  const { loopState, activePad, triggerDrum, quantize, clearLoop } = useDrumPlayer({ enabled });

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex-shrink-0 mb-8">
        <LoopControls loopState={loopState} onQuantize={() => quantize(16, 120)} onClear={clearLoop} />
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="grid grid-cols-4 gap-4">
          {DRUM_SOUNDS.map((sound) => (
            <DrumPad
              key={sound}
              sound={sound as DrumSound}
              keyLabel={SOUND_TO_KEY[sound] || ''}
              active={activePad === sound}
              onTrigger={() => triggerDrum(sound as DrumSound)}
            />
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 mt-8 text-center text-sm text-gray-500">
        <p>Press keys A-J to play drums</p>
        <p>SPACE for loop control, ESC to clear</p>
      </div>
    </div>
  );
}
