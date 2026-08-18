import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TechMarquee } from './components/TechMarquee';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { MernFlow } from './components/MernFlow';
import { Projects } from './components/Projects';
import { Experience } from './components/Experience';
import { Journey } from './components/Journey';
import { Education } from './components/Education';
import { BuildSection } from './components/BuildSection';
import { GithubSection } from './components/GithubSection';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Backdrop } from './components/Backdrop';
import { ScrollProgress } from './components/ScrollProgress';
import { Preloader } from './components/Preloader';
import { CustomCursor } from './components/CustomCursor';
import { BackToTop } from './components/BackToTop';
import { useTheme } from './hooks/useTheme';
import { ContentProvider } from './content/ContentContext';
import { AdminApp } from './admin/AdminApp';

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return hash;
}

function Portfolio() {
  const { theme, toggleTheme } = useTheme();
  const [booted, setBooted] = useState(false);

  return (
    <>
      <Preloader onDone={() => setBooted(true)} />
      {booted && (
        <>
          <CustomCursor />
          <Backdrop />
          <ScrollProgress />
          <Navbar theme={theme} onToggleTheme={toggleTheme} />
          <main>
            <Hero />
            <TechMarquee />
            <About />
            <Skills />
            <MernFlow />
            <Projects />
            <Experience />
            <Journey />
            <Education />
            <BuildSection />
            <GithubSection />
            <Contact />
          </main>
          <Footer />
          <BackToTop />
        </>
      )}
    </>
  );
}

export default function App() {
  const hash = useHashRoute();
  const isAdmin = hash.startsWith('#/admin');

  return <ContentProvider>{isAdmin ? <AdminApp /> : <Portfolio />}</ContentProvider>;
}