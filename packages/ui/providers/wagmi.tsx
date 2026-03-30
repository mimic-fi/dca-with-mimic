'use client'

import React from 'react'
import { cookieStorage, cookieToInitialState, createStorage, WagmiProvider } from 'wagmi'
import { mainnet, optimism, gnosis, arbitrum, base } from 'wagmi/chains'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

export const config = getDefaultConfig({
  appName: 'Mimic',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [mainnet, optimism, gnosis, arbitrum, base],
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
})

interface Props {
  children: React.ReactNode
  cookies: string | null
}

export default function WalletProvider({ children, cookies }: Props) {
  const initialState = cookieToInitialState(config, cookies)

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <RainbowKitProvider>{children}</RainbowKitProvider>
    </WagmiProvider>
  )
}
