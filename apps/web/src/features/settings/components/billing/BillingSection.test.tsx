import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActivePlanCard } from './ActivePlanCard';
import { BankTransferPlanCard } from './BankTransferPlanCard';
import { BillingSection } from '../BillingSection';
import { createMockSubscription } from '@/test/factories';
import type { Subscription } from '@/types/subscription';

// Module-level mocks for BillingSection dependencies (hoisted by Vitest)
vi.mock('@/lib/hooks/usePlans', () => ({
  usePlans: () => ({
    plans: [
      {
        id: 'basic',
        name: 'Básico',
        price: '$5000',
        priceNumber: 5000,
        priceSuffix: '/mes',
        features: [],
      },
    ],
    isLoading: false,
  }),
}));

vi.mock('../billing/useBankTransferFlow', () => ({
  useBankTransferFlow: () => ({
    step: 'idle',
    isProcessing: false,
    uploadFile: null,
    setUploadFile: vi.fn(),
    paymentStatus: null,
    rejectionReason: null,
    handleConfirmDetails: vi.fn(),
    handleUploadSubmit: vi.fn(),
    retryUpload: vi.fn(),
    reset: vi.fn(),
  }),
}));

vi.mock('../ChangePlanModal', () => ({
  ChangePlanModal: () => null,
}));

vi.mock('../billing/BankTransferDialog', () => ({
  BankTransferDialog: () => null,
}));

// Mock AuthContext so components using useAuth don't crash
const mockUseAuth = vi.fn();
vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// dateUtils uses Intl — no mock needed; just verify the values render

describe('ActivePlanCard — active subscription status', () => {
  it('shows "Activa" status badge when subscription status is active', () => {
    const subscription = createMockSubscription({ status: 'active' });

    render(
      <ActivePlanCard subscription={subscription} canChangePlan={false} onChangePlan={vi.fn()} />
    );

    expect(screen.getByText('Activa')).toBeInTheDocument();
  });

  it('shows the plan name', () => {
    const subscription = createMockSubscription({ planName: 'Básico', status: 'active' });

    render(
      <ActivePlanCard subscription={subscription} canChangePlan={false} onChangePlan={vi.fn()} />
    );

    expect(screen.getByText('Básico')).toBeInTheDocument();
  });

  it('shows "Pendiente" status badge when subscription status is approval_pending', () => {
    const subscription = createMockSubscription({ status: 'approval_pending' });

    render(
      <ActivePlanCard subscription={subscription} canChangePlan={false} onChangePlan={vi.fn()} />
    );

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('shows "Suspendida" status badge when subscription status is suspended', () => {
    const subscription = createMockSubscription({ status: 'suspended' });

    render(
      <ActivePlanCard subscription={subscription} canChangePlan={false} onChangePlan={vi.fn()} />
    );

    expect(screen.getByText('Suspendida')).toBeInTheDocument();
  });

  it('shows "Cancelada" status badge when subscription status is cancelled', () => {
    const subscription = createMockSubscription({ status: 'cancelled' });

    render(
      <ActivePlanCard subscription={subscription} canChangePlan={false} onChangePlan={vi.fn()} />
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
      />
    );

    expect(screen.queryByText('Cambiar plan')).not.toBeInTheDocument();

    rerender(
      <ActivePlanCard
        subscription={subscription}
        canChangePlan={true}
        onChangePlan={onChangePlan}
      />
    );

    expect(screen.getByText('Cambiar plan')).toBeInTheDocument();
  });

  it('shows the monthly price', () => {
    const subscription = createMockSubscription({
      amount: 5000,
      currency: 'ARS',
      status: 'active',
    });

    render(
      <ActivePlanCard subscription={subscription} canChangePlan={false} onChangePlan={vi.fn()} />
    );

    // The formatted price should appear somewhere in the card
    const priceElement = screen.getByText(/5\.000|5,000|5000/);
    expect(priceElement).toBeInTheDocument();
  });
});

describe('BankTransferPlanCard — status-driven', () => {
  it('shows "Activa" status badge when subscription status is active', () => {
    const subscription = createMockSubscription({
      status: 'active',
      paymentProvider: 'bank_transfer',
      planName: 'Básico',
    });
    render(<BankTransferPlanCard subscription={subscription} />);
    expect(screen.getAllByText('Activa').length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Pendiente" when subscription status is approval_pending', () => {
    const subscription = createMockSubscription({
      status: 'approval_pending',
      paymentProvider: 'bank_transfer',
      planName: 'Básico',
    });
    render(<BankTransferPlanCard subscription={subscription} />);
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Activa')).not.toBeInTheDocument();
  });

  it('shows "Suspendida" when subscription status is suspended', () => {
    const subscription = createMockSubscription({
      status: 'suspended',
      paymentProvider: 'bank_transfer',
    });
    render(<BankTransferPlanCard subscription={subscription} />);
    expect(screen.getAllByText('Suspendida').length).toBeGreaterThanOrEqual(1);
  });

  it('shows the plan name from subscription.planName', () => {
    const subscription = createMockSubscription({
      status: 'active',
      paymentProvider: 'bank_transfer',
      planName: 'Estándar',
    });
    render(<BankTransferPlanCard subscription={subscription} />);
    expect(screen.getByText('Estándar')).toBeInTheDocument();
  });

  it('shows "Transferencia bancaria" as payment method', () => {
    const subscription = createMockSubscription({
      status: 'active',
      paymentProvider: 'bank_transfer',
    });
    render(<BankTransferPlanCard subscription={subscription} />);
    expect(screen.getByText('Transferencia bancaria')).toBeInTheDocument();
  });
});

const renderSection = (subscription: Subscription | null, opts: { trialEndsAt?: string } = {}) => {
  mockUseAuth.mockReturnValue({
    currentUser: { id: 'user-1', name: 'Test', email: 'test@test.com' },
    currentCompany: { id: 'comp-1', name: 'Test Co', isSubscribed: !!subscription },
    isAdmin: false,
    isLoading: false,
  });

  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <BillingSection
          companyId="comp-1"
          subscription={subscription}
          payments={[]}
          isLoading={false}
          onCancel={vi.fn()}
          onReactivate={vi.fn()}
          onSubscriptionChange={vi.fn()}
          onChangePlan={vi.fn()}
          onBankTransferPayment={vi.fn()}
          trialEndsAt={opts.trialEndsAt}
        />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('BillingSection — rendering branches', () => {
  it('Branch A: when status is approval_pending AND paymentProvider is bank_transfer, renders BankTransferPendingCard', () => {
    const subscription = createMockSubscription({
      status: 'approval_pending',
      paymentProvider: 'bank_transfer',
      planName: 'Básico',
    });
    renderSection(subscription);

    expect(screen.getByText('Pago pendiente de aprobación')).toBeInTheDocument();
    expect(screen.getByText(/Básico/)).toBeInTheDocument();
    expect(screen.queryByText('Selecciona un plan para suscribirte')).not.toBeInTheDocument();
  });

  it('Branch B: when status is active AND paymentProvider is bank_transfer, renders BankTransferPlanCard (not PendingCard)', () => {
    const subscription = createMockSubscription({
      status: 'active',
      paymentProvider: 'bank_transfer',
      planName: 'Básico',
    });
    renderSection(subscription);

    expect(screen.getByText('Transferencia bancaria')).toBeInTheDocument();
    expect(screen.getAllByText('Activa').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Pago pendiente de aprobación')).not.toBeInTheDocument();
  });

  it('Branch C: when subscription is null AND trialEndsAt is set, renders NewSubscriptionSection', () => {
    renderSection(null, { trialEndsAt: '2026-05-01' });

    expect(screen.getByText('Selecciona un plan para suscribirte')).toBeInTheDocument();
    expect(screen.queryByText('Pago pendiente de aprobación')).not.toBeInTheDocument();
  });
});
