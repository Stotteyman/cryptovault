import Stripe from 'stripe'
import { getAccount, getPurchaseByTransactionId, recordPurchase, incrementAccountBalance } from './supabase.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10' as any,
})

export const VT_PER_USD = 100

export function usdToVt(usdAmount: number) {
  return Math.round(usdAmount * VT_PER_USD)
}

export function vtToUsd(vtAmount: number) {
  return Number((vtAmount / VT_PER_USD).toFixed(2))
}

// Legacy VT pricing tiers retained for compatibility, now aligned to exact conversion.
export const VT_PRICING = {
  tier_1: { price: vtToUsd(500), vt: 500, name: 'Starter Pack' },
  tier_2: { price: vtToUsd(2500), vt: 2500, name: 'Adventure Pack' },
  tier_3: { price: vtToUsd(6500), vt: 6500, name: 'Legend Pack' },
  tier_4: { price: vtToUsd(13000), vt: 13000, name: 'Vault Pack' },
}

export const IAP_PRICING = {
  apple_starter: { price: vtToUsd(500), vt: 500, productId: 'com.vaultcrawler.vt_500' },
  apple_adventure: { price: vtToUsd(2500), vt: 2500, productId: 'com.vaultcrawler.vt_2500' },
  apple_legend: { price: vtToUsd(6500), vt: 6500, productId: 'com.vaultcrawler.vt_6500' },
  apple_vault: { price: vtToUsd(13000), vt: 13000, productId: 'com.vaultcrawler.vt_13000' },
  google_starter: { price: vtToUsd(500), vt: 500, productId: 'vt_500_package' },
  google_adventure: { price: vtToUsd(2500), vt: 2500, productId: 'vt_2500_package' },
  google_legend: { price: vtToUsd(6500), vt: 6500, productId: 'vt_6500_package' },
  google_vault: { price: vtToUsd(13000), vt: 13000, productId: 'vt_13000_package' },
}

const CRYPTO_NETWORKS = {
  BTC: ['Bitcoin'],
  ETH: ['Ethereum', 'Base', 'Arbitrum'],
  USDC: ['Ethereum', 'Base', 'Polygon'],
  USDT: ['Ethereum', 'Polygon', 'Tron'],
} as const

const CRYPTO_USD_RATES: Record<keyof typeof CRYPTO_NETWORKS, number> = {
  BTC: 85000,
  ETH: 3200,
  USDC: 1,
  USDT: 1,
}

const CRYPTO_RECEIVE_ADDRESSES: Record<string, string> = {
  Bitcoin: 'bc1qvaultcrawlerfunding0demoaddress7z8x9c',
  Ethereum: '0x8F2A6D4bC71A5D6b3d8C9B0F9a1E4C6D2e8F3A90',
  Base: '0x8F2A6D4bC71A5D6b3d8C9B0F9a1E4C6D2e8F3A90',
  Arbitrum: '0x8F2A6D4bC71A5D6b3d8C9B0F9a1E4C6D2e8F3A90',
  Polygon: '0x8F2A6D4bC71A5D6b3d8C9B0F9a1E4C6D2e8F3A90',
  Tron: 'TVaultCrawlerFundingDemo123456789AbCdEf',
}

export function getCryptoPaymentOptions() {
  return CRYPTO_NETWORKS
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(options: {
  accountId: string
  usdAmount: number
  returnUrl: string
}): Promise<string> {
  const vtAmount = usdToVt(options.usdAmount)
  const successUrl = new URL(options.returnUrl)
  successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}')

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Vault Tokens',
            description: `${vtAmount} Vault Tokens`,
          },
          unit_amount: Math.round(options.usdAmount * 100),
        },
        quantity: 1,
      },
    ],
    client_reference_id: options.accountId,
    metadata: {
      accountId: options.accountId,
      vtAmount: vtAmount.toString(),
      usdAmount: options.usdAmount.toFixed(2),
    },
    success_url: successUrl.toString(),
    cancel_url: options.returnUrl,
  })

  return session.url || ''
}

export async function createCryptoCheckout(options: {
  accountId: string
  usdAmount: number
  currency: keyof typeof CRYPTO_NETWORKS
  network: string
}) {
  const supportedNetworks = [...CRYPTO_NETWORKS[options.currency]] as string[]
  if (!supportedNetworks.includes(options.network)) {
    throw new Error('Unsupported currency or network selection')
  }

  const vtAmount = usdToVt(options.usdAmount)
  const rate = CRYPTO_USD_RATES[options.currency]
  const cryptoAmount = Number((options.usdAmount / rate).toFixed(options.currency === 'BTC' ? 8 : 6))
  const transactionId = `crypto_${Date.now()}`

  return {
    transactionId,
    status: 'pending',
    accountId: options.accountId,
    usdAmount: Number(options.usdAmount.toFixed(2)),
    vtAmount,
    currency: options.currency,
    network: options.network,
    estimatedAmount: cryptoAmount,
    receiveAddress: CRYPTO_RECEIVE_ADDRESSES[options.network],
    rateUsedUsd: rate,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    memo: transactionId,
  }
}

/**
 * Retrieve and verify Stripe checkout session
 */
export async function verifyCheckoutSession(sessionId: string): Promise<boolean> {
  const existingPurchase = await getPurchaseByTransactionId(sessionId)
  if (existingPurchase) {
    return true
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status === 'paid' && session.client_reference_id) {
    const accountId = session.client_reference_id
    const vtAmount = session.metadata?.vtAmount ? parseInt(session.metadata.vtAmount) : 0
    const usdAmount = (session.amount_total || 0) / 100

    // Record purchase in database
    await recordPurchase({
      accountId,
      paymentMethod: 'stripe',
      amount: usdAmount,
      vtAmount,
      transactionId: sessionId,
      status: 'completed',
    })

    // Add VT to account balance
    await incrementAccountBalance(accountId, vtAmount)

    return true
  }

  return false
}

/**
 * Verify Apple in-app purchase receipt
 */
export async function verifyAppleIAP(options: {
  receipt: string
  accountId: string
  productId: string
}): Promise<boolean> {
  try {
    // In production, you would verify with Apple's server
    // For now, we'll simulate verification
    const tier = Object.entries(IAP_PRICING).find(([_, p]) => p.productId === options.productId)

    if (!tier) {
      return false
    }

    const [_, pricing] = tier
    const amount = pricing.price
    const vtAmount = pricing.vt

    // Record purchase
    await recordPurchase({
      accountId: options.accountId,
      paymentMethod: 'apple',
      amount,
      vtAmount,
      transactionId: `apple_${Date.now()}`,
      status: 'completed',
    })

    // Add VT to account
    await incrementAccountBalance(options.accountId, vtAmount)

    return true
  } catch (error) {
    console.error('Apple IAP verification failed:', error)
    return false
  }
}

/**
 * Verify Google Play in-app purchase
 */
export async function verifyGoogleIAP(options: {
  packageName: string
  productId: string
  purchaseToken: string
  accountId: string
}): Promise<boolean> {
  try {
    // In production, you would verify with Google Play's API
    // For now, we'll simulate verification
    const tier = Object.entries(IAP_PRICING).find(([_, p]) => p.productId === options.productId && p.productId.startsWith('vt_'))

    if (!tier) {
      return false
    }

    const [_, pricing] = tier
    const amount = pricing.price
    const vtAmount = pricing.vt

    // Record purchase
    await recordPurchase({
      accountId: options.accountId,
      paymentMethod: 'google',
      amount,
      vtAmount,
      transactionId: `google_${Date.now()}`,
      status: 'completed',
    })

    // Add VT to account
    await incrementAccountBalance(options.accountId, vtAmount)

    return true
  } catch (error) {
    console.error('Google IAP verification failed:', error)
    return false
  }
}

/**
 * Handle direct VT purchase (USD to VT conversion: 1 USD = 100 VT)
 */
export async function purchaseDirectVT(options: {
  accountId: string
  usdAmount: number
}): Promise<{ vtAmount: number; newBalance: number }> {
  const vtAmount = usdToVt(options.usdAmount)

  // Record purchase
  await recordPurchase({
    accountId: options.accountId,
    paymentMethod: 'crypto',
    amount: options.usdAmount,
    vtAmount,
    transactionId: `direct_${Date.now()}`,
    status: 'completed',
  })

  const updatedAccount = await incrementAccountBalance(options.accountId, vtAmount)
  return { vtAmount, newBalance: updatedAccount.cvt_balance }
}
