import { Trigger } from '@mimicprotocol/sdk'
import sdk from '@/lib/sdk'
import { FUNCTION_CID } from '@/lib/constants'

export interface Execution {
  description: string
  createdAt: Date
  result: string
  url?: string
}

export async function findCurrentTrigger(signer: string, active = true): Promise<Trigger | null> {
  const configs = await sdk().triggers.get({ signer, active, functionCid: FUNCTION_CID, offset: 0, limit: 1 })
  return configs.length == 1 ? configs[0] : null
}

export async function findExecutions(signer: string): Promise<Execution[]> {
  const trigger = (await findCurrentTrigger(signer)) || (await findCurrentTrigger(signer, false))
  if (!trigger) return []

  const executions = await sdk().executions.get({ triggerSig: trigger.sig })
  return Promise.all(
    executions.map(async (execution) => {
      if (execution.outputs.length == 0) {
        return {
          description: `${trigger.description} ${execution.logs?.[0]?.replace('[Info] ', '')}`,
          createdAt: execution.createdAt,
          result: 'Succeeded',
          url: `https://protocol.mimic.fi/executions/${execution.hash}`,
        }
      } else {
        const output = execution.outputs[0]
        const intent = await sdk().intents.getByHash(output.hash)
        return {
          description: trigger.description,
          createdAt: execution.createdAt,
          result: intent.status,
          url: `https://protocol.mimic.fi/intents/${intent.hash}`,
        }
      }
    })
  )
}
