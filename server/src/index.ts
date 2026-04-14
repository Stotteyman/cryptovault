import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { CombatEngine, MatchmakingEngine, spinSlots, spinWheel } from './engine.js'
import * as characterService from './character-service.js'
import * as db from './db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const combatEngine = new CombatEngine()
const matchmakingEngine = new MatchmakingEngine()

// Initialize database at startup
db.initializeDb()

const dungeons = [
  { id: 1, name: 'Beginner Dungeon', difficulty: 1, reward: 3 },
  { id: 2, name: 'Novice Dungeon', difficulty: 2, reward: 6 },
  { id: 3, name: 'Veteran Dungeon', difficulty: 3, reward: 12 },
]

const marketplaceItems = [
  { id: 1, name: 'Steel Sword', price: 12, rarity: 'Uncommon' },
  { id: 2, name: 'Battle Helm', price: 18, rarity: 'Rare' },
  { id: 3, name: 'Potion Pack', price: 4, rarity: 'Common' },
]

const shopItems = [
  { id: 101, name: 'Starter Gear Pack', price: 25, description: 'A set of reliable equipment for new VaultCrawlers.' },
  { id: 102, name: 'Cosmetic Outfit', price: 15, description: 'A unique cosmetic set to stand out in the arena.' },
  { id: 103, name: 'Repair Bundle', price: 10, description: 'Instant gear repair credits for your next run.' },
]

const arenaRankings = [
  { rank: 1, name: 'ShadowHunter', elo: 1420 },
  { rank: 2, name: 'Duelist', elo: 1360 },
  { rank: 3, name: 'VaultWarden', elo: 1290 },
]

const characters = [
  { id: 'starter-character', name: 'Vault Initiate', class: 'Rogue', level: 1 },
]

const accountInfo = {
  address: '0x0000000000000000000000000000000000000000',
  nickname: 'Vault Traveler',
}

const accountBalance = { cvtBalance: 120.5 }

app.use(cors())
app.use(express.json())

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() })
})

app.get('/api/characters', (req: Request, res: Response) => {
  const { walletAddress } = req.query
  
  if (walletAddress) {
    // Get characters for a specific wallet
    const account = db.getOrCreateAccount(walletAddress as string) as any
    const characters = db.getCharactersByOwner(account.id) as any[]
    return res.json({ characters })
  }
  
  // If no wallet specified, return empty array (for backward compatibility)
  res.json({ characters: [] })
})

app.get('/api/characters/classes', (req: Request, res: Response) => {
  const classes = Object.values(characterService.CHARACTER_CLASSES).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    health: c.health,
    attack: c.attack,
    defense: c.defense,
    cost: c.cost,
  }))
  res.json({ classes })
})

app.post('/api/characters', (req: Request, res: Response) => {
  const { walletAddress, name, classId, color, effect } = req.body

  // Validate input
  if (!walletAddress || !name || !classId) {
    return res.status(400).json({ error: 'walletAddress, name, and classId are required' })
  }

  // Validate character creation parameters
  const validation = characterService.validateCharacterCreation({ name, classId, color, effect })
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error })
  }

  // Get or create account
  const account = db.getOrCreateAccount(walletAddress) as any

  // Calculate costs
  const charClass = characterService.CHARACTER_CLASSES[classId]
  if (!charClass) {
    return res.status(400).json({ error: 'Invalid character class' })
  }

  const costs = characterService.calculateTotalCharacterCost({
    classId,
    nameLength: name.trim().length,
    includeColor: !!color,
    includeEffect: !!effect,
  })

  // Check if account has sufficient balance
  if (account.cvtBalance < costs.total) {
    return res.status(400).json({
      error: 'Insufficient vault tokens',
      required: costs.total,
      available: account.cvtBalance,
      breakdown: costs,
    })
  }

  // Deduct costs from account
  db.updateAccountBalance(account.id, -costs.total)

  // Create character
  const newCharacter = {
    name: name.trim(),
    class: classId,
    health: charClass.health,
    attack: charClass.attack,
    defense: charClass.defense,
    nameColor: color || null,
    nameEffect: effect || null,
    nameCost: costs.nameCost,
    colorCost: costs.colorCost,
    effectCost: costs.effectCost,
    classCost: costs.classCost,
    ownerId: account.id,
    level: 1,
  }

  const character = db.createCharacter(newCharacter)

  res.status(201).json({
    character: {
      ...character,
      className: charClass.name,
    },
    costs,
    newBalance: (account.cvtBalance - costs.total),
  })
})

app.get('/api/dungeons', (req: Request, res: Response) => {
  res.json({ dungeons })
})

app.post('/api/dungeons/:id/enter', (req: Request, res: Response) => {
  const dungeonId = Number(req.params.id)
  const dungeon = dungeons.find((d) => d.id === dungeonId)
  if (!dungeon) {
    return res.status(404).json({ error: 'Dungeon not found' })
  }

  const encounter = {
    encounterId: `encounter-${Date.now()}`,
    encounterDescription: `Entered ${dungeon.name} with reward potential ${dungeon.reward} CVT`,
    enemy: { name: 'Dungeon Beast', health: dungeon.difficulty * 12, attack: 8, defense: 2 },
  }

  res.json(encounter)
})

app.post('/api/combat/turn', (req: Request, res: Response) => {
  const { action, characterId, encounterId } = req.body
  const player = { name: 'Vault Initiate', health: 100, attack: 14, defense: 6 }
  const enemy = { name: 'Dungeon Beast', health: 36, attack: 10, defense: 3 }
  const result = combatEngine.resolveTurn(player, enemy, action)
  res.json({ encounterId, result })
})

app.get('/api/arena/rankings', (req: Request, res: Response) => {
  res.json({ rankings: arenaRankings })
})

app.post('/api/arena/queue', (req: Request, res: Response) => {
  const { characterId, mode } = req.body
  const match = matchmakingEngine.findOpponent(1000)
  res.json({ matched: true, mode, ...match })
})

app.get('/api/marketplace', (req: Request, res: Response) => {
  res.json({ items: marketplaceItems })
})

app.post('/api/marketplace/list', (req: Request, res: Response) => {
  const { itemId, price } = req.body
  res.status(201).json({ message: 'Item listed successfully', itemId, price })
})

app.post('/api/marketplace/:itemId/buy', (req: Request, res: Response) => {
  const itemId = Number(req.params.itemId)
  const item = marketplaceItems.find((entry) => entry.id === itemId)
  if (!item) {
    return res.status(404).json({ error: 'Item not found' })
  }
  res.json({ message: `Purchased ${item.name} for ${item.price} CVT` })
})

app.get('/api/shop/items', (req: Request, res: Response) => {
  res.json({ items: shopItems })
})

app.post('/api/shop/purchase', (req: Request, res: Response) => {
  const { itemId } = req.body
  const item = shopItems.find((entry) => entry.id === itemId)
  if (!item) {
    return res.status(404).json({ error: 'Item not found' })
  }
  res.json({ message: `Purchased ${item.name} for ${item.price} CVT` })
})

app.post('/api/vault-token/purchase', (req: Request, res: Response) => {
  const { usdAmount } = req.body
  if (typeof usdAmount !== 'number' || usdAmount <= 0) {
    return res.status(400).json({ error: 'USD amount must be a positive number' })
  }
  const vtAmount = Math.round(usdAmount * 100)
  accountBalance.cvtBalance += vtAmount
  res.json({ vtAmount, cvtBalance: accountBalance.cvtBalance })
})

app.get('/api/account', (req: Request, res: Response) => {
  const { walletAddress } = req.query
  
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' })
  }

  const account = db.getOrCreateAccount(walletAddress as string) as any
  res.json({
    id: account.id,
    address: account.address,
    nickname: account.nickname,
    cvtBalance: account.cvtBalance,
  })
})

app.post('/api/account/settings', (req: Request, res: Response) => {
  const { walletAddress, nickname } = req.body
  if (!walletAddress || !nickname || typeof nickname !== 'string') {
    return res.status(400).json({ error: 'Wallet address and nickname are required' })
  }

  const account = db.getOrCreateAccount(walletAddress) as any
  db.updateAccountNickname(account.id, nickname)
  
  res.json({ message: 'Account settings updated', nickname })
})

app.get('/api/account/balance', (req: Request, res: Response) => {
  const { walletAddress } = req.query
  
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' })
  }

  const account = db.getOrCreateAccount(walletAddress as string) as any
  res.json({ cvtBalance: account.cvtBalance })
})

app.post('/api/account/withdraw', (req: Request, res: Response) => {
  const { amount, wallet } = req.body
  if (!amount || !wallet) {
    return res.status(400).json({ error: 'Withdraw amount and wallet required' })
  }
  res.json({ message: `Withdrawal of ${amount} CVT to ${wallet} initiated.` })
})

app.post('/api/slots/spin', (req: Request, res: Response) => {
  const { wager, walletAddress } = req.body
  if (typeof wager !== 'number' || wager <= 0) {
    return res.status(400).json({ error: 'Wager must be a positive number' })
  }
  
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' })
  }

  const account = db.getOrCreateAccount(walletAddress) as any
  
  if (account.cvtBalance < wager) {
    return res.status(400).json({ 
      error: 'Insufficient vault tokens',
      required: wager,
      available: account.cvtBalance,
    })
  }

  const outcome = spinSlots(wager)
  const net = outcome.reward - wager
  db.updateAccountBalance(account.id, net)
  const updatedAccount = db.getAccount(account.id) as any
  
  res.json({ ...outcome, newBalance: updatedAccount.cvtBalance })
})

app.post('/api/wheel/spin', (req: Request, res: Response) => {
  const { wager, walletAddress } = req.body
  if (typeof wager !== 'number' || wager <= 0) {
    return res.status(400).json({ error: 'Wager must be a positive number' })
  }
  
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' })
  }

  const account = db.getOrCreateAccount(walletAddress) as any
  
  if (account.cvtBalance < wager) {
    return res.status(400).json({ 
      error: 'Insufficient vault tokens',
      required: wager,
      available: account.cvtBalance,
    })
  }

  const outcome = spinWheel(wager)
  const net = outcome.reward - wager
  db.updateAccountBalance(account.id, net)
  const updatedAccount = db.getAccount(account.id) as any
  
  res.json({ reward: outcome.reward, bonus: outcome.bonus, message: outcome.message, newBalance: updatedAccount.cvtBalance })
})

// Character Customization Cost Estimation
app.post('/api/characters/cost-estimate', (req: Request, res: Response) => {
  const { classId, nameLength, includeColor, includeEffect } = req.body

  try {
    const costs = characterService.calculateTotalCharacterCost({
      classId,
      nameLength: nameLength || 0,
      includeColor: !!includeColor,
      includeEffect: !!includeEffect,
    })
    res.json(costs)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// List Character for Trade
app.post('/api/characters/:id/trade', (req: Request, res: Response) => {
  const { characterId, walletAddress, price } = req.body

  if (!characterId || !walletAddress || typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'characterId, walletAddress, and price are required' })
  }

  try {
    const trade = db.listCharacterForTrade(characterId, price, walletAddress)
    res.status(201).json(trade)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Get Trade Listings
app.get('/api/marketplace/characters', (req: Request, res: Response) => {
  try {
    const listings = db.getTradeListings()
    const enriched = listings.map((trade: any) => {
      const character = db.getCharacter(trade.characterId)
      return { ...trade, character }
    })
    res.json({ listings: enriched })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Buy Character
app.post('/api/marketplace/characters/:id/buy', (req: Request, res: Response) => {
  const characterId = req.params.id
  const { buyerWallet, newOwnerId } = req.body

  if (!buyerWallet || !newOwnerId) {
    return res.status(400).json({ error: 'buyerWallet and newOwnerId are required' })
  }

  try {
    const character = db.buyCharacter(characterId, buyerWallet, newOwnerId)
    res.json({ message: 'Character purchased successfully', character })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`CryptoVault Server running on http://localhost:${PORT}`)
  console.log('Health check: http://localhost:' + PORT + '/health')
})

export default app
