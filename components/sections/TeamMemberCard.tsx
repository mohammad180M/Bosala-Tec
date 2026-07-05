'use client';

import { useRef, useEffect } from 'react';
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
      <div className="relative flex flex-1 flex-col">
        <div className="relative mx-auto mb-6 h-48 w-48 shrink-0">
          <div className="relative z-10 h-full w-full overflow-hidden rounded-2xl border border-[var(--micro-crystalline)]">
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
                width={192}
                height={192}
              />
            )}
          </div>
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
    </GlassCard>
  );
}

export default TeamMemberCard;
