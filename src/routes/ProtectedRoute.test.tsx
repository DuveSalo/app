import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Mock the AuthContext
const mockUseAuth = vi.fn();
vi.mock('../features/auth/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock SpinnerPage
vi.mock('../components/common/SpinnerPage', () => ({
    SpinnerPage: () => <div data-testid="spinner">Loading...</div>,
}));

// Helper to render ProtectedRoute with router
const renderWithRouter = (initialPath: string = '/dashboard') => {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route path="/login" element={<div data-testid="login-page">Login</div>} />
                <Route path="/create-company" element={
                    <ProtectedRoute>
                        <div data-testid="create-company-page">Create Company</div>
                    </ProtectedRoute>
                } />
                <Route path="/subscription" element={
                    <ProtectedRoute>
                        <div data-testid="subscription-page">Subscription</div>
                    </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <div data-testid="dashboard-page">Dashboard</div>
                    </ProtectedRoute>
                } />
            </Routes>
        </MemoryRouter>
    );
};

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show loading spinner when isLoading is true', () => {
        mockUseAuth.mockReturnValue({
            currentUser: null,
            currentCompany: null,
            isLoading: true,
        });

        renderWithRouter();
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should redirect to login when user is not authenticated', () => {
        mockUseAuth.mockReturnValue({
            currentUser: null,
            currentCompany: null,
            isLoading: false,
        });

        renderWithRouter();
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should redirect to create-company when user has no company', () => {
        mockUseAuth.mockReturnValue({
            currentUser: { id: '1', email: 'test@test.com', name: 'Test' },
            currentCompany: null,
            isLoading: false,
        });

        renderWithRouter();
        expect(screen.getByTestId('create-company-page')).toBeInTheDocument();
    });

    it('should redirect to subscription when company is not subscribed', () => {
        mockUseAuth.mockReturnValue({
            currentUser: { id: '1', email: 'test@test.com', name: 'Test' },
            currentCompany: { id: '1', name: 'Test Company', isSubscribed: false },
            isLoading: false,
        });

        renderWithRouter();
        expect(screen.getByTestId('subscription-page')).toBeInTheDocument();
    });

    it('should render children when user is fully authenticated with subscribed company', () => {
        mockUseAuth.mockReturnValue({
            currentUser: { id: '1', email: 'test@test.com', name: 'Test' },
            currentCompany: { id: '1', name: 'Test Company', isSubscribed: true },
            isLoading: false,
        });

        renderWithRouter();
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('should allow access to create-company page for user without company', () => {
        mockUseAuth.mockReturnValue({
            currentUser: { id: '1', email: 'test@test.com', name: 'Test' },
            currentCompany: null,
            isLoading: false,
        });

        renderWithRouter('/create-company');
        expect(screen.getByTestId('create-company-page')).toBeInTheDocument();
    });

    it('should allow access to subscription page for unsubscribed company', () => {
        mockUseAuth.mockReturnValue({
            currentUser: { id: '1', email: 'test@test.com', name: 'Test' },
            currentCompany: { id: '1', name: 'Test Company', isSubscribed: false },
            isLoading: false,
        });

        renderWithRouter('/subscription');
        expect(screen.getByTestId('subscription-page')).toBeInTheDocument();
    });
});
