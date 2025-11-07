'use client'

import { useMemo, useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { X402Client } from '@/lib/payments/x402Client'

export default function EchoPage() {
  const { walletClient, address } = useWallet()
  const [log, setLog] = useState<string>('')
  const [busy, setBusy] = useState(false)

  const x402 = useMemo(() => {
    if (!walletClient) return null
    try {
      return new X402Client({ walletClient, maxValue: BigInt(1 * 10 ** 6) }) // 1 USDC cap
    } catch {
      return null
    }
  }, [walletClient])

  const tryEcho = async () => {
    if (!x402) {
      setLog('Connect wallet first')
      return
    }
    setBusy(true)
    setLog('Preflighting Echo Merchant…')
    try {
      // Preflight (expect 402)
      const pre = await fetch('/api/x402/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://x402.payai.network/api/base/paid-content',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {},
        }),
      })
      if (pre.status !== 402) {
        setLog(`Expected 402, got ${pre.status}`)
        setBusy(false)
        return
      }
      setLog('Paying via x402… (approve in wallet)')

      // Pay+retry via client wrapper (will call /api/x402/proxy with X-Payment)
      const res = await x402.request('/api/x402/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://x402.payai.network/api/base/paid-content',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {},
        }),
      })

      if (!res.ok) {
        const t = await res.text()
        setLog(`Echo purchase failed (${res.status}): ${t}`)
        setBusy(false)
        return
      }

      const receiptHeader = res.headers.get('x-payment-response') || res.headers.get('X-Payment-Response')
      setLog(
        `Success!\n` +
          `Wallet: ${address}\n` +
          `Settlement: ${receiptHeader ? 'received' : 'n/a'}\n` +
          `Body: ${await res.text()}`
      )
    } catch (e: any) {
      setLog(`Error: ${e?.message || e}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 text-sm">
      <h1 className="text-xl font-semibold mb-4">Echo Merchant (x402 Test)</h1>
      <p className="mb-4">
        Validates your x402 client against a known-good merchant per PayAI docs. Echo refunds tokens; PayAI covers fees.
      </p>
      <button
        onClick={tryEcho}
        disabled={busy}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {busy ? 'Processing…' : 'Try Echo (Base)'}
      </button>
      <pre className="mt-6 whitespace-pre-wrap bg-neutral-900 text-neutral-100 p-4 rounded min-h-[200px]">{log}</pre>
    </div>
  )
}


