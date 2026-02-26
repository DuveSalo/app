// Common/shared types

import type { ReactElement } from 'react';
import { QRDocumentType } from './qr';

// Common literal types
export type YesNo = 'Sí' | 'No';
export type YesNoNA = 'Sí' | 'No' | 'N/A';

export interface NavItem {
  path: string;
  label: string;
  icon: ReactElement<{ className?: string }>;
  service?: QRDocumentType;
}

export interface DynamicListItem {
  id: string;
  value: string;
}

/** Optional pagination parameters for collection queries (OFFSET-based - legacy) */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/** Paginated response wrapper (OFFSET-based - legacy) */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

/**
 * Cursor-based pagination parameters (recommended for performance)
 * Uses keyset pagination for O(1) performance on any page depth
 */
export interface CursorPaginationParams {
  /** Number of items to fetch */
  limit?: number;
  /** Cursor for next page (usually `${sortValue}_${id}`) */
  cursor?: string;
  /** Direction: 'next' for forward, 'prev' for backward */
  direction?: 'next' | 'prev';
}

/** Cursor-based paginated response */
export interface CursorPaginatedResult<T> {
  items: T[];
  /** Cursor for next page (null if no more items) */
  nextCursor: string | null;
  /** Cursor for previous page (null if at start) */
  prevCursor: string | null;
  /** Whether there are more items */
  hasMore: boolean;
}

/** Helper to encode cursor from sort value and id */
export const encodeCursor = (sortValue: string | number | Date, id: string): string => {
  const sortStr = sortValue instanceof Date ? sortValue.toISOString() : String(sortValue);
  return Buffer.from(`${sortStr}|${id}`).toString('base64');
};

/** Helper to decode cursor into sort value and id */
export const decodeCursor = (cursor: string): { sortValue: string; id: string } | null => {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const [sortValue, id] = decoded.split('|');
    if (!sortValue || !id) return null;
    return { sortValue, id };
  } catch {
    return null;
  }
};
