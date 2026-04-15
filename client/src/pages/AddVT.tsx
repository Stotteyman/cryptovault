import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '../services/api'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletContext'

export default function AddVT() {
  const stripeSessionStorageKey = 'pendingStripeCheckoutSessionId'
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithWallet, token } = useAuth()
  const { account: walletAccount } = useWallet()
  const [searchParams] = useSearchParams()
  const [vtAmount, setVtAmount] = useState(500)
  const [actionLoading, setActionLoading] = useState(false)
  const [verifyingCheckout, setVerifyingCheckout] = useState(false)
  const [message, setMessage] = useState('Card checkout is live. Crypto funding is temporarily disabled while that flow is being rebuilt. 100 VT always equals $1 USD.')

  const usdAmount = useMemo(() => Number((vtAmount / 100).toFixed(2)), [vtAmount])

  useEffect(() => {
    const querySessionId = searchParams.get('session_id')
    const storedSessionId = window.sessionStorage.getItem(stripeSessionStorageKey)
    const sessionId =
      querySessionId && querySessionId !== '{CHECKOUT_SESSION_ID}' ? querySessionId : storedSessionId

    if (!sessionId) return

    const verifyCheckout = async () => {
      setVerifyingCheckout(true)
      setMessage('Finalizing card checkout and crediting VT...')

      try {
        let response: Awaited<ReturnType<typeof apiClient.verifyStripeCheckout>> | null = null
        let lastError: any = null

        for (let attempt = 0; attempt < 4; attempt += 1) {
          try {
            response = await apiClient.verifyStripeCheckout(sessionId)
            break
          } catch (error) {
            lastError = error

            if (attempt < 3) {
              await new Promise((resolve) => window.setTimeout(resolve, 1200 * (attempt + 1)))
            }
          }
        }

        if (!response) {
          throw lastError
        }

        setMessage(`Card purchase verified. New VT balance: ${response.data.balance}.`)
        window.sessionStorage.removeItem(stripeSessionStorageKey)
        navigate(location.pathname, { replace: true })
      } catch (error: any) {
        console.error('Stripe verification failed:', error)
        const backendMessage = error?.response?.data?.error
        setMessage(backendMessage || 'Card checkout was not verified. If you were charged, contact support.')
      } finally {
        setVerifyingCheckout(false)
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
    setMessage(`Starting card checkout for ${vtAmount.toLocaleString()} VT...`)
    try {
      if (!token && walletAccount) {
        await loginWithWallet(walletAccount)
      }

      const checkoutReturnUrl = new URL(window.location.href)
      checkoutReturnUrl.searchParams.delete('session_id')

      const response = await apiClient.createStripeCheckout({
        usdAmount,
        returnUrl: checkoutReturnUrl.toString(),
      })

      if (response.data.url) {
        if (response.data.sessionId) {
          window.sessionStorage.setItem(stripeSessionStorageKey, response.data.sessionId)
        }
        window.location.href = response.data.url
        return
      }

      setMessage('Card checkout URL was not returned by the server.')
    } catch (error) {
      console.error('Card checkout failed:', error)
      setMessage('Unable to start card checkout right now. Reconnect your account and try again.')
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
                  <div className="rounded-2xl border border-cyan-400 bg-cyan-500/10 px-4 py-4 text-left">
                    <p className="font-semibold text-white">Card</p>
                    <p className="mt-1 text-sm text-slate-400">Create a Stripe card checkout for the exact USD amount.</p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-left opacity-80">
                    <p className="font-semibold text-white">Crypto</p>
                    <p className="mt-1 text-sm text-slate-400">WIP. Crypto funding is temporarily disabled until the rebuilt flow is ready.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                Crypto funding is disabled for now. Use card checkout while the crypto flow is under active rebuild.
              </div>

              <button
                type="button"
                onClick={handleCardCheckout}
                disabled={actionLoading || verifyingCheckout || vtAmount <= 0}
                className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading || verifyingCheckout ? 'Processing...' : 'Continue to Card Checkout'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Live Status</p>
                <p className="mt-4 text-slate-300">{message}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-sm text-slate-300">
                Stripe is the only active funding method right now. The VT conversion remains fixed at 100 VT per $1 USD.
              </div>
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
