import { useState, type ReactNode } from 'react';
import { Button } from './ui/Button';
import { SettingsDialog } from './settings/SettingsDialog';
import { HelpDialog } from './settings/HelpDialog';
import { cn } from '../lib/utils';

type Instrument = 'piano' | 'drums';

interface LayoutProps {
  instrument: Instrument;
  onInstrumentChange: (instrument: Instrument) => void;
  children: ReactNode;
}

export function Layout({ instrument, onInstrumentChange, children }: LayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-gray-900">Harmonic Keyboard</h1>

            {/* Instrument switcher */}
            <div className="flex rounded-lg bg-gray-100 p-1">
              <InstrumentTab
                active={instrument === 'piano'}
                onClick={() => onInstrumentChange('piano')}
              >
                Piano
              </InstrumentTab>
              <InstrumentTab
                active={instrument === 'drums'}
                onClick={() => onInstrumentChange('drums')}
              >
                Drums
              </InstrumentTab>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setHelpOpen(true)}>
              Help
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">{children}</main>

      {/* Dialogs */}
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

function InstrumentTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      )}
    >
      {children}
    </button>
  );
}
