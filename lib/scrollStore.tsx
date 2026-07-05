'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type ScrollStore = {
  progress: number;
  setProgress: (value: number) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
};

const ScrollContext = createContext<ScrollStore | null>(null);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [progress, setProgressState] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  const setProgress = useCallback((value: number) => {
    setProgressState(Math.max(0, Math.min(1, value)));
  }, []);

  return (
    <ScrollContext.Provider
      value={{ progress, setProgress, activeSection, setActiveSection }}
    >
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollStore() {
  const ctx = useContext(ScrollContext);
  if (!ctx) {
    throw new Error('useScrollStore must be used within ScrollProvider');
  }
  return ctx;
}
