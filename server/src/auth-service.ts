import jwt from 'jsonwebtoken'
import { getOrCreateAccount, getAccountByAuthId } from './supabase.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'

export interface AuthPayload {
  id: string
  authId: string
  email?: string
  provider: string
  walletAddress?: string
}

export interface AuthUser {
  id: string
  email?: string
  provider: string
}

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload
  } catch (error) {
    return null
  }
}

/**
 * Handle Google OAuth callback
 */
export async function handleGoogleAuth(profile: any): Promise<{ token: string; accountId: string }> {
  const authId = `google_${profile.sub}`
  const email = profile.email

  let account = await getAccountByAuthId(authId)

  if (!account) {
    account = await getOrCreateAccount('', authId)
    // Update account with email and provider
    // First add email to account if schema allows
  }

  const token = generateToken({
    id: account.id,
    authId,
    email,
    provider: 'google',
  })

  return { token, accountId: account.id }
}

/**
 * Handle Apple OAuth callback
 */
export async function handleAppleAuth(profile: any): Promise<{ token: string; accountId: string }> {
  const authId = `apple_${profile.sub}`
  const email = profile.email

  let account = await getAccountByAuthId(authId)

  if (!account) {
    account = await getOrCreateAccount('', authId)
  }

  const token = generateToken({
    id: account.id,
    authId,
    email,
    provider: 'apple',
  })

  return { token, accountId: account.id }
}

/**
 * Handle Discord OAuth callback
 */
export async function handleDiscordAuth(profile: any): Promise<{ token: string; accountId: string }> {
  const authId = `discord_${profile.id}`
  const email = profile.email

  let account = await getAccountByAuthId(authId)

  if (!account) {
    account = await getOrCreateAccount('', authId)
  }

  const token = generateToken({
    id: account.id,
    authId,
    email,
    provider: 'discord',
  })

  return { token, accountId: account.id }
}

/**
 * Handle Steam OAuth callback
 */
export async function handleSteamAuth(steamId: string): Promise<{ token: string; accountId: string }> {
  const authId = `steam_${steamId}`

  let account = await getAccountByAuthId(authId)

  if (!account) {
    account = await getOrCreateAccount('', authId)
  }

  const token = generateToken({
    id: account.id,
    authId,
    provider: 'steam',
  })

  return { token, accountId: account.id }
}

/**
 * Handle MetaMask wallet auth
 */
export async function handleWalletAuth(walletAddress: string): Promise<{ token: string; accountId: string }> {
  const authId = `wallet_${walletAddress.toLowerCase()}`

  let account = await getOrCreateAccount(walletAddress, authId)

  const token = generateToken({
    id: account.id,
    authId,
    provider: 'metamask',
    walletAddress,
  })

  return { token, accountId: account.id }
}

/**
 * Middleware to verify JWT token in requests
 */
export function verifyTokenMiddleware(token: string | undefined): AuthPayload | null {
  if (!token) return null

  // Extract token from "Bearer <token>" format
  const bearerToken = token.startsWith('Bearer ') ? token.slice(7) : token

  return verifyToken(bearerToken)
}
