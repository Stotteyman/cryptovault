import { useEffect, useState } from 'react'
import { apiClient } from '../services/api'

interface ShopItem {
  id: number
  name: string
  price: number
  description: string
}

export default function Shop() {
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [usdAmount, setUsdAmount] = useState(5)
  const [vtAmount, setVtAmount] = useState(usdAmount * 100)
  const [message, setMessage] = useState('Purchase VT or gear to power up your VaultCrawler.')

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await apiClient.getShopItems()
        setItems(response.data.items)
      } catch (error) {
        console.error('Failed to load shop items:', error)
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [])

  useEffect(() => {
    setVtAmount(Math.max(0, usdAmount * 100))
  }, [usdAmount])

  const handlePurchaseVT = async () => {
    if (usdAmount <= 0) {
      setMessage('Enter a valid USD amount to buy VT.')
      return
    }

    setMessage('Processing purchase...')
    try {
      const response = await apiClient.purchaseVaultTokens({ usdAmount })
      setMessage(`Purchased ${response.data.vtAmount} VT (${usdAmount} USD). New VT balance: ${response.data.cvtBalance}.`)
    } catch (error) {
      console.error('Vault token purchase failed:', error)
      setMessage('Unable to purchase VT right now.')
    }
  }

  const handleItemPurchase = async (itemId: number) => {
    setMessage('Completing item purchase...')
    try {
      const response = await apiClient.purchaseShopItem({ itemId })
      setMessage(response.data.message)
    } catch (error) {
      console.error('Item purchase failed:', error)
      setMessage('Item purchase failed. Try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/70">Shop</p>
              <h1 className="mt-3 text-4xl font-semibold">Purchase VT & gear</h1>
              <p className="mt-2 text-slate-400">Convert USD to Vault Tokens and buy starter packs or cosmetics.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_0.6fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <h2 className="text-xl font-semibold text-white">Buy Vault Tokens</h2>
              <p className="mt-3 text-slate-400">$1 USD = 100 VT. Enter an amount to calculate the VT reward automatically.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr]">
                <label className="block">
                  <span className="text-sm text-slate-300">USD Amount</span>
                  <input
                    type="number"
                    value={usdAmount}
                    min={1}
                    onChange={(e) => setUsdAmount(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Vault Tokens</span>
                  <input
                    readOnly
                    value={vtAmount}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={handlePurchaseVT}
                className="mt-6 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Purchase VT
              </button>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Live status</p>
              <p className="mt-4 text-slate-300">{message}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured Shop Items</h2>
          </div>

          {loading ? (
            <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950 p-10 text-center text-slate-400">Loading shop items...</div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                  <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                  <p className="mt-3 text-slate-400">{item.description}</p>
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <span className="text-lg font-semibold text-cyan-300">{item.price} CVT</span>
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
          )}
        </div>
      </div>
    </div>
  )
}
