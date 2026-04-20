import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

// Mock AuthContext BEFORE importing component
const mockUseAuth = vi.fn();
vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock react-router-dom — provide useParams with a fixed id and a no-op useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: () => ({ id: 'school-1' }),
    useNavigate: () => mockNavigate,
  };
});

// Mock the entire services barrel — only stub what the component uses
const mockGetSchoolDetail = vi.fn();
const mockGetSchoolDocumentCounts = vi.fn();
const mockGetSchoolPaymentHistory = vi.fn();
vi.mock('@/lib/api/services', () => ({
  getSchoolDetail: (...args: unknown[]) => mockGetSchoolDetail(...args),
  getSchoolDocumentCounts: (...args: unknown[]) => mockGetSchoolDocumentCounts(...args),
  getSchoolPaymentHistory: (...args: unknown[]) => mockGetSchoolPaymentHistory(...args),
}));

// Mock sonner to avoid ESM issues in jsdom
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
  Toaster: () => null,
}));

import { renderWithAuth } from '@/test/renderHelpers';
import { createMockCompany } from '@/test/factories';
import AdminSchoolDetailPage from './AdminSchoolDetailPage';
import type { AdminSchoolDetail } from './types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeSchool(overrides?: Partial<AdminSchoolDetail>): AdminSchoolDetail {
  return {
    id: 'school-1',
    name: 'Escuela Test',
    cuit: '30-12345678-9',
    address: 'Av. Test 123',
    city: 'Buenos Aires',
    province: 'Buenos Aires',
    locality: 'CABA',
    postalCode: 'C1000',
    phone: '+541155551234',
    email: 'test@escuela.com',
    plan: 'basic',
    subscriptionStatus: 'active',
    paymentMethod: null,
    bankTransferStatus: null,
    isSubscribed: true,
    trialEndsAt: null,
    subscriptionRenewalDate: null,
    createdAt: '2026-01-01T00:00:00Z',
    employees: [],
    services: null,
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AdminSchoolDetailPage — Método de pago InfoItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      currentUser: { id: 'admin-1', name: 'Admin', email: 'admin@test.com' },
      currentCompany: createMockCompany(),
      isAdmin: true,
      isLoading: false,
      pendingCompanyData: null,
      login: vi.fn(),
      register: vi.fn(),
      resendConfirmationEmail: vi.fn(),
      verifyEmailOtp: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      setCompany: vi.fn(),
      setPendingCompanyData: vi.fn(),
      refreshCompany: vi.fn(),
      updateUserDetails: vi.fn(),
    });

    // Default: no payments, no document counts
    mockGetSchoolPaymentHistory.mockResolvedValue([]);
    mockGetSchoolDocumentCounts.mockResolvedValue({});
  });

  it('renders em-dash (—) when paymentMethod is null and no payments exist', async () => {
    mockGetSchoolDetail.mockResolvedValue(makeSchool({ paymentMethod: null }));

    renderWithAuth(<AdminSchoolDetailPage />, mockUseAuth);

    await waitFor(() => {
      expect(screen.getByText('Método de pago')).toBeInTheDocument();
    });

    // The InfoItem for "Método de pago" must show — (em-dash U+2014), not a hyphen
    const label = screen.getByText('Método de pago');
    const valueEl = label.nextElementSibling;
    expect(valueEl).not.toBeNull();
    expect(valueEl!.textContent).toBe('\u2014');
  });

  it('renders "Transferencia bancaria" when paymentMethod is "bank_transfer"', async () => {
    mockGetSchoolDetail.mockResolvedValue(makeSchool({ paymentMethod: 'bank_transfer' }));

    renderWithAuth(<AdminSchoolDetailPage />, mockUseAuth);

    await waitFor(() => {
      expect(screen.getByText('Transferencia bancaria')).toBeInTheDocument();
    });
  });

  it('does not render trial end for an active subscribed school', async () => {
    mockGetSchoolDetail.mockResolvedValue(
      makeSchool({
        isSubscribed: true,
        subscriptionStatus: 'active',
        trialEndsAt: '2026-05-01T00:00:00Z',
        subscriptionRenewalDate: '2026-06-01',
      })
    );

    renderWithAuth(<AdminSchoolDetailPage />, mockUseAuth);

    await waitFor(() => {
      expect(screen.getByText('Fecha de renovación')).toBeInTheDocument();
    });

    expect(screen.queryByText('Fin del período de prueba')).not.toBeInTheDocument();
  });
});
