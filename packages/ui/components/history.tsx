'use client'

import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { ExternalLink, Loader2 } from 'lucide-react'
import { findExecutions, Execution } from '@/lib/functions'
import { capitalize } from '@/lib/utils'
import { useAccount } from 'wagmi'

function getResultColor(result: string): string {
  if (result === 'succeeded') return 'text-green-500'
  if (['failed', 'discarded', 'expired'].includes(result)) return 'text-red-500'
  return 'text-violet-500'
}

function getResultIcon(result: string): string {
  if (result === 'succeeded') return '✓'
  if (['failed', 'discarded', 'expired'].includes(result)) return '✗'
  return '-'
}

export function History() {
  const { address, isConnected } = useAccount()

  const {
    data: executions = [],
    isLoading,
    error,
  } = useQuery<Execution[], Error>({
    queryKey: ['executions', address],
    queryFn: () => findExecutions(address!),
    enabled: isConnected && !!address,
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  })

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl py-6 bg-card border-border">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
          <span className="ml-2 text-muted-foreground">Loading DCA history...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl py-6 bg-card border-border">
        <div className="text-center py-8">
          <p className="text-destructive">{error.message ?? 'Failed to load DCA history'}</p>
        </div>
      </Card>
    )
  }

  if (executions.length === 0) {
    return (
      <Card className="w-full max-w-2xl py-6 bg-card border-border">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {isConnected ? 'No DCA transactions registered yet' : 'Please connect your wallet'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl py-6 bg-card border-border">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">DCA history</h2>
        <div className="space-y-3">
          {executions.map((execution, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{execution.description}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(execution.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-sm font-medium ${getResultColor(execution.result)}`}>
                    {getResultIcon(execution.result)} {capitalize(execution.result)}
                  </div>
                </div>
                {execution.url && (
                  <a
                    href={execution.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-500 hover:text-violet-400 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
