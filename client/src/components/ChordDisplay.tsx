import { Card } from "@/components/ui/card";
import type { ChordVoicing } from "@shared/schema";
import { midiNoteToNoteName } from "@/lib/chords";

interface ChordDisplayProps {
  voicing: ChordVoicing | null;
}

export default function ChordDisplay({ voicing }: ChordDisplayProps) {
  const emptyState = !voicing;

  const bassNoteName = voicing ? midiNoteToNoteName(voicing.bass) : "";
  const rootNoteName =
    voicing && voicing.root !== -1
      ? midiNoteToNoteName(voicing.root + 60).replace(/\d+/, "")
      : bassNoteName.replace(/\d+/, "");

  return (
    <div className="flex flex-col justify-center space-y-6 min-h-[180px]">
      {emptyState ? (
        <div className="text-xl font-light text-center tracking-wide text-gray-600">
          Press any bass key (Z-M) to start playing
        </div>
      ) : (
        <>
          <div className="text-3xl font-light text-center tracking-wide">
            <span className="text-rose-600/90">{rootNoteName + " "}</span>
            <span className="text-gray-900">{voicing.quality}</span>
            {voicing.position !== "root" && (
              <span className="text-gray-600">
                {" "}
                ({voicing.position} inversion)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-white/80 backdrop-blur border-rose-600/5">
              <div className="text-sm text-gray-600">Bass Note</div>
              <div className="text-xl font-light tracking-wide text-gray-900">
                {emptyState ? "—" : bassNoteName}
              </div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur border-rose-600/5">
              <div className="text-sm text-gray-600">Chord Structure</div>
              <div className="text-xl font-light tracking-wide text-gray-900">
                {emptyState
                  ? "—"
                  : voicing.notes
                      .map((note) =>
                        midiNoteToNoteName(note).replace(/\d+/, ""),
                      )
                      .join(" ")}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}