import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry(failureCount, error) {
        const status = error?.response?.status
        return failureCount < 1 && (status === undefined || status >= 500)
      },
    },
  },
})
