import { useChordPlayer } from '../../hooks/useChordPlayer';
import { ChordDisplay } from './ChordDisplay';
import { KeyboardGuide } from './KeyboardGuide';

interface PianoViewProps {
  enabled: boolean;
}

export function PianoView({ enabled }: PianoViewProps) {
  const { currentVoicing } = useChordPlayer({ enabled });

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex-shrink-0">
        <ChordDisplay voicing={currentVoicing} />
      </div>
      <div className="flex-grow flex items-center justify-center py-8">
        <KeyboardGuide voicing={currentVoicing} />
      </div>
    </div>
  );
}
