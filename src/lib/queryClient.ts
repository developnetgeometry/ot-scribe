import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof Error && 'status' in error && 
              typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false, // Prevent excessive refetching
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
        onError: (error) => {
          console.error('Mutation error:', error);
        },
      },
    },
  });
};