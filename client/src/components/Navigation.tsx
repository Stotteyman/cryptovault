import { useWallet } from '../context/WalletContext'
import { useNavigate } from 'react-router-dom'

interface NavItem {
  label: string
  path: string
  icon: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Dungeons', path: '/dungeons', icon: '⚔️' },
  { label: 'Arena', path: '/arena', icon: '🗡️' },
  { label: 'Inventory', path: '/inventory', icon: '🎒' },
  { label: 'Marketplace', path: '/marketplace', icon: '💰' },
  { label: 'Shop', path: '/shop', icon: '🛍️' },
]

export default function Navigation() {
  const { account, disconnectWallet } = useWallet()
  const navigate = useNavigate()

  const handleDisconnect = () => {
    disconnectWallet()
    navigate('/')
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <nav className="bg-gray-800 border-b border-purple-500/30">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">🎮 CryptoVault</h1>
          <div className="flex items-center gap-4">
            <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400">Connected Wallet</p>
              <p className="text-sm text-white font-mono">{formatAddress(account!)}</p>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white bg-gray-700/50 hover:bg-purple-600/50 transition flex items-center gap-2"
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
