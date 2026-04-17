import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createMockPaymentTransaction } from '@/test/factories';
import { PaymentHistorySection } from './PaymentHistorySection';

describe('PaymentHistorySection', () => {
  it('renders approved and rejected manual bank-transfer payment statuses', () => {
    render(
      <PaymentHistorySection
        payments={[
          createMockPaymentTransaction({ id: 'pay-1', status: 'approved', grossAmount: 5000 }),
          createMockPaymentTransaction({ id: 'pay-2', status: 'rejected', grossAmount: 7000 }),
        ]}
      />
    );

    expect(screen.getByText('Aprobado')).toBeInTheDocument();
    expect(screen.getByText('Rechazado')).toBeInTheDocument();
    expect(screen.getByText(/\$\s*5\.000/)).toBeInTheDocument();
    expect(screen.getByText(/\$\s*7\.000/)).toBeInTheDocument();
  });
});
