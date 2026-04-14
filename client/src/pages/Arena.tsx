import { useEffect, useState } from 'react'
import { apiClient } from '../services/api'

interface RankEntry {
  rank: number
  name: string
  elo: number
}

export default function Arena() {
  const [rankings, setRankings] = useState<RankEntry[]>([])
  const [queueMessage, setQueueMessage] = useState<string>('Ready for battle.')
  const [isQueueing, setIsQueueing] = useState(false)

  useEffect(() => {
    const loadRankings = async () => {
      try {
        const response = await apiClient.getArenaRankings()
        setRankings(response.data.rankings)
      } catch (error) {
        console.error('Failed to load arena rankings:', error)
      }
    }

    loadRankings()
  }, [])

  const joinQueue = async () => {
    setIsQueueing(true)
    setQueueMessage('Searching for opponents...')
    try {
      const response = await apiClient.queueBattle({ characterId: 'starter-character', mode: '1v1' })
      setQueueMessage(response.data.message)
    } catch (error) {
      console.error('Failed to join arena queue:', error)
      setQueueMessage('Unable to join queue at this time.')
    } finally {
      setIsQueueing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-rose-300/70">Arena</p>
            <h1 className="mt-3 text-4xl font-semibold">PvP Matchmaking</h1>
            <p className="mt-2 text-slate-400">Queue for a duel and see where you rank in the season.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 px-5 py-4 text-sm text-slate-300">
            {queueMessage}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Arena Rankings</h2>
            <div className="mt-6 space-y-4">
              {rankings.map((entry) => (
                <div key={entry.rank} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div>
                    <p className="font-semibold text-white">#{entry.rank} {entry.name}</p>
                    <p className="text-sm text-slate-400">ELO {entry.elo}</p>
                  </div>
                </div>
              ))}
              {rankings.length === 0 && <p className="text-slate-400">No ranking data available right now.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Quick Queue</h2>
            <p className="mt-3 text-slate-400">Jump into a ranked 1v1 duel and earn VT for victories.</p>
            <button
              type="button"
              onClick={joinQueue}
              disabled={isQueueing}
              className="mt-6 w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isQueueing ? 'Searching...' : 'Join Arena Queue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
