import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

const memoryDb = {
  accounts: new Map<string, any>(),
  accountByAuthId: new Map<string, string>(),
  accountByWallet: new Map<string, string>(),
  characters: new Map<string, any>(),
  purchases: [] as any[],
  trades: [] as any[],
}

function createMemoryId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function shouldUseMemoryFallback(error: any) {
  const message = String(error?.message || error || '').toLowerCase()
  return message.includes('fetch failed') || message.includes('network') || message.includes('timeout')
}

/**
 * Initialize database schema and tables
 */
export async function initializeDb() {
  console.log('Database already initialized in Supabase cloud')
}

// ===== ACCOUNT OPERATIONS =====

export async function getOrCreateAccount(walletAddress: string, authId?: string) {
  try {
    // First check if account exists
    const { data: existing } = await supabase
      .from('accounts')
      .select('*')
      .or(`wallet_address.eq.${walletAddress},auth_id.eq.${authId}`)
      .single()

    if (existing) {
      return existing
    }

    // Create new account
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        wallet_address: walletAddress,
        auth_id: authId,
        nickname: 'Vault Traveler',
        cvt_balance: 100.0,
        auth_provider: 'metamask',
      })
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) throw error

    if (authId) {
      const existingId = memoryDb.accountByAuthId.get(authId)
      if (existingId) return memoryDb.accounts.get(existingId)
    }

    if (walletAddress) {
      const existingId = memoryDb.accountByWallet.get(walletAddress.toLowerCase())
      if (existingId) return memoryDb.accounts.get(existingId)
    }

    const id = createMemoryId('acct')
    const account = {
      id,
      wallet_address: walletAddress || null,
      auth_id: authId || null,
      nickname: 'Vault Traveler',
      cvt_balance: 100.0,
      auth_provider: walletAddress ? 'metamask' : 'oauth',
    }

    memoryDb.accounts.set(id, account)
    if (authId) memoryDb.accountByAuthId.set(authId, id)
    if (walletAddress) memoryDb.accountByWallet.set(walletAddress.toLowerCase(), id)

    return account
  }
}

export async function getAccount(id: string) {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) throw error
    const account = memoryDb.accounts.get(id)
    if (!account) throw new Error('Account not found')
    return account
  }
}

export async function getAccountByAuthId(authId: string) {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('auth_id', authId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) throw error
    const id = memoryDb.accountByAuthId.get(authId)
    return id ? memoryDb.accounts.get(id) : null
  }
}

export async function getAccountByWallet(walletAddress: string) {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) throw error
    const id = memoryDb.accountByWallet.get(walletAddress.toLowerCase())
    return id ? memoryDb.accounts.get(id) : null
  }
}

export async function updateAccountBalance(id: string, amount: number) {
  const { data, error } = await supabase
    .from('accounts')
    .update({ cvt_balance: supabase.rpc('increment_balance', { amount, account_id: id }) })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function incrementAccountBalance(id: string, amount: number) {
  try {
    const current = await getAccount(id)
    const { data, error } = await supabase
      .from('accounts')
      .update({ cvt_balance: current.cvt_balance + amount })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) throw error
    const current = memoryDb.accounts.get(id)
    if (!current) throw new Error('Account not found')
    current.cvt_balance = (current.cvt_balance || 0) + amount
    memoryDb.accounts.set(id, current)
    return current
  }
}

export async function updateAccountNickname(id: string, nickname: string) {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .update({ nickname })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) throw error
    const current = memoryDb.accounts.get(id)
    if (!current) throw new Error('Account not found')
    current.nickname = nickname
    memoryDb.accounts.set(id, current)
    return current
  }
}

// ===== CHARACTER OPERATIONS =====

export async function createCharacter(character: any) {
  try {
    const { data, error } = await supabase
      .from('characters')
      .insert({
        name: character.name,
        class: character.class,
        level: character.level || 1,
        health: character.health,
        attack: character.attack,
        defense: character.defense,
        name_color: character.nameColor || null,
        name_effect: character.nameEffect || null,
        name_cost: character.nameCost || 0,
        color_cost: character.colorCost || 0,
        effect_cost: character.effectCost || 0,
        class_cost: character.classCost || 0,
        owner_id: character.ownerId,
      })
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) throw error
    const id = createMemoryId('char')
    const row = {
      id,
      name: character.name,
      class: character.class,
      level: character.level || 1,
      health: character.health,
      attack: character.attack,
      defense: character.defense,
      name_color: character.nameColor || null,
      name_effect: character.nameEffect || null,
      name_cost: character.nameCost || 0,
      color_cost: character.colorCost || 0,
      effect_cost: character.effectCost || 0,
      class_cost: character.classCost || 0,
      owner_id: character.ownerId,
    }
    memoryDb.characters.set(id, row)
    return row
  }
}

export async function getCharacter(id: string) {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) throw error
    return memoryDb.characters.get(id) || null
  }
}

export async function getCharactersByOwner(ownerId: string) {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('owner_id', ownerId)

    if (error) throw error
    return data || []
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) throw error
    return Array.from(memoryDb.characters.values()).filter((c) => c.owner_id === ownerId)
  }
}

export async function updateCharacter(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('characters')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) throw error
    const current = memoryDb.characters.get(id)
    if (!current) throw new Error('Character not found')
    const updated = { ...current, ...updates }
    memoryDb.characters.set(id, updated)
    return updated
  }
}

// ===== PURCHASE/TRANSACTION OPERATIONS =====

export async function recordPurchase(purchase: {
  accountId: string
  paymentMethod: 'stripe' | 'apple' | 'google' | 'crypto'
  amount: number
  vtAmount: number
  transactionId: string
  status: string
}) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .insert({
        account_id: purchase.accountId,
        payment_method: purchase.paymentMethod,
        amount_usd: purchase.amount,
        vt_amount: purchase.vtAmount,
        transaction_id: purchase.transactionId,
        status: purchase.status,
      })
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) throw error
    const row = {
      id: createMemoryId('purchase'),
      account_id: purchase.accountId,
      payment_method: purchase.paymentMethod,
      amount_usd: purchase.amount,
      vt_amount: purchase.vtAmount,
      transaction_id: purchase.transactionId,
      status: purchase.status,
      created_at: new Date().toISOString(),
    }
    memoryDb.purchases.push(row)
    return row
  }
}

export async function getPurchaseByTransactionId(transactionId: string) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('transaction_id', transactionId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) throw error
    return memoryDb.purchases.find((p) => p.transaction_id === transactionId) || null
  }
}

export async function getPurchaseHistory(accountId: string) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) throw error
    return memoryDb.purchases
      .filter((p) => p.account_id === accountId)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  }
}

// ===== TRADE OPERATIONS =====

export async function listCharacterForTrade(characterId: string, price: number, seller: string) {
  const { data, error } = await supabase
    .from('trades')
    .insert({
      character_id: characterId,
      from_wallet: seller,
      price,
      status: 'listing',
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function buyCharacter(characterId: string, buyerWallet: string, newOwnerId: string) {
  // Update character ownership
  const { error: charError } = await supabase
    .from('characters')
    .update({
      owner_id: newOwnerId,
      is_trading: false,
      trade_price: null,
      trade_offered_by: null,
    })
    .eq('id', characterId)

  if (charError) throw charError

  // Mark trade as completed
  const { error: tradeError } = await supabase
    .from('trades')
    .update({ to_wallet: buyerWallet, status: 'completed' })
    .eq('character_id', characterId)
    .eq('status', 'listing')

  if (tradeError) throw tradeError

  return await getCharacter(characterId)
}

export async function getTradeListings() {
  const { data, error } = await supabase
    .from('trades')
    .select(
      `
      *,
      character:characters(*)
    `
    )
    .eq('status', 'listing')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export default supabase
