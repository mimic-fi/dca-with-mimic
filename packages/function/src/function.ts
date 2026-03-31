import { BigInt, environment, ERC20Token, log, SwapBuilder, TokenAmount, USD } from '@mimicprotocol/lib-ts'

import { inputs } from './types'

const BPS_DENOMINATOR = BigInt.fromI32(10_000)
const ZERO_USD = USD.fromStringDecimal('0')

export default function main(): void {
  const slippageBps = BigInt.fromI32(inputs.slippageBps as i32)
  if (slippageBps.gt(BPS_DENOMINATOR)) throw new Error('Slippage must be between 0 and 100 BPS')

  const lowerThreshold = USD.fromStringDecimal(inputs.lowerThresholdPriceUsd)
  const upperThreshold = USD.fromStringDecimal(inputs.upperThresholdPriceUsd)
  const hasLowerThreshold = lowerThreshold.gt(ZERO_USD)
  const hasUpperThreshold = upperThreshold.gt(ZERO_USD)
  if (hasLowerThreshold && hasUpperThreshold && lowerThreshold.gt(upperThreshold))
    throw new Error('Lower threshold must be less than or equal to upper threshold')

  // Check token out price thresholds
  const tokenOut = ERC20Token.fromAddress(inputs.destinationToken, inputs.destinationChain)
  const tokenOutPriceResult = environment.tokenPriceQuery(tokenOut)
  const tokenOutPrice = tokenOutPriceResult.unwrap()
  if (hasLowerThreshold && tokenOutPrice.lt(lowerThreshold)) {
    log.info(`Price (${tokenOutPrice.toString()}) lt lower threshold (${inputs.lowerThresholdPriceUsd})`)
    return
  }

  if (hasUpperThreshold && tokenOutPrice.gt(upperThreshold)) {
    log.info(`Price (${tokenOutPrice.toString()}) gt upper threshold (${inputs.upperThresholdPriceUsd})`)
    return
  }

  // Apply slippage to calculate the expected minimum amount out
  const tokenIn = ERC20Token.fromAddress(inputs.sourceToken, inputs.sourceChain)
  const amountIn = TokenAmount.fromStringDecimal(tokenIn, inputs.sourceAmount)
  const expectedOut = amountIn.toTokenAmount(tokenOut)
  if (expectedOut.isError) {
    log.error(`Failed to convert ${tokenIn} on ${inputs.sourceChain} to ${tokenOut} on ${inputs.destinationChain}`)
    return
  }

  const minAmountOut = expectedOut.unwrap().applySlippageBps(inputs.slippageBps as i32)
  log.info(`Swap ${amountIn} on ${inputs.sourceChain} to at least ${minAmountOut} on ${inputs.destinationChain}`)

  // Execute swap
  SwapBuilder.forChains(inputs.sourceChain, inputs.destinationChain)
    .addTokenInFromTokenAmount(amountIn)
    .addTokenOutFromTokenAmount(minAmountOut, environment.getContext().user)
    .build()
    .send()
}
