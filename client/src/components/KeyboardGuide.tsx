import { getKeyboardLayout } from "@/lib/keyboardMapping";
import { ChordQuality, ChordExtension } from "@shared/schema";

export default function KeyboardGuide() {
  const layout = getKeyboardLayout();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Keyboard Controls</h2>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-500">Melody Notes (Top Row)</div>
          <div className="flex gap-2">
            {layout.melodyKeys.map((key) => (
              <div key={key} className="w-10 h-10 flex items-center justify-center border rounded bg-white shadow-sm">
                {key}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-500">Chord Qualities</div>
          <div className="flex gap-2">
            {layout.qualityKeys.map((key, i) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center border rounded bg-white shadow-sm">
                  {key}
                </div>
                <span className="text-xs text-gray-600">
                  {Object.values(ChordQuality)[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-500">Extensions</div>
          <div className="flex gap-2">
            {layout.extensionKeys.map((key, i) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center border rounded bg-white shadow-sm">
                  {key}
                </div>
                <span className="text-xs text-gray-600">
                  {Object.values(ChordExtension)[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-500">Bass Notes (Bottom Row)</div>
          <div className="flex gap-2">
            {layout.bassKeys.map((key) => (
              <div key={key} className="w-10 h-10 flex items-center justify-center border rounded bg-white shadow-sm">
                {key}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
