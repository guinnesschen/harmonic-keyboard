import { useEffect, useState } from "react";
import { getKeyboardLayout, getActiveKeys } from "@/lib/keyboardMapping";
import { ChordQuality, ChordExtension } from "@shared/schema";

export default function KeyboardGuide() {
  const layout = getKeyboardLayout();
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const updateActiveKeys = () => {
      setActiveKeys(new Set(getActiveKeys()));
    };

    window.addEventListener("keydown", updateActiveKeys);
    window.addEventListener("keyup", updateActiveKeys);

    return () => {
      window.removeEventListener("keydown", updateActiveKeys);
      window.removeEventListener("keyup", updateActiveKeys);
    };
  }, []);

  const isKeyActive = (key: string) => activeKeys.has(key.toLowerCase());

  const bassWhiteKeys = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
  const bassBlackKeys = ['S', 'D', 'G', 'H', 'J'];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Keyboard Controls</h2>

      <div className="grid gap-6">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-500">Melody Notes (Top Row)</div>
          <div className="flex gap-2">
            {layout.melodyKeys.map((key) => (
              <div 
                key={key} 
                className={`w-10 h-10 flex items-center justify-center border rounded shadow-sm transition-colors
                  ${isKeyActive(key) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-white text-gray-700'}`}
              >
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
                <div 
                  className={`w-10 h-10 flex items-center justify-center border rounded shadow-sm transition-colors
                    ${isKeyActive(key) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-white text-gray-700'}`}
                >
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
                <div 
                  className={`w-10 h-10 flex items-center justify-center border rounded shadow-sm transition-colors
                    ${isKeyActive(key) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-white text-gray-700'}`}
                >
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
          <div className="text-sm font-medium text-gray-500">Bass Notes (Piano Layout)</div>
          <div className="relative">
            {/* Black keys */}
            <div className="absolute top-0 left-0 flex gap-2 pl-7 z-10">
              {bassBlackKeys.map((key, index) => (
                <div 
                  key={key}
                  style={{
                    marginLeft: index === 2 ? '2.5rem' : undefined // Extra space after F#
                  }}
                  className={`w-8 h-24 flex items-end pb-2 justify-center border rounded-b shadow-sm transition-colors
                    ${isKeyActive(key)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-800 text-white'}`}
                >
                  {key}
                </div>
              ))}
            </div>
            {/* White keys */}
            <div className="flex gap-0.5">
              {bassWhiteKeys.map((key) => (
                <div 
                  key={key} 
                  className={`w-12 h-36 flex items-end pb-2 justify-center border rounded-b shadow-sm transition-colors
                    ${isKeyActive(key)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white text-gray-700'}`}
                >
                  {key}
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            White keys (Z-M): C D E F G A B | Black keys (S-J): C# D# F# G# A#
          </div>
        </div>
      </div>
    </div>
  );
}