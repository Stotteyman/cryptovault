import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../services/api'
import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'

interface Character {
  id: string
  name: string
  class: string
  level: number
  health: number
  attack: number
  defense: number
  experience?: number
  nameColor?: string | null
}

export default function Characters() {
  const navigate = useNavigate()
  const { account: walletAccount } = useWallet()
  const { account: authAccount } = useAuth()
  const walletAddress = walletAccount || authAccount?.wallet_address || ''

  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [busyCharacterId, setBusyCharacterId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const canManage = useMemo(() => Boolean(walletAddress), [walletAddress])

  const loadCharacters = async () => {
    if (!walletAddress) {
      setCharacters([])
      setLoading(false)
      return
    }

    try {
      const response = await apiClient.getCharacters(walletAddress)
      setCharacters(response.data.characters || [])
    } catch (error: any) {
      console.error('Failed to load characters:', error)
      setMessage(error?.response?.data?.error || 'Unable to load characters right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadCharacters()
  }, [walletAddress])

  const handleLevelUp = async (characterId: string) => {
    if (!walletAddress) {
      setMessage('Connect a wallet-linked account to level up characters.')
      return
    }

    setBusyCharacterId(characterId)
    setMessage('Leveling up character...')
    try {
      const response = await apiClient.levelUpCharacter(characterId, walletAddress)
      setMessage(`${response.data.message} (-${response.data.levelUpCost} VT)`)
      await loadCharacters()
    } catch (error: any) {
      console.error('Failed to level up character:', error)
      setMessage(error?.response?.data?.error || 'Unable to level up character right now.')
    } finally {
      setBusyCharacterId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/70">Character Menu</p>
            <h1 className="mt-3 text-4xl font-semibold">Manage Characters</h1>
            <p className="mt-2 text-slate-400">Review your roster, monitor stats, and spend VT to level up.</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/create-character')}
              className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Create Character
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {!canManage && (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-100">
            This account has no connected wallet address yet. Add or connect a wallet in Account Settings to manage characters.
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-slate-300">Loading character roster...</div>
        ) : characters.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-slate-300">
            No characters found for this account. Create your first character to get started.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {characters.map((character) => (
              <div key={character.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold" style={{ color: character.nameColor || undefined }}>
                    {character.name}
                  </h2>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                    {character.class}
                  </span>
                </div>
                <p className="mt-3 text-slate-300">Level {character.level}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-slate-400">
                  <p>HP {character.health}</p>
                  <p>ATK {character.attack}</p>
                  <p>DEF {character.defense}</p>
                </div>
                <p className="mt-2 text-sm text-slate-500">XP {character.experience || 0}</p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/characters/${character.id}`)}
                    className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    Open Menu
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLevelUp(character.id)}
                    disabled={!canManage || busyCharacterId === character.id}
                    className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busyCharacterId === character.id ? 'Leveling...' : `Quick Level Up (${Math.max(100, character.level * 100)} VT)`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {message && <p className="mt-6 text-sm text-cyan-300">{message}</p>}
      </div>
    </div>
  )
}
