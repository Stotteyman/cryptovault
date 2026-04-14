import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useState, useEffect } from 'react'

export default function Login() {
  const navigate = useNavigate()
  const { account, connectWallet, isConnected } = useWallet()
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    try {
      await connectWallet()
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && account) {
      navigate('/dashboard')
    }
  }, [isConnected, account, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="space-y-8">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-cyan-300/70">CryptoVault</p>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mt-4">Risk. Loot. Survive. Repeat.</h1>
            <p className="mt-6 text-lg text-slate-300 max-w-2xl leading-8">
              A minimalist crypto dungeon crawler with real token rewards, permadeath stakes, and PvP arenas. Connect your MetaMask wallet to play, earn CVT, and trade gear on a player-driven marketplace.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-6 shadow-xl ring-1 ring-cyan-500/10">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80 mb-3">Game Info</p>
              <p className="text-sm text-slate-300 leading-7">
                Enter dungeons and arenas, manage gear durability, and earn CVT loot that can be withdrawn to your wallet.
              </p>
            </div>
            <div className="rounded-3xl border border-purple-500/20 bg-slate-900/70 p-6 shadow-xl ring-1 ring-purple-500/10">
              <p className="text-xs uppercase tracking-[0.4em] text-purple-300/80 mb-3">What to expect</p>
              <ul className="text-sm text-slate-300 leading-7 space-y-2">
                <li>• Permadeath characters and gear repair mechanics</li>
                <li>• PvP arena battles and ranked matchmaking</li>
                <li>• Minimalist graphics with fast load performance</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-3xl border border-white/10 p-8 shadow-2xl">
            <div className="flex flex-col gap-4">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Login with Wallet</p>
              <button
                type="button"
                onClick={handleConnect}
                disabled={loading}
                className={`w-full rounded-2xl px-6 py-4 text-lg font-semibold transition ${
                  loading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500'
                }`}
              >
                {loading ? 'Connecting Wallet...' : 'Connect MetaMask Wallet'}
              </button>
              <p className="text-sm text-slate-400">
                Your session is saved per visit. Once connected, you can return and stay logged in as long as your wallet is available.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="space-y-6">
            <div className="rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-6">
              <h2 className="text-xl font-semibold text-cyan-200 mb-2">Quick Start</h2>
              <ul className="space-y-3 text-slate-300 text-sm leading-7">
                <li>1. Click Connect with MetaMask</li>
                <li>2. Create your first character</li>
                <li>3. Enter a dungeon or arena</li>
                <li>4. Loot CVT and upgrade gear</li>
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-purple-500/10 bg-purple-500/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-purple-300/80 mb-3">Network Support</p>
                <p className="text-sm text-slate-300">Ethereum Mainnet, Polygon, and Web3 wallet-ready.</p>
              </div>
              <div className="rounded-3xl border border-slate-600/40 bg-slate-900/70 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400/80 mb-3">Security</p>
                <p className="text-sm text-slate-300">MetaMask never exposes private keys. Transactions require explicit approval.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
