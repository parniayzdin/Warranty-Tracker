import { useCallback, useEffect, useState } from 'react';

export class ApiError extends Error {
  constructor(message: string, public status: number, public fields: Record<string, string> = {}) { super(message); }
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try { response = await fetch('/api' + path, { ...options, headers: { ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...options.headers } }); }
  catch { throw new ApiError('Cannot reach your tracker. Check the connection and try again.', 0); }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(error.message || 'Something went wrong. Please try again.', response.status, error.errors);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return text ? JSON.parse(text) : undefined as T;
}
export function useApi<T>(path: string) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(n => n + 1), []);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setData(undefined);
    api<T>(path).then(value => { if (active) setData(value); })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [path, version]);
  return { data, error, loading, refresh };
}
export const dateLabel = (value?: string | null) => value ? new Date(value + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not added';
export function today() { const d = new Date(); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-'); }
export function daysUntil(value: string) { return Math.round((Date.parse(value + 'T12:00:00Z') - Date.parse(today() + 'T12:00:00Z')) / 86400000); }
export function dueLabel(value: string) { const days = daysUntil(value); return days < 0 ? Math.abs(days) + ' days overdue' : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'In ' + days + ' days'; }
export const cleanText = (value: string) => value.replace(/[\u002d\u2010-\u2015\u2212]/g, ' ');
