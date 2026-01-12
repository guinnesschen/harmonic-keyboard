import { useStorage } from '../../state/StorageContext';
import { getKeyboardLayout, getBassKeyNoteName } from '../../domain/keyMapping';
import { QUALITY_NAMES } from '../../domain/constants';
import type { ChordVoicing, ChordQuality } from '../../domain/types';
import { cn } from '../../lib/utils';

interface KeyboardGuideProps {
  voicing: ChordVoicing | null;
}

export function KeyboardGuide({ voicing }: KeyboardGuideProps) {
  const { settings } = useStorage();
  const layout = getKeyboardLayout(settings.qualityMappings);

  return (
    <div className="space-y-6">
      {/* Quality keys (top row) */}
      <div>
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Chord Quality</div>
        <div className="flex gap-1 flex-wrap">
          {settings.qualityMappings
            .filter((m) => m.enabled)
            .map((mapping) => (
              <KeyCap
                key={mapping.key}
                keyLabel={mapping.key}
                subLabel={QUALITY_NAMES[mapping.quality]}
                active={voicing?.quality === mapping.quality}
                variant="quality"
              />
            ))}
        </div>
      </div>

      {/* Bass keys (middle row) */}
      <div>
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Bass Note</div>
        <div className="flex gap-1">
          {layout.bassKeys.map((key, i) => {
            const noteName = getBassKeyNoteName(i);
            const isBlackKey = noteName.includes('#');
            return (
              <KeyCap
                key={key}
                keyLabel={key}
                subLabel={noteName}
                active={voicing !== null && voicing.notes[0] % 12 === i % 12}
                variant={isBlackKey ? 'black' : 'white'}
              />
            );
          })}
        </div>
      </div>

      {/* Inversion keys (number row) */}
      <div>
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Inversion</div>
        <div className="flex gap-1">
          {['Root', '1st', '2nd', '3rd'].map((label, i) => (
            <KeyCap
              key={i}
              keyLabel={String(i)}
              subLabel={label}
              active={voicing?.inversion === i}
              variant="inversion"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface KeyCapProps {
  keyLabel: string;
  subLabel: string;
  active: boolean;
  variant: 'quality' | 'white' | 'black' | 'inversion';
}

function KeyCap({ keyLabel, subLabel, active, variant }: KeyCapProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-md border transition-all',
        'min-w-[40px] h-14 px-2',
        {
          'bg-white border-gray-300': variant === 'white' && !active,
          'bg-gray-800 border-gray-700 text-white': variant === 'black' && !active,
          'bg-blue-50 border-blue-200': variant === 'quality' && !active,
          'bg-green-50 border-green-200': variant === 'inversion' && !active,
          'bg-blue-500 border-blue-600 text-white': active,
        }
      )}
    >
      <span className="text-sm font-bold">{keyLabel}</span>
      <span className={cn('text-[10px]', active ? 'text-blue-100' : 'text-gray-500')}>
        {subLabel}
      </span>
    </div>
  );
}
