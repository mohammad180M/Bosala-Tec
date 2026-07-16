'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '@/lib/scrollStore';
import { detectMobileProfile } from '@/lib/mobileProfile';

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollProps = {
  children: ReactNode;
};

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const { setProgress } = useScrollStore();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    let cleanupNative: (() => void) | undefined;
    let rafId = 0;
    let scrollTrigger: ScrollTrigger | undefined;
    let tick: ((time: number) => void) | undefined;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isMobileProfile = detectMobileProfile();

    const setupNativeScroll = () => {
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? window.scrollY / max : 0);
        ScrollTrigger.update();
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener('scroll', onScroll);
    };

    if (prefersReducedMotion || isMobileProfile) {
      cleanupNative = setupNativeScroll();
      return () => cleanupNative?.();
    }

    rafId = requestAnimationFrame(() => {
      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: false,
      });
      lenisRef.current = lenis;

      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value?: number) {
          if (value !== undefined) {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
      });

      lenis.on('scroll', ScrollTrigger.update);

      tick = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      scrollTrigger = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => setProgress(self.progress),
      });

      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (tick) gsap.ticker.remove(tick);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      scrollTrigger?.kill();
      ScrollTrigger.scrollerProxy(document.documentElement, {});
      cleanupNative?.();
    };
  }, [setProgress]);

  return <>{children}</>;
}
