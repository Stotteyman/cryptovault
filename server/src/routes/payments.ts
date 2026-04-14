import { Router, Request, Response } from 'express'
import * as paymentService from '../payment-service.js'
import * as supabase from '../supabase.js'
import * as authService from '../auth-service.js'

const router = Router()

// Middleware to verify token
async function verifyAuth(req: Request, res: Response, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const payload = authService.verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  ;(req as any).userId = payload.id
  next()
}

// Restrict auth enforcement to payment endpoints mounted under /api/payments/*.
router.use('/payments', verifyAuth)

// ===== STRIPE PAYMENT ENDPOINTS =====

/**
 * Create Stripe checkout session
 */
router.post('/payments/stripe/checkout', async (req: Request, res: Response) => {
  try {
    const { tier, returnUrl } = req.body
    const accountId = (req as any).userId

    if (!tier || !Object.keys(paymentService.VT_PRICING).includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' })
    }

    const url = await paymentService.createCheckoutSession({
      accountId,
      tier,
      returnUrl: returnUrl || 'http://localhost:3000/shop',
    })

    res.json({ url })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * Purchase VT directly with USD
 */
router.post('/payments/vt/purchase', async (req: Request, res: Response) => {
  try {
    const { usdAmount } = req.body
    const accountId = (req as any).userId

    if (typeof usdAmount !== 'number' || usdAmount <= 0) {
      return res.status(400).json({ error: 'Invalid USD amount' })
    }

    const purchase = await paymentService.purchaseDirectVT({
      accountId,
      usdAmount,
    })

    const account = await supabase.getAccount(accountId)

    res.json({
      vtAmount: purchase.vtAmount,
      cvtBalance: account.cvt_balance,
      message: `Purchased ${purchase.vtAmount} VT for $${usdAmount.toFixed(2)}.`,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * Verify Stripe checkout and add VT to account
 */
router.post('/payments/stripe/verify', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body
    const accountId = (req as any).userId

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' })
    }

    const success = await paymentService.verifyCheckoutSession(sessionId)

    if (success) {
      const account = await supabase.getAccount(accountId)
      res.json({
        success: true,
        message: 'Purchase verified',
        balance: account.cvt_balance,
      })
    } else {
      res.status(400).json({ error: 'Payment not completed' })
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * Get available VT pricing tiers
 */
router.get('/payments/tiers', async (req: Request, res: Response) => {
  try {
    res.json({
      tiers: paymentService.VT_PRICING,
      iapTiers: paymentService.IAP_PRICING,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ===== APPLE IAP ENDPOINTS =====

/**
 * Verify Apple in-app purchase
 */
router.post('/payments/apple/verify', async (req: Request, res: Response) => {
  try {
    const { receipt, productId } = req.body
    const accountId = (req as any).userId

    if (!receipt || !productId) {
      return res.status(400).json({ error: 'Receipt and product ID are required' })
    }

    const success = await paymentService.verifyAppleIAP({
      receipt,
      accountId,
      productId,
    })

    if (success) {
      const account = await supabase.getAccount(accountId)
      res.json({
        success: true,
        message: 'Apple purchase verified',
        balance: account.cvt_balance,
      })
    } else {
      res.status(400).json({ error: 'Apple purchase verification failed' })
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ===== GOOGLE PLAY IAP ENDPOINTS =====

/**
 * Verify Google Play in-app purchase
 */
router.post('/payments/google/verify', async (req: Request, res: Response) => {
  try {
    const { packageName, productId, purchaseToken } = req.body
    const accountId = (req as any).userId

    if (!packageName || !productId || !purchaseToken) {
      return res.status(400).json({ error: 'Package name, product ID, and purchase token are required' })
    }

    const success = await paymentService.verifyGoogleIAP({
      packageName,
      productId,
      purchaseToken,
      accountId,
    })

    if (success) {
      const account = await supabase.getAccount(accountId)
      res.json({
        success: true,
        message: 'Google purchase verified',
        balance: account.cvt_balance,
      })
    } else {
      res.status(400).json({ error: 'Google purchase verification failed' })
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ===== PURCHASE HISTORY =====

/**
 * Get user purchase history
 */
router.get('/payments/history', async (req: Request, res: Response) => {
  try {
    const accountId = (req as any).userId
    const history = await supabase.getPurchaseHistory(accountId)
    res.json({ purchases: history })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
