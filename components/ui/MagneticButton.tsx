'use client';

import { useRef, useCallback, type ReactNode, type MouseEvent } from 'react';
import gsap from 'gsap';
import clsx from 'clsx';

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  as?: 'button' | 'a';
  strength?: number;
};

export default function MagneticButton({
  children,
  className,
  onClick,
  href,
  as = 'button',
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null);

  const handleMove = useCallback(
    (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out',
      });
    },
    [strength]
  );

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
  }, []);

  const hoverHandlers =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover)').matches
      ? { onMouseMove: handleMove, onMouseLeave: handleLeave }
      : {};

  const sharedProps = {
    ref,
    className: clsx(className),
    ...hoverHandlers,
  };

  if (as === 'a' && href) {
    return (
      <a href={href} {...sharedProps} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" {...sharedProps} onClick={onClick}>
      {children}
    </button>
  );
}
