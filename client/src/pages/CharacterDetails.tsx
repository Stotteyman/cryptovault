import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletContext'

interface CharacterRecord {
  id: string
  name: string
  class: string
  className?: string
  level: number
  health: number
  attack: number
  defense: number
  experience?: number
  nameColor?: string | null
  nameEffect?: string | null
  classCost?: number
  colorCost?: number
  effectCost?: number
  ownerId?: string
}

const EQUIPMENT_SLOTS = [
  { id: 'weapon', label: 'Weapon', value: 'No weapon equipped' },
  { id: 'armor', label: 'Armor', value: 'No armor equipped' },
  { id: 'trinket', label: 'Trinket', value: 'No trinket equipped' },
  { id: 'relic', label: 'Relic', value: 'No relic equipped' },
]

export default function CharacterDetails() {
  const navigate = useNavigate()
  const { characterId } = useParams()
  const { account: walletAccount } = useWallet()
  const { account: authAccount } = useAuth()
  const walletAddress = walletAccount || authAccount?.wallet_address || ''

  const [character, setCharacter] = useState<CharacterRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const levelUpCost = useMemo(() => {
    if (!character) return 0
    return Math.max(100, character.level * 100)
  }, [character])

  useEffect(() => {
    const loadCharacter = async () => {
      if (!characterId) {
        setMessage('Character not found.')
        setLoading(false)
        return
      }

      try {
        const [characterResponse, classesResponse] = await Promise.all([
          apiClient.getCharacter(characterId),
          apiClient.getCharacterClasses(),
        ])

        const loadedCharacter = characterResponse.data.character
        const classMatch = classesResponse.data.classes.find((entry: { id: string; name: string }) => entry.id === loadedCharacter.class)

        setCharacter({
          ...loadedCharacter,
          className: classMatch?.name || loadedCharacter.class,
        })
      } catch (error: any) {
        console.error('Failed to load character:', error)
        setMessage(error?.response?.data?.error || 'Unable to load character details right now.')
      } finally {
        setLoading(false)
      }
    }

    loadCharacter()
  }, [characterId])

  const handleLevelUp = async () => {
    if (!characterId || !walletAddress) {
      setMessage('Connect a wallet-linked account to manage this character.')
      return
    }

    setBusy(true)
    setMessage('Leveling up character...')
    try {
      const response = await apiClient.levelUpCharacter(characterId, walletAddress)
      setCharacter(response.data.character)
      setMessage(`${response.data.message} (-${response.data.levelUpCost} VT)`)
    } catch (error: any) {
      console.error('Failed to level up character:', error)
      setMessage(error?.response?.data?.error || 'Unable to level up this character right now.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-slate-300">Loading character menu...</div>
        </div>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl">
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-100">
            {message || 'Character not found.'}
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/characters')}
              className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Back to Characters
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8 rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/70">Character Menu</p>
            <h1 className="mt-3 text-4xl font-semibold" style={{ color: character.nameColor || undefined }}>
              {character.name}
            </h1>
            <p className="mt-2 text-slate-400">
              {character.className || character.class} build, level {character.level}, ready for roster management.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleLevelUp}
              disabled={busy || !walletAddress}
              className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Leveling...' : `Level Up (${levelUpCost} VT)`}
            </button>
            <button
              type="button"
              onClick={() => navigate('/characters')}
              className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Back to Characters
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Health</p>
                <p className="mt-3 text-3xl font-semibold text-white">{character.health}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Attack</p>
                <p className="mt-3 text-3xl font-semibold text-white">{character.attack}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Defense</p>
                <p className="mt-3 text-3xl font-semibold text-white">{character.defense}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Experience</p>
                <p className="mt-3 text-3xl font-semibold text-white">{character.experience || 0}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Equipped Items</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {EQUIPMENT_SLOTS.map((slot) => (
                  <div key={slot.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{slot.label}</p>
                    <p className="mt-2 text-sm text-slate-300">{slot.value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500">Equipment persistence is not wired yet, so this menu shows your current empty slots and leaves room for the live item system.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Overview</p>
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
                  <span className="text-slate-500">Class</span>
                  <span>{character.className || character.class}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
                  <span className="text-slate-500">Name Color</span>
                  <span>{character.nameColor || 'Default'}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
                  <span className="text-slate-500">Name Effect</span>
                  <span>{character.nameEffect || 'None'}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
                  <span className="text-slate-500">Class Unlock Cost</span>
                  <span>{(character.classCost || 0).toLocaleString()} VT</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
                  <span className="text-slate-500">Color Cost</span>
                  <span>{(character.colorCost || 0).toLocaleString()} VT</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Effect Cost</span>
                  <span>{(character.effectCost || 0).toLocaleString()} VT</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Management</p>
              <div className="mt-5 space-y-4 text-sm text-slate-300">
                <p>Use this menu to review the character, level it up, and prepare for equipment management once the live item system is connected.</p>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-300">
                  Next level-up cost: <span className="font-semibold text-white">{levelUpCost.toLocaleString()} VT</span>
                </div>
              </div>
            </div>

            {message && (
              <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6 text-sm text-cyan-100">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}