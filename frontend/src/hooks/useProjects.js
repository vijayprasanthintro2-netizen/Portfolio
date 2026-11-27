import { useMemo } from 'react';
import { projects as defaultProjects } from '../data/projects';
import { useContent } from '../content/ContentContext';
import { normalizeList } from '../content/shape';
import { normalizeProjects } from '../lib/normalizeProject';

// One source of truth for public project data. The homepage cards and the
// dedicated detail pages must always resolve the same normalized records.
export function useProjects() {
  const { content, status } = useContent();

  const savedProjects = useMemo(
    () => normalizeProjects(normalizeList(content.projects)),
    [content.projects]
  );
  const fallbackProjects = useMemo(() => normalizeProjects(defaultProjects), []);

  const source = savedProjects === null ? fallbackProjects : savedProjects;

  const projects = useMemo(
    () =>
      (Array.isArray(source) ? source : [])
        .slice()
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    [source]
  );

  return { projects, savedProjects, status };
}
