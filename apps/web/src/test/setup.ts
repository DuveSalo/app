import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup DOM after each test
afterEach(() => {
    cleanup();
});

// Mock matchMedia for components that use responsive features
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
    }),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
    observe = () => null;
    disconnect = () => null;
    unobserve = () => null;
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
    observe = () => null;
    disconnect = () => null;
    unobserve = () => null;
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: MockResizeObserver,
});

// Global Supabase client mock
vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
            getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
            signInWithOAuth: vi.fn(),
            signOut: vi.fn(),
        },
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            then: vi.fn(),
        }),
        storage: {
            from: vi.fn().mockReturnValue({
                upload: vi.fn().mockResolvedValue({ data: null, error: null }),
                getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: '' } }),
                remove: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
        },
        functions: {
            invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
        },
    },
}));
