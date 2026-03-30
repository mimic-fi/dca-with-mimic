'use client'

import { useAccount, useConfig } from 'wagmi'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Settings } from 'lucide-react'

import { Trigger } from '@mimicprotocol/sdk'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChainSelector } from '@/components/chain-selector'
import { TokenSelector } from '@/components/token-selector'

import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { CHAINS, type Chain } from '@/lib/chains'
import { TOKENS, type Token } from '@/lib/tokens'
import { WagmiSigner } from '@/lib/wagmi-signer'
import { useSmartAccountCheck } from '@/hooks/use-smart-account-check'

import { dca, deactivate, CRON_SCHEDULES, Frequency, getFrequencyFromSchedule } from '@/lib/dca'
import { findCurrentTrigger } from '@/lib/functions'
import { capitalize } from '@/lib/utils'
import { useTokenBalance } from '@/hooks/use-token-balance'

export function Form() {
  const { toast } = useToast()
  const { address, isConnected } = useAccount()
  const wagmiConfig = useConfig()
  const signer = new WagmiSigner(address || '', wagmiConfig)

  const [sourceChain, setSourceChain] = useState<Chain>(CHAINS.base)
  const [sourceToken, setSourceToken] = useState<Token>(TOKENS.base.USDC)
  const [sourceAmount, setSourceAmount] = useState('')
  const [destinationChain, setDestinationChain] = useState<Chain>(CHAINS.base)
  const [destinationToken, setDestinationToken] = useState<Token>(TOKENS.base.USDT)
  const [thresholdPriceUsd, setThresholdPriceUsd] = useState('')
  const [recipient, setRecipient] = useState('0xbcE3248eDE29116e4bD18416dcC2DFca668Eeb84')
  const [slippage, setSlippage] = useState('2.0')
  const [maxFee, setMaxFee] = useState('0.1')
  const [frequency, setFrequency] = useState<Frequency>('hourly')
  const [isLoading, setIsLoading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [currentDca, setCurrentDca] = useState<Trigger | null>(null)
  const [isLoadingCurrentDca, setIsLoadingCurrentDca] = useState(false)
  const { tokenBalance, isTokenBalanceLoading } = useTokenBalance(destinationChain, destinationToken)
  const { isSmartAccount, isSmartAccountLoading } = useSmartAccountCheck(sourceChain)
  const isFormDisabled = isLoadingCurrentDca || !!currentDca

  useEffect(() => {
    const tokens = TOKENS[sourceChain.key]
    if (!tokens) return

    const stillValid = Object.values(tokens).some((t) => t.address === sourceToken.address)
    if (stillValid) return

    const firstSymbol = Object.keys(tokens)[0]
    if (firstSymbol) setSourceToken(tokens[firstSymbol])
  }, [sourceChain, sourceToken])

  useEffect(() => {
    const tokens = TOKENS[destinationChain.key]
    if (!tokens) return

    const stillValid = Object.values(tokens).some((t) => t.address === destinationToken.address)
    if (stillValid) return

    const firstSymbol = Object.keys(tokens)[0]
    if (firstSymbol) setDestinationToken(tokens[firstSymbol])
  }, [destinationChain, destinationToken])

  useEffect(() => {
    const fetchCurrentDca = async () => {
      try {
        if (!isConnected || !address) {
          setCurrentDca(null)
          return
        }

        setIsLoadingCurrentDca(true)
        const trigger = await findCurrentTrigger(address)
        setCurrentDca(trigger)
      } catch (error) {
        console.error('Error fetching DCA trigger', error)
        setCurrentDca(null)
      } finally {
        setIsLoadingCurrentDca(false)
      }
    }

    fetchCurrentDca()
  }, [isConnected, address])

  useEffect(() => {
    if (!currentDca) return

    const config = currentDca.config as unknown as { schedule: string }
    const frequencyFound = getFrequencyFromSchedule(config.schedule)
    if (frequencyFound) setFrequency(frequencyFound)

    const inputs = currentDca.input
    setSourceAmount(String(inputs.sourceAmount))
    setThresholdPriceUsd(String(inputs.thresholdPriceUsd))
    setMaxFee(String(inputs.maxFee))
    setSlippage(String(Number(inputs.slippageBps || 0) / 100))
    setRecipient(String(inputs.recipient))

    const sourceChainFound = Object.values(CHAINS).find((chain: Chain) => chain.id == inputs.sourceChain)
    if (sourceChainFound) {
      setSourceChain(sourceChainFound)
      const token = Object.values(TOKENS[sourceChainFound.key]).find((token) => token.address == inputs.token)
      if (token) setSourceToken(token)
    }

    const destinationChainFound = Object.values(CHAINS).find((chain: Chain) => chain.id == inputs.destinationChain)
    if (destinationChainFound) {
      setDestinationChain(destinationChainFound)
      const token = Object.values(TOKENS[destinationChainFound.key]).find((token) => token.address == inputs.token)
      if (token) setDestinationToken(token)
    }
  }, [currentDca])

  const handleDca = async () => {
    if (!sourceAmount || Number.parseFloat(sourceAmount) <= 0) {
      toast({
        title: 'Invalid Source Amount',
        description: 'Please enter a valid source amount.',
        variant: 'destructive',
      })
      return
    }

    if (!thresholdPriceUsd || Number.parseFloat(thresholdPriceUsd) <= 0) {
      toast({
        title: 'Invalid USD Price Threshold',
        description: 'Please enter a valid USD price threshold.',
        variant: 'destructive',
      })
      return
    }

    if (!maxFee || Number.parseFloat(maxFee) <= 0) {
      toast({
        title: 'Invalid Max Fee',
        description: 'Please enter a valid max fee',
        variant: 'destructive',
      })
      return
    }

    if (!slippage || Number.parseFloat(slippage) <= 0) {
      toast({
        title: 'Invalid Slippage',
        description: 'Please enter a valid slippage',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const params = {
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
      }
      const trigger = await dca(params)

      toast({
        title: 'DCA Created',
        description: 'Your DCA has been created successfully',
        action: (
          <ToastAction
            altText="View"
            onClick={() => window.open(`https://protocol.mimic.fi/triggers/${trigger.sig}`, '_blank')}
          >
            View
          </ToastAction>
        ),
      })

      setCurrentDca(trigger)
    } catch (error) {
      toast({
        title: 'DCA Failed',
        description: error instanceof Error ? error.message : 'Failed to create DCA',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!currentDca) return
    setIsLoading(true)

    try {
      const params = { trigger: currentDca, signer }
      await deactivate(params)

      toast({
        title: 'DCA Cancelled',
        description: 'Your DCA has been cancelled successfully',
      })

      setCurrentDca(null)
      setThresholdPriceUsd('')
      setSourceAmount('')
    } catch (error) {
      toast({
        title: 'Cancellation Failed',
        description: error instanceof Error ? error.message : 'Failed to cancel DCA',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl p-6 bg-card border-border">
      <div className="space-y-6">
        {isConnected && !isSmartAccountLoading && !isSmartAccount && (
          <div className="w-full rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span className="font-semibold">This app is only meant to be used with Mimic EIP-7702 smart accounts.</span>{' '}
            <br />
            <span className="text-destructive/90">
              You can upgrade your existing wallet by following{' '}
              <a
                href="https://docs.mimic.fi/examples/upgrade-your-eoa-to-a-mimic-7702"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-80"
              >
                this guide
              </a>
              .
            </span>
          </div>
        )}

        {isConnected && !isSmartAccountLoading && isSmartAccount && (
          <div className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
            <span className="font-semibold">Your wallet is a Mimic EIP-7702 smart account.</span>
          </div>
        )}

        {isConnected && isSmartAccountLoading && (
          <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
            Checking EIP-7702 delegation ...
          </div>
        )}

        <div className="space-y-1 flex items-end justify-between">
          {currentDca ? (
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">DCA detected</div>
              <a
                href={`https://protocol.mimic.fi/triggers/${currentDca.sig}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-violet-500 hover:text-violet-400 transition-colors"
              >
                view
              </a>
            </div>
          ) : (
            <Label className="text-sm font-medium">Dollar Cost Averaging</Label>
          )}
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="slippage-setting" className="text-sm text-muted-foreground">
                    Slippage
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="slippage-setting"
                      type="number"
                      placeholder="0.5"
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                      className="h-11 bg-secondary/50 border-border"
                      step="0.1"
                      min="0"
                      max="100"
                      disabled={isFormDisabled}
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your transaction will revert if the price changes unfavorably by more than this percentage.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-fee-setting" className="text-sm text-muted-foreground">
                    Max fee
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="max-fee-setting"
                      type="number"
                      placeholder="0.1"
                      value={maxFee}
                      onChange={(e) => setMaxFee(e.target.value)}
                      className="h-11 bg-secondary/50 border-border"
                      min="0"
                      step="0.01"
                      disabled={isFormDisabled}
                    />
                    <span className="text-muted-foreground">USD</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Maximum fee you{"'"}re willing to pay per execution.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <div className="w-36 shrink-0">
              <Label className="text-muted-foreground">Source Chain</Label>
            </div>
            <div className="w-36 shrink-0">
              <Label className="text-muted-foreground">Source Token</Label>
            </div>
            <div className="w-36 shrink-0">
              <Label className="text-muted-foreground">Source Amount</Label>
            </div>
            <div className="w-36 shrink-0">
              <Label className="text-muted-foreground">USD Price Threshold</Label>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <div className={`w-36 shrink-0 ${isFormDisabled ? 'pointer-events-none opacity-70' : ''}`}>
              <ChainSelector value={sourceChain} onChange={setSourceChain} />
            </div>
            <div className={`w-36 shrink-0 ${isFormDisabled ? 'pointer-events-none opacity-70' : ''}`}>
              <TokenSelector chain={sourceChain} value={sourceToken} onChange={setSourceToken} />
            </div>
            <div className="w-36 shrink-0">
              <Input
                type="number"
                placeholder="0.0"
                value={sourceAmount}
                onChange={(e) => setSourceAmount(e.target.value)}
                className="h-12 bg-secondary/50 border-border text-lg text-right"
                disabled={isFormDisabled}
              />
            </div>
            <div className="w-36 shrink-0">
              <Input
                type="number"
                placeholder="0.0"
                value={thresholdPriceUsd}
                onChange={(e) => setThresholdPriceUsd(e.target.value)}
                className="h-12 bg-secondary/50 border-border text-lg text-right"
                disabled={isFormDisabled}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <div className="w-36 shrink-0">
              <Label className="text-muted-foreground">Destination Chain</Label>
            </div>
            <div className="w-36 shrink-0">
              <Label className="text-muted-foreground">Destination Token</Label>
            </div>
            <div className="flex-1 min-w-0">
              <Label className="text-muted-foreground">Recipient</Label>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <div className={`w-36 shrink-0 ${isFormDisabled ? 'pointer-events-none opacity-70' : ''}`}>
              <ChainSelector value={destinationChain} onChange={setDestinationChain} />
            </div>
            <div className={`w-36 shrink-0 ${isFormDisabled ? 'pointer-events-none opacity-70' : ''}`}>
              <TokenSelector chain={destinationChain} value={destinationToken} onChange={setDestinationToken} />
            </div>
            <div className="flex-1 min-w-0">
              <Input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="h-12 bg-secondary/50 border-border text-lg text-right"
                disabled={isFormDisabled}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="w-56 text-xs text-muted-foreground text-right pr-2">
              {isConnected
                ? isTokenBalanceLoading
                  ? 'Fetching balance…'
                  : tokenBalance
                    ? `${destinationToken.symbol} Balance in ${destinationChain.name}: ${tokenBalance}`
                    : '.'
                : '...'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-muted-foreground">Frequency</Label>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(CRON_SCHEDULES) as Frequency[]).map((f) => (
              <Button
                key={f}
                type="button"
                variant={frequency === f ? 'default' : 'secondary'}
                className="rounded-xl"
                onClick={() => setFrequency(f)}
                disabled={isFormDisabled}
              >
                {capitalize(f)}
              </Button>
            ))}
          </div>
        </div>

        {currentDca ? (
          <Button
            size="lg"
            variant="destructive"
            className="w-full text-lg h-14"
            onClick={handleCancel}
            disabled={isLoading || !isConnected || !isSmartAccount}
          >
            {isLoading ? 'Cancelling...' : 'Cancel DCA'}
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full text-lg h-14 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            onClick={handleDca}
            disabled={isLoading || !isConnected || !isSmartAccount}
          >
            {isLoading
              ? 'Initiating DCA...'
              : !isConnected
                ? 'Connect wallet'
                : isSmartAccountLoading
                  ? 'Checking account...'
                  : !isSmartAccount
                    ? 'EIP-7702 required'
                    : 'Create'}
          </Button>
        )}

        <div className="text-xs text-muted-foreground text-center">
          Powered by{' '}
          <a
            href="https://www.mimic.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-500 hover:text-violet-400 transition-colors"
          >
            Mimic
          </a>
        </div>
      </div>
    </Card>
  )
}
