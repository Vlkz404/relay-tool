const secretKeys = new Set(['apikey', 'apiKey', 'authorization', 'token', 'password']);

export function sanitizeForLog(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeForLog);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [
    key,
    secretKeys.has(key) ? '[REDACTED]' : sanitizeForLog(child),
  ]));
}

