import { useState, type ReactNode } from 'react';
import { SettingsDialog } from './settings/SettingsDialog';
import { HelpDialog } from './settings/HelpDialog';

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
    <div className="min-h-screen flex flex-col">
      {/* Minimal header with icon buttons */}
      <header className="flex-shrink-0 px-6 py-4">
        <div className="flex items-center justify-end gap-1">
          <IconButton
            onClick={() => setSettingsOpen(true)}
            title="Settings"
          >
            <SettingsIcon />
          </IconButton>
          <IconButton
            onClick={() => setHelpOpen(true)}
            title="Help"
          >
            <HelpIcon />
          </IconButton>
          <IconButton
            onClick={() => onInstrumentChange(instrument === 'piano' ? 'drums' : 'piano')}
            title={instrument === 'piano' ? 'Switch to Drums' : 'Switch to Piano'}
          >
            {instrument === 'piano' ? <DrumIcon /> : <PianoIcon />}
          </IconButton>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col">{children}</main>

      {/* Dialogs */}
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

function IconButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="icon-btn"
    >
      {children}
    </button>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function DrumIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="10" rx="9" ry="5" />
      <path d="M3 10v4a9 5 0 0 0 18 0v-4" />
      <line x1="3" y1="10" x2="3" y2="14" />
      <line x1="21" y1="10" x2="21" y2="14" />
    </svg>
  );
}

function PianoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="6" y1="4" x2="6" y2="14" />
      <line x1="10" y1="4" x2="10" y2="14" />
      <line x1="14" y1="4" x2="14" y2="14" />
      <line x1="18" y1="4" x2="18" y2="14" />
      <rect x="4" y="4" width="3" height="8" fill="currentColor" />
      <rect x="8" y="4" width="3" height="8" fill="currentColor" />
      <rect x="13" y="4" width="3" height="8" fill="currentColor" />
      <rect x="17" y="4" width="3" height="8" fill="currentColor" />
    </svg>
  );
}
