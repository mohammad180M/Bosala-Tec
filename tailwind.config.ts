import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-velvet': 'var(--deep-velvet)',
        'frosted-obsidian': 'var(--frosted-obsidian)',
        'quantum-cyan': 'var(--quantum-cyan)',
        'hyper-violet': 'var(--hyper-violet)',
        'liquid-silver': 'var(--liquid-silver)',
      },
      fontFamily: {
        display: ['var(--font-manrope)', 'sans-serif'],
        body: ['var(--font-manrope)', 'sans-serif'],
        brand: ['var(--font-michroma)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
