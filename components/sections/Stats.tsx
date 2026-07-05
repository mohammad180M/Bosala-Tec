'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { stats, sectionIds } from '@/lib/constants';
import TextReveal from '@/components/ui/TextReveal';
import GlassCard from '@/components/ui/GlassCard';

gsap.registerPlugin(ScrollTrigger);

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  const numRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const displayValue = `${value}${suffix}`;

  useEffect(() => {
    const el = numRef.current;
    const card = cardRef.current;
    if (!el || !card) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    const obj = { val: 0 };
    const tween = gsap.fromTo(
      obj,
      { val: 0 },
      {
        val: value,
        duration: 2,
        ease: 'power2.out',
        paused: true,
        onUpdate: () => {
          el.textContent = `${Math.round(obj.val)}${suffix}`;
        },
      }
    );

    const trigger = ScrollTrigger.create({
      trigger: card,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        obj.val = 0;
        el.textContent = `0${suffix}`;
        tween.restart();
      },
    });

    return () => {
      trigger.kill();
      tween.kill();
    };
  }, [value, suffix]);

  return (
    <GlassCard ref={cardRef} glow="cyan" className="text-center">
      <span
        ref={numRef}
        className="font-display text-4xl font-bold text-[var(--quantum-cyan)] md:text-5xl"
      >
        {displayValue}
      </span>
      <p className="mt-2 text-sm uppercase tracking-widest text-[var(--liquid-silver)] opacity-60">
        {label}
      </p>
    </GlassCard>
  );
}

export default function Stats() {
  return (
    <section id={sectionIds.stats} className="section-padding relative z-10">
      <div className="mx-auto max-w-6xl">
        <TextReveal as="h2" className="kinetic-heading mb-16 text-center" splitBy="letters">
          By the Numbers
        </TextReveal>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              suffix={stat.suffix}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
