import { lazy, memo, Suspense, useCallback, useEffect, useState } from 'react';
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
import { scrollToHashTarget } from './lib/hashRoute';

// The admin panel is a separate route and never needed by portfolio visitors.
// Splitting it out keeps its editor UI out of the initial bundle.
const AdminApp = lazy(() =>
  import('./admin/AdminApp').then((module) => ({ default: module.AdminApp }))
);

// Sections have no props; memoising them stops a theme toggle (or any other
// Portfolio-level state change) from re-rendering the whole page.
const Static = {
  Hero: memo(Hero),
  TechMarquee: memo(TechMarquee),
  About: memo(About),
  Skills: memo(Skills),
  MernFlow: memo(MernFlow),
  Projects: memo(Projects),
  Experience: memo(Experience),
  Journey: memo(Journey),
  Education: memo(Education),
  BuildSection: memo(BuildSection),
  GithubSection: memo(GithubSection),
  Contact: memo(Contact),
  Footer: memo(Footer),
  Backdrop: memo(Backdrop),
  ScrollProgress: memo(ScrollProgress),
  CustomCursor: memo(CustomCursor),
  BackToTop: memo(BackToTop),
};

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    window.addEventListener('hashchange', sync);
    // pushState-based public navigation and history traversal use popstate.
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);
  return hash;
}

function Portfolio() {
  const { theme, toggleTheme } = useTheme();
  const [booted, setBooted] = useState(false);
  const [scrollReady, setScrollReady] = useState(false);
  const onBootDone = useCallback(() => setBooted(true), []);
  const onPreloaderExit = useCallback(() => setScrollReady(true), []);

  useEffect(() => {
    if (!scrollReady) return undefined;

    // The sections mount only after the preloader, so the browser's native
    // fragment scroll has already been missed on refresh. Restore it once the
    // DOM exists, and keep it in sync with history navigation afterwards.
    // Effects run after the DOM commit, and Preloader only reports its exit
    // after the scroll lock is released, so the target is ready now.
    scrollToHashTarget();
    window.addEventListener('popstate', scrollToHashTarget);
    window.addEventListener('hashchange', scrollToHashTarget);

    return () => {
      window.removeEventListener('popstate', scrollToHashTarget);
      window.removeEventListener('hashchange', scrollToHashTarget);
    };
  }, [scrollReady]);

  return (
    <>
      <Preloader onDone={onBootDone} onExited={onPreloaderExit} />
      {booted && (
        <>
          <Static.CustomCursor />
          <Static.Backdrop />
          <Static.ScrollProgress />
          <Navbar theme={theme} onToggleTheme={toggleTheme} />
          <main className="portfolio-main">
            <Static.Hero />
            <Static.TechMarquee />
            <Static.About />
            <Static.Skills />
            <Static.MernFlow />
            <Static.Projects />
            <Static.Experience />
            <Static.Journey />
            <Static.Education />
            <Static.BuildSection />
            <Static.GithubSection />
            <Static.Contact />
          </main>
          <Static.Footer />
          <Static.BackToTop />
        </>
      )}
    </>
  );
}

export default function App() {
  const hash = useHashRoute();
  const isAdmin = hash.startsWith('#/admin');

  return (
    <ContentProvider>
      {isAdmin ? (
        <Suspense fallback={<div className="admin-loading admin-boot-loading">Loading admin panel…</div>}>
          <AdminApp />
        </Suspense>
      ) : (
        <Portfolio />
      )}
    </ContentProvider>
  );
}
