'use client'

import { isServer, QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) return makeQueryClient()
  else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return <TanstackQueryClientProvider client={queryClient}>{children}</TanstackQueryClientProvider>
}
