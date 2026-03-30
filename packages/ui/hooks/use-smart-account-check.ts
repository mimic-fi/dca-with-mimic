'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { getBytecode } from '@wagmi/core'
import { Chain } from '@/lib/chains'
import { EIP7702_SMART_ACCOUNT } from '@/lib/constants'

export function useSmartAccountCheck(chain: Chain) {
  const { address, isConnected } = useAccount()
  const wagmiConfig = useConfig()

  const [isSmartAccount, setIsSmartAccount] = useState<boolean | null>(null)
  const [isSmartAccountLoading, setIsSmartAccountLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function check() {
      if (!isConnected || !address) {
        setIsSmartAccount(null)
        setIsSmartAccountLoading(false)
        return
      }

      setIsSmartAccountLoading(true)

      try {
        const code = await getBytecode(wagmiConfig, { chainId: chain.id, address })
        const delegated = !!code && code.toLowerCase() == EIP7702_SMART_ACCOUNT
        if (!cancelled) setIsSmartAccount(delegated)
      } catch (err) {
        console.error('Delegation check error', err)
        if (!cancelled) setIsSmartAccount(null)
      } finally {
        if (!cancelled) setIsSmartAccountLoading(false)
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [isConnected, address, chain, wagmiConfig])

  return { isSmartAccount, isSmartAccountLoading }
}
