/**
 * Utility functions for type-safe sorting operations
 */

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

/**
 * Parse a sort string (e.g., "fieldName-asc") into field and direction
 */
export function parseSortString(sortBy: string): SortConfig {
  const [field, direction = 'asc'] = sortBy.split('-');
  return { field, direction: direction as SortDirection };
}

/**
 * Get a comparable value from an object field
 * Handles dates, numbers, and strings appropriately
 */
function getComparableValue(value: unknown): string | number {
  if (value === null || value === undefined) {
    return '';
  }

  // Handle dates (ISO strings)
  if (typeof value === 'string') {
    const dateValue = Date.parse(value);
    if (!isNaN(dateValue) && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return dateValue;
    }
    return value.toLowerCase();
  }

  if (typeof value === 'number') {
    return value;
  }

  return String(value).toLowerCase();
}

/**
 * Compare two values for sorting
 * Returns -1, 0, or 1 for ascending order
 */
function compareValues(aValue: string | number, bValue: string | number): number {
  if (aValue < bValue) return -1;
  if (aValue > bValue) return 1;
  return 0;
}

/**
 * Create a type-safe sorting function for an array of objects
 *
 * @example
 * const sorted = [...items].sort(createSortFunction<MyType>('name-asc'));
 */
export function createSortFunction<T>(sortBy: string): (a: T, b: T) => number {
  const { field, direction } = parseSortString(sortBy);

  return (a: T, b: T) => {
    const aValue = getComparableValue((a as Record<string, unknown>)[field]);
    const bValue = getComparableValue((b as Record<string, unknown>)[field]);
    const comparison = compareValues(aValue, bValue);
    return direction === 'asc' ? comparison : -comparison;
  };
}

/**
 * Sort an array by multiple fields with specified directions
 *
 * @example
 * const sorted = sortByFields(items, [
 *   { field: 'date', direction: 'desc' },
 *   { field: 'name', direction: 'asc' }
 * ]);
 */
export function sortByFields<T>(items: T[], sortConfigs: SortConfig[]): T[] {
  return [...items].sort((a, b) => {
    for (const { field, direction } of sortConfigs) {
      const aValue = getComparableValue((a as Record<string, unknown>)[field]);
      const bValue = getComparableValue((b as Record<string, unknown>)[field]);
      const comparison = compareValues(aValue, bValue);

      if (comparison !== 0) {
        return direction === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
}

/**
 * Filter items by searching in specified fields
 */
export function filterBySearch<T>(items: T[], query: string, fields: (keyof T)[]): T[] {
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();
  return items.filter(item =>
    fields.some(field => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(lowerQuery);
    })
  );
}
