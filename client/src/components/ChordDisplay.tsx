import { Card } from "@/components/ui/card";
import type { ChordVoicing } from "@shared/schema";
import { midiNoteToNoteName } from "@/lib/chords";
import { getMidiNoteKey } from "@/lib/keyboardMapping";

interface ChordDisplayProps {
  voicing: ChordVoicing | null;
}

function MiniPianoGuide({ activeKey }: { activeKey?: string }) {
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
            <div
              key={key}
              className={`relative w-8 h-20 border-x first:border-l last:border-r border-gray-300 flex flex-col items-center justify-end pb-1 transition-colors duration-150
                ${
                  activeKey?.toLowerCase() === key.toLowerCase()
                    ? "bg-stone-500 hover:bg-stone-400"
                    : "hover:bg-stone-50"
                }`}
            >
              <span
                className={`text-xs font-medium ${activeKey?.toLowerCase() === key.toLowerCase() ? "text-gray-100" : "text-gray-900"}`}
              >
                {key}
              </span>
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
                className={`w-4 h-12 rounded-b-sm border-x border-b border-gray-600 flex flex-col items-center justify-end pb-1 transition-colors duration-150
                  ${
                    activeKey?.toLowerCase() === key.toLowerCase()
                      ? "bg-blue-700 hover:bg-blue-600"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
              >
                <span className="text-xs font-medium text-white">{key}</span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChordDisplay({ voicing }: ChordDisplayProps) {
  const emptyState = !voicing;
  const activeKey = voicing ? getMidiNoteKey(voicing.bass) : undefined;

  const rootNoteName =
    voicing && voicing.root !== -1
      ? midiNoteToNoteName(voicing.root + 60).replace(/\d+/, "")
      : "";

  return (
    <div className="flex flex-col justify-center space-y-6 min-h-[180px]">
      <div className="text-3xl font-light text-center tracking-wide">
        {emptyState ? (
          <span className="text-gray-600">Press a key to play a note</span>
        ) : (
          <>
            <span className="text-stone-500">{rootNoteName + " "}</span>
            <span className="text-gray-900">{voicing.quality}</span>
            {voicing.position !== "root" && (
              <span className="text-gray-600">
                {" "}
                ({voicing.position} inversion)
              </span>
            )}
          </>
        )}
      </div>
      <MiniPianoGuide activeKey={activeKey} />
    </div>
  );
}