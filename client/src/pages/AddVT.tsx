import { useEffect, useState } from 'react'
import { apiClient } from '../services/api'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

interface PricingTier {
  id: string
  name: string
  price: number
  vt: number
}

export default function AddVT() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [usdAmount, setUsdAmount] = useState(5)
  const [vtAmount, setVtAmount] = useState(usdAmount * 100)
  const [loading, setLoading] = useState(true)
  const [stripeLoading, setStripeLoading] = useState(false)
  const [message, setMessage] = useState('Add Vault Tokens with direct crypto purchase or Stripe checkout packs.')

  useEffect(() => {
    const loadTiers = async () => {
      try {
        const response = await apiClient.getVTPricingTiers()
        const mappedTiers: PricingTier[] = Object.entries(response.data.tiers || {}).map(
          ([id, value]: [string, any]) => ({
            id,
            name: value.name,
            price: value.price,
            vt: value.vt,
          }),
        )
        setTiers(mappedTiers)
      } catch (error) {
        console.error('Failed to load VT tiers:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTiers()
  }, [])

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) return

    const verifyCheckout = async () => {
      try {
        const response = await apiClient.verifyStripeCheckout(sessionId)
        setMessage(`Stripe purchase verified. New VT balance: ${response.data.balance}.`)
        navigate(location.pathname, { replace: true })
      } catch (error) {
        console.error('Stripe verification failed:', error)
        setMessage('Stripe checkout was not verified. If you were charged, contact support.')
      }
    }

    verifyCheckout()
  }, [searchParams, navigate, location.pathname])

  useEffect(() => {
    setVtAmount(Math.max(0, usdAmount * 100))
  }, [usdAmount])

  const handlePurchaseVT = async () => {
    if (usdAmount <= 0) {
      setMessage('Enter a valid USD amount to buy VT.')
      return
    }

    setMessage('Processing crypto VT purchase...')
    try {
      const response = await apiClient.purchaseVaultTokens({ usdAmount })
      setMessage(`Purchased ${response.data.vtAmount} VT. New VT balance: ${response.data.cvtBalance}.`)
    } catch (error) {
      console.error('Direct VT purchase failed:', error)
      setMessage('Unable to complete direct VT purchase right now.')
    }
  }

  const handleStripeCheckout = async (tier: PricingTier) => {
    setStripeLoading(true)
    setMessage(`Starting Stripe checkout for ${tier.name}...`)
    try {
      const checkoutReturnUrl = new URL(window.location.href)
      checkoutReturnUrl.searchParams.delete('session_id')

      const response = await apiClient.createStripeCheckout({
        tier: tier.id,
        returnUrl: checkoutReturnUrl.toString(),
      })

      if (response.data.url) {
        window.location.href = response.data.url
        return
      }

      setMessage('Stripe checkout URL was not returned by server.')
    } catch (error) {
      console.error('Stripe checkout failed:', error)
      setMessage('Unable to start Stripe checkout right now.')
    } finally {
      setStripeLoading(false)
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
              <p className="mt-2 text-slate-400">Choose direct purchase or Stripe packs to add VT to your account.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <h2 className="text-xl font-semibold text-white">Direct Purchase</h2>
              <p className="mt-3 text-slate-400">$1 USD = 100 VT</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-slate-300">USD Amount</span>
                  <input
                    type="number"
                    value={usdAmount}
                    min={1}
                    onChange={(event) => setUsdAmount(Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Vault Tokens</span>
                  <input
                    readOnly
                    value={vtAmount}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={handlePurchaseVT}
                className="mt-6 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Purchase VT
              </button>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Live status</p>
              <p className="mt-4 text-slate-300">{message}</p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950 p-6">
            <h2 className="text-xl font-semibold text-white">Stripe Packs</h2>
            {loading ? (
              <p className="mt-4 text-slate-400">Loading Stripe packs...</p>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {tiers.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    disabled={stripeLoading}
                    onClick={() => handleStripeCheckout(tier)}
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-sm transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <p className="font-semibold text-white">{tier.name}</p>
                    <p className="mt-1 text-slate-300">${tier.price.toFixed(2)} • {tier.vt.toLocaleString()} VT</p>
                  </button>
                ))}
              </div>
            )}
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
