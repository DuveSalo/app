import { useState, useCallback, useMemo } from 'react';
import { useToast } from '../../components/common/Toast';
import { getErrorMessage } from '../utils/errors';

export interface UseListPageOptions<T> {
  /** Function to fetch items from the API */
  fetchItems: () => Promise<T[]>;
  /** Function to delete an item by ID */
  deleteItem?: (id: string) => Promise<void>;
  /** Initial sort value (e.g., 'date-desc') */
  initialSort?: string;
  /** Fields to search in for filtering */
  searchFields?: (keyof T)[];
  /** Success message after deletion */
  deleteSuccessMessage?: string;
  /** Error message for loading failure */
  loadErrorMessage?: string;
  /** Error message for deletion failure */
  deleteErrorMessage?: string;
}

export interface UseListPageReturn<T> {
  /** Current items list */
  items: T[];
  /** Loading state for initial fetch */
  isLoading: boolean;
  /** Deleting state */
  isDeleting: boolean;
  /** ID of item being deleted (for confirmation dialog) */
  deleteId: string | null;
  /** Current search query */
  searchQuery: string;
  /** Current sort value */
  sortBy: string;
  /** Current filter value */
  filterValue: string;
  /** Filtered and sorted items */
  filteredItems: T[];
  /** Update search query */
  setSearchQuery: (query: string) => void;
  /** Update sort value */
  setSortBy: (sort: string) => void;
  /** Update filter value */
  setFilterValue: (filter: string) => void;
  /** Trigger delete confirmation */
  handleDeleteClick: (id: string) => void;
  /** Cancel delete */
  handleDeleteCancel: () => void;
  /** Confirm and execute delete */
  handleDeleteConfirm: () => Promise<void>;
  /** Reload items */
  reload: () => Promise<void>;
}

type SortDirection = 'asc' | 'desc';

function parseSort(sortBy: string): { field: string; direction: SortDirection } {
  const [field, direction = 'asc'] = sortBy.split('-');
  return { field, direction: direction as SortDirection };
}

function compareValues<T>(
  a: T,
  b: T,
  field: string,
  direction: SortDirection
): number {
  const aValue = a[field as keyof T];
  const bValue = b[field as keyof T];

  let aComparable: string | number;
  let bComparable: string | number;

  // Handle dates
  if (typeof aValue === 'string' && !isNaN(Date.parse(aValue))) {
    aComparable = new Date(aValue).getTime();
    bComparable = new Date(bValue as string).getTime();
  } else if (typeof aValue === 'number') {
    aComparable = aValue;
    bComparable = bValue as number;
  } else {
    aComparable = String(aValue ?? '').toLowerCase();
    bComparable = String(bValue ?? '').toLowerCase();
  }

  if (aComparable < bComparable) return direction === 'asc' ? -1 : 1;
  if (aComparable > bComparable) return direction === 'asc' ? 1 : -1;
  return 0;
}

export function useListPage<T extends { id: string }>(
  options: UseListPageOptions<T>
): UseListPageReturn<T> {
  const {
    fetchItems,
    deleteItem,
    initialSort = '',
    searchFields = [],
    deleteSuccessMessage = 'Elemento eliminado correctamente',
    loadErrorMessage = 'Error al cargar los datos',
    deleteErrorMessage = 'Error al eliminar el elemento',
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(initialSort);
  const [filterValue, setFilterValue] = useState('');

  const { showSuccess, showError } = useToast();

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      showError(getErrorMessage(err) || loadErrorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems, showError, loadErrorMessage]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteId(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId || !deleteItem) return;

    setIsDeleting(true);

    // Optimistic update
    const previousItems = [...items];
    setItems(prev => prev.filter(item => item.id !== deleteId));

    try {
      await deleteItem(deleteId);
      showSuccess(deleteSuccessMessage);
    } catch (err) {
      // Revert optimistic update
      setItems(previousItems);
      showError(getErrorMessage(err) || deleteErrorMessage);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }, [deleteId, deleteItem, items, showSuccess, showError, deleteSuccessMessage, deleteErrorMessage]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search filter
    if (searchQuery && searchFields.length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Sort
    if (sortBy) {
      const { field, direction } = parseSort(sortBy);
      result.sort((a, b) => compareValues(a, b, field, direction));
    }

    return result;
  }, [items, searchQuery, searchFields, sortBy]);

  return {
    items,
    isLoading,
    isDeleting,
    deleteId,
    searchQuery,
    sortBy,
    filterValue,
    filteredItems,
    setSearchQuery,
    setSortBy,
    setFilterValue,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    reload,
  };
}
