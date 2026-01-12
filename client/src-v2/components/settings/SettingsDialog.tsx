import { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { SoundControls } from './SoundControls';
import { KeyMappingEditor } from './KeyMappingEditor';
import { cn } from '../../lib/utils';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

type Tab = 'sound' | 'keys';

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<Tab>('sound');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Settings</DialogTitle>
      </DialogHeader>

      <div className="flex gap-2 mb-4">
        <TabButton active={activeTab === 'sound'} onClick={() => setActiveTab('sound')}>
          Sound
        </TabButton>
        <TabButton active={activeTab === 'keys'} onClick={() => setActiveTab('keys')}>
          Key Mappings
        </TabButton>
      </div>

      <div className="min-h-[300px]">
        {activeTab === 'sound' && <SoundControls />}
        {activeTab === 'keys' && <KeyMappingEditor />}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </div>
    </Dialog>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
        active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      )}
    >
      {children}
    </button>
  );
}
