import { Token } from '@/lib/tokens'
import { Chain } from '@/lib/chains'
import { hexToBigInt, pad32, toStringDecimal } from '@/lib/utils'

type BalanceParams = {
  chain: Chain
  token: Token
  owner: string
}

const BALANCE_OF_SELECTOR = '0x70a08231'

function encodeBalanceOf(owner: string) {
  const addr = owner.toLowerCase().replace(/^0x/, '')
  return `${BALANCE_OF_SELECTOR}${pad32(addr)}`
}

export async function fetchTokenBalance(params: BalanceParams): Promise<string> {
  const { chain, token, owner } = params
  const calldata = encodeBalanceOf(owner)

  const response = await fetch('/api/evm-call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chainId: chain.id, address: token.address, data: calldata }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch token balance')
  }

  const { data: returnData } = (await response.json()) as { data: string }
  const balance = hexToBigInt(returnData)
  return toStringDecimal(balance, token.decimals)
}
