'use client'

import QueryClientProvider from './react-query'
import WalletProvider from './wagmi'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function Providers({ children, cookies }: { children: React.ReactNode; cookies: string | null }) {
  return (
    <QueryClientProvider>
      <WalletProvider cookies={cookies}>
        <TooltipProvider>{children}</TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  )
}
