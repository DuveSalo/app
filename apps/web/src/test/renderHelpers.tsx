import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { vi } from 'vitest';
import type { User, Company } from '@/types';
import { createMockUser, createMockCompany } from '@/test/factories';

interface RouterOptions {
  initialEntries?: string[];
}

/**
 * Wraps component with MemoryRouter for route testing.
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: RouterOptions & Omit<RenderOptions, 'wrapper'>,
) {
  const { initialEntries = ['/'], ...renderOptions } = options ?? {};

  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    ),
    ...renderOptions,
  });
}

interface AuthOptions extends RouterOptions {
  user?: User | null;
  company?: Company | null;
  isAdmin?: boolean;
  isLoading?: boolean;
}

/**
 * Wraps component with a mocked AuthContext + MemoryRouter.
 *
 * IMPORTANT: The test file must mock `@/lib/auth/AuthContext` before importing
 * this helper, following the same pattern as ProtectedRoute.test.tsx:
 *
 * ```ts
 * const mockUseAuth = vi.fn();
 * vi.mock('@/lib/auth/AuthContext', () => ({
 *   useAuth: () => mockUseAuth(),
 * }));
 * ```
 *
 * This helper configures `mockUseAuth` with the provided user/company/isAdmin
 * values and renders the component inside a MemoryRouter.
 */
export function renderWithAuth(
  ui: ReactElement,
  mockUseAuth: ReturnType<typeof vi.fn>,
  options?: AuthOptions & Omit<RenderOptions, 'wrapper'>,
) {
  const {
    user = createMockUser(),
    company = createMockCompany(),
    isAdmin = false,
    isLoading = false,
    initialEntries = ['/'],
    ...renderOptions
  } = options ?? {};

  mockUseAuth.mockReturnValue({
    currentUser: user,
    currentCompany: company,
    isAdmin,
    isLoading,
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

  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    ),
    ...renderOptions,
  });
}
