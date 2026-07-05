'use client';

import { company, sectionIds } from '@/lib/constants';
import { michroma } from '@/lib/fonts';
import TextReveal from '@/components/ui/TextReveal';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';

const ICON = '/brand/bosala-icon.png';

export default function Contact() {
  return (
    <section id={sectionIds.contact} className="section-padding relative z-10">
      <div className="mx-auto max-w-3xl">
        <TextReveal as="h2" className="kinetic-heading mb-12 text-center" splitBy="letters">
          Contact
        </TextReveal>
        <GlassCard className="w-full text-center">
          <p className="text-[var(--liquid-silver)] opacity-70">
            Ready to build something extraordinary? Reach out and let&apos;s start
            the conversation.
          </p>
          <p className="mt-4 break-all">
            <a
              href={`mailto:${company.email}`}
              className="inline-flex min-h-[44px] items-center text-[var(--quantum-cyan)] hover:underline"
              data-cursor="hover"
            >
              {company.email}
            </a>
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {Object.entries(company.social).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-3 text-sm capitalize text-[var(--liquid-silver)] opacity-50 transition-opacity hover-opacity-full"
                data-cursor="hover"
              >
                {key}
              </a>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <MagneticButton
              as="a"
              href={`mailto:${company.email}`}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--quantum-cyan)] px-8 py-3 font-display text-sm font-semibold uppercase tracking-wider text-[var(--quantum-cyan)] transition-shadow hover:shadow-[0_0_30px_rgba(0,240,255,0.2)]"
            >
              Get in touch
            </MagneticButton>
          </div>
        </GlassCard>
        <footer className="mt-16 flex flex-col items-center gap-4 text-center">
          <a
            href="#hero"
            className="flex min-h-[44px] items-center gap-2.5"
            data-cursor="hover"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ICON}
              alt=""
              aria-hidden="true"
              className="block h-7 w-7"
              width={28}
              height={28}
            />
            <span
              className={`${michroma.className} text-xs tracking-[0.3em] text-[#F5F5F7]/70`}
            >
              BOSALA
            </span>
          </a>
          <p className="text-center text-xs text-[var(--liquid-silver)] opacity-40">
            {company.copyright}
          </p>
        </footer>
      </div>
    </section>
  );
}
