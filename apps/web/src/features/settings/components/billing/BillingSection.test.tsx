import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivePlanCard } from './ActivePlanCard';
import { BankTransferPlanCard } from './BankTransferPlanCard';
import { createMockSubscription } from '@/test/factories';

// dateUtils uses Intl — no mock needed; just verify the values render

describe('ActivePlanCard — active subscription status', () => {
  it('shows "Activa" status badge when subscription status is active', () => {
    const subscription = createMockSubscription({ status: 'active' });

    render(
      <ActivePlanCard
        subscription={subscription}
        canChangePlan={false}
        onChangePlan={vi.fn()}
      />,
    );

    expect(screen.getByText('Activa')).toBeInTheDocument();
  });

  it('shows the plan name', () => {
    const subscription = createMockSubscription({ planName: 'Básico', status: 'active' });

    render(
      <ActivePlanCard
        subscription={subscription}
        canChangePlan={false}
        onChangePlan={vi.fn()}
      />,
    );

    expect(screen.getByText('Básico')).toBeInTheDocument();
  });

  it('shows "Pendiente" status badge when subscription status is approval_pending', () => {
    const subscription = createMockSubscription({ status: 'approval_pending' });

    render(
      <ActivePlanCard
        subscription={subscription}
        canChangePlan={false}
        onChangePlan={vi.fn()}
      />,
    );

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('shows "Suspendida" status badge when subscription status is suspended', () => {
    const subscription = createMockSubscription({ status: 'suspended' });

    render(
      <ActivePlanCard
        subscription={subscription}
        canChangePlan={false}
        onChangePlan={vi.fn()}
      />,
    );

    expect(screen.getByText('Suspendida')).toBeInTheDocument();
  });

  it('shows "Cancelada" status badge when subscription status is cancelled', () => {
    const subscription = createMockSubscription({ status: 'cancelled' });

    render(
      <ActivePlanCard
        subscription={subscription}
        canChangePlan={false}
        onChangePlan={vi.fn()}
      />,
    );

    expect(screen.getByText('Cancelada')).toBeInTheDocument();
  });

  it('shows "Cambiar plan" button only when canChangePlan is true', () => {
    const subscription = createMockSubscription({ status: 'active' });
    const onChangePlan = vi.fn();

    const { rerender } = render(
      <ActivePlanCard
        subscription={subscription}
        canChangePlan={false}
        onChangePlan={onChangePlan}
      />,
    );

    expect(screen.queryByText('Cambiar plan')).not.toBeInTheDocument();

    rerender(
      <ActivePlanCard
        subscription={subscription}
        canChangePlan={true}
        onChangePlan={onChangePlan}
      />,
    );

    expect(screen.getByText('Cambiar plan')).toBeInTheDocument();
  });

  it('shows the monthly price', () => {
    const subscription = createMockSubscription({ amount: 5000, currency: 'ARS', status: 'active' });

    render(
      <ActivePlanCard
        subscription={subscription}
        canChangePlan={false}
        onChangePlan={vi.fn()}
      />,
    );

    // The formatted price should appear somewhere in the card
    const priceElement = screen.getByText(/5\.000|5,000|5000/);
    expect(priceElement).toBeInTheDocument();
  });
});

describe('BankTransferPlanCard — bank transfer active state', () => {
  it('shows active subscription status when bank transfer is active', () => {
    render(<BankTransferPlanCard planName="Básico" />);

    // "Activa" appears in both the status badge and the Estado field
    const activeLabels = screen.getAllByText('Activa');
    expect(activeLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('shows the plan name passed as prop', () => {
    render(<BankTransferPlanCard planName="Estándar" />);

    expect(screen.getByText('Estándar')).toBeInTheDocument();
  });

  it('shows "Transferencia bancaria" as payment method', () => {
    render(<BankTransferPlanCard planName="Básico" />);

    expect(screen.getByText('Transferencia bancaria')).toBeInTheDocument();
  });

  it('shows "Activa" in both the status badge and the estado field', () => {
    render(<BankTransferPlanCard planName="Básico" />);

    // The card renders "Activa" in two places: the badge and the "Estado" field
    const activeLabels = screen.getAllByText('Activa');
    expect(activeLabels).toHaveLength(2);
  });
});
