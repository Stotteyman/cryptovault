import { useEffect, useState } from 'react'
import { apiClient } from '../services/api'

interface MarketItem {
  id: number
  name: string
  price: number
  rarity: string
}

export default function Marketplace() {
  const [items, setItems] = useState<MarketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await apiClient.getMarketplaceItems()
        setItems(response.data.items)
      } catch (error) {
        console.error('Failed to load marketplace items:', error)
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [])

  const purchaseItem = async (itemId: number) => {
    setMessage('Processing purchase...')
    try {
      await apiClient.buyItem(itemId.toString())
      setMessage('Purchase successful! Check inventory to equip gear.')
    } catch (error) {
      console.error('Marketplace purchase failed:', error)
      setMessage('Purchase failed. Try again later.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-300/70">Marketplace</p>
            <h1 className="mt-3 text-4xl font-semibold">Player Gear Market</h1>
            <p className="mt-2 text-slate-400">Shop for gear, cosmetics, and battle supplies.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 px-5 py-4 text-sm text-slate-300">
            {message || 'Buy items to optimize your run.'}
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">Loading marketplace...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center justify-between text-slate-400 text-sm uppercase tracking-[0.3em]">
                  <span>{item.rarity}</span>
                  <span>{item.price} VT</span>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-white">{item.name}</h2>
                <button
                  type="button"
                  onClick={() => purchaseItem(item.id)}
                  className="mt-6 w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                >
                  Buy Item
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
