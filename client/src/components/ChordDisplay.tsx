import { Card } from "@/components/ui/card";
import type { ChordVoicing } from "@shared/schema";
import { midiNoteToNoteName } from "@/lib/chords";

interface ChordDisplayProps {
  voicing: ChordVoicing | null;
}

function MiniPianoGuide() {
  return (
    <div className="flex justify-center items-center">
      <div className="relative inline-flex h-20">
        {/* White keys */}
        <div className="flex">
          {[
            { key: "Z" },
            { key: "X" },
            { key: "C" },
            { key: "V" },
            { key: "B" },
            { key: "N" },
            { key: "M" },
          ].map(({ key }) => (
            <div key={key} className="relative w-8 h-20 bg-white border-x first:border-l last:border-r border-gray-300 flex flex-col items-center justify-end pb-1">
              <span className="text-xs font-medium text-gray-900">{key}</span>
            </div>
          ))}
        </div>
        {/* Black keys */}
        <div className="absolute flex space-x-[0.85rem] left-[1.15rem]">
          {[
            { key: "S", skip: false },
            { key: "D", skip: false },
            { key: "", skip: true },
            { key: "G", skip: false },
            { key: "H", skip: false },
            { key: "J", skip: false },
          ].map(({ key, skip }, index) =>
            skip ? (
              <div key={index} className="w-4" />
            ) : (
              <div
                key={index}
                className="w-4 h-12 bg-gray-800 rounded-b-sm border-x border-b border-gray-600 flex flex-col items-center justify-end pb-1"
              >
                <span className="text-xs font-medium text-white">{key}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
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
        <div className="space-y-4">
          <div className="text-xl font-light text-center tracking-wide text-gray-600">
            Press a key to play a note
          </div>
          <MiniPianoGuide />
        </div>
      ) : (
        <>
          <div className="text-3xl font-light text-center tracking-wide">
            <span className="text-stone-500">{rootNoteName + " "}</span>
            <span className="text-gray-900">{voicing.quality}</span>
            {voicing.position !== "root" && (
              <span className="text-gray-600">
                {" "}
                ({voicing.position} inversion)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-white/80 backdrop-blur border-stone-500/5">
              <div className="text-sm text-gray-600">Bass Note</div>
              <div className="text-xl font-light tracking-wide text-gray-900">
                {emptyState ? "—" : bassNoteName}
              </div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur border-stone-500/5">
              <div className="text-sm text-gray-600">Notes</div>
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