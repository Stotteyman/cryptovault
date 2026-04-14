import { Router } from 'express';
import * as supabase from '../supabase.js';
import * as authService from '../auth-service.js';
const router = Router();
// ===== AUTHENTICATION ENDPOINTS =====
/**
 * OAuth Google callback
 */
router.post('/auth/google', async (req, res) => {
    try {
        const { profile } = req.body;
        if (!profile) {
            return res.status(400).json({ error: 'Profile is required' });
        }
        const { token, accountId } = await authService.handleGoogleAuth(profile);
        const account = await supabase.getAccount(accountId);
        res.json({
            token,
            user: {
                id: account.id,
                email: profile.email,
                provider: 'google',
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * OAuth Apple callback
 */
router.post('/auth/apple', async (req, res) => {
    try {
        const { profile } = req.body;
        if (!profile) {
            return res.status(400).json({ error: 'Profile is required' });
        }
        const { token, accountId } = await authService.handleAppleAuth(profile);
        const account = await supabase.getAccount(accountId);
        res.json({
            token,
            user: {
                id: account.id,
                email: profile.email,
                provider: 'apple',
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * OAuth Discord callback
 */
router.post('/auth/discord', async (req, res) => {
    try {
        const { profile } = req.body;
        if (!profile) {
            return res.status(400).json({ error: 'Profile is required' });
        }
        const { token, accountId } = await authService.handleDiscordAuth(profile);
        const account = await supabase.getAccount(accountId);
        res.json({
            token,
            user: {
                id: account.id,
                email: profile.email,
                provider: 'discord',
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * OAuth Steam callback
 */
router.post('/auth/steam', async (req, res) => {
    try {
        const { steamId } = req.body;
        if (!steamId) {
            return res.status(400).json({ error: 'Steam ID is required' });
        }
        const { token, accountId } = await authService.handleSteamAuth(steamId);
        const account = await supabase.getAccount(accountId);
        res.json({
            token,
            user: {
                id: account.id,
                provider: 'steam',
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * Metamask wallet authentication
 */
router.post('/auth/wallet', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }
        const { token, accountId } = await authService.handleWalletAuth(walletAddress);
        const account = await supabase.getAccount(accountId);
        res.json({
            token,
            user: {
                id: account.id,
                walletAddress: account.wallet_address,
                provider: 'metamask',
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * Verify token
 */
router.post('/auth/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Token is required' });
        }
        const payload = authService.verifyToken(token);
        if (!payload) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        const account = await supabase.getAccount(payload.id);
        res.json({
            valid: true,
            user: {
                id: payload.id,
                provider: payload.provider,
            },
            account,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
