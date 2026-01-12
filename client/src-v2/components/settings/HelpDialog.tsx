import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import { Button } from '../ui/Button';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

export function HelpDialog({ open, onClose }: HelpDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>How to Play</DialogTitle>
        <DialogDescription>
          The Harmonic Keyboard lets you play chords with just a few keys
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 text-sm">
        <Section title="Basic Concept">
          <p>
            Instead of playing individual notes, you control three dimensions of a chord
            simultaneously:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
            <li>
              <strong>Bass Note</strong> - Which note is in the bass
            </li>
            <li>
              <strong>Chord Quality</strong> - Major, minor, 7th, etc.
            </li>
            <li>
              <strong>Inversion</strong> - Which chord tone is in the bass
            </li>
          </ul>
        </Section>

        <Section title="Keyboard Layout">
          <p className="text-gray-600">
            <strong>Bottom row (Z-/)</strong>: Bass notes (chromatic from C)
          </p>
          <p className="text-gray-600">
            <strong>Top row (Q-P, 5-7)</strong>: Chord qualities
          </p>
          <p className="text-gray-600">
            <strong>Number row (0-3)</strong>: Inversions
          </p>
        </Section>

        <Section title="Playing">
          <p className="text-gray-600">
            Hold a bass note key and optionally add a quality and/or inversion key. The voice
            leading algorithm automatically creates smooth transitions between chords.
          </p>
        </Section>

        <Section title="Drums">
          <p className="text-gray-600">
            Switch to drums mode and use keys A-J to trigger drum sounds. Press SPACE to
            record/play loops, ESC to clear.
          </p>
        </Section>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={onClose}>Got it</Button>
      </div>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
      {children}
    </div>
  );
}
