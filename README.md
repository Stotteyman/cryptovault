# CryptoVault

**Risk. Loot. Survive. Repeat.**

A minimalist Play-to-Earn (P2E) dungeon crawler with PvP arena combat. Players deposit cryptocurrency, purchase characters and gear, then risk them in permadeath dungeons and PvP arenas to earn real crypto rewards.

## Project Structure

```
cryptovault/
├── client/           # React frontend (Web3 UI)
├── server/           # Node.js/Express backend (game logic)
├── contracts/        # Solidity smart contracts (ERC-20 token, marketplace)
├── docs/             # Documentation & design docs
└── GAME_DESIGN_DOCUMENT.md  # Full game design specification
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- MetaMask or Web3 wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cryptovault.git
cd cryptovault

# Install dependencies
npm install

# Install workspace dependencies
npm run install-all
```

### Development

```bash
# Start both client and server in development mode
npm run dev

# Client runs on http://localhost:3000
# Server runs on http://localhost:5000
```

### Production Build

```bash
# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## Features

- **Permadeath Characters** — Lose characters permanently; creates genuine tension
- **Real Crypto Rewards** — Earn CVT tokens, withdraw anytime to wallet
- **Turn-Based Combat** — Tactical dungeon crawling and PvP arenas
- **Gear Economy** — Craft, trade, and repair equipment with real value
- **Cross-Chain Support** — Ethereum & Polygon integration
- **Minimalist UI** — Pixel art aesthetic, fast-loading, globally accessible

## Tokenomics

**CVT Token (CryptoVault Token)**
- Total Supply: 1,000,000,000 CVT
- 50% allocated to Play-to-Earn rewards
- ERC-20 standard on Ethereum + Polygon

See [GAME_DESIGN_DOCUMENT.md](./GAME_DESIGN_DOCUMENT.md#2-tokenomics) for full tokenomics.

## Game Modes

### Dungeons
- 5 difficulty tiers (Beginner → Nightmare)
- Procedurally generated floors with minions and bosses
- Earn CVT, gear, and XP

### Arenas (PvP)
- 1v1 Duels
- 3v3 Team Wars
- Royal Rumble tournaments
- ELO-based ranking system

## Deployment

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

Configuration is in `netlify.toml` at the root.

### GitHub Pages (Alternative)

```bash
npm run build
npm run build:ghpages
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## Development

### Client Technologies
- React 18
- TypeScript
- Web3.js / Ethers.js
- Tailwind CSS
- Vite (build tool)

### Server Technologies
- Express.js
- PostgreSQL
- Prisma (ORM)
- Web3.js (blockchain interaction)

### Smart Contracts
- Solidity 0.8.x
- Hardhat (development framework)
- OpenZeppelin contracts (ERC-20, access control)

## Environment Variables

Create `.env.local` in the `client` and `server` directories:

### Client (`.env.local`)
```
VITE_API_URL=http://localhost:5000
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=137  # Polygon mainnet
VITE_RPC_URL=https://polygon-rpc.com
```

### Server (`.env.local`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/cryptovault
JWT_SECRET=your-secret-key
PRIVATE_KEY=your-wallet-private-key
NETWORK=polygon
```

## API Documentation

See [docs/API.md](./docs/API.md) for complete API specification.

## Smart Contracts

See [contracts/README.md](./contracts/README.md) for contract deployment and interaction.

## Rules & Mechanics

See [GAME_DESIGN_DOCUMENT.md](./GAME_DESIGN_DOCUMENT.md) for complete game rules, mechanics, and tokenomics.

## Testing

```bash
# Run all tests
npm test

# Run client tests
npm test --workspace=client

# Run server tests
npm test --workspace=server

# Run contract tests
cd contracts && npm test
```

## License

This project is proprietary. All rights reserved.

## Contributing

For team members: Submit pull requests against the `develop` branch. Ensure all tests pass before merging.

## Support

- **Discord:** [Join our community](https://discord.gg/cryptovault)
- **Twitter:** [@CryptoVault](https://twitter.com/cryptovault)
- **Email:** support@cryptovault.game

## Roadmap

See [GAME_DESIGN_DOCUMENT.md#9-roadmap](./GAME_DESIGN_DOCUMENT.md#9-roadmap) for full development roadmap.

---

**Version:** 0.1.0 (MVP)  
**Last Updated:** April 2026
