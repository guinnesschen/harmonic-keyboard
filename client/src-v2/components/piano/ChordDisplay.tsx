import type { ChordVoicing } from '../../domain/types';
import { formatChordWithBass, getMidiNoteName } from '../../domain/chord';

interface ChordDisplayProps {
  voicing: ChordVoicing | null;
}

export function ChordDisplay({ voicing }: ChordDisplayProps) {
  if (!voicing) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl font-light text-gray-300">Press keys to play</div>
        <div className="text-sm text-gray-400 mt-2">
          Bass note + Quality + Inversion
        </div>
      </div>
    );
  }

  const chordName = formatChordWithBass(
    voicing.root,
    voicing.quality,
    voicing.notes[0] % 12 as any
  );

  return (
    <div className="text-center py-4">
      <div className="text-5xl font-bold text-gray-900 tracking-tight">
        {chordName}
      </div>
      <div className="flex justify-center gap-2 mt-3">
        {voicing.notes.map((note, i) => (
          <span
            key={i}
            className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-600"
          >
            {getMidiNoteName(note)}
          </span>
        ))}
      </div>
    </div>
  );
}
