import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock AuthContext BEFORE importing component
const mockUseAuth = vi.fn();
vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock bank transfer API service
const mockGetLatestManualPayment = vi.fn();
vi.mock('@/lib/api/services/bankTransfer', () => ({
  getLatestManualPayment: (...args: unknown[]) => mockGetLatestManualPayment(...args),
}));

// Mock AuthLayout
vi.mock('../../components/layout/AuthLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-layout">{children}</div>
  ),
}));

import BankTransferStatusPage from './BankTransferStatusPage';

const defaultCompany = { id: 'company-1', name: 'Test School' };

const renderPage = () => {
  return render(
    <MemoryRouter>
      <BankTransferStatusPage />
    </MemoryRouter>
  );
};

describe('BankTransferStatusPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      currentCompany: defaultCompany,
      logout: vi.fn(),
      refreshCompany: vi.fn(),
    });
  });

  describe('when payment status is pending', () => {
    beforeEach(() => {
      mockGetLatestManualPayment.mockResolvedValue({
        status: 'pending',
        rejectionReason: null,
        receiptUrl: null,
      });
    });

    it('should render pending state without rejection dialog', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Pago pendiente de verificacion')).toBeInTheDocument();
      });

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  describe('when payment status is rejected', () => {
    beforeEach(() => {
      mockGetLatestManualPayment.mockResolvedValue({
        status: 'rejected',
        rejectionReason: 'El comprobante no es legible',
        receiptUrl: null,
      });
    });

    it('should show rejection AlertDialog on load', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });
    });

    it('should show "Pago rechazado" as dialog title', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveTextContent('Pago rechazado');
    });

    it('should show rejection reason in the dialog', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveTextContent('El comprobante no es legible');
    });

    it('should dismiss dialog when "Entendido" button is clicked', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Entendido'));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should show normal rejected UI after dialog is dismissed', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Entendido'));

      await waitFor(() => {
        expect(screen.getByText('Subir nuevo comprobante')).toBeInTheDocument();
      });
    });
  });

  describe('when payment status is rejected without reason', () => {
    beforeEach(() => {
      mockGetLatestManualPayment.mockResolvedValue({
        status: 'rejected',
        rejectionReason: null,
        receiptUrl: null,
      });
    });

    it('should show AlertDialog without rejection reason box', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      expect(
        screen.queryByText('El comprobante no es legible')
      ).not.toBeInTheDocument();
    });
  });
});
