import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function pad32(hexNo0x: string) {
  return hexNo0x.padStart(64, '0')
}

export function hexToBigInt(hex: string): bigint {
  if (!hex) return 0n
  return BigInt(hex)
}

export function toStringDecimal(value: bigint, decimals: number, precision = 6): string {
  const isNegative = value < 0n
  const absolute = isNegative ? -value : value

  const base = 10n ** BigInt(decimals)
  const whole = absolute / base
  const fraction = absolute % base

  const decimalPart = fraction.toString().padStart(decimals, '0').slice(0, precision).replace(/0+$/, '')
  const result = decimalPart ? `${whole.toString()}.${decimalPart}` : whole.toString()
  return isNegative ? `-${result}` : result
}
