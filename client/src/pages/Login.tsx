export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">CryptoVault</h1>
        <p className="text-xl text-gray-300 mb-8">Risk. Loot. Survive. Repeat.</p>
        <button 
          onClick={() => alert('MetaMask login will be implemented')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  )
}
