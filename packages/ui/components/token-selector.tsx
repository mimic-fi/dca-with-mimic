'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TOKENS, Token } from '@/lib/tokens'
import type { Chain } from '@/lib/chains'

interface TokenSelectorProps {
  chain: Chain
  value: Token
  onChange: (token: Token) => void
}

export function TokenSelector({ chain, value, onChange }: TokenSelectorProps) {
  const chainKey = chain.key

  return (
    <Select value={value.symbol} onValueChange={(tokenSymbol) => onChange(TOKENS[chainKey][tokenSymbol])}>
      <SelectTrigger className="w-full h-12 bg-secondary/50 border-border">
        <SelectValue>
          <div className="flex items-center gap-2">
            <img src={value.icon} alt={value.symbol} className="w-5 h-5 rounded-full" />
            <span className="font-medium">{value.symbol}</span>
          </div>
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {Object.keys(TOKENS[chainKey]).map((tokenSymbol) => (
          <SelectItem key={tokenSymbol} value={tokenSymbol}>
            <div className="flex items-center gap-2">
              <img src={TOKENS[chainKey][tokenSymbol].icon} alt={tokenSymbol} className="w-5 h-5 rounded-full" />
              <span className="font-medium">{tokenSymbol}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
