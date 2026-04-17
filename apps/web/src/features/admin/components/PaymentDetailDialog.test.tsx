import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentDetailDialog } from './PaymentDetailDialog';
import type { AdminPaymentRow } from '../types';

// Base payment factory
function makePayment(overrides?: Partial<AdminPaymentRow>): AdminPaymentRow {
  return {
    id: 'pay-1',
    companyId: 'comp-1',
    companyName: 'Escuela Test',
    amount: 5000,
    periodStart: '2026-03-01',
    periodEnd: '2026-04-01',
    status: 'pending',
    createdAt: '2026-03-01T00:00:00Z',
    rejectionReason: null,
    receiptUrl: null,
    paymentMethod: 'bank_transfer',
    ...overrides,
  };
}

describe('PaymentDetailDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onViewReceipt: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Approve/Reject buttons visibility', () => {
    it('shows approve and reject buttons for pending bank_transfer payments', () => {
      const payment = makePayment({ status: 'pending', paymentMethod: 'bank_transfer' });
      const onApprove = vi.fn();
      const onReject = vi.fn();

      render(
        <PaymentDetailDialog
          {...defaultProps}
          payment={payment}
          onApprove={onApprove}
          onReject={onReject}
        />
      );

      expect(screen.getByRole('button', { name: /aprobar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /rechazar/i })).toBeInTheDocument();
    });

    it('does NOT show approve/reject buttons for approved payments', () => {
      const payment = makePayment({ status: 'approved', paymentMethod: 'bank_transfer' });
      const onApprove = vi.fn();
      const onReject = vi.fn();

      render(
        <PaymentDetailDialog
          {...defaultProps}
          payment={payment}
          onApprove={onApprove}
          onReject={onReject}
        />
      );

      expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /rechazar/i })).not.toBeInTheDocument();
    });

    it('does NOT show approve/reject buttons for rejected payments', () => {
      const payment = makePayment({ status: 'rejected', paymentMethod: 'bank_transfer' });
      const onApprove = vi.fn();
      const onReject = vi.fn();

      render(
        <PaymentDetailDialog
          {...defaultProps}
          payment={payment}
          onApprove={onApprove}
          onReject={onReject}
        />
      );

      expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /rechazar/i })).not.toBeInTheDocument();
    });

    it('does NOT show approve/reject buttons when onApprove/onReject are not provided', () => {
      const payment = makePayment({ status: 'pending', paymentMethod: 'bank_transfer' });

      render(<PaymentDetailDialog {...defaultProps} payment={payment} />);

      expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /rechazar/i })).not.toBeInTheDocument();
    });
  });

  describe('Receipt action', () => {
    it('shows a disabled "Ver PDF" button when the payment has no receipt yet', () => {
      const payment = makePayment({
        receiptUrl: null,
        paymentMethod: 'bank_transfer',
      });

      render(<PaymentDetailDialog {...defaultProps} payment={payment} />);

      expect(screen.getByRole('button', { name: /ver pdf/i })).toBeDisabled();
    });

    it('shows a "Ver PDF" button when the payment has a receipt', () => {
      const payment = makePayment({
        receiptUrl: 'comp-1/pay-1.pdf',
        paymentMethod: 'bank_transfer',
      });
      const onViewReceipt = vi.fn();

      render(
        <PaymentDetailDialog
          {...defaultProps}
          payment={payment}
          onViewReceipt={onViewReceipt}
        />
      );

      const viewPdfButton = screen.getByRole('button', { name: /ver pdf/i });
      expect(viewPdfButton).toBeInTheDocument();

      fireEvent.click(viewPdfButton);

      expect(onViewReceipt).toHaveBeenCalledOnce();
      expect(onViewReceipt).toHaveBeenCalledWith(payment);
    });
  });

  describe('Approve action', () => {
    it('renders the approve button with the outline variant', () => {
      const payment = makePayment({
        status: 'pending',
        paymentMethod: 'bank_transfer',
      });
      const onApprove = vi.fn();
      const onReject = vi.fn();

      render(
        <PaymentDetailDialog
          {...defaultProps}
          payment={payment}
          onApprove={onApprove}
          onReject={onReject}
        />
      );

      expect(screen.getByRole('button', { name: /aprobar/i })).toHaveAttribute(
        'data-variant',
        'outline'
      );
    });

    it('calls onApprove with payment id when Aprobar is clicked', () => {
      const payment = makePayment({
        id: 'pay-42',
        status: 'pending',
        paymentMethod: 'bank_transfer',
      });
      const onApprove = vi.fn();
      const onReject = vi.fn();

      render(
        <PaymentDetailDialog
          {...defaultProps}
          payment={payment}
          onApprove={onApprove}
          onReject={onReject}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /aprobar/i }));

      expect(onApprove).toHaveBeenCalledOnce();
      expect(onApprove).toHaveBeenCalledWith('pay-42');
    });
  });

  describe('Reject action', () => {
    it('opens RejectPaymentDialog when Rechazar is clicked', () => {
      const payment = makePayment({ status: 'pending', paymentMethod: 'bank_transfer' });
      const onApprove = vi.fn();
      const onReject = vi.fn();

      render(
        <PaymentDetailDialog
          {...defaultProps}
          payment={payment}
          onApprove={onApprove}
          onReject={onReject}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /rechazar/i }));

      // RejectPaymentDialog is an AlertDialog — its title heading should appear
      expect(screen.getByRole('heading', { name: /rechazar pago/i })).toBeInTheDocument();
    });

    it('calls onReject with paymentId and reason after confirming in RejectPaymentDialog', () => {
      const payment = makePayment({
        id: 'pay-99',
        status: 'pending',
        paymentMethod: 'bank_transfer',
      });
      const onApprove = vi.fn();
      const onReject = vi.fn();

      render(
        <PaymentDetailDialog
          {...defaultProps}
          payment={payment}
          onApprove={onApprove}
          onReject={onReject}
        />
      );

      // Open RejectPaymentDialog
      fireEvent.click(screen.getByRole('button', { name: /rechazar/i }));

      // Type a reason
      const textarea = screen.getByPlaceholderText(/motivo del rechazo/i);
      fireEvent.change(textarea, { target: { value: 'Comprobante ilegible' } });

      // Confirm rejection
      fireEvent.click(screen.getByRole('button', { name: /rechazar pago/i }));

      expect(onReject).toHaveBeenCalledOnce();
      expect(onReject).toHaveBeenCalledWith('pay-99', 'Comprobante ilegible');
    });
  });
});
