import { useEffect, useState } from "react";
import { getKeyboardLayout, getActiveKeys, getMidiNoteKey } from "@/lib/keyboardMapping";
import { ChordQuality, ChordPosition, type ChordVoicing } from "@shared/schema";

interface KeyboardGuideProps {
  activeVoicing: ChordVoicing | null;
}

export default function KeyboardGuide({ activeVoicing }: KeyboardGuideProps) {
  const layout = getKeyboardLayout();
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const updateActiveKeys = () => {
      // Get currently pressed keys
      const pressedKeys = new Set(getActiveKeys());

      // Add keys from the current voicing
      if (activeVoicing) {
        activeVoicing.notes.forEach(note => {
          const key = getMidiNoteKey(note % 12);
          if (key) pressedKeys.add(key);
        });
      }

      setActiveKeys(pressedKeys);
    };

    window.addEventListener("keydown", updateActiveKeys);
    window.addEventListener("keyup", updateActiveKeys);
    updateActiveKeys(); // Initial update

    return () => {
      window.removeEventListener("keydown", updateActiveKeys);
      window.removeEventListener("keyup", updateActiveKeys);
    };
  }, [activeVoicing]);

  const isKeyActive = (key: string) => activeKeys.has(key.toLowerCase());

  const bassWhiteKeys = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
  const bassBlackKeys = ['S', 'D', 'G', 'H', 'J'];

  // Adjust black key positions relative to white keys
  const blackKeyOffsets = {
    'S': 10,  // C#
    'D': 25,  // D#
    'G': 55,  // F#
    'H': 70,  // G#
    'J': 85   // A#
  };

  const qualityLabels: Record<string, string> = {
    'Q': 'Major',
    'W': 'Major 7',
    'E': 'Dominant 7',
    'R': 'Minor',
    'T': 'Minor 7',
    'Y': 'Diminished 7',
    'U': 'Half Dim 7'
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-center">Keyboard Controls</h2>

      <div className="grid gap-8">
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-500">Inversions (Number Row)</div>
          <div className="flex gap-3">
            {layout.positionKeys.map((key, i) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={`w-12 h-12 flex items-center justify-center border rounded-lg shadow-sm transition-colors text-lg
                    ${isKeyActive(key)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white text-gray-700'}`}
                >
                  {key}
                </div>
                <span className="text-sm text-gray-600">
                  {Object.values(ChordPosition)[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-500">Chord Qualities (Letter Keys)</div>
          <div className="flex gap-3">
            {layout.qualityKeys.map((key) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={`w-12 h-12 flex items-center justify-center border rounded-lg shadow-sm transition-colors text-lg
                    ${isKeyActive(key)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white text-gray-700'}`}
                >
                  {key}
                </div>
                <span className="text-sm text-gray-600">
                  {qualityLabels[key]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-500">Root Notes (Piano Layout)</div>
          <div className="relative w-full max-w-4xl mx-auto h-72">
            {/* White keys */}
            <div className="flex h-72 w-full relative">
              {bassWhiteKeys.map((key, index) => (
                <div
                  key={key}
                  className={`flex-1 flex items-end pb-4 justify-center border-l last:border-r rounded-b-xl shadow-md transition-colors
                    ${isKeyActive(key)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white text-gray-700'}`}
                >
                  <span className="text-xl">{key}</span>
                </div>
              ))}
            </div>

            {/* Black keys */}
            <div className="absolute top-0 left-0 w-full">
              {bassBlackKeys.map((key) => (
                <div
                  key={key}
                  style={{
                    position: 'absolute',
                    left: `${blackKeyOffsets[key]}%`,
                    width: '8%',
                    height: '60%',
                  }}
                  className={`flex items-end pb-4 justify-center rounded-b-xl shadow-lg transition-colors
                    ${isKeyActive(key)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-800 text-white'}`}
                >
                  <span className="text-lg">{key}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-500 text-center mt-4">
            White keys (Z-M): C D E F G A B | Black keys (S-J): C# D# F# G# A#
          </div>
        </div>
      </div>
    </div>
  );
}