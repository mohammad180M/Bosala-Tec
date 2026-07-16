'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

type LoadingStore = {
  progress: number;
  active: boolean;
  ready: boolean;
  dismissable: boolean;
  setReady: () => void;
  reportProgress: (progress: number, active: boolean) => void;
};

const LoadingStoreContext = createContext<LoadingStore | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(true);
  const [ready, setReadyState] = useState(false);

  const setReady = useCallback(() => {
    setReadyState(true);
  }, []);

  const reportProgress = useCallback((p: number, isActive: boolean) => {
    setProgress(p);
    setActive(isActive);
  }, []);

  const dismissable = useMemo(
    () => ready || (!active && progress >= 100),
    [ready, active, progress]
  );

  return (
    <LoadingStoreContext.Provider
      value={{
        progress,
        active,
        ready,
        dismissable,
        setReady,
        reportProgress,
      }}
    >
      {children}
    </LoadingStoreContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingStoreContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
}
