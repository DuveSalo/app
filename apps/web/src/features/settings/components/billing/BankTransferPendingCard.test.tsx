import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BankTransferPendingCard } from './BankTransferPendingCard';

describe('BankTransferPendingCard', () => {
  it('renders the plan name passed as prop', () => {
    render(<BankTransferPendingCard planName="Básico" />);
    expect(screen.getByText(/Básico/)).toBeInTheDocument();
  });

  it('renders the "Pago pendiente de aprobación" heading', () => {
    render(<BankTransferPendingCard planName="Básico" />);
    expect(screen.getByText('Pago pendiente de aprobación')).toBeInTheDocument();
  });

  it('renders the "En revisión" status badge', () => {
    render(<BankTransferPendingCard planName="Básico" />);
    expect(screen.getByText('En revisión')).toBeInTheDocument();
  });

  it('renders reassurance copy about email notification', () => {
    render(<BankTransferPendingCard planName="Básico" />);
    expect(screen.getByText(/notificar por email/)).toBeInTheDocument();
  });
});
