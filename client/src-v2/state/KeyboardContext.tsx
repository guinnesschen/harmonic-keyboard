import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface KeyboardContextValue {
  pressedKeys: Set<string>;
  addKey: (key: string) => void;
  removeKey: (key: string) => void;
  clearKeys: () => void;
}

const KeyboardContext = createContext<KeyboardContextValue | null>(null);

export function KeyboardProvider({ children }: { children: ReactNode }) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const addKey = useCallback((key: string) => {
    setPressedKeys((prev) => new Set(prev).add(key.toLowerCase()));
  }, []);

  const removeKey = useCallback((key: string) => {
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(key.toLowerCase());
      return next;
    });
  }, []);

  const clearKeys = useCallback(() => {
    setPressedKeys(new Set());
  }, []);

  // Clear keys when window loses focus
  useEffect(() => {
    const handleBlur = () => clearKeys();
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [clearKeys]);

  return (
    <KeyboardContext.Provider value={{ pressedKeys, addKey, removeKey, clearKeys }}>
      {children}
    </KeyboardContext.Provider>
  );
}

export function useKeyboard() {
  const context = useContext(KeyboardContext);
  if (!context) throw new Error('useKeyboard must be used within KeyboardProvider');
  return context;
}
