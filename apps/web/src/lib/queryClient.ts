import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
