export const theme = {
  deepVelvet: '#030303',
  frostedObsidian: '#0D0D11',
  frostedObsidian65: 'rgba(13, 13, 17, 0.65)',
  quantumCyan: '#00F0FF',
  hyperViolet: '#8A2BE2',
  liquidSilver: '#F5F5F7',
  microCrystalline: 'rgba(255, 255, 255, 0.08)',
} as const;

export const company = {
  name: 'Bosala Technology',
  tagline: 'Building the platforms of tomorrow',
  subline: 'Immersive technology experiences crafted with precision and vision.',
  email: 'info@bosala.ps',
  social: {
    github: 'https://github.com/mohammad180M/Bosala-Tec',
    instagram: 'https://www.instagram.com/bosala.ps',
    tiktok: 'https://www.tiktok.com/@bosala.ps',
  },
  copyright: `© ${new Date().getFullYear()} Bosala Technology. All rights reserved.`,
} as const;

export const about = {
  mission:
    'Bosala Technology is a forward-thinking technology company dedicated to building innovative digital platforms that empower businesses and communities. We combine cutting-edge engineering with thoughtful design to create experiences that matter.',
  vision:
    'We envision a world where technology seamlessly bridges ambition and execution — where every platform we build becomes a foundation for lasting impact.',
  pillars: [
    {
      title: 'Innovation',
      description:
        'We push boundaries with emerging technologies, from immersive 3D experiences to scalable cloud architectures.',
    },
    {
      title: 'Craft',
      description:
        'Every detail matters. We approach each project with the discipline of artisans and the rigor of engineers.',
    },
    {
      title: 'Partnership',
      description:
        'We work alongside our clients as true partners, translating vision into tangible, production-ready solutions.',
    },
  ],
} as const;

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  depthImage?: string;
  featured?: boolean;
};

export const teamMembers: TeamMember[] = [
  {
    id: 'mohammad-zyoud',
    name: 'Mohammad Zyoud',
    role: 'CEO & Owner',
    bio: 'Founder and visionary leader driving Bosala',
    image: '/team/Mohammad_Zyoud_transparent.png',
    featured: true,
  },
  {
    id: 'mohammad-jarrar',
    name: 'Mohammad Jarrar',
    role: 'Software Engineer',
    bio: 'Software Engineer with expertise in designing, developing, and maintaining scalable software systems and applications',
    image: '/team/mohammad_Jarrar_transparent.png',
    featured: true,
  },
  {
    id: 'ameed-nimer',
    name: 'Ameed Nimer',
    role: 'Cyber Security',
    bio: 'Cyber Security Specialist dedicated to protecting digital assets and identifying security vulnerabilities.',
    image: '/team/Ameed_background.png',
    featured: true,
  },
  {
    id: 'ward-warrior',
    name: 'Ward_Warrior',
    role: 'CFO',
    bio: 'Architect financial strategy and risk framework. With extensive experience.',
    image: '/team/warrd_transparent.png',
    featured: true,
  },
];

export type Platform = {
  id: string;
  name: string;
  url: string;
  icon: string;
  description?: string;
};

export const platformsIntro =
  'The platforms we build — with more on the way.';

export const platforms: Platform[] = [
  {
    id: 'kitzos',
    name: 'Kitzos.com',
    url: 'https://kitzos.com',
    icon: '/platforms/kitzos-icon.png',
    description: 'Our first live platform.',
  },
  {
    id: 'c8xt',
    name: 'C8xt.com',
    url: 'https://c8xt.com',
    icon: '/platforms/c8xt-icon.png',
    description: 'Our newest live platform.',
  },
];

export const stats = [
  { id: 'projects', label: 'PROJECTS', value: 100, suffix: '+' },
  { id: 'team', label: 'TEAM', value: 4, suffix: '' },
  { id: 'years', label: 'YEARS', value: 2, suffix: '+' },
  { id: 'vision', label: 'VISION', value: 201, suffix: '%' },
] as const;

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Team', href: '#team' },
  { label: 'Platforms', href: '#platforms' },
  { label: 'Contact', href: '#contact' },
] as const;

export const portraitDepth = {
  strength: 0.022,
  spotlight: 0.2,
  depthContrast: 1.15,
  parallaxMul: 1.0,
  grain: 0.012,
} as const;

export const sectionIds = {
  hero: 'hero',
  about: 'about',
  team: 'team',
  platforms: 'platforms',
  stats: 'stats',
  contact: 'contact',
} as const;

export const scrollBreakpoints = {
  hero: 0,
  about: 0.18,
  team: 0.38,
  platforms: 0.55,
  stats: 0.72,
  contact: 0.9,
} as const;
