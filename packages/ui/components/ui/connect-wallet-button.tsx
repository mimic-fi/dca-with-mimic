'use client'

import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import type { Connector } from 'wagmi'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

const WALLET_LOGOS: Record<string, string> = {
  metamask: '/assets/wallets/Metamask.svg',
  walletconnect: '/assets/wallets/WalletConnect.svg',
  coinbasewallet: '/assets/wallets/Coinbase.svg',
  'io.rabby': '/assets/wallets/Rabby.svg',
  trustwallet: '/assets/wallets/Trust.svg',
}

function normalizeConnectorKey(connector?: Connector | null): string | null {
  if (!connector) return null

  const candidates = [connector.type, connector.name, connector.id]

  for (const c of candidates) {
    if (!c) continue
    const key = String(c).replace(/\s+/g, '').toLowerCase()
    if (WALLET_LOGOS[key]) return key
  }

  return null
}

export default function ConnectWalletButton({ className }: Props) {
  const { connector } = useAccount()
  const connectorKey = normalizeConnectorKey(connector)
  const walletLogo =
    connectorKey && WALLET_LOGOS[connectorKey]
      ? WALLET_LOGOS[connectorKey]
      : typeof connector?.icon === 'string'
        ? connector.icon
        : null

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal }) => {
        const connected = account && chain

        return (
          <button
            onClick={connected ? openAccountModal : openConnectModal}
            className={cn(
              `
              h-[36px] px-6 py-1
              md:h-[43px] md:px-6 md:py-3
              rounded-[12px]
              bg-grey-background
              hover:bg-grey-background-dark
              text-white text-center font-sans text-[14px] font-bold
              transition outline-none border-0
              cursor-pointer flex items-center gap-2
              `,
              className
            )}
          >
            {connected && walletLogo && (
              <Image src={walletLogo} width={20} height={20} alt={connector?.name || 'wallet'} />
            )}

            {connected ? account.displayName : 'Connect Wallet'}
          </button>
        )
      }}
    </ConnectButton.Custom>
  )
}
