import type { ChordVoicing } from '../../domain/types';
import { NOTE_NAMES, QUALITY_NAMES } from '../../domain/constants';

interface ChordDisplayProps {
  voicing: ChordVoicing | null;
}

// More readable quality names for display
const QUALITY_DISPLAY: Record<string, string> = {
  major: 'major',
  minor: 'minor',
  dominant7: 'dominant 7',
  major7: 'major 7',
  minor7: 'minor 7',
  diminished7: 'diminished 7',
  halfDiminished7: 'half dim 7',
  augmented: 'augmented',
  sus4: 'sus 4',
  dominant7sus4: 'dom 7 sus 4',
  minorMajor7: 'minor maj 7',
  add9: 'add 9',
  minorAdd9: 'minor add 9',
};

export function ChordDisplay({ voicing }: ChordDisplayProps) {
  if (!voicing) {
    return (
      <div className="text-center py-6">
        <div className="chord-name text-4xl text-gray-300">
          Play a chord
        </div>
      </div>
    );
  }

  const rootName = NOTE_NAMES[voicing.root];
  const qualityName = QUALITY_DISPLAY[voicing.quality] || voicing.quality;

  return (
    <div className="text-center py-6">
      <div className="chord-name text-5xl">
        <span className="text-gray-900">{rootName}</span>
        {' '}
        <span className="text-gray-500">{qualityName}</span>
      </div>
    </div>
  );
}
