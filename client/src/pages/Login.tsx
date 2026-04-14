import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletContext'
import { useState, useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { Link } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const { isConnected, account, loginWithGoogle, loginWithApple, loginWithDiscord, loginWithSteam, loginWithWallet, loading } = useAuth()
  const { syncWalletAddress } = useWallet()
  const [localLoading, setLocalLoading] = useState(false)
  const [error, setError] = useState('')
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const isGoogleConfigured = Boolean(googleClientId)

  const finalizeLogin = () => {
    navigate('/dashboard')
  }

  const fetchGoogleProfile = async (accessToken: string) => {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Google profile')
    }

    return response.json()
  }

  const handleGoogleClick = useGoogleLogin({
    onSuccess: async (tokenResponse: any) => {
      try {
        setLocalLoading(true)
        setError('')

        const accessToken = tokenResponse.access_token || tokenResponse.accessToken
        if (!accessToken) {
          throw new Error('Google auth token was not returned')
        }

        const profile = await fetchGoogleProfile(accessToken)
        await loginWithGoogle(profile)
        navigate('/dashboard')
      } catch (err: any) {
        setError(err?.response?.data?.error || err?.message || 'Google login failed')
      } finally {
        setLocalLoading(false)
      }
    },
    onError: () => {
      setError('Failed to sign in with Google')
    },
  })

  const handleWalletConnect = async () => {
    try {
      setLocalLoading(true)
      setError('')
      // Assuming MetaMask or similar provider is available
      if (!window.ethereum) {
        setError('MetaMask not installed. Please install MetaMask to connect.')
        return
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (!accounts || !accounts[0]) {
        setError('No wallet account returned by MetaMask.')
        return
      }

      await syncWalletAddress(accounts[0])
      await loginWithWallet(accounts[0])
      finalizeLogin()
    } catch (err: any) {
      setError(err.message || 'Wallet connection failed')
    } finally {
      setLocalLoading(false)
    }
  }

  const handleAppleConnect = async () => {
    try {
      setLocalLoading(true)
      setError('')

      const generatedId = `apple_dev_${Date.now()}`
      const profile = {
        sub: generatedId,
        email: `${generatedId}@vaultcrawler.local`,
      }

      await loginWithApple(profile)
      finalizeLogin()
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Apple login failed')
    } finally {
      setLocalLoading(false)
    }
  }

  const handleDiscordConnect = async () => {
    try {
      setLocalLoading(true)
      setError('')
      const generatedId = `discord_dev_${Date.now()}`
      const profile = {
        id: generatedId,
        email: `${generatedId}@vaultcrawler.local`,
      }

      await loginWithDiscord(profile)
      finalizeLogin()
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Discord login failed')
    } finally {
      setLocalLoading(false)
    }
  }

  const handleSteamConnect = async () => {
    try {
      setLocalLoading(true)
      setError('')

      const steamId = window.prompt('Enter your Steam ID to continue:')
      if (!steamId) {
        setError('Steam ID is required to continue.')
        return
      }

      await loginWithSteam(steamId.trim())
      finalizeLogin()
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Steam login failed')
    } finally {
      setLocalLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && account) {
      navigate('/dashboard')
    }
  }, [isConnected, account, navigate])

  const isLoading = loading || localLoading

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="space-y-8">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-cyan-300/70">Vault Crawler</p>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mt-4">Risk. Loot. Survive. Repeat.</h1>
            <p className="mt-6 text-lg text-slate-300 max-w-2xl leading-8">
              A crypto dungeon crawler where you can login with Google, Apple, Discord, Steam, or MetaMask. Purchase Vault Tokens and climb the ranks.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-6 shadow-xl ring-1 ring-cyan-500/10">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80 mb-3">Multi-Platform</p>
              <p className="text-sm text-slate-300 leading-7">
                Login with your favorite account and purchase VT packs on web, iOS, and Android.
              </p>
            </div>
            <div className="rounded-3xl border border-purple-500/20 bg-slate-900/70 p-6 shadow-xl ring-1 ring-purple-500/10">
              <p className="text-xs uppercase tracking-[0.4em] text-purple-300/80 mb-3">Multiple Providers</p>
              <ul className="text-sm text-slate-300 leading-7 space-y-2">
                <li>• Google & Apple Sign-In</li>
                <li>• Discord & Steam OAuth</li>
                <li>• Web3 Wallet Support</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Sign In</h2>
              <p className="text-sm text-slate-400">Choose your preferred login method</p>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              {/* Google Sign-In */}
              <button
                type="button"
                onClick={async () => {
                  if (!isGoogleConfigured) {
                    try {
                      setLocalLoading(true)
                      setError('Google OAuth not configured; using local dev Google identity.')
                      const generatedId = `google_dev_${Date.now()}`
                      await loginWithGoogle({
                        sub: generatedId,
                        email: `${generatedId}@vaultcrawler.local`,
                      })
                      finalizeLogin()
                    } catch (err: any) {
                      setError(err?.response?.data?.error || err?.message || 'Google login failed')
                    } finally {
                      setLocalLoading(false)
                    }
                    return
                  }
                  handleGoogleClick()
                }}
                disabled={isLoading}
                className={`w-full rounded-2xl px-4 py-4 text-sm font-semibold transition flex items-center justify-center gap-3 ${
                  isLoading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-slate-950 hover:bg-slate-100'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.91 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  />
                </svg>
                {isGoogleConfigured ? 'Sign in with Google' : 'Continue with Google (Dev)'}
              </button>

              {/* Apple Sign-In */}
              <button
                type="button"
                onClick={handleAppleConnect}
                disabled={isLoading}
                className={`w-full rounded-2xl px-4 py-4 text-sm font-semibold transition flex items-center justify-center gap-3 ${
                  isLoading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-slate-800'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.635 11.672c-.02-2.405 1.968-3.598 2.057-3.653-1.12-1.641-2.857-1.866-3.476-1.893-1.48-.15-2.88.872-3.633.872-.768 0-1.955-.857-3.216-.834-1.655.025-3.182.96-4.034 2.44-1.72 2.982-.44 7.413 1.235 9.835.82 1.188 1.795 2.523 3.08 2.473 1.248-.05 1.718-.808 3.227-.808 1.495 0 1.93.809 3.227.784 1.33-.02 2.17-1.213 2.97-2.41.938-1.36 1.322-2.68 1.34-2.748-.03-.01-2.617-1.004-2.64-3.993z" />
                </svg>
                Continue with Apple
              </button>

              {/* Discord */}
              <button
                type="button"
                onClick={handleDiscordConnect}
                disabled={isLoading}
                className={`w-full rounded-2xl px-4 py-4 text-sm font-semibold transition flex items-center justify-center gap-3 ${
                  isLoading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-[#5865F2] text-white hover:bg-[#4752C4]'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.607 1.25a18.27 18.27 0 00-5.487 0c-.163-.386-.399-.875-.609-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.042-.106 13.107 13.107 0 01-1.872-.892.077.077 0 00-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 00.03-.066c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 00.032.066c.12.099.246.197.373.291a.077.077 0 00-.006.127c-.6.35-1.235.638-1.872.892a.077.077 0 00-.041.107c.352.699.764 1.365 1.226 1.994a.076.076 0 00.084.028 19.86 19.86 0 006.002-3.03.077.077 0 00.032-.054c.5-4.506-.838-8.962-3.551-12.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156 0-1.193.946-2.157 2.157-2.157 1.211 0 2.176.964 2.157 2.157 0 1.19-.946 2.156-2.157 2.156zm7.975 0c-1.183 0-2.157-.965-2.157-2.156 0-1.193.946-2.157 2.157-2.157 1.211 0 2.176.964 2.157 2.157 0 1.19-.946 2.156-2.157 2.156z" />
                </svg>
                Continue with Discord
              </button>

              {/* Steam */}
              <button
                type="button"
                onClick={handleSteamConnect}
                disabled={isLoading}
                className={`w-full rounded-2xl px-4 py-4 text-sm font-semibold transition flex items-center justify-center gap-3 ${
                  isLoading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm6.563 6.57a8.758 8.758 0 012.056 5.596 8.758 8.758 0 01-.26 2.12l-2.892-1.194a2.903 2.903 0 00-2.903-2.902h-.05l-1.302-1.86V6.623a8.756 8.756 0 015.351.947zM8.048 18.606l1.934.8a2.904 2.904 0 005.793-.256l2.075.856A8.742 8.742 0 0112 21.379a8.744 8.744 0 01-3.952-.773zm4.838-.427a1.452 1.452 0 11-1.453-1.451 1.453 1.453 0 011.453 1.451zm2.759-.478a2.894 2.894 0 00-5.154-1.84l-2.978-1.23a8.753 8.753 0 016.969-6.286l1.37 1.958v.023a2.903 2.903 0 001.26 3.824 2.9 2.9 0 001.819.327l2.703 1.115a8.771 8.771 0 01-1.617 2.78l-2.37-.978z" />
                </svg>
                Continue with Steam
              </button>

              {/* MetaMask/Crypto Wallet */}
              <button
                type="button"
                onClick={handleWalletConnect}
                disabled={isLoading}
                className={`w-full rounded-2xl px-4 py-4 text-sm font-semibold transition flex items-center justify-center gap-3 ${
                  isLoading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                Connect MetaMask
              </button>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-400 leading-5">
                By signing in, you agree to our Terms of Service. Your authentication is secured and your account will be saved.
              </p>
              <div className="mt-3 flex gap-4 text-xs">
                <Link to="/terms" className="text-cyan-300 hover:text-cyan-200">Terms of Service</Link>
                <Link to="/disclaimer" className="text-cyan-300 hover:text-cyan-200">Disclaimer</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

