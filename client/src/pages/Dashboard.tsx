import { useEffect, useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '../services/api'

interface DashboardStats {
  characters: number
  dungeons: number
  cvt: number
}

export default function Dashboard() {
  const { account, balance, disconnectWallet } = useWallet()
  const { account: authAccount, balance: authBalance, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({ characters: 0, dungeons: 0, cvt: 0 })
  const [loading, setLoading] = useState(true)
  const effectiveWallet = account || authAccount?.wallet_address || null

  const handleDisconnect = () => {
    disconnectWallet()
    logout()
    navigate('/')
  }

  useEffect(() => {
    const loadStats = async () => {
      if (!effectiveWallet) {
        setStats((current) => ({ ...current, cvt: authBalance ?? current.cvt }))
        setLoading(false)
        return
      }

      try {
        const [charRes, dungeonRes, balanceRes] = await Promise.all([
          apiClient.getCharacters(effectiveWallet),
          apiClient.getDungeons(),
          apiClient.getBalance(effectiveWallet),
        ])

        setStats({
          characters: charRes.data.characters.length,
          dungeons: dungeonRes.data.dungeons.length,
          cvt: balanceRes.data.cvtBalance ?? 0,
        })
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [effectiveWallet, authBalance])

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Vault Crawler Hub</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-2 text-slate-400">Your wallet, progression, and quick actions in one place.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/settings')}
              className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Settings
            </button>
            <button
              onClick={handleDisconnect}
              className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500"
            >
              Disconnect
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Wallet Address</p>
            <p className="mt-4 text-lg font-semibold text-white">{effectiveWallet ? formatAddress(effectiveWallet) : 'Not connected'}</p>
            <p className="text-sm text-slate-400 mt-2">Balance: {balance ?? '0'} ETH</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Progress</p>
            {loading ? (
              <p className="mt-4 text-slate-400">Loading progress...</p>
            ) : (
              <>
                <p className="mt-4 text-3xl font-semibold text-white">{stats.characters}</p>
                <p className="text-sm text-slate-400 mt-2">Characters created</p>
              </>
            )}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">VT Balance</p>
            {loading ? (
              <p className="mt-4 text-slate-400">Fetching VT...</p>
            ) : (
              <>
                <p className="mt-4 text-3xl font-semibold text-cyan-300">{stats.cvt.toFixed(2)} VT</p>
                <p className="text-sm text-slate-400 mt-2">Spend on gear, entry fees, and premium systems.</p>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div
            onClick={() => navigate('/add-vt')}
            className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 transition hover:border-emerald-300/50 hover:bg-slate-900 cursor-pointer"
          >
            <p className="text-5xl">💰</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Add VT</h2>
            <p className="mt-3 text-slate-400">Add Vault Tokens to your account using crypto or Stripe packs.</p>
          </div>

          <div
            onClick={() => navigate('/create-character')}
            className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 transition hover:border-cyan-300/50 hover:bg-slate-900 cursor-pointer"
          >
            <p className="text-5xl">🛡️</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Create Character</h2>
            <p className="mt-3 text-slate-400">Build your Vault Crawler hero and begin the dungeon loop.</p>
          </div>

          <div
            onClick={() => navigate('/shop')}
            className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 transition hover:border-blue-300/50 hover:bg-slate-900 cursor-pointer"
          >
            <p className="text-5xl">🛒</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Item Shop</h2>
            <p className="mt-3 text-slate-400">Browse item categories, compare prices, and purchase gear.</p>
          </div>

          <div
            onClick={() => navigate('/slot-machine')}
            className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 transition hover:border-pink-300/50 hover:bg-slate-900 cursor-pointer"
          >
            <p className="text-5xl">🎰</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Slot Machine</h2>
            <p className="mt-3 text-slate-400">Wager VT for the chance to win rare gear or more tokens.</p>
          </div>

          <div
            onClick={() => navigate('/prize-wheel')}
            className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 transition hover:border-amber-300/50 hover:bg-slate-900 cursor-pointer"
          >
            <p className="text-5xl">🎡</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Prize Wheel</h2>
            <p className="mt-3 text-slate-400">Spin for boosted token payouts and bonus rewards.</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300 shadow-lg">
          <h3 className="text-xl font-semibold text-white">Vault Crawler Quick Start</h3>
          <ul className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <li>✓ Create a character to begin dungeon runs.</li>
            <li>✓ Purchase VT in the shop to stock up for upgrades.</li>
            <li>✓ Use mini-games to earn bonus rewards.</li>
            <li>✓ Update your account nickname in Settings.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
          <Link to="/terms" className="text-cyan-300 hover:text-cyan-200">Terms of Service</Link>
          <Link to="/disclaimer" className="text-cyan-300 hover:text-cyan-200">Disclaimer</Link>
        </div>
      </div>
    </div>
  )
}
