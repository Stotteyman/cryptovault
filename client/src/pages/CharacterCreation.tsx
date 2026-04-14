import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../services/api'

interface ClassOption {
  id: string
  name: string
  description: string
  health: number
  attack: number
  defense: number
  cost: number
}

interface CostBreakdown {
  classCost: number
  nameCost: number
  colorCost: number
  effectCost: number
  total: number
}

export default function CharacterCreation() {
  const navigate = useNavigate()
  const { account } = useWallet()
  const { account: authAccount } = useAuth()
  const effectiveWallet = account || authAccount?.wallet_address || ''
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [name, setName] = useState('')
  const [color, setColor] = useState(false)
  const [effect, setEffect] = useState(false)
  const [costs, setCosts] = useState<CostBreakdown | null>(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await apiClient.getCharacterClasses()
        setClasses(response.data.classes)
        if (response.data.classes.length > 0) {
          setSelectedClass(response.data.classes[0].id)
        }
      } catch (error) {
        console.error('Failed to load character classes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [])

  // Update costs whenever name, class, color, or effect changes
  useEffect(() => {
    const updateCosts = async () => {
      if (!selectedClass) return
      
      try {
        const response = await apiClient.estimateCharacterCost({
          classId: selectedClass,
          nameLength: name.trim().length,
          includeColor: color,
          includeEffect: effect,
        })
        setCosts(response.data)
      } catch (error) {
        console.error('Failed to calculate costs:', error)
      }
    }

    updateCosts()
  }, [selectedClass, name, color, effect])

  const handleCreate = async () => {
    if (!selectedClass || !name.trim()) {
      setStatus('Choose a class and enter a name.')
      return
    }

    if (!effectiveWallet) {
      setStatus('Wallet not connected. Please connect your wallet.')
      return
    }

    setStatus('Creating character...')
    try {
      await apiClient.createCharacter({
        walletAddress: effectiveWallet,
        name: name.trim(),
        classId: selectedClass,
        color: color ? '#00d9ff' : undefined,
        effect: effect ? 'glow' : undefined,
      })
      setStatus('Character created! Redirecting to dashboard...')
      setTimeout(() => navigate('/dashboard'), 800)
    } catch (error: any) {
      console.error('Character creation failed:', error)
      const message = error.response?.data?.error || 'Unable to create character. Please try again.'
      setStatus(message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-5xl mx-auto rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300/70">Character Creation</p>
            <h1 className="mt-3 text-4xl font-semibold">Create your first Vault Crawler</h1>
          <p className="mt-2 text-slate-400">Pick a class, customize your name, and start your dungeon journey.</p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-10 text-center text-slate-400">Loading classes...</div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[0.9fr_0.7fr]">
            <div className="space-y-6">
              {classes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedClass(option.id)}
                  className={`w-full rounded-3xl border p-6 text-left transition ${
                    selectedClass === option.id
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">{option.name}</h2>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                      {option.cost === 0 ? 'FREE' : `${option.cost.toLocaleString()} VT`}
                    </span>
                  </div>
                  <p className="mt-3 text-slate-400">{option.description}</p>
                  <div className="mt-4 flex gap-4 text-sm text-slate-300">
                    <span>Attack {option.attack}</span>
                    <span>Defense {option.defense}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <label className="block text-sm font-medium text-slate-300">Character Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your character name"
                  maxLength={30}
                  className="mt-3 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
                <p className="mt-2 text-xs text-slate-500">{name.length}/30 characters</p>

                {name.length > 0 && (
                  <div className="mt-4 space-y-3 rounded-2xl bg-slate-800/50 p-4">
                    <p className="text-xs font-medium text-slate-400">Name Length Pricing:</p>
                    <p className="text-xs text-slate-400">
                      {name.length === 1
                        ? '1 letter = 100,000 VT'
                        : name.length === 2
                          ? '2 letters = 50,000 VT'
                          : name.length === 3
                            ? '3 letters = 25,000 VT'
                            : name.length === 4
                              ? '4 letters = 10,000 VT'
                              : name.length === 5
                                ? '5 letters = 5,000 VT'
                                : '6+ letters = FREE'}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <label className="block text-sm font-medium text-slate-300">Customizations</label>
                <div className="mt-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={color}
                      onChange={(e) => setColor(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-700 bg-slate-800"
                    />
                    <span className="text-sm text-slate-300">Add Color (+10,000 VT)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={effect}
                      onChange={(e) => setEffect(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-700 bg-slate-800"
                    />
                    <span className="text-sm text-slate-300">Add Effect (+10,000 VT)</span>
                  </label>
                </div>
              </div>

              {costs && (
                <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-6">
                  <p className="text-sm font-medium text-cyan-300">Cost Breakdown</p>
                  <div className="mt-3 space-y-2 text-sm">
                    {costs.classCost > 0 && <div className="flex justify-between text-slate-400"><span>Class:</span> <span>{costs.classCost.toLocaleString()} VT</span></div>}
                    {costs.nameCost > 0 && <div className="flex justify-between text-slate-400"><span>Name:</span> <span>{costs.nameCost.toLocaleString()} VT</span></div>}
                    {costs.colorCost > 0 && <div className="flex justify-between text-slate-400"><span>Color:</span> <span>{costs.colorCost.toLocaleString()} VT</span></div>}
                    {costs.effectCost > 0 && <div className="flex justify-between text-slate-400"><span>Effect:</span> <span>{costs.effectCost.toLocaleString()} VT</span></div>}
                    <div className="border-t border-slate-700 pt-2 flex justify-between text-cyan-300 font-semibold">
                      <span>Total:</span>
                      <span>{costs.total.toLocaleString()} VT</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleCreate}
                disabled={!name.trim() || !selectedClass}
                className="w-full rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                Create Character
              </button>
              {status && <p className={`mt-4 text-sm ${status.includes('failed') || status.includes('Unable') || status.includes('Insufficient') ? 'text-red-300' : 'text-cyan-300'}`}>{status}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
