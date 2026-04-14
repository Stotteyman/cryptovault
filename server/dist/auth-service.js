import jwt from 'jsonwebtoken';
import { getOrCreateAccount, getAccountByAuthId } from './supabase.js';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
/**
 * Generate JWT token for authenticated user
 */
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
/**
 * Verify and decode JWT token
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
/**
 * Handle Google OAuth callback
 */
export async function handleGoogleAuth(profile) {
    const authId = `google_${profile.sub}`;
    const email = profile.email;
    let account = await getAccountByAuthId(authId);
    if (!account) {
        account = await getOrCreateAccount('', authId);
        // Update account with email and provider
        // First add email to account if schema allows
    }
    const token = generateToken({
        id: account.id,
        authId,
        email,
        provider: 'google',
    });
    return { token, accountId: account.id };
}
/**
 * Handle Apple OAuth callback
 */
export async function handleAppleAuth(profile) {
    const authId = `apple_${profile.sub}`;
    const email = profile.email;
    let account = await getAccountByAuthId(authId);
    if (!account) {
        account = await getOrCreateAccount('', authId);
    }
    const token = generateToken({
        id: account.id,
        authId,
        email,
        provider: 'apple',
    });
    return { token, accountId: account.id };
}
/**
 * Handle Discord OAuth callback
 */
export async function handleDiscordAuth(profile) {
    const authId = `discord_${profile.id}`;
    const email = profile.email;
    let account = await getAccountByAuthId(authId);
    if (!account) {
        account = await getOrCreateAccount('', authId);
    }
    const token = generateToken({
        id: account.id,
        authId,
        email,
        provider: 'discord',
    });
    return { token, accountId: account.id };
}
/**
 * Handle Steam OAuth callback
 */
export async function handleSteamAuth(steamId) {
    const authId = `steam_${steamId}`;
    let account = await getAccountByAuthId(authId);
    if (!account) {
        account = await getOrCreateAccount('', authId);
    }
    const token = generateToken({
        id: account.id,
        authId,
        provider: 'steam',
    });
    return { token, accountId: account.id };
}
/**
 * Handle MetaMask wallet auth
 */
export async function handleWalletAuth(walletAddress) {
    const authId = `wallet_${walletAddress.toLowerCase()}`;
    let account = await getOrCreateAccount(walletAddress, authId);
    const token = generateToken({
        id: account.id,
        authId,
        provider: 'metamask',
        walletAddress,
    });
    return { token, accountId: account.id };
}
/**
 * Middleware to verify JWT token in requests
 */
export function verifyTokenMiddleware(token) {
    if (!token)
        return null;
    // Extract token from "Bearer <token>" format
    const bearerToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    return verifyToken(bearerToken);
}
