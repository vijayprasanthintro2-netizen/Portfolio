// Project detail URLs are derived only from data that already exists in the
// portfolio. The one override keeps the public example URL for the poultry
// project while its CMS record keeps its original id.

const SLUG_OVERRIDES = {
  'Poultry-Management-System': 'balasubramani-poultry',
};

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function projectSlug(project) {
  if (!project) return '';
  if (project.slug) return slugify(project.slug);
  if (SLUG_OVERRIDES[project.id]) return SLUG_OVERRIDES[project.id];
  return slugify(project.name || project.id);
}

export function projectAliases(project) {
  return [...new Set([projectSlug(project), slugify(project.name), slugify(project.id)])].filter(
    Boolean
  );
}

export function findProjectBySlug(projects, slug) {
  const wanted = slugify(slug);
  if (!wanted) return null;
  return (
    (projects || []).find((project) => projectAliases(project).includes(wanted)) || null
  );
}
