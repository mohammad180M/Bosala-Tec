'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { portraitDepth, type TeamMember } from '@/lib/constants';
import GlassCard from '@/components/ui/GlassCard';
import DepthPortrait from '@/components/DepthPortrait';

gsap.registerPlugin(ScrollTrigger);

type TeamMemberCardProps = {
  member: TeamMember;
  index: number;
};

function TeamMemberCard({ member, index }: TeamMemberCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxOpen, closeLightbox]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: index * 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [index]);

  return (
    <GlassCard
      ref={cardRef}
      className="relative flex h-full flex-col overflow-hidden opacity-0"
    >
      {member.featured && (
        <div
          className="pointer-events-none absolute left-1/2 top-[7.5rem] z-0 aspect-square w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.35] blur-3xl md:top-[8rem]"
          style={{ background: 'var(--hyper-violet)' }}
          aria-hidden="true"
        />
      )}
      <div className="relative flex flex-1 flex-col items-center text-center">
        <div className="relative mb-6 h-48 w-48 shrink-0">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group relative z-10 h-full w-full cursor-zoom-in overflow-hidden rounded-2xl border border-[var(--micro-crystalline)] transition-[border-color,box-shadow] duration-300 hover:border-[var(--quantum-cyan)] hover:shadow-[0_0_28px_rgba(0,240,255,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--quantum-cyan)]"
            aria-label={`View larger photo of ${member.name}`}
          >
            <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]">
              {member.depthImage ? (
                <DepthPortrait
                  src={member.image}
                  depthSrc={member.depthImage}
                  alt={`Portrait of ${member.name}`}
                  className="h-full w-full"
                  strength={portraitDepth.strength}
                  spotlight={portraitDepth.spotlight}
                  depthContrast={portraitDepth.depthContrast}
                  parallaxMul={portraitDepth.parallaxMul}
                  grain={portraitDepth.grain}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.image}
                  alt={`Portrait of ${member.name}`}
                  className="h-full w-full object-cover"
                  width={240}
                  height={240}
                />
              )}
            </div>
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--deep-velvet)]/70 to-transparent px-3 pb-2.5 pt-8 text-center text-[10px] font-medium tracking-[0.18em] text-[var(--liquid-silver)] opacity-0 transition-opacity duration-300 group-hover:opacity-70 group-focus-visible:opacity-70"
              aria-hidden="true"
            >
              VIEW
            </span>
          </button>
        </div>
        <h3 className="font-display text-xl font-semibold text-[var(--liquid-silver)]">
          {member.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-[var(--hyper-violet)]">
          {member.role}
        </p>
        <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--liquid-silver)] opacity-60">
          {member.bio}
        </p>
      </div>

      {mounted &&
        lightboxOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`Enlarged portrait of ${member.name}`}
          >
            <button
              type="button"
              className="absolute inset-0 bg-[var(--deep-velvet)]/85 backdrop-blur-md"
              aria-label="Close enlarged photo"
              onClick={closeLightbox}
            />
            <div className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-3xl flex-col items-center gap-4 animate-[fadeZoomIn_0.28s_ease-out]">
              <button
                type="button"
                onClick={closeLightbox}
                className="absolute -top-1 right-0 z-20 min-h-[44px] min-w-[44px] rounded-full border border-[var(--micro-crystalline)] bg-[var(--frosted-obsidian-65)] text-sm tracking-[0.2em] text-[var(--liquid-silver)] transition-colors hover:border-[var(--quantum-cyan)] hover:text-[var(--quantum-cyan)] md:-right-2 md:-top-2"
                aria-label="Close"
              >
                ✕
              </button>
              <div className="overflow-hidden rounded-2xl border border-[var(--micro-crystalline)] bg-[var(--frosted-obsidian)]/40 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.55)] md:p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.image}
                  alt={`Enlarged portrait of ${member.name}`}
                  className="max-h-[min(78vh,820px)] w-auto max-w-full object-contain"
                />
              </div>
              <p className="text-center text-sm text-[var(--liquid-silver)] opacity-70">
                <span className="font-display font-semibold text-[var(--liquid-silver)] opacity-100">
                  {member.name}
                </span>
                <span className="mx-2 opacity-40">·</span>
                {member.role}
              </p>
            </div>
          </div>,
          document.body
        )}
    </GlassCard>
  );
}

export default TeamMemberCard;
