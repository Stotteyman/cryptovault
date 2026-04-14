# Quick Start Guide

## For Developers

### Prerequisites
- Node.js 18+
- npm
- Git
- MetaMask (for testing Web3 features)

### Local Setup (5 minutes)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/cryptovault.git
cd cryptovault

# Install dependencies
npm install

# Create environment files
cp .env.example client/.env.local
cp .env.example server/.env.local

# Start development servers
npm run dev
```

Your app runs on:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

### Directory Structure Explained

```
cryptovault/
├── client/                 # React Web3 frontend
│   ├── src/
│   │   ├── pages/         # Page components (Dashboard, Arena, etc.)
│   │   ├── App.tsx        # Main routing
│   │   └── index.css      # Tailwind styles
│   └── vite.config.ts     # Frontend build config
│
├── server/                 # Node.js backend API
│   ├── src/
│   │   ├── index.ts       # Express server
│   │   └── engine.ts      # Game logic (combat, loot, etc.)
│   └── tsconfig.json
│
├── contracts/              # Solidity smart contracts
│   ├── CryptoVaultToken.sol
│   └── CryptoVaultMarketplace.sol
│
├── docs/                   # Documentation
│   ├── API.md             # API endpoint reference
│   ├── DEPLOYMENT.md      # Deployment instructions
│   └── QUICKSTART.md      # This file
│
├── .github/workflows/      # CI/CD pipelines
│   ├── deploy.yml         # Auto-deploy to Netlify
│   └── test.yml           # Run tests on PR
│
├── GAME_DESIGN_DOCUMENT.md # Full game spec
├── README.md              # Project overview
└── package.json           # Workspace configuration
```

### Available Commands

```bash
# Development
npm run dev              # Start client + server

# Building
npm run build            # Build for production
npm run build --workspace=client      # Build only frontend
npm run build --workspace=server      # Build only backend

# Testing & Linting
npm test                 # Run all tests
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix linting issues

# Deployment
netlify deploy --prod    # Deploy to production
```

## For Game Designers

### Modifying Game Balance

1. **Character Stats:** `server/src/engine.ts`
   ```typescript
   const CHARACTER_STATS = {
     Knight: { health: 120, damage: 8, defense: 12 },
     Rogue: { health: 80, damage: 15, defense: 5 },
     // ... edit these values
   }
   ```

2. **Loot Rewards:** `GAME_DESIGN_DOCUMENT.md` Section 4.1
   - Adjust CVT payouts, item drop rates, etc.

3. **Dungeon Difficulty:** `server/src/engine.ts`
   - Modify enemy stats, room layouts, boss mechanics

### Adding New Content

**New Dungeon:**
1. Add tier to `server/src/engine.ts`
2. Create floor layout data
3. Update UI in `client/src/pages/Dungeons.tsx`

**New Character Class:**
1. Add stats to game balance spreadsheet
2. Create character asset (pixel art)
3. Add frontend component

## For Web3/Smart Contract Developers

### Contract Setup

```bash
cd contracts

# Install OpenZeppelin contracts
npm install @openzeppelin/contracts

# Compile contracts
npx hardhat compile

# Deploy to Polygon Testnet
npx hardhat run scripts/deploy.ts --network polygonMumbai

# Deploy to mainnet (after testing)
npx hardhat run scripts/deploy.ts --network polygon
```

### Token Distribution

The CVT token has 1B supply allocated as:
- 50% Play-to-Earn rewards
- 15% Team (vested)
- 15% Early investors (vested)
- 10% Treasury
- 10% Partnerships

See `GAME_DESIGN_DOCUMENT.md` Section 2 for full details.

## For DevOps/Deployment

### Deploying to Netlify

```bash
# First time
netlify login
netlify init

# Subsequent deployments (automatic on git push)
# OR manual deployment
netlify deploy --prod
```

Deploy logs: `netlify logs --tail`

### GitHub Integration

1. Push to `main` branch → Auto-deploys to production
2. Push to `develop` branch → Auto-deploys to staging
3. Create PR → Gets preview deployment

### Environment Variables

**Frontend (.env.local):**
```
VITE_API_URL=http://localhost:5000
VITE_CHAIN_ID=137
```

**Backend (.env.local):**
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
PRIVATE_KEY=your-wallet-key
```

## Useful Links

- **GitHub:** https://github.com/your-username/cryptovault
- **Netlify:** https://app.netlify.com
- **Polygon Network:** https://polygonscan.com
- **OpenZeppelin Docs:** https://docs.openzeppelin.com/contracts
- **Ethers.js Docs:** https://docs.ethers.org

## Getting Help

- 📖 **Read:** [API.md](./API.md)
- 🎮 **Game Design:** [GAME_DESIGN_DOCUMENT.md](../GAME_DESIGN_DOCUMENT.md)
- 🚀 **Deploy:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- 💬 **Discord:** [Join community](https://discord.gg/cryptovault)

---

**Ready to start?** Run `npm run dev` and visit http://localhost:3000!
