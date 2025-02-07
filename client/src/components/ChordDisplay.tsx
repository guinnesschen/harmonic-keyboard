import { Card } from "@/components/ui/card";
import type { ChordVoicing } from "@shared/schema";
import { midiNoteToNoteName } from "@/lib/chords";

interface ChordDisplayProps {
  voicing: ChordVoicing | null;
}

export default function ChordDisplay({ voicing }: ChordDisplayProps) {
  if (!voicing) {
    return (
      <div className="text-center text-gray-500">
        Press any bass key (Z-M) to start playing
      </div>
    );
  }

  const rootNoteName = midiNoteToNoteName(voicing.root + 60).replace(/\d+/, "");
  const bassNoteName = midiNoteToNoteName(voicing.bass);
  const melodyNoteName = midiNoteToNoteName(voicing.melody);

  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold text-center">
        <span className="text-primary">{rootNoteName}</span>
        <span className="text-gray-600">{voicing.quality}</span>
        {voicing.extension !== "none" && (
          <span className="text-gray-400">{voicing.extension}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Bass</div>
          <div className="text-xl font-semibold">{bassNoteName}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Melody</div>
          <div className="text-xl font-semibold">{melodyNoteName}</div>
        </Card>
      </div>

      <div className="text-sm text-gray-500 text-center">
        Notes: {voicing.notes.map(note => midiNoteToNoteName(note)).join(" ")}
      </div>
    </div>
  );
}
