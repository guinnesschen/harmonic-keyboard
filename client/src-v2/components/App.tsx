import { useState } from 'react';
import { AudioProvider } from '../state/AudioContext';
import { KeyboardProvider } from '../state/KeyboardContext';
import { StorageProvider } from '../state/StorageContext';
import { Layout } from './Layout';
import { PianoView } from './piano/PianoView';
import { DrumView } from './drums/DrumView';

type Instrument = 'piano' | 'drums';

export function App() {
  const [instrument, setInstrument] = useState<Instrument>('piano');

  return (
    <StorageProvider>
      <AudioProvider>
        <KeyboardProvider>
          <Layout instrument={instrument} onInstrumentChange={setInstrument}>
            {instrument === 'piano' ? (
              <PianoView enabled={instrument === 'piano'} />
            ) : (
              <DrumView enabled={instrument === 'drums'} />
            )}
          </Layout>
        </KeyboardProvider>
      </AudioProvider>
    </StorageProvider>
  );
}
