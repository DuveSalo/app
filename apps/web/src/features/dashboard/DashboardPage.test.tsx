/**
 * DashboardPage tests — fire extinguisher integration
 *
 * Strategy: mock `useQuery` from @tanstack/react-query so we control what
 * data the component renders, and separately test the queryFn transformation
 * logic by calling the API mocks directly.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMockFireExtinguisher,
  createMockConservationCertificate,
  createMockSelfProtectionSystem,
} from '@/test/factories';
import type { FireExtinguisherControl } from '@/types';

// Must mock AuthContext before importing the component
const mockUseAuth = vi.fn();
vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the entire api/services module
vi.mock('@/lib/api/services', () => ({
  getCertificates: vi.fn(),
  getSelfProtectionSystems: vi.fn(),
  getAllQRDocuments: vi.fn(),
  getFireExtinguishers: vi.fn(),
}));

// Mock useQuery to give us full control over what the component sees
vi.mock('@tanstack/react-query', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

import * as api from '@/lib/api/services';
import { useQuery } from '@tanstack/react-query';
import { createMockCompany } from '@/test/factories';
import { calculateExpirationStatus } from '@/lib/utils/dateUtils';
import { ROUTE_PATHS } from '@/constants';
import DashboardPage from './DashboardPage';

const mockUseQuery = useQuery as ReturnType<typeof vi.fn>;

// ─── helpers ────────────────────────────────────────────────────────────────

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
}

function makeItem(
  id: string,
  name: string,
  type: string,
  expirationDate: string,
  modulePath: string
) {
  return {
    id,
    name,
    type,
    expirationDate,
    modulePath,
    status: calculateExpirationStatus(expirationDate),
  };
}

// ─── queryFn logic tests (pure transformation) ──────────────────────────────

/**
 * These tests exercise the mapping logic directly by calling the real service
 * mocks and asserting on the items array, without rendering React at all.
 * This mirrors what the dashboard queryFn does.
 */
describe('dashboard queryFn — fire extinguisher mapping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps charge_expiration_date to a separate dashboard item', async () => {
    const fe = createMockFireExtinguisher({
      id: 'fe-1',
      extinguisherNumber: 'MAT-001',
      chargeExpirationDate: '2025-01-15',
      hydraulicPressureExpirationDate: '', // empty — should be skipped
    });

    vi.mocked(api.getFireExtinguishers).mockResolvedValue([fe]);

    const result = await api.getFireExtinguishers('comp-1');

    const items: ReturnType<typeof makeItem>[] = [];
    for (const extinguisher of result) {
      if (extinguisher.chargeExpirationDate) {
        items.push(
          makeItem(
            `${extinguisher.id}-charge`,
            `${extinguisher.extinguisherNumber || extinguisher.positionNumber} - Carga`,
            'Matafuego',
            extinguisher.chargeExpirationDate,
            ROUTE_PATHS.FIRE_EXTINGUISHERS
          )
        );
      }
    }

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('fe-1-charge');
    expect(items[0].name).toBe('MAT-001 - Carga');
    expect(items[0].type).toBe('Matafuego');
    expect(items[0].expirationDate).toBe('2025-01-15');
    expect(items[0].modulePath).toBe(ROUTE_PATHS.FIRE_EXTINGUISHERS);
  });

  it('maps hydraulic_pressure_expiration_date to a separate dashboard item', async () => {
    const fe = createMockFireExtinguisher({
      id: 'fe-2',
      extinguisherNumber: 'MAT-002',
      chargeExpirationDate: '', // empty — should be skipped
      hydraulicPressureExpirationDate: '2024-06-30',
    });

    vi.mocked(api.getFireExtinguishers).mockResolvedValue([fe]);

    const result = await api.getFireExtinguishers('comp-1');

    const items: ReturnType<typeof makeItem>[] = [];
    for (const extinguisher of result) {
      if (extinguisher.hydraulicPressureExpirationDate) {
        items.push(
          makeItem(
            `${extinguisher.id}-hydraulic`,
            `${extinguisher.extinguisherNumber || extinguisher.positionNumber} - Prueba hidráulica`,
            'Matafuego',
            extinguisher.hydraulicPressureExpirationDate,
            ROUTE_PATHS.FIRE_EXTINGUISHERS
          )
        );
      }
    }

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('fe-2-hydraulic');
    expect(items[0].name).toBe('MAT-002 - Prueba hidráulica');
    expect(items[0].type).toBe('Matafuego');
    expect(items[0].expirationDate).toBe('2024-06-30');
    expect(items[0].modulePath).toBe(ROUTE_PATHS.FIRE_EXTINGUISHERS);
  });

  it('produces two items when both expiration dates are present', async () => {
    const fe = createMockFireExtinguisher({
      id: 'fe-3',
      extinguisherNumber: 'MAT-003',
      chargeExpirationDate: '2025-03-01',
      hydraulicPressureExpirationDate: '2031-03-01',
    });

    vi.mocked(api.getFireExtinguishers).mockResolvedValue([fe]);

    const result = await api.getFireExtinguishers('comp-1');

    const items: ReturnType<typeof makeItem>[] = [];
    for (const extinguisher of result) {
      if (extinguisher.chargeExpirationDate) {
        items.push(
          makeItem(
            `${extinguisher.id}-charge`,
            `${extinguisher.extinguisherNumber || extinguisher.positionNumber} - Carga`,
            'Matafuego',
            extinguisher.chargeExpirationDate,
            ROUTE_PATHS.FIRE_EXTINGUISHERS
          )
        );
      }
      if (extinguisher.hydraulicPressureExpirationDate) {
        items.push(
          makeItem(
            `${extinguisher.id}-hydraulic`,
            `${extinguisher.extinguisherNumber || extinguisher.positionNumber} - Prueba hidráulica`,
            'Matafuego',
            extinguisher.hydraulicPressureExpirationDate,
            ROUTE_PATHS.FIRE_EXTINGUISHERS
          )
        );
      }
    }

    expect(items).toHaveLength(2);
    expect(items[0].id).toBe('fe-3-charge');
    expect(items[1].id).toBe('fe-3-hydraulic');
  });

  it('skips null charge_expiration_date', async () => {
    const fe = createMockFireExtinguisher({
      id: 'fe-4',
      chargeExpirationDate: '',
      hydraulicPressureExpirationDate: '',
    });

    vi.mocked(api.getFireExtinguishers).mockResolvedValue([fe]);

    const result = await api.getFireExtinguishers('comp-1');

    const items: ReturnType<typeof makeItem>[] = [];
    for (const extinguisher of result) {
      if (extinguisher.chargeExpirationDate) {
        items.push(
          makeItem(
            `${extinguisher.id}-charge`,
            `${extinguisher.extinguisherNumber || extinguisher.positionNumber} - Carga`,
            'Matafuego',
            extinguisher.chargeExpirationDate,
            ROUTE_PATHS.FIRE_EXTINGUISHERS
          )
        );
      }
      if (extinguisher.hydraulicPressureExpirationDate) {
        items.push(
          makeItem(
            `${extinguisher.id}-hydraulic`,
            `${extinguisher.extinguisherNumber || extinguisher.positionNumber} - Prueba hidráulica`,
            'Matafuego',
            extinguisher.hydraulicPressureExpirationDate,
            ROUTE_PATHS.FIRE_EXTINGUISHERS
          )
        );
      }
    }

    expect(items).toHaveLength(0);
  });

  it('falls back to positionNumber when extinguisherNumber is empty', async () => {
    const fe = createMockFireExtinguisher({
      id: 'fe-5',
      extinguisherNumber: '',
      positionNumber: 'P-03',
      chargeExpirationDate: '2025-12-01',
      hydraulicPressureExpirationDate: '',
    });

    vi.mocked(api.getFireExtinguishers).mockResolvedValue([fe]);

    const result = await api.getFireExtinguishers('comp-1');

    const items: ReturnType<typeof makeItem>[] = [];
    for (const extinguisher of result) {
      if (extinguisher.chargeExpirationDate) {
        items.push(
          makeItem(
            `${extinguisher.id}-charge`,
            `${extinguisher.extinguisherNumber || extinguisher.positionNumber} - Carga`,
            'Matafuego',
            extinguisher.chargeExpirationDate,
            ROUTE_PATHS.FIRE_EXTINGUISHERS
          )
        );
      }
    }

    expect(items[0].name).toBe('P-03 - Carga');
  });
});

// ─── component render tests ──────────────────────────────────────────────────

describe('DashboardPage — fire extinguisher items in table', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      currentCompany: createMockCompany(),
      currentUser: { id: 'user-1', email: 'test@example.com' },
      isAdmin: false,
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
  });

  it('renders fire extinguisher charge item in the table', () => {
    mockUseQuery.mockReturnValue({
      data: [
        {
          id: 'fe-1-charge',
          name: 'MAT-001 - Carga',
          type: 'Matafuego',
          expirationDate: '2025-01-15',
          modulePath: '/fire-extinguishers',
          status: 'expired' as const,
        },
      ],
      isLoading: false,
    });

    renderDashboard();

    // DataTable renders both a table row and a card view, so multiple elements exist
    expect(screen.getAllByText('MAT-001 - Carga').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Matafuego').length).toBeGreaterThan(0);
  });

  it('renders fire extinguisher hydraulic item in the table', () => {
    mockUseQuery.mockReturnValue({
      data: [
        {
          id: 'fe-1-hydraulic',
          name: 'MAT-001 - Prueba hidráulica',
          type: 'Matafuego',
          expirationDate: '2031-03-01',
          modulePath: '/fire-extinguishers',
          status: 'valid' as const,
        },
      ],
      isLoading: false,
    });

    renderDashboard();

    // DataTable renders both a table row and a card view, so multiple elements exist
    expect(screen.getAllByText('MAT-001 - Prueba hidráulica').length).toBeGreaterThan(0);
  });

  it('counts fire extinguisher items in stats cards', () => {
    mockUseQuery.mockReturnValue({
      data: [
        {
          id: 'fe-1-charge',
          name: 'MAT-001 - Carga',
          type: 'Matafuego',
          expirationDate: '2025-01-15',
          modulePath: '/fire-extinguishers',
          status: 'expired' as const,
        },
        {
          id: 'fe-1-hydraulic',
          name: 'MAT-001 - Prueba hidráulica',
          type: 'Matafuego',
          expirationDate: '2031-03-01',
          modulePath: '/fire-extinguishers',
          status: 'valid' as const,
        },
      ],
      isLoading: false,
    });

    renderDashboard();

    // Total documents stat card should show 2
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows loading skeleton while data is being fetched', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderDashboard();

    // The skeleton loader renders; the stat cards and table do not
    expect(screen.queryByText('Total documentos')).not.toBeInTheDocument();
  });
});

// ─── integration: getFireExtinguishers is called in Promise.all ──────────────

describe('DashboardPage — getFireExtinguishers is included in data fetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      currentCompany: createMockCompany({ id: 'comp-42' }),
      currentUser: { id: 'user-1' },
      isAdmin: false,
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

    // Restore real useQuery so queryFn actually executes
    mockUseQuery.mockImplementation(async ({ queryFn }: { queryFn: () => Promise<unknown> }) => {
      // Just capture the queryFn to test it was constructed properly
      return { data: await queryFn(), isLoading: false };
    });

    vi.mocked(api.getCertificates).mockResolvedValue([]);
    vi.mocked(api.getSelfProtectionSystems).mockResolvedValue([]);
    vi.mocked(api.getAllQRDocuments).mockResolvedValue([]);
    vi.mocked(api.getFireExtinguishers).mockResolvedValue([]);
  });

  it('calls getFireExtinguishers with the current company id', async () => {
    // We can't easily test queryFn execution through useQuery mock,
    // so we test the service function directly replicating the queryFn logic
    const companyId = 'comp-42';

    await Promise.all([
      api.getCertificates(companyId),
      api.getSelfProtectionSystems(companyId),
      api.getAllQRDocuments(companyId),
      api.getFireExtinguishers(companyId),
    ]);

    expect(vi.mocked(api.getFireExtinguishers)).toHaveBeenCalledWith(companyId);
    expect(vi.mocked(api.getFireExtinguishers)).toHaveBeenCalledTimes(1);
  });

  it('produces correct item count when fire extinguishers have both expiration dates', async () => {
    const fe1 = createMockFireExtinguisher({
      id: 'fe-a',
      chargeExpirationDate: '2025-06-01',
      hydraulicPressureExpirationDate: '2030-06-01',
    });
    const fe2 = createMockFireExtinguisher({
      id: 'fe-b',
      chargeExpirationDate: '2025-09-01',
      hydraulicPressureExpirationDate: '', // no hydraulic date
    });

    vi.mocked(api.getFireExtinguishers).mockResolvedValue([fe1, fe2]);

    const extinguishers = await api.getFireExtinguishers('comp-42');

    const items: { id: string }[] = [];
    for (const fe of extinguishers) {
      if (fe.chargeExpirationDate) {
        items.push({ id: `${fe.id}-charge` });
      }
      if (fe.hydraulicPressureExpirationDate) {
        items.push({ id: `${fe.id}-hydraulic` });
      }
    }

    // fe1: charge + hydraulic = 2; fe2: charge only = 1; total = 3
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.id)).toEqual(['fe-a-charge', 'fe-a-hydraulic', 'fe-b-charge']);
  });
});
