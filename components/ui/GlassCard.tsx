import clsx from 'clsx';
import { forwardRef, type ReactNode } from 'react';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  glow?: 'cyan' | 'violet' | 'none';
};

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard({ children, className, glow = 'none' }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          'glass-card rounded-2xl p-6 md:p-8',
          glow === 'cyan' && 'shadow-[0_0_40px_rgba(0,240,255,0.15)]',
          glow === 'violet' && 'shadow-[0_0_40px_rgba(138,43,226,0.2)]',
          className
        )}
      >
        {children}
      </div>
    );
  }
);

export default GlassCard;
