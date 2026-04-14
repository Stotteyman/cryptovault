import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const apiClient = {
  // ===== AUTHENTICATION =====
  loginGoogle: (profile: any) => api.post('/api/auth/google', { profile }),
  loginApple: (profile: any) => api.post('/api/auth/apple', { profile }),
  loginDiscord: (profile: any) => api.post('/api/auth/discord', { profile }),
  loginSteam: (steamId: string) => api.post('/api/auth/steam', { steamId }),
  loginWallet: (walletAddress: string) => api.post('/api/auth/wallet', { walletAddress }),
  verifyToken: (token: string) => api.post('/api/auth/verify', {}, { headers: { Authorization: `Bearer ${token}` } }),

  // ===== CHARACTERS =====
  getCharacters: (walletAddress?: string) =>
    api.get('/api/characters', { params: walletAddress ? { walletAddress } : {} }),
  getCharacterClasses: () => api.get('/api/characters/classes'),
  createCharacter: (data: {
    walletAddress: string
    name: string
    classId: string
    color?: string
    effect?: string
  }) => api.post('/api/characters', data),
  getCharacter: (id: string) => api.get(`/api/characters/${id}`),
  levelUpCharacter: (id: string, walletAddress: string) =>
    api.post(`/api/characters/${id}/level-up`, { walletAddress }),
  estimateCharacterCost: (data: {
    classId: string
    nameLength: number
    includeColor: boolean
    includeEffect: boolean
  }) => api.post('/api/characters/cost-estimate', data),

  // ===== DUNGEONS =====
  getDungeons: () => api.get('/api/dungeons'),
  enterDungeon: (dungeonId: string, characterId: string) =>
    api.post(`/api/dungeons/${dungeonId}/enter`, { characterId }),

  // ===== COMBAT =====
  executeTurn: (data: { action: string; characterId: string; encounterId: string }) =>
    api.post('/api/combat/turn', data),

  // ===== ARENA =====
  getArenaRankings: () => api.get('/api/arena/rankings'),
  queueBattle: (data: { characterId: string; mode: string }) =>
    api.post('/api/arena/queue', data),

  // ===== SHOP & ITEMS =====
  getShopItems: () => api.get('/api/shop/items'),
  purchaseShopItem: (data: { itemId: number }) => api.post('/api/shop/purchase', data),
  purchaseVaultTokens: (data: { usdAmount: number }) => api.post('/api/payments/vt/purchase', data),

  // ===== MARKETPLACE =====
  getMarketplaceItems: (filters?: Record<string, any>) => api.get('/api/marketplace', { params: filters }),
  listItem: (data: { itemId: string; price: number }) => api.post('/api/marketplace/list', data),
  buyItem: (itemId: string) => api.post(`/api/marketplace/${itemId}/buy`),
  getCharactersForTrade: () => api.get('/api/marketplace/characters'),
  listCharacterForTrade: (data: { characterId: string; walletAddress: string; price: number }) =>
    api.post(`/api/characters/${data.characterId}/trade`, data),
  buyCharacter: (characterId: string, data: { buyerWallet: string; newOwnerId: string }) =>
    api.post(`/api/marketplace/characters/${characterId}/buy`, data),

  // ===== ACCOUNT =====
  getAccountInfo: (walletAddress?: string) =>
    api.get('/api/account', { params: walletAddress ? { walletAddress } : {} }),
  updateAccountSettings: (data: { walletAddress: string; nickname: string }) =>
    api.post('/api/account/settings', data),
  getBalance: (walletAddress?: string) =>
    api.get('/api/account/balance', { params: walletAddress ? { walletAddress } : {} }),
  withdrawCVT: (data: { amount: number; wallet: string }) =>
    api.post('/api/account/withdraw', data),

  // ===== MINI-GAMES =====
  spinSlotMachine: (data: { wager: number; walletAddress: string }) =>
    api.post('/api/slots/spin', data),
  spinPrizeWheel: (data: { wager: number; walletAddress: string }) =>
    api.post('/api/wheel/spin', data),

  // ===== PAYMENTS - STRIPE =====
  createStripeCheckout: (data: { tier: string; returnUrl: string }) =>
    api.post('/api/payments/stripe/checkout', data),
  verifyStripeCheckout: (sessionId: string) =>
    api.post('/api/payments/stripe/verify', { sessionId }),
  getVTPricingTiers: () => api.get('/api/payments/tiers'),

  // ===== PAYMENTS - APPLE =====
  verifyAppleIAP: (data: { receipt: string; productId: string }) =>
    api.post('/api/payments/apple/verify', data),

  // ===== PAYMENTS - GOOGLE =====
  verifyGoogleIAP: (data: { packageName: string; productId: string; purchaseToken: string }) =>
    api.post('/api/payments/google/verify', data),

  // ===== PURCHASE HISTORY =====
  getPurchaseHistory: () => api.get('/api/payments/history'),

  // ===== HEALTH CHECK =====
  healthCheck: () => api.get('/health'),
}
