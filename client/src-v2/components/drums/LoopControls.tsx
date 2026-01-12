import type { LoopState } from '../../audio/types';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface LoopControlsProps {
  loopState: LoopState;
  onQuantize: () => void;
  onClear: () => void;
}

const STATE_LABELS: Record<LoopState, string> = {
  idle: 'Press SPACE to record',
  recording: 'Recording... (SPACE to stop)',
  playing: 'Playing (SPACE to overdub)',
  overdubbing: 'Overdubbing... (SPACE to stop)',
};

const STATE_COLORS: Record<LoopState, string> = {
  idle: 'bg-gray-200 text-gray-600',
  recording: 'bg-red-500 text-white',
  playing: 'bg-green-500 text-white',
  overdubbing: 'bg-yellow-500 text-white',
};

export function LoopControls({ loopState, onQuantize, onClear }: LoopControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          STATE_COLORS[loopState]
        )}
      >
        {STATE_LABELS[loopState]}
      </div>

      {loopState !== 'idle' && (
        <>
          <Button variant="outline" size="sm" onClick={onQuantize}>
            Quantize (Q)
          </Button>
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear (ESC)
          </Button>
        </>
      )}
    </div>
  );
}
