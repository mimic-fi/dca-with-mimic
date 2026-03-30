'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CHAINS, Chain, ChainKey } from '@/lib/chains'

interface ChainSelectorProps {
  value: Chain
  onChange: (chain: Chain) => void
}

export function ChainSelector({ value, onChange }: ChainSelectorProps) {
  return (
    <Select value={value.key} onValueChange={(chainKey) => onChange(CHAINS[chainKey as ChainKey])}>
      <SelectTrigger className="w-full h-12 bg-secondary/50 border-border">
        <SelectValue>
          <div className="flex items-center gap-2">
            <img src={value.icon} alt={value.name} className="w-6 h-6 rounded-full" />
            <span>{value.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {(Object.keys(CHAINS) as ChainKey[]).map((chainKey) => (
          <SelectItem key={chainKey} value={chainKey}>
            <div className="flex items-center gap-2">
              <img src={CHAINS[chainKey].icon} alt={CHAINS[chainKey].name} className="w-6 h-6 rounded-full" />
              <span>{CHAINS[chainKey].name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
