import { Card } from "@/components/ui/card";
import type { ChordVoicing } from "@shared/schema";
import { midiNoteToNoteName } from "@/lib/chords";

interface ChordDisplayProps {
  voicing: ChordVoicing | null;
}

export default function ChordDisplay({ voicing }: ChordDisplayProps) {
  if (!voicing) {
    return (
      <div className="text-center text-muted-foreground/80">
        Press any bass key (Z-M) to start playing
      </div>
    );
  }

  const bassNoteName = midiNoteToNoteName(voicing.bass);
  const rootNoteName = voicing.root !== -1 
    ? midiNoteToNoteName(voicing.root + 60).replace(/\d+/, "")
    : bassNoteName.replace(/\d+/, "");

  return (
    <div className="space-y-6">
      <div className="text-3xl font-light text-center tracking-wide">
        <span className="text-primary">{rootNoteName}</span>
        <span className="text-foreground/90">{voicing.quality}</span>
        {voicing.position !== "root" && (
          <span className="text-muted-foreground">
            {" "}({voicing.position} inversion)
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-background/40 backdrop-blur border-primary/5">
          <div className="text-sm text-muted-foreground">Bass Note</div>
          <div className="text-xl font-light tracking-wide">{bassNoteName}</div>
        </Card>
        <Card className="p-4 bg-background/40 backdrop-blur border-primary/5">
          <div className="text-sm text-muted-foreground">Chord Structure</div>
          <div className="text-xl font-light tracking-wide">
            {voicing.notes.map(note => midiNoteToNoteName(note).replace(/\d+/, "")).join(" ")}
          </div>
        </Card>
      </div>

      <div className="text-sm text-muted-foreground text-center font-light tracking-wide">
        Notes: {voicing.notes.map(note => midiNoteToNoteName(note)).join(" ")}
      </div>
    </div>
  );
}