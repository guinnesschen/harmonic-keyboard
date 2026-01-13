import { useChordPlayer } from '../../hooks/useChordPlayer';
import { ChordDisplay } from './ChordDisplay';
import { KeyboardGuide } from './KeyboardGuide';

interface PianoViewProps {
  enabled: boolean;
}

export function PianoView({ enabled }: PianoViewProps) {
  const { currentVoicing } = useChordPlayer({ enabled });

  return (
    <div className="flex flex-col items-center flex-grow">
      {/* Chord name display */}
      <div className="mt-4">
        <ChordDisplay voicing={currentVoicing} />
      </div>

      {/* Main keyboard guide area */}
      <div className="flex-grow flex items-center justify-center py-8">
        <KeyboardGuide voicing={currentVoicing} />
      </div>
    </div>
  );
}
