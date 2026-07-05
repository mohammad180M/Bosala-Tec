'use client';

import { sectionIds, platforms, platformsIntro } from '@/lib/constants';
import TextReveal from '@/components/ui/TextReveal';
import GlassCard from '@/components/ui/GlassCard';

const COMING_SOON_SLOTS = 2;

export default function Platforms() {
  return (
    <section id={sectionIds.platforms} className="section-padding relative z-10">
      <div className="mx-auto max-w-6xl text-center">
        <TextReveal as="h2" className="kinetic-heading mb-6" splitBy="letters">
          Platforms
        </TextReveal>
        <p className="mx-auto mb-16 max-w-lg text-[var(--liquid-silver)] opacity-60">
          {platformsIntro}
        </p>
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
          {platforms.map((platform) => (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block text-left"
              data-cursor="hover"
            >
              <GlassCard className="flex aspect-square flex-col items-center justify-center transition-shadow hover-glow-cyan">
                <div className="glass-card mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--micro-crystalline)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={platform.icon}
                    alt={`${platform.name} icon`}
                    className="h-14 w-14 object-contain p-2"
                    width={56}
                    height={56}
                  />
                </div>
                <span className="font-display text-sm font-semibold text-[var(--liquid-silver)]">
                  {platform.name}
                </span>
                {platform.description && (
                  <span className="mt-2 text-xs text-[var(--liquid-silver)] opacity-50">
                    {platform.description}
                  </span>
                )}
              </GlassCard>
            </a>
          ))}
          {Array.from({ length: COMING_SOON_SLOTS }).map((_, i) => (
            <GlassCard
              key={`soon-${i}`}
              className="flex aspect-square flex-col items-center justify-center opacity-40"
            >
              <div className="mb-4 h-16 w-16 rounded-lg border border-dashed border-[var(--micro-crystalline)]" />
              <span className="text-xs uppercase tracking-widest text-[var(--liquid-silver)] opacity-50">
                Coming Soon
              </span>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
