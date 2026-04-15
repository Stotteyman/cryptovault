import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletContext'
import { apiClient } from '../services/api'

interface InventoryItem {
  id: string
  item_id: number
  name: string
  category: string
  description?: string
  rarity: string
  quantity: number
  equipped: boolean
}

export default function Inventory() {
  const navigate = useNavigate()
  const { account: walletAccount } = useWallet()
  const { account: authAccount } = useAuth()
  const walletAddress = walletAccount || authAccount?.wallet_address || ''

  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyItemId, setBusyItemId] = useState<string | null>(null)
  const [message, setMessage] = useState('Manage your acquired items, equip what you need, and discard what you do not.')

  const groupedItems = useMemo(() => {
    return inventory.reduce<Record<string, InventoryItem[]>>((groups, item) => {
      const key = item.category || 'General'
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
      return groups
    }, {})
  }, [inventory])

  const loadInventory = async () => {
    if (!walletAddress) {
      setInventory([])
      setBalance(null)
      setLoading(false)
      return
    }

    try {
      const response = await apiClient.getInventory(walletAddress)
      setInventory(response.data.inventory || [])
      setBalance(response.data.cvtBalance ?? null)
    } catch (error: any) {
      console.error('Failed to load inventory:', error)
      setMessage(error?.response?.data?.error || 'Unable to load inventory right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadInventory()
  }, [walletAddress])

  const handleEquipToggle = async (item: InventoryItem) => {
    if (!walletAddress) {
      setMessage('Connect a wallet-linked account to manage inventory.')
      return
    }

    setBusyItemId(item.id)
    setMessage(item.equipped ? 'Unequipping item...' : 'Equipping item...')
    try {
      const response = await apiClient.setInventoryEquipped({
        walletAddress,
        inventoryItemId: item.id,
        equipped: !item.equipped,
      })

      setMessage(response.data.message)
      await loadInventory()
    } catch (error: any) {
      console.error('Failed to update equipped state:', error)
      setMessage(error?.response?.data?.error || 'Unable to update item state right now.')
    } finally {
      setBusyItemId(null)
    }
  }

  const handleDiscard = async (item: InventoryItem) => {
    if (!walletAddress) {
      setMessage('Connect a wallet-linked account to manage inventory.')
      return
    }

    setBusyItemId(item.id)
    setMessage('Discarding item...')
    try {
      const response = await apiClient.discardInventoryItem({
        walletAddress,
        inventoryItemId: item.id,
      })
      setMessage(response.data.message)
      await loadInventory()
    } catch (error: any) {
      console.error('Failed to discard item:', error)
      setMessage(error?.response?.data?.error || 'Unable to discard item right now.')
    } finally {
      setBusyItemId(null)
    }
  }

  const rarityClass = (rarity: string) => {
    switch ((rarity || '').toLowerCase()) {
      case 'rare':
        return 'text-cyan-300'
      case 'uncommon':
        return 'text-emerald-300'
      case 'legendary':
        return 'text-amber-300'
      default:
        return 'text-slate-300'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/70">Inventory</p>
          <h1 className="mt-3 text-4xl font-semibold">Gear & Items</h1>
          <p className="mt-2 text-slate-400">Manage acquired items, equip them, and clean up your inventory.</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Open Shop
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

        {!walletAddress && (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-100">
            This account has no connected wallet address yet. Connect a wallet-linked account in settings to manage inventory.
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">Loading inventory...</div>
        ) : inventory.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            No items acquired yet. Buy something in the Shop to populate your inventory.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
                <p className="text-lg font-semibold text-white">{category}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-base font-semibold text-white">{item.name}</p>
                        <span className={`text-xs uppercase tracking-[0.2em] ${rarityClass(item.rarity)}`}>{item.rarity}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{item.description || 'No description available.'}</p>
                      <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                        <span>Quantity: {item.quantity}</span>
                        <span>{item.equipped ? 'Equipped' : 'Not Equipped'}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEquipToggle(item)}
                          disabled={busyItemId === item.id}
                          className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {busyItemId === item.id ? 'Saving...' : item.equipped ? 'Unequip' : 'Equip'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDiscard(item)}
                          disabled={busyItemId === item.id}
                          className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {busyItemId === item.id ? 'Saving...' : 'Discard 1'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Inventory Notes</p>
          <p className="mt-3 text-slate-400">{message}</p>
          {balance !== null && <p className="mt-2 text-sm text-cyan-300">Current balance: {balance.toFixed(2)} VT</p>}
        </div>
      </div>
    </div>
  )
}
