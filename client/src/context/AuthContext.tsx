import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '../services/api'
import { useWallet } from './WalletContext'

type AuthProvider = 'google' | 'apple' | 'discord' | 'steam' | 'metamask'

interface AuthUser {
  id: string
  email?: string
  provider: AuthProvider
  walletAddress?: string
}

interface AuthContextType {
  user: AuthUser | null
  isConnected: boolean
  initializing: boolean
  token: string | null
  account: any | null
  balance: number | null
  loading: boolean
  authProvider: AuthProvider | null
  loginWithGoogle: (profile: any) => Promise<void>
  loginWithApple: (profile: any) => Promise<void>
  loginWithDiscord: (profile: any) => Promise<void>
  loginWithSteam: (steamId: string) => Promise<void>
  loginWithWallet: (walletAddress: string) => Promise<void>
  logout: () => void
  verifyToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { account: walletAccount } = useWallet()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [account, setAccount] = useState<any>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [authProvider, setAuthProvider] = useState<AuthProvider | null>(null)

  // Check for stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedProvider = localStorage.getItem('authProvider') as AuthProvider | null

    if (storedToken && storedProvider) {
      setToken(storedToken)
      setAuthProvider(storedProvider)
      verifyStoredToken(storedToken).finally(() => setInitializing(false))
      return
    }

    setInitializing(false)
  }, [])

  useEffect(() => {
    if (initializing || token || !walletAccount) {
      return
    }

    let cancelled = false

    const restoreWalletAuth = async () => {
      try {
        setLoading(true)
        const response = await apiClient.loginWallet(walletAccount)

        if (cancelled) {
          return
        }

        setToken(response.data.token)
        setUser(response.data.user)
        setAuthProvider('metamask')

        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('authProvider', 'metamask')

        await hydrateAccountFromToken(response.data.token)
      } catch (error) {
        console.error('Wallet auth restore failed:', error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    restoreWalletAuth()

    return () => {
      cancelled = true
    }
  }, [initializing, token, walletAccount])

  const verifyStoredToken = async (token: string) => {
    try {
      const response = await apiClient.verifyToken(token)
      if (response.data.valid) {
        setUser(response.data.user)
        setAccount(response.data.account)
        setBalance(response.data.account?.cvt_balance)
      } else {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authProvider')
        setToken(null)
      }
    } catch (error) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('authProvider')
      setToken(null)
    }
  }

  const hydrateAccountFromToken = async (authToken: string) => {
    const verifyResponse = await apiClient.verifyToken(authToken)
    if (verifyResponse.data.valid) {
      setAccount(verifyResponse.data.account)
      setBalance(verifyResponse.data.account?.cvt_balance ?? null)
    }
  }

  const loginWithGoogle = async (profile: any) => {
    try {
      setLoading(true)
      const response = await apiClient.loginGoogle(profile)
      
      setToken(response.data.token)
      setUser(response.data.user)
      setAuthProvider('google')
      
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('authProvider', 'google')

      await hydrateAccountFromToken(response.data.token)
    } catch (error: any) {
      console.error('Google login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithApple = async (profile: any) => {
    try {
      setLoading(true)
      const response = await apiClient.loginApple(profile)
      
      setToken(response.data.token)
      setUser(response.data.user)
      setAuthProvider('apple')
      
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('authProvider', 'apple')

      await hydrateAccountFromToken(response.data.token)
    } catch (error: any) {
      console.error('Apple login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithDiscord = async (profile: any) => {
    try {
      setLoading(true)
      const response = await apiClient.loginDiscord(profile)
      
      setToken(response.data.token)
      setUser(response.data.user)
      setAuthProvider('discord')
      
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('authProvider', 'discord')

      await hydrateAccountFromToken(response.data.token)
    } catch (error: any) {
      console.error('Discord login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithSteam = async (steamId: string) => {
    try {
      setLoading(true)
      const response = await apiClient.loginSteam(steamId)
      
      setToken(response.data.token)
      setUser(response.data.user)
      setAuthProvider('steam')
      
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('authProvider', 'steam')

      await hydrateAccountFromToken(response.data.token)
    } catch (error: any) {
      console.error('Steam login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithWallet = async (walletAddress: string) => {
    try {
      setLoading(true)
      const response = await apiClient.loginWallet(walletAddress)
      
      setToken(response.data.token)
      setUser(response.data.user)
      setAuthProvider('metamask')
      
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('authProvider', 'metamask')

      await hydrateAccountFromToken(response.data.token)
    } catch (error: any) {
      console.error('Wallet login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setAccount(null)
    setBalance(null)
    setAuthProvider(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('authProvider')
  }

  const verifyToken = async (): Promise<boolean> => {
    if (!token) return false
    
    try {
      const response = await apiClient.verifyToken(token)
      return response.data.valid
    } catch {
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isConnected: !!user,
        initializing,
        token,
        account,
        balance,
        loading,
        authProvider,
        loginWithGoogle,
        loginWithApple,
        loginWithDiscord,
        loginWithSteam,
        loginWithWallet,
        logout,
        verifyToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
