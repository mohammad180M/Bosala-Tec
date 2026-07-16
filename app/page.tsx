import Nav from '@/components/ui/Nav';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Team from '@/components/sections/Team';
import Platforms from '@/components/sections/Platforms';
import Stats from '@/components/sections/Stats';
import Contact from '@/components/sections/Contact';

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <About />
      <Team />
      <Platforms />
      <Stats />
      <Contact />
    </main>
  );
}
