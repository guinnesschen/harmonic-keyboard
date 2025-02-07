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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Keyboard Controls</h2>

      <div className="grid gap-4">
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
          <div className="text-sm font-medium text-gray-500">Bass Notes (Bottom Row)</div>
          <div className="flex gap-2">
            {layout.bassKeys.map((key) => (
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
      </div>
    </div>
  );
}