'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

export const SCENE_READY_EVENT = 'bosala:scene-ready';

const FORCE_HIDE_MS = 4000;
const ICON_SRC = '/brand/bosala-icon.png';

export default function PreloaderOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef({ val: 0 });
  const baseTweenRef = useRef<gsap.core.Tween | null>(null);
  const finishTweenRef = useRef<gsap.core.Tween | null>(null);
  const [hidden, setHidden] = useState(false);
  const [shown, setShown] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);
  const dismissedRef = useRef(false);

  const fadeOut = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    sessionStorage.setItem('bosala-visited', '1');

    const el = overlayRef.current;
    if (!el) {
      setHidden(true);
      return;
    }

    el.style.pointerEvents = 'none';
    gsap.to(el, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => setHidden(true),
    });
  }, []);

  const completeTo100 = useCallback(() => {
    if (dismissedRef.current) return;

    baseTweenRef.current?.kill();
    finishTweenRef.current?.kill();

    finishTweenRef.current = gsap.to(progressRef.current, {
      val: 100,
      duration: 0.3,
      ease: 'power2.out',
      onUpdate: () => setDisplayProgress(progressRef.current.val),
      onComplete: fadeOut,
    });
  }, [fadeOut]);

  useEffect(() => {
    const visited = sessionStorage.getItem('bosala-visited');
    if (visited) {
      setShown(false);
      setHidden(true);
    }
  }, []);

  useEffect(() => {
    if (!shown || !iconRef.current) return;
    const tween = gsap.to(iconRef.current, {
      scale: 1.06,
      opacity: 1,
      duration: 1.2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    });
    gsap.set(iconRef.current, { scale: 1, opacity: 0.85 });
    return () => {
      tween.kill();
    };
  }, [shown]);

  useEffect(() => {
    if (!shown || dismissedRef.current) return;

    progressRef.current.val = 0;
    setDisplayProgress(0);

    baseTweenRef.current = gsap.to(progressRef.current, {
      val: 90,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => setDisplayProgress(progressRef.current.val),
    });

    const onReady = () => completeTo100();
    window.addEventListener(SCENE_READY_EVENT, onReady);

    const fallback = window.setTimeout(() => {
      if (!dismissedRef.current) completeTo100();
    }, FORCE_HIDE_MS);

    return () => {
      baseTweenRef.current?.kill();
      finishTweenRef.current?.kill();
      window.removeEventListener(SCENE_READY_EVENT, onReady);
      window.clearTimeout(fallback);
    };
  }, [shown, completeTo100]);

  if (!shown || hidden) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[var(--deep-velvet)]"
      role="progressbar"
      aria-valuenow={Math.round(displayProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading"
    >
      <div ref={iconRef} className="will-change-transform">
        <Image
          src={ICON_SRC}
          alt="Bosala Technology"
          width={96}
          height={96}
          unoptimized
          className="h-24 w-24"
          priority
        />
      </div>
      <p className="mt-6 font-mono text-sm text-[var(--quantum-cyan)]">
        {Math.round(displayProgress)}%
      </p>
    </div>
  );
}
