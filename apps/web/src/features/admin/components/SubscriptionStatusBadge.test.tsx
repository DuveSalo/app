import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';

describe('SubscriptionStatusBadge', () => {
  it('renders rejected subscriptions as a red "Rechazado" badge', () => {
    render(<SubscriptionStatusBadge status="rejected" />);

    const label = screen.getByText('Rechazado');
    const badge = label.parentElement;

    expect(label).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-50', 'text-red-700', 'border-red-200');
  });
});
