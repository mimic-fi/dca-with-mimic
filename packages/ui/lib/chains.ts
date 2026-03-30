const CHAINS_DICTIONARY: Record<string, { id: number; name: string; icon: string }> = {
  arbitrum: { id: 42161, name: 'Arbitrum', icon: 'https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg' },
  base: { id: 8453, name: 'Base', icon: 'https://icons.llamao.fi/icons/chains/rsz_base.jpg' },
  optimism: { id: 10, name: 'Optimism', icon: 'https://icons.llamao.fi/icons/chains/rsz_optimism.jpg' },
}

export type ChainKey = keyof typeof CHAINS_DICTIONARY

export type Chain = (typeof CHAINS_DICTIONARY)[ChainKey] & { key: ChainKey }

export const CHAINS = (Object.keys(CHAINS_DICTIONARY) as ChainKey[]).reduce(
  (chains, key) => {
    chains[key] = { ...CHAINS_DICTIONARY[key], key }
    return chains
  },
  {} as Record<ChainKey, Chain>
)
