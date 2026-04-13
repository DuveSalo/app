import { useMemo, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Column } from '@tanstack/react-table';
import { StatusFilter, statusFilterFn } from './StatusFilter';
import type { ExpirationStatus } from '@/types/expirable';

interface StatusFilterHarnessProps {
  initialValue?: ExpirationStatus[];
}

function StatusFilterHarness({ initialValue }: StatusFilterHarnessProps) {
  const [filterValue, setFilterValue] = useState<ExpirationStatus[] | undefined>(initialValue);

  const column = useMemo(
    () =>
      ({
        getFilterValue: () => filterValue,
        setFilterValue: (nextValue: unknown) =>
          setFilterValue(nextValue as ExpirationStatus[] | undefined),
      }) as unknown as Column<Record<string, string>, unknown>,
    [filterValue]
  );

  return (
    <div>
      <StatusFilter column={column} />
      <span data-testid="filter-value">{filterValue?.join(',') ?? 'none'}</span>
    </div>
  );
}

describe('StatusFilter', () => {
  it('keeps the active filter count outside the trigger button', () => {
    render(<StatusFilterHarness />);

    expect(screen.getByRole('button', { name: 'Estado' })).toBeInTheDocument();
    expect(screen.queryByText('1 filtro')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('shows the selected filter count and clear button when statuses are active', () => {
    render(<StatusFilterHarness initialValue={['valid', 'expired']} />);

    expect(screen.getByText('2 filtros')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument();
    expect(screen.getByTestId('filter-value')).toHaveTextContent('valid,expired');
  });

  it('clears the selected filters when the clear button is pressed', () => {
    render(<StatusFilterHarness initialValue={['expiring']} />);

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    expect(screen.queryByText('1 filtro')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
    expect(screen.getByTestId('filter-value')).toHaveTextContent('none');
  });

  it('matches rows only when the status is included in the selected filters', () => {
    expect(statusFilterFn({ getValue: () => 'valid' }, 'status', ['valid', 'expired'])).toBe(true);

    expect(statusFilterFn({ getValue: () => 'expiring' }, 'status', ['valid', 'expired'])).toBe(
      false
    );
  });
});
