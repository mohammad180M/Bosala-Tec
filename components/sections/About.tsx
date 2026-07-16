'use client';

import { about, sectionIds } from '@/lib/constants';
import TextReveal from '@/components/ui/TextReveal';
import GlassCard from '@/components/ui/GlassCard';

export default function About() {
  return (
    <section id={sectionIds.about} className="section-padding relative z-10">
      <div className="mx-auto max-w-6xl">
        <TextReveal as="h2" className="kinetic-heading mb-16" splitBy="letters">
          About Us
        </TextReveal>
        <div className="grid gap-8 md:grid-cols-2">
          <GlassCard>
            <h3 className="font-display text-xl font-semibold text-[var(--liquid-silver)]">
              Our Mission
            </h3>
            <p className="mt-4 leading-relaxed text-[var(--liquid-silver)] opacity-70">
              {about.mission}
            </p>
          </GlassCard>
          <GlassCard>
            <h3 className="font-display text-xl font-semibold text-[var(--liquid-silver)]">
              Our Vision
            </h3>
            <p className="mt-4 leading-relaxed text-[var(--liquid-silver)] opacity-70">
              {about.vision}
            </p>
          </GlassCard>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {about.pillars.map((pillar) => (
            <GlassCard key={pillar.title} className="text-center md:text-left">
              <h4 className="font-display text-lg font-semibold text-[var(--quantum-cyan)]">
                {pillar.title}
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-[var(--liquid-silver)] opacity-60">
                {pillar.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
