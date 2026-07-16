'use client';

import { teamMembers, sectionIds } from '@/lib/constants';
import TextReveal from '@/components/ui/TextReveal';
import TeamMemberCard from './TeamMemberCard';

export default function Team() {
  return (
    <section id={sectionIds.team} className="section-padding relative z-10">
      <div className="mx-auto max-w-6xl">
        <TextReveal as="h2" className="kinetic-heading mb-16 text-center" splitBy="letters">
          Team
        </TextReveal>
        <div className="grid grid-cols-1 items-stretch gap-6 px-0 md:gap-8 lg:grid-cols-3">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={member.id} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
