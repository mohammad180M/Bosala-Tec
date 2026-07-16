'use client';

import { useState, useCallback } from 'react';
import { navLinks } from '@/lib/constants';
import { michroma } from '@/lib/fonts';
import MagneticButton from './MagneticButton';

const ICON = '/brand/bosala-icon.png';

export default function Nav() {
  const [open, setOpen] = useState(false);

  const scrollTo = useCallback((href: string) => {
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  }, []);

  return (
    <>
      <nav
        className="glass-card fixed left-1/2 top-4 z-50 flex w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2 items-center justify-between rounded-full px-4 py-3 md:top-6 md:w-[calc(100%-3rem)] md:px-8 md:py-4"
        aria-label="Main navigation"
      >
        <a
          href="#hero"
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center gap-2.5"
          onClick={(e) => {
            e.preventDefault();
            scrollTo('#hero');
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ICON}
            alt=""
            aria-hidden="true"
            className="block h-9 w-9"
            width={36}
            height={36}
          />
          <span
            className={`${michroma.className} text-sm tracking-[0.28em] text-[var(--liquid-silver)]`}
          >
            BOSALA
          </span>
        </a>

        <ul className="hidden items-center gap-4 md:flex md:gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <MagneticButton
                as="button"
                className="min-h-[44px] px-2 text-xs md:text-sm text-[var(--liquid-silver)] opacity-80 transition-opacity hover-opacity-full"
                onClick={() => scrollTo(link.href)}
                strength={0.2}
              >
                {link.label}
              </MagneticButton>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`block h-0.5 w-6 bg-[var(--liquid-silver)] transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span
            className={`block h-0.5 w-6 bg-[var(--liquid-silver)] transition-opacity ${open ? 'opacity-0' : ''}`}
          />
          <span
            className={`block h-0.5 w-6 bg-[var(--liquid-silver)] transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </nav>

      {open && (
        <div
          className="glass-card fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <button
            type="button"
            className={`${michroma.className} absolute right-6 top-6 min-h-[44px] min-w-[44px] text-sm tracking-[0.2em] text-[var(--liquid-silver)]`}
            onClick={() => setOpen(false)}
          >
            CLOSE
          </button>
          {navLinks.map((link) => (
            <button
              key={link.href}
              type="button"
              className={`${michroma.className} min-h-[44px] px-6 text-lg tracking-[0.25em] text-[var(--liquid-silver)]`}
              onClick={() => scrollTo(link.href)}
            >
              {link.label.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
