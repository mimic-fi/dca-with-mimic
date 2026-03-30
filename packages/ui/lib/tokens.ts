import { ChainKey } from '@/lib/chains'

export const TOKENS_DICTIONARY: Record<string, Record<string, { address: string; decimals: number }>> = {
  arbitrum: {
    USDC: { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
    USDT: { address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', decimals: 6 },
  },
  base: {
    USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
    USDT: { address: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2', decimals: 6 },
  },
  optimism: {
    USDC: { address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85', decimals: 6 },
    USDT: { address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', decimals: 6 },
  },
}

const TOKEN_ICON_URLS: Record<string, string> = {
  USDC: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  USDT: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
}

export type Token = {
  address: string
  decimals: number
  symbol: string
  icon: string
  chainKey: ChainKey
}

export const TOKENS = Object.keys(TOKENS_DICTIONARY).reduce(
  (chains, chainKey) => {
    const tokensForChain = TOKENS_DICTIONARY[chainKey]

    chains[chainKey] = Object.keys(tokensForChain).reduce(
      (tokens, symbol) => {
        const icon = TOKEN_ICON_URLS[symbol]
        tokens[symbol] = { ...tokensForChain[symbol], symbol, chainKey, icon }
        return tokens
      },
      {} as Record<string, Token>
    )

    return chains
  },
  {} as Record<ChainKey, Record<string, Token>>
)
