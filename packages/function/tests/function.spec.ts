import { Chains, fp, NATIVE_TOKEN_ADDRESS, OpType, randomEvmAddress } from '@mimicprotocol/sdk'
import { Context, EvmCallQueryMock, runFunction, Swap, TokenPriceQueryMock } from '@mimicprotocol/test-ts'
import { expect } from 'chai'
import { Interface } from 'ethers'

import ERC20Abi from '../abis/ERC20.json'

const ERC20Interface = new Interface(ERC20Abi)

describe('Function', () => {
  const buildDir = './build'

  const chainId = Chains.Optimism
  const context: Context = {
    user: randomEvmAddress(),
    settlers: [{ address: randomEvmAddress(), chainId }],
    timestamp: Date.now(),
  }

  const inputs = {
    sourceChain: chainId,
    sourceToken: randomEvmAddress(),
    sourceAmount: '10',
    destinationChain: chainId,
    destinationToken: NATIVE_TOKEN_ADDRESS,
    thresholdPriceUsd: '2000',
    recipient: randomEvmAddress(),
    maxFee: '0.1',
    slippageBps: 1,
  }

  const tokenInDecimals = 6
  const tokenOutDecimals = 18

  const calls: EvmCallQueryMock[] = [
    // token in
    {
      request: {
        to: inputs.sourceToken,
        chainId: inputs.sourceChain,
        fnSelector: ERC20Interface.getFunction('decimals')!.selector,
      },
      response: { value: tokenInDecimals.toString(), abiType: 'uint8' },
    },
    {
      request: {
        to: inputs.sourceToken,
        chainId: inputs.sourceChain,
        fnSelector: ERC20Interface.getFunction('symbol')!.selector,
      },
      response: { value: 'IN', abiType: 'string' },
    },
    // token out
    {
      request: {
        to: inputs.destinationToken,
        chainId: inputs.destinationChain,
        fnSelector: ERC20Interface.getFunction('decimals')!.selector,
      },
      response: { value: tokenOutDecimals.toString(), abiType: 'uint8' },
    },
    {
      request: {
        to: inputs.destinationToken,
        chainId: inputs.destinationChain,
        fnSelector: ERC20Interface.getFunction('symbol')!.selector,
      },
      response: { value: 'OUT', abiType: 'string' },
    },
  ]

  const buildPrices = (chain: number, token: string, price: string): TokenPriceQueryMock[] => [
    {
      request: { token: { address: token, chainId: chain } },
      response: [fp(price).toString()],
    },
  ]

  describe('when the price is above the threshold', () => {
    const prices = buildPrices(chainId, NATIVE_TOKEN_ADDRESS, '2001')

    it('does not produce any intent', async () => {
      const result = await runFunction(buildDir, context, { inputs, prices, calls })
      expect(result.success).to.be.true
      expect(result.intents).to.be.empty
    })
  })

  describe('when the price is below the threshold', () => {
    const prices = [
      ...buildPrices(chainId, NATIVE_TOKEN_ADDRESS, '2000'),
      ...buildPrices(chainId, inputs.sourceToken, '1'),
    ]

    const priceTokenIn = fp(1)
    const priceTokenOut = fp(2000)
    const amountInUsd = (fp(inputs.sourceAmount, tokenInDecimals) * priceTokenIn) / 10n ** BigInt(tokenInDecimals)
    const expectedAmountOut = (amountInUsd * 10n ** BigInt(tokenOutDecimals)) / priceTokenOut
    const bpsDenominator = 10_000n
    const slippageFactor = bpsDenominator - BigInt(inputs.slippageBps)
    const expectedMinAmountOut = (expectedAmountOut * slippageFactor) / bpsDenominator

    it('produces the expected intents', async () => {
      const result = await runFunction(buildDir, context, { inputs, prices, calls })
      expect(result.success).to.be.true
      expect(result.timestamp).to.be.equal(context.timestamp)

      const intents = result.intents as Swap[]
      expect(intents).to.have.lengthOf(1)

      const intent = intents[0]
      expect(intent.op).to.equal(OpType.Swap)
      expect(intent.user).to.equal(context.user)
      expect(intent.settler).to.equal(context.settlers?.[0].address)
      expect(intent.sourceChain).to.equal(inputs.sourceChain)
      expect(intent.destinationChain).to.equal(inputs.destinationChain)

      // Tokens in
      expect(intent.tokensIn).to.have.lengthOf(1)
      expect(intent.tokensIn[0].token).to.equal(inputs.sourceToken)
      expect(intent.tokensIn[0].amount).to.equal(fp(inputs.sourceAmount, tokenInDecimals).toString())

      // Tokens out
      expect(intent.tokensOut).to.have.lengthOf(1)
      expect(intent.tokensOut[0].token).to.equal(inputs.destinationToken.toLowerCase())
      expect(intent.tokensOut[0].minAmount).to.equal(expectedMinAmountOut.toString())
      expect(intent.tokensOut[0].recipient).to.equal(context.user)
    })
  })
})
