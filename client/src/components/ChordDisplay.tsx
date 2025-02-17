import { Card } from "@/components/ui/card";
import type { ChordVoicing } from "@shared/schema";
import { midiNoteToNoteName } from "@/lib/chords";
import { getMidiNoteKey } from "@/lib/keyboardMapping";

interface ChordDisplayProps {
  voicing: ChordVoicing | null;
  sheetMusicPanelOpen: boolean; // Added prop to track panel state
}

export function MiniPianoGuide({ activeKey }: { activeKey?: string }) {
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
                    : "bg-white hover:bg-stone-200"
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
        <div className="absolute flex space-x-[1.01rem] left-[1.47rem]">
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
                    ? "bg-stone-500 hover:bg-blue-500"
                    : "bg-gray-800 hover:bg-gray-600"
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

export default function ChordDisplay({ voicing, sheetMusicPanelOpen }: ChordDisplayProps) {
  const emptyState = !voicing;
  const activeKey = voicing ? getMidiNoteKey(voicing.bass) : undefined;

  const rootNoteName =
    voicing && voicing.root !== -1
      ? midiNoteToNoteName(voicing.root + 60).replace(/\d+/, "")
      : "";

  return (
    <div className={`flex flex-col justify-center space-y-4 ${sheetMusicPanelOpen ? 'min-h-[10rem]' : ''}`}> {/* Added conditional min-height */}
      <div className="text-2xl font-light text-center tracking-wide min-h-[4rem]"> {/* Increased min-height for better visibility */}
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