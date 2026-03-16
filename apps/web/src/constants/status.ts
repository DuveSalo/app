import type { ExpirationStatus } from '@/types/expirable';

/** Dot indicator colors for status in split-pane list items */
export const STATUS_DOT: Record<ExpirationStatus, string> = {
  valid: 'bg-emerald-600',
  expiring: 'bg-amber-600',
  expired: 'bg-red-600',
};
