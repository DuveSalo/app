import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// IMPORTANT: mock AuthContext BEFORE importing the component
const mockUseAuth = vi.fn();
vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the api services module so useQuery calls don't hit Supabase
const mockGetActiveSubscription = vi.fn();
vi.mock('@/lib/api/services', () => ({
  getActiveSubscription: (companyId: string) => mockGetActiveSubscription(companyId),
}));

import { TrialSidebarCard, TrialMobileIndicator } from './TrialBanner';
import { createMockCompany, createMockSubscription } from '@/test/factories';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const dateDaysFromNow = (days: number): string =>
  new Date(Date.now() + days * DAY_IN_MS).toISOString();

const renderBanner = (ui: React.ReactElement, subscription: unknown) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  mockGetActiveSubscription.mockResolvedValue(subscription);
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

const expectNeutralCardStyle = (container: HTMLElement) => {
  expect(container.querySelector('.from-neutral-800')).toBeInTheDocument();
  expect(container.querySelector('.to-neutral-900')).toBeInTheDocument();
  expect(container.querySelector('.from-amber-500')).not.toBeInTheDocument();
  expect(container.querySelector('.to-amber-600')).not.toBeInTheDocument();
};

describe('TrialSidebarCard', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      currentCompany: createMockCompany({
        id: 'comp-1',
        isSubscribed: false,
        trialEndsAt: dateDaysFromNow(14),
      }),
    });
  });

  it('renders the trial countdown card while the company is in trial and has no pending payment', async () => {
    const { container } = renderBanner(<TrialSidebarCard />, null);

    expect(await screen.findByText(/Período de prueba/)).toBeInTheDocument();
    expect(screen.getByText(/días restantes/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Suscribirse/ })).toBeInTheDocument();
    expectNeutralCardStyle(container);
  });

  it('keeps the same neutral card style when the trial is close to ending', async () => {
    mockUseAuth.mockReturnValue({
      currentCompany: createMockCompany({
        id: 'comp-1',
        isSubscribed: false,
        trialEndsAt: dateDaysFromNow(2),
      }),
    });

    const { container } = renderBanner(<TrialSidebarCard />, null);

    expect(await screen.findByText(/Período de prueba/)).toBeInTheDocument();
    expect(screen.getByText(/días restantes/)).toBeInTheDocument();
    expectNeutralCardStyle(container);
  });

  it('renders a payment review card instead of the trial countdown when payment is pending during trial', async () => {
    const { container } = renderBanner(
      <TrialSidebarCard />,
      createMockSubscription({ status: 'approval_pending' })
    );

    expect(await screen.findByText('Pago en revisión')).toBeInTheDocument();
    expect(screen.getByText(/Estamos verificando tu transferencia/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver estado/ })).toBeInTheDocument();
    expect(screen.queryByText(/Período de prueba/)).not.toBeInTheDocument();
    expect(screen.queryByText(/días restantes/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Suscribirse/)).not.toBeInTheDocument();
    expectNeutralCardStyle(container);
  });

  it('renders a payment review card for an already subscribed company with a pending renewal payment', async () => {
    mockUseAuth.mockReturnValue({
      currentCompany: createMockCompany({
        id: 'comp-1',
        isSubscribed: true,
        trialEndsAt: undefined,
      }),
    });

    const { container } = renderBanner(
      <TrialSidebarCard />,
      createMockSubscription({ status: 'approval_pending' })
    );

    expect(await screen.findByText('Pago en revisión')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver estado/ })).toBeInTheDocument();
    expect(screen.queryByText(/Período de prueba/)).not.toBeInTheDocument();
    expectNeutralCardStyle(container);
  });
});

describe('TrialMobileIndicator', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      currentCompany: createMockCompany({
        id: 'comp-1',
        isSubscribed: false,
        trialEndsAt: dateDaysFromNow(14),
      }),
    });
  });

  it('renders the trial countdown mobile indicator with the shared neutral style', async () => {
    const { container } = renderBanner(<TrialMobileIndicator />, null);

    expect(await screen.findByText(/días de prueba/)).toBeInTheDocument();
    expect(screen.getByText(/Suscribirse/)).toBeInTheDocument();
    expectNeutralCardStyle(container);
  });

  it('renders the payment review mobile indicator with the shared neutral style', async () => {
    const { container } = renderBanner(
      <TrialMobileIndicator />,
      createMockSubscription({ status: 'approval_pending' })
    );

    expect(await screen.findByText('Pago en revisión')).toBeInTheDocument();
    expect(screen.getByText(/Ver estado/)).toBeInTheDocument();
    expect(screen.queryByText(/días de prueba/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Suscribirse/)).not.toBeInTheDocument();
    expectNeutralCardStyle(container);
  });
});
