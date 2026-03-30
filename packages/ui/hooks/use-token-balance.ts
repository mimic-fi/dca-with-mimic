'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { fetchTokenBalance } from '@/lib/balance'
import { Chain } from '@/lib/chains'
import { Token } from '@/lib/tokens'

export function useTokenBalance(chain: Chain, token: Token, debounceMs = 250) {
  const { address, isConnected } = useAccount()
  const [tokenBalance, setTokenBalance] = useState<string | null>(null)
  const [isTokenBalanceLoading, setIsTokenBalanceLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!isConnected || !address) {
        setTokenBalance(null)
        setIsTokenBalanceLoading(false)
        return
      }

      setIsTokenBalanceLoading(true)
      try {
        const balance = await fetchTokenBalance({ chain, token, owner: address })
        if (!cancelled) setTokenBalance(balance)
      } catch (error) {
        console.error('Token balance fetch error', error)
        if (!cancelled) setTokenBalance(null)
      } finally {
        if (!cancelled) setIsTokenBalanceLoading(false)
      }
    }

    const timeout = setTimeout(run, debounceMs)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [chain, token, isConnected, address, debounceMs])

  return { tokenBalance, isTokenBalanceLoading }
}
