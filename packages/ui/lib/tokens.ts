import { ChainKey } from '@/lib/chains'

export const TOKENS_DICTIONARY: Record<string, Record<string, { address: string; decimals: number }>> = {
  arbitrum: {
    USDC: { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
    USDT: { address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', decimals: 6 },
    DAI: { address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', decimals: 18 },
    WBTC: { address: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', decimals: 8 },
    WETH: { address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', decimals: 18 },
  },
  base: {
    USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
    USDT: { address: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2', decimals: 6 },
    DAI: { address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', decimals: 18 },
    WBTC: { address: '0x0555e30da8f98308edb960aa94c0db47230d2b9c', decimals: 8 },
    WETH: { address: '0x4200000000000000000000000000000000000006', decimals: 18 },
  },
  optimism: {
    USDC: { address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85', decimals: 6 },
    USDT: { address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', decimals: 6 },
    DAI: { address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', decimals: 18 },
    WBTC: { address: '0x68f180fcce6836688e9084f035309e29bf0a2095', decimals: 8 },
    WETH: { address: '0x4200000000000000000000000000000000000006', decimals: 18 },
  },
}

const TOKEN_ICON_URLS: Record<string, string> = {
  WBTC: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  USDC: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  USDT: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  WETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  DAI: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
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
