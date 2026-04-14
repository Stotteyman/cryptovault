import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { apiClient } from '../services/api'

export default function Settings() {
  const { account } = useWallet()
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const loadAccount = async () => {
      if (!account) return
      try {
        const response = await apiClient.getAccountInfo(account)
        setNickname(response.data.nickname || '')
      } catch (error) {
        console.error('Failed to load account info:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAccount()
  }, [account])

  const handleSave = async () => {
    if (!account) {
      setStatus('Wallet not connected.')
      return
    }
    setStatus('Saving settings...')
    try {
      await apiClient.updateAccountSettings({ walletAddress: account, nickname })
      setStatus('Nickname updated successfully.')
    } catch (error) {
      console.error('Failed to save settings:', error)
      setStatus('Unable to save settings. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-4xl mx-auto rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/70">Account Settings</p>
            <h1 className="mt-3 text-4xl font-semibold">Manage your account</h1>
            <p className="mt-2 text-slate-400">Update your nickname and view your wallet status.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Wallet</p>
            <p className="mt-4 text-sm text-slate-300">Connected address</p>
            <p className="mt-2 break-all text-white">{account ?? 'Not connected'}</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
            <label className="block text-sm font-medium text-slate-300">Nickname</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
              placeholder="Enter your VaultCrawler name"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="mt-6 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save Settings
            </button>
            <p className="mt-4 text-sm text-slate-400">Nickname makes you easier to recognize in leaderboards and arena matches.</p>
            {status && <p className="mt-3 text-sm text-cyan-300">{status}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
