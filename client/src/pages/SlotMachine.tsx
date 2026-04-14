import { useState } from 'react'
import { apiClient } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function SlotMachine() {
  const navigate = useNavigate()
  const [wager, setWager] = useState(10)
  const [message, setMessage] = useState('Place a wager and spin the vault slots.')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSpin = async () => {
    if (wager <= 0) {
      setMessage('Enter a wager greater than zero.')
      return
    }

    setLoading(true)
    setMessage('Spinning...')
    try {
      const response = await apiClient.spinSlotMachine({ wager })
      const data = response.data
      setResult(data.result)
      setMessage(data.message)
    } catch (error) {
      console.error('Slot spin failed:', error)
      setMessage('The slot machine is unavailable right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-4xl mx-auto rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-pink-300/70">Slot Machine</p>
            <h1 className="mt-3 text-4xl font-semibold">Wager VT for prizes</h1>
            <p className="mt-2 text-slate-400">Spin the vault reels for a chance to win more tokens or rare gear.</p>
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
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Spin Details</p>
            <div className="mt-6 grid gap-3">
              <label className="text-sm text-slate-300">Wager VT</label>
              <input
                type="number"
                value={wager}
                min={1}
                onChange={(event) => setWager(Number(event.target.value))}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-pink-400"
              />
              <button
                type="button"
                onClick={handleSpin}
                disabled={loading}
                className="mt-4 rounded-2xl bg-pink-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Spinning...' : 'Spin the Slots'}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Result</p>
            <p className="mt-4 text-lg font-semibold text-white">{message}</p>
            {result && <p className="mt-4 text-slate-300">{result}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
