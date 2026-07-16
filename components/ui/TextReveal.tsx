'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import clsx from 'clsx';

gsap.registerPlugin(ScrollTrigger);

type TextRevealProps = {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  splitBy?: 'lines' | 'words' | 'letters';
};

export default function TextReveal({
  children,
  className,
  as: Tag = 'h2',
  splitBy = 'words',
}: TextRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    let parts: string[];
    if (splitBy === 'letters') {
      parts = children.split('');
    } else if (splitBy === 'words') {
      parts = children.split(' ');
    } else {
      parts = children.split('\n');
    }

    el.innerHTML = parts
      .map((part, i) => {
        if (splitBy === 'letters' && part === ' ') {
          return '<span class="inline-block">&nbsp;</span>';
        }
        const suffix =
          splitBy === 'words' && i < parts.length - 1 ? '&nbsp;' : '';
        return `<span class="inline-block overflow-hidden align-bottom"><span class="reveal-part inline-block" style="transform: translateY(110%)">${part}${suffix}</span></span>`;
      })
      .join(splitBy === 'lines' ? '<br/>' : '');

    const targets = el.querySelectorAll('.reveal-part');

    const tween = gsap.to(targets, {
      y: 0,
      duration: splitBy === 'letters' ? 0.6 : 0.8,
      stagger: splitBy === 'letters' ? 0.03 : 0.05,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [children, splitBy]);

  return (
    <Tag ref={ref} className={clsx(className)} suppressHydrationWarning>
      {children}
    </Tag>
  );
}
