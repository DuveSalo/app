import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAuth = vi.fn();
const mockSendPasswordResetEmail = vi.fn();

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/lib/api/services', () => ({
  sendPasswordResetEmail: (...args: unknown[]) => mockSendPasswordResetEmail(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import LoginForm from './LoginForm';

function renderLoginForm() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginForm />
    </MemoryRouter>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      login: vi.fn().mockResolvedValue(undefined),
      loginWithGoogle: vi.fn().mockResolvedValue(undefined),
    });

    mockSendPasswordResetEmail.mockResolvedValue(undefined);
  });

  it('renders the login fields, Google CTA, and register link', () => {
    renderLoginForm();

    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('--------')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar con Google/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Registrate' })).toBeInTheDocument();
  });

  it('switches into forgot password mode and shows the confirmation state', async () => {
    renderLoginForm();

    fireEvent.click(screen.getByRole('button', { name: 'Olvidaste?' }));

    expect(screen.getByText('Restablecer contraseña')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    await waitFor(() => {
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
    });

    expect(await screen.findByText('Revisa tu email')).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
  });
});
