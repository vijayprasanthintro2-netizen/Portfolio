import { useMemo } from 'react';
import { normalizeRichHtml, sanitizeHtml } from '../lib/richText';

// Shared by the admin live preview and the public project modal so the
// formatted content looks the same on both sides. All HTML is sanitized here.
export function RichContent({ html, className = '', as: Tag = 'div', inline = false }) {
  const safe = useMemo(
    () => (inline ? sanitizeHtml(html) : normalizeRichHtml(html)),
    [html, inline]
  );

  if (!safe) return null;
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: safe }} />;
}
