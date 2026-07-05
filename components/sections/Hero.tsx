'use client';

import { company, sectionIds } from '@/lib/constants';
import TextReveal from '@/components/ui/TextReveal';
import MagneticButton from '@/components/ui/MagneticButton';

export default function Hero() {
  const scrollToAbout = () => {
    document.getElementById(sectionIds.about)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id={sectionIds.hero}
      className="section-padding relative flex min-h-[100svh] flex-col justify-end pb-16 md:min-h-screen md:justify-center md:pb-0"
    >
      <div
        className="pointer-events-none h-[38vw] max-h-52 w-full shrink-0 md:hidden"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto w-full max-w-4xl md:mx-0">
        <p className="mb-4 font-display text-sm uppercase tracking-[0.4em] text-[var(--quantum-cyan)] opacity-80">
          Technology Portfolio
        </p>
        <TextReveal as="h1" className="kinetic-heading hero-heading">
          {company.name}
        </TextReveal>
        <p className="mt-6 max-w-xl text-base text-[var(--liquid-silver)] opacity-70 md:text-lg lg:text-xl">
          {company.tagline}
        </p>
        <p className="mt-3 max-w-lg text-sm text-[var(--liquid-silver)] opacity-50">
          {company.subline}
        </p>
        <div className="mt-10 w-full max-w-[280px]">
          <MagneticButton
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[var(--quantum-cyan)] px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-wider text-[var(--deep-velvet)] transition-shadow hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] md:w-auto"
            onClick={scrollToAbout}
          >
            Explore
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
