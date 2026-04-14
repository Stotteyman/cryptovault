# CryptoVault Smart Contracts

## Overview
Solidity smart contracts for CryptoVault:
- `CryptoVaultToken.sol` - ERC-20 CVT token contract
- `CryptoVaultMarketplace.sol` - Gear trading marketplace

## Setup

```bash
# Install dependencies
npm install @openzeppelin/contracts

# Compile (requires Hardhat)
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy.ts --network polygon
```

## Deployment Addresses

### Polygon Mainnet
- CVT Token: `0x...` (to be deployed)
- Marketplace: `0x...` (to be deployed)

### Ethereum Mainnet
- CVT Token: `0x...` (to be deployed)
- Marketplace: `0x...` (to be deployed)

See `GAME_DESIGN_DOCUMENT.md` for full tokenomics and contract specifications.
