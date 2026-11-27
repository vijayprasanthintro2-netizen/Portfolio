import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
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
import { ProjectDetails, ProjectNotFound } from './components/ProjectDetails';
import { useTheme } from './hooks/useTheme';
import { ContentProvider } from './content/ContentContext';
import { scrollToHashTarget, scrollToY } from './lib/hashRoute';

// The admin panel is a separate route and never needed by portfolio visitors.
// Splitting it out keeps its editor UI out of the initial bundle.
const AdminApp = lazy(() =>
  import('./admin/AdminApp').then((module) => ({ default: module.AdminApp }))
);

// Sections have no props; memoising them stops a theme toggle (or any other
// portfolio-level state change) from re-rendering the whole page.
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

// Public section links still use hashes; only project detail pages have their
// own pathname. Both live inside the same PublicApp so the preloader runs once.

function usePublicScrollRestoration(scrollReady, location) {
  const restoredInitial = useRef(false);

  useEffect(() => {
    if (!scrollReady) return undefined;

    // Opening a project detail must start at the top of that page. The saved
    // homepage scroll position is only used when returning to the homepage.
    if (location.pathname !== '/') {
      scrollToY(0);
      return undefined;
    }

    const restore = () => {
      const y = location.state?.restoreProjectsScrollY;
      if (typeof y === 'number' && location.pathname === '/') scrollToY(y);
      else scrollToHashTarget();
    };

    if (!restoredInitial.current) {
      restoredInitial.current = true;
      restore();
      return;
    }

    // Navigation triggered by our Back button carries an explicit restore
    // marker. Ordinary section links keep their smooth in-page scroll.
    if (
      location.state?.restoreHash ||
      typeof location.state?.restoreProjectsScrollY === 'number'
    ) {
      restore();
    }
  }, [scrollReady, location.key]);

  useEffect(() => {
    if (!scrollReady) return undefined;

    // Browser back/forward does not set a restore marker. React Router updates
    // `location` on popstate, so read the history entry directly here.
    const onPop = () => {
      if (window.location.pathname !== '/') {
        scrollToY(0);
        return;
      }

      const state = window.history.state?.usr;
      if (typeof state?.restoreProjectsScrollY === 'number' && window.location.pathname === '/') {
        scrollToY(state.restoreProjectsScrollY);
      } else {
        scrollToHashTarget();
      }
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [scrollReady]);
}

function HomeSections() {
  return (
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
  );
}

function PublicApp() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [booted, setBooted] = useState(false);
  const [scrollReady, setScrollReady] = useState(false);
  const onBootDone = useCallback(() => setBooted(true), []);
  const onPreloaderExit = useCallback(() => setScrollReady(true), []);

  usePublicScrollRestoration(scrollReady, location);

  return (
    <>
      <Preloader onDone={onBootDone} onExited={onPreloaderExit} />
      {booted && (
        <>
          <Static.CustomCursor />
          <Static.Backdrop />
          <Static.ScrollProgress />
          <Navbar theme={theme} onToggleTheme={toggleTheme} />
          <Routes>
            <Route path="/projects/:slug" element={<ProjectDetails />} />
            <Route path="/" element={<HomeSections />} />
            <Route path="*" element={<ProjectNotFound />} />
          </Routes>
          <Static.Footer />
          <Static.BackToTop />
        </>
      )}
    </>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.hash.startsWith('#/admin');

  return (
    <ContentProvider>
      {isAdmin ? (
        <Suspense fallback={<div className="admin-loading admin-boot-loading">Loading admin panel…</div>}>
          <AdminApp />
        </Suspense>
      ) : (
        <PublicApp />
      )}
    </ContentProvider>
  );
}
