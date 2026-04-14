import { useEffect, useState } from 'react'
import { apiClient } from '../services/api'
import { useNavigate } from 'react-router-dom'

interface Dungeon {
  id: number
  name: string
  difficulty: number
  reward: number
}

export default function Dungeons() {
  const [dungeons, setDungeons] = useState<Dungeon[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDungeon, setActiveDungeon] = useState<number | null>(null)
  const [message, setMessage] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    const loadDungeons = async () => {
      try {
        const response = await apiClient.getDungeons()
        setDungeons(response.data.dungeons)
      } catch (error) {
        console.error('Failed to load dungeons:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDungeons()
  }, [])

  const enterDungeon = async (dungeonId: number) => {
    setActiveDungeon(dungeonId)
    setMessage('Entering dungeon...')
    try {
      const response = await apiClient.enterDungeon(dungeonId.toString(), 'starter-character')
      setMessage(`Dungeon entered: ${response.data.encounterDescription}`)
      navigate('/arena')
    } catch (error) {
      console.error('Failed to enter dungeon:', error)
      setMessage('Unable to enter dungeon right now.')
    } finally {
      setActiveDungeon(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/70">Dungeon Gateway</p>
            <h1 className="mt-3 text-4xl font-semibold">Select a Dungeon</h1>
            <p className="mt-2 text-slate-400">Choose a fast run that fits your build and risk tolerance.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 px-5 py-4 text-sm text-slate-300">
            {message || 'Select a dungeon to begin your run.'}
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">Loading dungeons...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {dungeons.map((dungeon) => (
              <div key={dungeon.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center justify-between text-slate-400 text-sm uppercase tracking-[0.3em]">
                  <span>{dungeon.name}</span>
                  <span>Tier {dungeon.difficulty}</span>
                </div>
                <p className="mt-6 text-2xl font-semibold text-white">{dungeon.reward} VT</p>
                <p className="mt-3 text-slate-400 text-sm">A quick, optimized run with fast combat and solid loot.</p>
                <button
                  type="button"
                  onClick={() => enterDungeon(dungeon.id)}
                  disabled={activeDungeon === dungeon.id}
                  className="mt-6 w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {activeDungeon === dungeon.id ? 'Entering...' : 'Enter Dungeon'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
