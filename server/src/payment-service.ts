import Stripe from 'stripe'
import { getAccount, getPurchaseByTransactionId, recordPurchase, incrementAccountBalance } from './supabase.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10' as any,
})

// VT pricing tiers
export const VT_PRICING = {
  tier_1: { price: 4.99, vt: 500, name: 'Starter Pack' },
  tier_2: { price: 19.99, vt: 2500, name: 'Adventure Pack' },
  tier_3: { price: 49.99, vt: 6500, name: 'Legend Pack' },
  tier_4: { price: 99.99, vt: 13000, name: 'Vault Pack' },
}

export const IAP_PRICING = {
  apple_starter: { price: 4.99, vt: 500, productId: 'com.vaultcrawler.vt_500' },
  apple_adventure: { price: 19.99, vt: 2500, productId: 'com.vaultcrawler.vt_2500' },
  apple_legend: { price: 49.99, vt: 6500, productId: 'com.vaultcrawler.vt_6500' },
  apple_vault: { price: 99.99, vt: 13000, productId: 'com.vaultcrawler.vt_13000' },
  google_starter: { price: 4.99, vt: 500, productId: 'vt_500_package' },
  google_adventure: { price: 19.99, vt: 2500, productId: 'vt_2500_package' },
  google_legend: { price: 49.99, vt: 6500, productId: 'vt_6500_package' },
  google_vault: { price: 99.99, vt: 13000, productId: 'vt_13000_package' },
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(options: {
  accountId: string
  tier: keyof typeof VT_PRICING
  returnUrl: string
}): Promise<string> {
  const pricing = VT_PRICING[options.tier]
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
            name: pricing.name,
            description: `${pricing.vt} Vault Tokens`,
          },
          unit_amount: Math.round(pricing.price * 100),
        },
        quantity: 1,
      },
    ],
    client_reference_id: options.accountId,
    metadata: {
      accountId: options.accountId,
      tier: options.tier,
      vtAmount: pricing.vt.toString(),
    },
    success_url: successUrl.toString(),
    cancel_url: options.returnUrl,
  })

  return session.url || ''
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
  const vtAmount = Math.round(options.usdAmount * 100)

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
