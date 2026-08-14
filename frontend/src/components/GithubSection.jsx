import { useEffect, useState } from 'react';
import { Github, Star, GitFork, ExternalLink, FolderGit2 } from 'lucide-react';
import { socials } from '../config';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { Magnetic } from './Magnetic';

export function GithubSection() {
  const [repos, setRepos] = useState([]);
  const [state, setState] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`https://api.github.com/users/${socials.githubUser}/repos?sort=updated&per_page=6`, {
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!res.ok) throw new Error('GitHub API error');
        const data = await res.json();
        if (cancelled) return;
        setRepos(
          data
            .filter((repo) => !repo.fork)
            .map((repo) => ({
              name: repo.name,
              description: repo.description || 'No description provided.',
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              language: repo.language || 'JavaScript',
              url: repo.html_url,
            }))
        );
        setState('ready');
      } catch {
        if (!cancelled) setState('error');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [socials.githubUser]);

  return (
    <section id="github" aria-label="GitHub">
      <div className="container">
        <SectionHeading
          kicker="GitHub"
          title="My open-source work"
          sub="Public repositories I've built while learning and shipping."
        />

        <Reveal>
          <div className="github-card">
            <div className="github-card-head">
              <div className="github-avatar">
                <Github size={34} aria-hidden="true" />
              </div>
              <div className="github-card-meta">
                <h3>{socials.githubUser}</h3>
                <p>Full-stack developer building with the MERN stack.</p>
              </div>
              <Magnetic>
                <a className="btn btn-primary btn-sm" href={socials.github} target="_blank" rel="noreferrer">
                  View GitHub
                  <ExternalLink className="btn-icon" aria-hidden="true" />
                </a>
              </Magnetic>
            </div>

            {state === 'loading' && (
              <p className="muted github-note">Loading repositories…</p>
            )}

            {state === 'ready' && repos.length > 0 && (
              <div className="repo-grid">
                {repos.map((repo) => (
                  <a className="repo-card" href={repo.url} target="_blank" rel="noreferrer" key={repo.name}>
                    <div className="repo-card-top">
                      <FolderGit2 size={18} aria-hidden="true" />
                      <span className="repo-name">{repo.name}</span>
                    </div>
                    <p className="repo-desc">{repo.description}</p>
                    <div className="repo-meta">
                      <span className="repo-lang">
                        <span className="lang-dot" aria-hidden="true" />
                        {repo.language}
                      </span>
                      <span className="repo-stat">
                        <Star size={13} aria-hidden="true" />
                        {repo.stars}
                      </span>
                      <span className="repo-stat">
                        <GitFork size={13} aria-hidden="true" />
                        {repo.forks}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {state === 'error' && (
              <p className="muted github-note">
                Could not load repositories right now — you can still view my profile below.
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
