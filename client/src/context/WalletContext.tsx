import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'

interface WalletContextType {
  account: string | null
  balance: string | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  syncWalletAddress: (walletAddress: string) => Promise<void>
  disconnectWallet: () => void
  provider: ethers.BrowserProvider | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Check if wallet is already connected on mount
  useEffect(() => {
    const restoreConnection = async () => {
      if (typeof window === 'undefined' || !window.ethereum) return

      const savedAddress = localStorage.getItem('walletAddress')
      if (savedAddress) {
        await connectWalletInternal(savedAddress, false)
        return
      }

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        })
        if (accounts && accounts.length > 0) {
          await connectWalletInternal(accounts[0], false)
        }
      } catch (error) {
        console.error('Failed to restore wallet connection:', error)
      }
    }

    restoreConnection()
  }, [])

  const connectWalletInternal = async (selectedAccount?: string, requestAccounts = true) => {
    try {
      if (!window.ethereum) {
        alert('MetaMask not installed. Please install MetaMask.')
        return
      }

      const newProvider = new ethers.BrowserProvider(window.ethereum)
      setProvider(newProvider)

      let walletAddress = selectedAccount || null
      if (requestAccounts) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        walletAddress = accounts[0]
      }

      if (!walletAddress) {
        throw new Error('No wallet address available')
      }

      setAccount(walletAddress)
      setIsConnected(true)

      const balanceWei = await newProvider.getBalance(walletAddress)
      const balanceEth = ethers.formatEther(balanceWei)
      setBalance(balanceEth)

      localStorage.setItem('walletAddress', walletAddress)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('Failed to connect wallet. See console for details.')
    }
  }

  const connectWallet = async () => {
    await connectWalletInternal()
  }

  const syncWalletAddress = async (walletAddress: string) => {
    await connectWalletInternal(walletAddress, false)
  }

  const disconnectWallet = () => {
    setAccount(null)
    setBalance(null)
    setProvider(null)
    setIsConnected(false)
    localStorage.removeItem('walletAddress')
  }

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          connectWalletInternal(accounts[0])
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  return (
    <WalletContext.Provider
      value={{
        account,
        balance,
        isConnected,
        connectWallet,
        syncWalletAddress,
        disconnectWallet,
        provider,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
