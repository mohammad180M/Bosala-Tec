'use client';

import { ScrollProvider } from '@/lib/scrollStore';
import { LoadingProvider } from '@/lib/loadingStore';
import SmoothScroll from '@/components/ui/SmoothScroll';
import GrainOverlay from '@/components/ui/GrainOverlay';
import PreloaderOverlay from '@/components/ui/PreloaderOverlay';
import ParticleLogoBackground from '@/components/ParticleLogoBackground';
import type { ReactNode } from 'react';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ScrollProvider>
      <LoadingProvider>
        <ParticleLogoBackground />
        <SmoothScroll>
          <GrainOverlay />
          <PreloaderOverlay />
          {children}
        </SmoothScroll>
      </LoadingProvider>
    </ScrollProvider>
  );
}
