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

  const bassNoteName = midiNoteToNoteName(voicing.bass);
  const rootNoteName = voicing.root !== -1 
    ? midiNoteToNoteName(voicing.root + 60).replace(/\d+/, "")
    : bassNoteName.replace(/\d+/, "");

  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold text-center">
        <span className="text-primary">{rootNoteName}</span>
        <span className="text-gray-600">{voicing.quality}</span>
        {voicing.position !== "root" && (
          <span className="text-gray-400">
            {" "}({voicing.position} inversion)
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Bass Note</div>
          <div className="text-xl font-semibold">{bassNoteName}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Chord Structure</div>
          <div className="text-xl font-semibold">
            {voicing.notes.map(note => midiNoteToNoteName(note).replace(/\d+/, "")).join(" ")}
          </div>
        </Card>
      </div>

      <div className="text-sm text-gray-500 text-center">
        Notes: {voicing.notes.map(note => midiNoteToNoteName(note)).join(" ")}
      </div>
    </div>
  );
}