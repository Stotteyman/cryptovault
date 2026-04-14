import { useState } from 'react'
import { apiClient } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function PrizeWheel() {
  const navigate = useNavigate()
  const [wager, setWager] = useState(20)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Spin the wheel to win tokens, gear, or bonus rewards.')
  const [rewardDetail, setRewardDetail] = useState<string | null>(null)

  const handleSpin = async () => {
    if (wager <= 0) {
      setMessage('Wager must be greater than zero.')
      return
    }

    setLoading(true)
    setMessage('Spinning the prize wheel...')
    try {
      const response = await apiClient.spinPrizeWheel({ wager })
      setMessage(response.data.message)
      setRewardDetail(response.data.reward || null)
    } catch (error) {
      console.error('Prize wheel spin failed:', error)
      setMessage('The prize wheel is offline at the moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-4xl mx-auto rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300/70">Prize Wheel</p>
            <h1 className="mt-3 text-4xl font-semibold">Take a spin for rewards</h1>
            <p className="mt-2 text-slate-400">Wager Vault Tokens to win bigger payouts or rare gear.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.6fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Wager</p>
            <input
              type="number"
              value={wager}
              min={1}
              onChange={(event) => setWager(Number(event.target.value))}
              className="mt-4 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleSpin}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Spinning...' : 'Spin Prize Wheel'}
            </button>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Outcome</p>
            <p className="mt-4 text-lg font-semibold text-white">{message}</p>
            {rewardDetail && <p className="mt-4 text-slate-300">{rewardDetail}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
