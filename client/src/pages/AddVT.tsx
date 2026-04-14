import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '../services/api'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

type FundingMethod = 'card' | 'crypto'

interface CryptoTransaction {
  transactionId: string
  status: string
  usdAmount: number
  vtAmount: number
  currency: string
  network: string
  estimatedAmount: number
  receiveAddress: string
  rateUsedUsd: number
  expiresAt: string
  memo: string
}

const DEFAULT_CRYPTO_OPTIONS: Record<string, string[]> = {
  BTC: ['Bitcoin'],
  ETH: ['Ethereum', 'Base', 'Arbitrum'],
  USDC: ['Ethereum', 'Base', 'Polygon'],
  USDT: ['Ethereum', 'Polygon', 'Tron'],
}

export default function AddVT() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [method, setMethod] = useState<FundingMethod>('card')
  const [vtAmount, setVtAmount] = useState(500)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('Choose card or crypto to fund your VT balance. 100 VT always equals $1 USD.')
  const [cryptoOptions, setCryptoOptions] = useState<Record<string, string[]>>(DEFAULT_CRYPTO_OPTIONS)
  const [currency, setCurrency] = useState('USDC')
  const [network, setNetwork] = useState('Ethereum')
  const [cryptoTransaction, setCryptoTransaction] = useState<CryptoTransaction | null>(null)

  const usdAmount = useMemo(() => Number((vtAmount / 100).toFixed(2)), [vtAmount])
  const availableNetworks = cryptoOptions[currency] || []

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await apiClient.getVTPricingTiers()
        setCryptoOptions(response.data.cryptoOptions || DEFAULT_CRYPTO_OPTIONS)
      } catch (error) {
        console.error('Failed to load payment options:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOptions()
  }, [])

  useEffect(() => {
    if (!availableNetworks.includes(network)) {
      setNetwork(availableNetworks[0] || '')
    }
  }, [currency, availableNetworks, network])

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) return

    const verifyCheckout = async () => {
      try {
        const response = await apiClient.verifyStripeCheckout(sessionId)
        setMessage(`Card purchase verified. New VT balance: ${response.data.balance}.`)
        navigate(location.pathname, { replace: true })
      } catch (error) {
        console.error('Stripe verification failed:', error)
        setMessage('Card checkout was not verified. If you were charged, contact support.')
      }
    }

    verifyCheckout()
  }, [searchParams, navigate, location.pathname])

  const handleUsdChange = (value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0
    setVtAmount(Math.round(safeValue * 100))
  }

  const handleVtChange = (value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0
    setVtAmount(safeValue)
  }

  const handleCardCheckout = async () => {
    if (usdAmount <= 0 || vtAmount <= 0) {
      setMessage('Enter a valid VT amount before starting card checkout.')
      return
    }

    setActionLoading(true)
    setCryptoTransaction(null)
    setMessage(`Starting card checkout for ${vtAmount.toLocaleString()} VT...`)
    try {
      const checkoutReturnUrl = new URL(window.location.href)
      checkoutReturnUrl.searchParams.delete('session_id')

      const response = await apiClient.createStripeCheckout({
        usdAmount,
        returnUrl: checkoutReturnUrl.toString(),
      })

      if (response.data.url) {
        window.location.href = response.data.url
        return
      }

      setMessage('Card checkout URL was not returned by the server.')
    } catch (error) {
      console.error('Card checkout failed:', error)
      setMessage('Unable to start card checkout right now.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCryptoCheckout = async () => {
    if (usdAmount <= 0 || vtAmount <= 0) {
      setMessage('Enter a valid VT amount before opening a crypto transaction.')
      return
    }

    if (!currency || !network) {
      setMessage('Select a currency and network for the crypto transaction.')
      return
    }

    setActionLoading(true)
    setMessage(`Opening ${currency} transaction on ${network}...`)
    try {
      const response = await apiClient.createCryptoCheckout({
        usdAmount,
        currency,
        network,
      })
      setCryptoTransaction(response.data)
      setMessage(`Crypto transaction opened for ${response.data.vtAmount.toLocaleString()} VT.`)
    } catch (error) {
      console.error('Crypto checkout failed:', error)
      setMessage('Unable to open crypto transaction right now.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/70">Add VT</p>
              <h1 className="mt-3 text-4xl font-semibold">Fund your Vault Tokens</h1>
              <p className="mt-2 text-slate-400">Choose a payment method, lock your amount, and fund VT at a fixed rate of 100 VT = $1 USD.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Conversion</p>
                <p className="mt-3 text-lg font-semibold text-white">100 VT = $1.00 USD</p>
                <p className="mt-2 text-sm text-slate-400">This ratio is fixed. 1 VT always equals $0.01 USD.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-slate-300">Vault Tokens</span>
                  <input
                    type="number"
                    value={vtAmount}
                    min={100}
                    step={100}
                    onChange={(event) => handleVtChange(Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">USD Amount</span>
                  <input
                    type="number"
                    value={usdAmount}
                    min={1}
                    step={1}
                    onChange={(event) => handleUsdChange(Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
                <p>You are funding <span className="font-semibold text-white">{vtAmount.toLocaleString()} VT</span> for <span className="font-semibold text-white">${usdAmount.toFixed(2)}</span>.</p>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Payment Method</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setMethod('card')}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${method === 'card' ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}
                  >
                    <p className="font-semibold text-white">Card</p>
                    <p className="mt-1 text-sm text-slate-400">Create a Stripe card checkout for the exact USD amount.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('crypto')}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${method === 'crypto' ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}
                  >
                    <p className="font-semibold text-white">Crypto</p>
                    <p className="mt-1 text-sm text-slate-400">Open a crypto transaction and choose the currency and network.</p>
                  </button>
                </div>
              </div>

              {method === 'crypto' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-slate-300">Currency</span>
                    <select
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                    >
                      {Object.keys(cryptoOptions).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-300">Network</span>
                    <select
                      value={network}
                      onChange={(event) => setNetwork(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                    >
                      {availableNetworks.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <button
                type="button"
                onClick={method === 'card' ? handleCardCheckout : handleCryptoCheckout}
                disabled={loading || actionLoading || vtAmount <= 0}
                className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading
                  ? 'Processing...'
                  : method === 'card'
                    ? 'Continue to Card Checkout'
                    : 'Open Crypto Transaction'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Live Status</p>
                <p className="mt-4 text-slate-300">{message}</p>
              </div>

              {cryptoTransaction && (
                <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                  <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Crypto Transaction Opened</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-200">
                    <p><span className="text-slate-400">Transaction ID:</span> {cryptoTransaction.transactionId}</p>
                    <p><span className="text-slate-400">Funding:</span> {cryptoTransaction.vtAmount.toLocaleString()} VT for ${cryptoTransaction.usdAmount.toFixed(2)}</p>
                    <p><span className="text-slate-400">Currency / Network:</span> {cryptoTransaction.currency} on {cryptoTransaction.network}</p>
                    <p><span className="text-slate-400">Estimated send amount:</span> {cryptoTransaction.estimatedAmount} {cryptoTransaction.currency}</p>
                    <p><span className="text-slate-400">Receive address:</span></p>
                    <p className="break-all rounded-2xl bg-slate-950/70 px-4 py-3 text-white">{cryptoTransaction.receiveAddress}</p>
                    <p><span className="text-slate-400">Memo / Reference:</span> {cryptoTransaction.memo}</p>
                    <p><span className="text-slate-400">Quote expires:</span> {new Date(cryptoTransaction.expiresAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <Link to="/terms" className="text-cyan-300 hover:text-cyan-200">Terms of Service</Link>
          <Link to="/disclaimer" className="text-cyan-300 hover:text-cyan-200">Disclaimer</Link>
        </div>
      </div>
    </div>
  )
}
