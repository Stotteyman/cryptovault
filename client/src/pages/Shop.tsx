import { useEffect, useState } from 'react'
import { apiClient } from '../services/api'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletContext'

interface ShopItem {
  id: number
  name: string
  price: number
  description: string
  category?: string
}

export default function Shop() {
  const navigate = useNavigate()
  const { account: walletAccount } = useWallet()
  const { account: authAccount } = useAuth()
  const walletAddress = walletAccount || authAccount?.wallet_address || ''
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Browse categories and purchase items with your VT balance.')

  useEffect(() => {
    const loadItems = async () => {
      try {
        const shopResponse = await apiClient.getShopItems()
        setItems(shopResponse.data.items || [])
      } catch (error) {
        console.error('Failed to load shop items:', error)
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [])

  const handleItemPurchase = async (itemId: number) => {
    if (!walletAddress) {
      setMessage('Connect a wallet-linked account before purchasing items.')
      return
    }

    setMessage('Completing item purchase...')
    try {
      const response = await apiClient.purchaseShopItem({ itemId, walletAddress })
      setMessage(`${response.data.message}. New balance: ${response.data.cvtBalance.toFixed(2)} VT.`)
    } catch (error: any) {
      console.error('Item purchase failed:', error)
      setMessage(error?.response?.data?.error || 'Item purchase failed. Try again.')
    }
  }

  const groupedItems = items.reduce<Record<string, ShopItem[]>>((accumulator, item) => {
    const category = item.category || 'General'
    if (!accumulator[category]) {
      accumulator[category] = []
    }
    accumulator[category].push(item)
    return accumulator
  }, {})

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/70">Shop</p>
              <h1 className="mt-3 text-4xl font-semibold">Item Categories & Prices</h1>
              <p className="mt-2 text-slate-400">Focus your loadout by category and buy the exact gear you need.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/add-vt')}
              className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Add VT
            </button>
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Open Inventory
            </button>
          </div>
          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950 p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Live status</p>
            <p className="mt-4 text-slate-300">{message}</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Available Items</h2>
          </div>

          {loading ? (
            <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950 p-10 text-center text-slate-400">Loading shop items...</div>
          ) : (
            <div className="mt-8 space-y-8">
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-emerald-300">{category}</h3>
                  <div className="mt-4 grid gap-6 lg:grid-cols-3">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                        <h4 className="text-xl font-semibold text-white">{item.name}</h4>
                        <p className="mt-3 text-slate-400">{item.description}</p>
                        <div className="mt-6 flex items-center justify-between gap-4">
                          <span className="text-lg font-semibold text-cyan-300">{item.price} VT</span>
                          <button
                            type="button"
                            onClick={() => handleItemPurchase(item.id)}
                            className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                          >
                            Buy Item
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <Link to="/terms" className="text-cyan-300 hover:text-cyan-200">Terms of Service</Link>
          <Link to="/disclaimer" className="text-cyan-300 hover:text-cyan-200">Disclaimer</Link>
        </div>
      </div>
    </div>
  )
}
