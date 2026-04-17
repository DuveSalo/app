import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROUTE_PATHS } from '../../constants';

const mockUseAuth = vi.fn();
const mockUsePlans = vi.fn();
const mockNavigate = vi.fn();

const mockCreateCompany = vi.fn();
const mockActivateTrial = vi.fn();
const mockSubmitBankTransferPayment = vi.fn();

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../lib/hooks/usePlans', () => ({
  usePlans: (...args: unknown[]) => mockUsePlans(...args),
}));

vi.mock('../../lib/api/services', () => ({
  createCompany: (...args: unknown[]) => mockCreateCompany(...args),
  activateTrial: (...args: unknown[]) => mockActivateTrial(...args),
  submitBankTransferPayment: (...args: unknown[]) => mockSubmitBankTransferPayment(...args),
}));

vi.mock('./components/BankDetailsCard', () => ({
  BankDetailsCard: () => <div>Datos bancarios mock</div>,
}));

import SubscriptionPage from './SubscriptionPage';

type PlanFixture = {
  id: string;
  name: string;
  price: string;
  priceNumber: number;
  priceSuffix: string;
  features: string[];
  tag?: string;
};

function makePlan(overrides: Partial<PlanFixture>): PlanFixture {
  return {
    id: 'standard',
    name: 'Plan Standard',
    price: '$10.000',
    priceNumber: 10000,
    priceSuffix: '/mes',
    features: ['Acceso completo'],
    ...overrides,
  };
}

function renderSubscriptionPage() {
  return render(
    <MemoryRouter initialEntries={[ROUTE_PATHS.SUBSCRIPTION]}>
      <SubscriptionPage />
    </MemoryRouter>
  );
}

describe('SubscriptionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      currentCompany: null,
      currentUser: { id: 'user-1', email: 'test@example.com' },
      pendingCompanyData: { name: 'Colegio Test' },
      setCompany: vi.fn(),
      refreshCompany: vi.fn().mockResolvedValue(undefined),
    });

    mockUsePlans.mockReturnValue({
      plans: [
        makePlan({ id: 'standard' }),
        makePlan({
          id: 'trial',
          name: 'Prueba Gratis',
          price: '$0',
          priceNumber: 0,
          priceSuffix: '/14 dias',
        }),
      ],
      isLoading: false,
    });

    mockCreateCompany.mockResolvedValue({ id: 'company-1' });
    mockActivateTrial.mockResolvedValue(undefined);
    mockSubmitBankTransferPayment.mockResolvedValue(undefined);
  });

  it('falls back to the first available plan when the default id is missing', async () => {
    mockUsePlans.mockReturnValue({
      plans: [
        makePlan({ id: 'starter', name: 'Plan Starter' }),
        makePlan({ id: 'premium', name: 'Plan Premium', price: '$20.000', priceNumber: 20000 }),
      ],
      isLoading: false,
    });

    renderSubscriptionPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Plan Starter/ })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });
  });

  it('shows bank transfer details and Confirmar button for non-trial plans', async () => {
    renderSubscriptionPage();

    // Bank details always visible for non-trial plan
    expect(screen.getByText('Datos bancarios mock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activar prueba' })).not.toBeInTheDocument();

    // No payment method selector
    expect(screen.queryByText(/tarjeta de credito/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/transferencia bancaria/i)).not.toBeInTheDocument();
  });

  it('shows Activar prueba and hides bank details when trial plan is selected', async () => {
    renderSubscriptionPage();

    fireEvent.click(screen.getByRole('button', { name: /Prueba Gratis/ }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Activar prueba' })).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument();
    expect(screen.queryByText('Datos bancarios mock')).not.toBeInTheDocument();
  });

  it('navigates back to the company step', () => {
    renderSubscriptionPage();

    fireEvent.click(screen.getByRole('button', { name: /Volver/ }));

    expect(mockNavigate).toHaveBeenCalledWith(ROUTE_PATHS.CREATE_COMPANY);
  });
});
