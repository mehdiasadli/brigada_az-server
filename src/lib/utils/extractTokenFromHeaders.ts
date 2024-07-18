import { IncomingHttpHeaders } from 'http';

export function extractTokenFromHeaders(
  headers: IncomingHttpHeaders,
  key = 'Authorization',
): string | null {
  const token = headers[key] || headers[key.toLowerCase()];

  if (!token) return null;
  if (typeof token !== 'string') return null;
  if (!token.startsWith('Bearer ')) return null;

  const value = token.split(' ')?.[1];

  return value || null;
}
