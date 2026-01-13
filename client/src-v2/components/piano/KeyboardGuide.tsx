import { useStorage } from '../../state/StorageContext';
import type { ChordVoicing } from '../../domain/types';
import { cn } from '../../lib/utils';

interface KeyboardGuideProps {
  voicing: ChordVoicing | null;
}

// Quality key labels (human readable)
const QUALITY_LABELS: Record<string, string> = {
  major: 'Major',
  major7: 'Major 7',
  dominant7: 'Dom 7',
  minor: 'Minor',
  minor7: 'Minor 7',
  diminished7: 'Dim 7',
  halfDiminished7: 'HalfDim 7',
  dominant7sus4: 'DomSus',
  sus4: 'Sus',
  augmented: 'Aug',
  minorMajor7: 'MinMaj 7',
  add9: 'Add 9',
  minorAdd9: 'MinAdd 9',
};

// Define rows for quality keys
const QUALITY_ROW_1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U'];
const QUALITY_ROW_2 = ['I', 'O', 'P', '5', '6', '7'];

export function KeyboardGuide({ voicing }: KeyboardGuideProps) {
  const { settings } = useStorage();
  const qualityMappings = settings.qualityMappings.filter(m => m.enabled);

  // Get current active bass note (pitch class)
  const activeBass = voicing ? voicing.notes[0] % 12 : null;

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Mini piano for bass notes */}
      <MiniPiano activeBass={activeBass} />

      {/* Inversions row */}
      <div className="flex items-end gap-8">
        {[
          { key: '0', label: 'Root position' },
          { key: '1', label: '1st inversion' },
          { key: '2', label: '2nd inversion' },
          { key: '3', label: '3rd inversion' },
        ].map(({ key, label }) => (
          <div key={key} className="flex flex-col items-center gap-2">
            <span className="text-sm text-gray-500">{label}</span>
            <div className={cn('key-cap', voicing?.inversion === parseInt(key) && 'active')}>
              {key}
            </div>
          </div>
        ))}
      </div>

      {/* Quality keys in 2 rows */}
      <div className="flex flex-col items-center gap-4">
        {/* Row 1 */}
        <div className="flex items-end gap-6">
          {QUALITY_ROW_1.map((key) => {
            const mapping = qualityMappings.find(m => m.key === key);
            if (!mapping) return null;
            return (
              <div key={key} className="flex flex-col items-center gap-2">
                <span className="text-sm text-gray-500">{QUALITY_LABELS[mapping.quality]}</span>
                <div className={cn('key-cap', voicing?.quality === mapping.quality && 'active')}>
                  {key}
                </div>
              </div>
            );
          })}
        </div>
        {/* Row 2 */}
        <div className="flex items-end gap-6">
          {QUALITY_ROW_2.map((key) => {
            const mapping = qualityMappings.find(m => m.key === key);
            if (!mapping) return null;
            return (
              <div key={key} className="flex flex-col items-center gap-2">
                <span className="text-sm text-gray-500">{QUALITY_LABELS[mapping.quality]}</span>
                <div className={cn('key-cap', voicing?.quality === mapping.quality && 'active')}>
                  {key}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Large piano keyboard */}
      <PianoKeyboard activeBass={activeBass} activeNotes={voicing?.notes || []} />
    </div>
  );
}

// Mini piano showing one octave with keyboard shortcuts
function MiniPiano({ activeBass }: { activeBass: number | null }) {
  // One octave of keys with their keyboard mappings
  const keys = [
    { note: 0, key: 'Z', isBlack: false },
    { note: 1, key: 'S', isBlack: true },
    { note: 2, key: 'X', isBlack: false },
    { note: 3, key: 'D', isBlack: true },
    { note: 4, key: 'C', isBlack: false },
    { note: 5, key: 'V', isBlack: false },
    { note: 6, key: 'G', isBlack: true },
    { note: 7, key: 'B', isBlack: false },
    { note: 8, key: 'H', isBlack: true },
    { note: 9, key: 'N', isBlack: false },
    { note: 10, key: 'J', isBlack: true },
    { note: 11, key: 'M', isBlack: false },
  ];

  const whiteKeys = keys.filter(k => !k.isBlack);
  const blackKeys = keys.filter(k => k.isBlack);

  // Positions for black keys (relative to white keys)
  const blackKeyPositions = [0.7, 1.7, 3.7, 4.7, 5.7]; // After C, D, F, G, A

  return (
    <div className="relative" style={{ width: '196px', height: '80px' }}>
      {/* White keys */}
      <div className="absolute inset-0 flex">
        {whiteKeys.map((k, i) => (
          <div
            key={k.note}
            className={cn(
              'relative flex-1 flex flex-col items-center justify-end pb-1',
              'border border-gray-300 bg-white',
              i === 0 && 'rounded-bl',
              i === whiteKeys.length - 1 && 'rounded-br',
              activeBass === k.note && 'bg-gray-200'
            )}
          >
            <span className="text-[11px] text-gray-600 font-medium">{k.key}</span>
          </div>
        ))}
      </div>
      {/* Black keys */}
      {blackKeys.map((k, i) => (
        <div
          key={k.note}
          className={cn(
            'absolute top-0 flex items-end justify-center pb-1',
            'bg-gray-800 rounded-b text-white',
            activeBass === k.note && 'bg-gray-600'
          )}
          style={{
            left: `${blackKeyPositions[i] * (196 / 7)}px`,
            width: '20px',
            height: '48px',
          }}
        >
          <span className="text-[10px] font-medium">{k.key}</span>
        </div>
      ))}
    </div>
  );
}

// Large piano keyboard (2 octaves)
function PianoKeyboard({ activeBass, activeNotes }: { activeBass: number | null; activeNotes: number[] }) {
  const octaves = 2;
  const whiteKeyWidth = 40;
  const blackKeyWidth = 24;
  const whiteKeyHeight = 140;
  const blackKeyHeight = 90;

  // Notes in an octave
  const notePattern = [
    { isBlack: false }, // C
    { isBlack: true },  // C#
    { isBlack: false }, // D
    { isBlack: true },  // D#
    { isBlack: false }, // E
    { isBlack: false }, // F
    { isBlack: true },  // F#
    { isBlack: false }, // G
    { isBlack: true },  // G#
    { isBlack: false }, // A
    { isBlack: true },  // A#
    { isBlack: false }, // B
  ];

  // Build all keys for 2 octaves
  const allKeys: { note: number; isBlack: boolean; whiteIndex: number }[] = [];
  let whiteIndex = 0;
  for (let octave = 0; octave < octaves; octave++) {
    notePattern.forEach((pattern, noteInOctave) => {
      const midiNote = 48 + octave * 12 + noteInOctave; // Starting from C3
      allKeys.push({
        note: midiNote,
        isBlack: pattern.isBlack,
        whiteIndex: pattern.isBlack ? whiteIndex - 1 : whiteIndex,
      });
      if (!pattern.isBlack) whiteIndex++;
    });
  }

  const whiteKeys = allKeys.filter(k => !k.isBlack);
  const blackKeys = allKeys.filter(k => k.isBlack);

  const totalWidth = whiteKeys.length * whiteKeyWidth;

  // Check if a note is active
  const isActive = (midiNote: number) => activeNotes.includes(midiNote);

  // Black key offsets (fraction of white key width from left of preceding white key)
  const blackKeyOffset = 0.65;

  return (
    <div
      className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-100 p-1"
      style={{ width: totalWidth + 2, height: whiteKeyHeight + 2 }}
    >
      {/* White keys */}
      <div className="absolute inset-1 flex">
        {whiteKeys.map((k, i) => (
          <div
            key={k.note}
            className={cn(
              'piano-key-white flex-shrink-0',
              isActive(k.note) && 'active'
            )}
            style={{ width: whiteKeyWidth, height: whiteKeyHeight }}
          />
        ))}
      </div>
      {/* Black keys */}
      {blackKeys.map((k) => {
        // Calculate position based on which white key it follows
        const whiteKeysBefore = allKeys.filter(
          key => !key.isBlack && key.note < k.note
        ).length;
        const left = 4 + whiteKeysBefore * whiteKeyWidth - blackKeyWidth * blackKeyOffset;

        return (
          <div
            key={k.note}
            className={cn(
              'piano-key-black absolute',
              isActive(k.note) && 'active'
            )}
            style={{
              left,
              top: 4,
              width: blackKeyWidth,
              height: blackKeyHeight,
            }}
          />
        );
      })}
    </div>
  );
}
