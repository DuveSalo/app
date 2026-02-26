import DOMPurify from 'dompurify';

/**
 * Sanitize HTML string to prevent XSS attacks.
 * Only use when rendering user-generated HTML is absolutely necessary.
 * Prefer plain text rendering (React's default escaping) whenever possible.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Strip ALL HTML tags from a string, returning plain text.
 * Use this for user input that should never contain HTML.
 */
export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize a URL to prevent javascript: protocol attacks.
 * Returns empty string for dangerous URLs.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed) || /^vbscript:/i.test(trimmed)) {
    return '';
  }
  return trimmed;
}

/**
 * Sanitize user input for use in Supabase queries.
 * Trims whitespace and removes null bytes.
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\0/g, '');
}
