import { type NextRequest, NextResponse } from 'next/server'
import { OracleEvmCall } from '@mimicprotocol/sdk'

interface EvmCallRequest {
  chainId: number
  address: string
  data: string
}

export async function POST(request: NextRequest) {
  let body: EvmCallRequest

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.chainId) return NextResponse.json({ error: 'Missing chainId' }, { status: 400 })
  if (!body.address) return NextResponse.json({ error: 'Missing address' }, { status: 400 })
  if (!body.data) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/oracle/evm/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: Date.now(),
        chainId: body.chainId,
        to: body.address,
        data: body.data,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: text }, { status: response.status })
    }

    const responseData: OracleEvmCall = await response.json()
    const data = responseData.result.value
    return NextResponse.json({ data })
  } catch (error) {
    console.error('EVM call request error', error)
    return NextResponse.json({ error: 'Failed to fetch EVM call' }, { status: 500 })
  }
}
