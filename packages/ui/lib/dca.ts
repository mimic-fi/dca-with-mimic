import { fp, Trigger, TriggerType } from '@mimicprotocol/sdk'
import type { Chain } from '@/lib/chains'
import type { Token } from '@/lib/tokens'
import sdk from '@/lib/sdk'
import { WagmiSigner } from '@/lib/wagmi-signer'
import { BPS_DECIMALS, FUNCTION_CID } from '@/lib/constants'
import { findCurrentTrigger } from '@/lib/functions'

interface DcaParams {
  sourceChain: Chain
  sourceToken: Token
  sourceAmount: string
  destinationChain: Chain
  destinationToken: Token
  thresholdPriceUsd: string
  recipient: string
  maxFee: string
  slippage: string
  frequency: Frequency
  signer: WagmiSigner
}

interface DeactivateParams {
  trigger: Trigger
  signer: WagmiSigner
}

export const CRON_SCHEDULES = {
  minutely: '* * * * *',
  hourly: '0 * * * *',
  daily: '0 0 * * *',
  weekly: '0 0 * * 1', // Monday
  monthly: '0 0 1 * *', // 1st of every month
  quarterly: '0 0 1 */3 *', // Jan, Apr, Jul, Oct
  yearly: '0 0 1 1 *', // Jan 1st
} as const

export type Frequency = keyof typeof CRON_SCHEDULES

export function getFrequencyFromSchedule(schedule: string): Frequency | null {
  const entry = Object.entries(CRON_SCHEDULES).find(([, s]) => s === schedule)
  return entry ? (entry[0] as Frequency) : null
}

function bumpPatch(version: string): string {
  const [major = '0', minor = '0', patch = '0'] = version.split('.')
  return `${major}.${minor}.${Number(patch) + 1}`
}

export async function deactivate(params: DeactivateParams): Promise<Trigger> {
  const { trigger, signer } = params
  return sdk().triggers.signAndDeactivate(trigger.sig, signer)
}

export async function dca(params: DcaParams): Promise<Trigger> {
  const {
    sourceChain,
    sourceToken,
    sourceAmount,
    destinationChain,
    destinationToken,
    thresholdPriceUsd,
    recipient,
    maxFee,
    slippage,
    frequency,
    signer,
  } = params

  const description = `Buying ${destinationToken.symbol} on ${destinationChain.name} when price is above ${thresholdPriceUsd} USD. Paying with ${sourceAmount} ${sourceToken.symbol} on ${sourceChain.name} with ${slippage}% slippage.`
  const manifest = await sdk().functions.getManifest(FUNCTION_CID)
  const config = (await findCurrentTrigger(signer.address)) || (await findCurrentTrigger(signer.address, false))
  const version = config ? bumpPatch(config.version) : '0.0.1'
  return sdk().triggers.signAndCreate(
    {
      functionCid: FUNCTION_CID,
      version,
      manifest,
      description,
      config: {
        type: TriggerType.Cron,
        schedule: CRON_SCHEDULES[frequency],
        delta: '10m',
        endDate: 0,
      },
      input: {
        sourceChain: sourceChain.id,
        sourceToken: sourceToken.address,
        sourceAmount,
        destinationChain: destinationChain.id,
        destinationToken: destinationToken.address,
        thresholdPriceUsd,
        recipient,
        maxFee,
        slippageBps: fp(slippage, BPS_DECIMALS),
      },
      executionFeeLimit: fp(1).toString(),
      minValidations: 1,
    },
    signer
  )
}
