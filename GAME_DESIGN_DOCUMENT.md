# VaultCrawler: Game Design Document

## 1. Core Objective

Build a scalable, monetizable, skill-based dungeon crawler with PvP that prioritizes:
- Fast gameplay loops (30–90 seconds per encounter)
- Long-term retention
- Fair progression with no hard pay-to-win
- Expandable systems designed for future growth

The system must keep players returning daily, encourage optional spending, and evolve continuously without breaking balance.

---

## 2. Design Philosophy

Every system follows these rules:
1. Clarity Over Complexity
   - Easy to understand, hard to master
2. Speed Over Realism
   - No long animations or downtime
3. Risk vs Reward
   - Every choice should feel meaningful
4. Skill > Money
   - Purchases provide convenience, not dominance
5. Everything is Tunable
   - All numbers adjustable without code rewrites

---

## 3. Core Game Loop

1. Player logs in with wallet or account
2. Selects character
3. Enters dungeon or PvP arena
4. Engages in combat (4–8 turns)
5. Gains loot + currency
6. Upgrades gear / skills
7. Repeats

The loop must feel fast, rewarding, and slightly risky.

---

## 4. Combat System

### 4.1 Combat Objectives

Combat must:
- End in under 8 turns
- Avoid infinite loops
- Reward decision-making
- Deliver tension through tradeoffs

Balance targets:
- Tanks survive longer but deal less damage
- DPS deal high damage but are fragile
- Hybrid classes remain viable without dominating

### 4.2 Turn Structure

- Player first on each encounter
- Available actions:
  - Attack
  - Defend
  - Use Item
  - Skill / Special
  - Escape
- Combat ends when one side loses all health or player escapes
- Average encounter length: 4–8 turns

### 4.3 Combat Systems

- Damage is calculated from stats, gear, buffs, and enemy resistances.
- Defense reduces incoming damage and absorbs critical hits.
- Skills are limited by short cooldowns, not mana, to keep pace fast.
- Enemy behavior is predictable with readable telegraphs for counterplay.

### 4.4 Combat Rewards

- Combat rewards are split into:
  - Currency (CVT / crests)
  - Gear items
  - XP
  - Temporary buffs
- Risk modifiers improve rewards for harder plays:
  - Fast clear: +50% loot
  - No damage: +25% loot
  - Boss defeat: + bonus CVT

---

## 5. Economy Design

### 5.1 Currency Layers

- **CVT:** Primary on-chain currency earned through gameplay and marketplace sales.
- **USDC/ETH:** Fiat on-ramp for purchases and withdrawals.
- **Crests:** Non-tradeable currency for cosmetics, battle pass, and temporary boosts.

### 5.2 Inflation Control

Economy must prevent runaway inflation through sinks:
- Gear repair
- Character insurance
- Battle pass
- Storage rent
- Marketplace fees
- Cosmetic purchases

### 5.3 Revenue Model

Primary revenue sources:
- Cosmetics
- Battle passes
- Convenience items
- Marketplace commissions
- Withdraw fees

Rules:
- No direct stat purchases
- No guaranteed wins
- Spending should feel optional and rewarding

### 5.4 Marketplace & Trading

- Marketplace fees: 5% on sales
- Auction windows: 72 hours
- Legendary items bind on pickup for 7 days
- Player-driven economy with platform-curated price guidance

---

## 6. Progression

### 6.1 Short-term Goals

Players should always have:
- A next dungeon to clear
- Better gear to chase
- A clear reason to upgrade or change build

### 6.2 Long-term Goals

Long-term progression comes from:
- Character collection
- Gear optimization
- Arena ranking climb
- Seasonal objectives
- Battle pass mastery

### 6.3 Leveling & Skill Growth

- Level cap: 50
- XP from dungeons, PvP, quests
- Every 5 levels unlocks new content or slot capacity
- Skill points are earned and allocated for build variety

### 6.4 Progression Rewards

Each session should feel meaningful via:
- XP and currency gains
- New loot and gear upgrades
- Cosmetic unlocks
- Battle pass progression

---

## 7. Balance System

### 7.1 Data Tracking

Track the following metrics:
- Win rates by dungeon, mode, and class
- Skill usage rates
- Time to kill
- Average session duration
- Economic velocity

### 7.2 Adjustment Principles

Adjust gradually:
- Underperforming systems receive small buffs
- Overperforming systems receive small nerfs
- Avoid drastic changes that break existing builds

### 7.3 Fairness Standards

- Ensure skill matters more than spend
- Keep progression and random rewards tuned
- Prevent late-game power spikes from invalidating earlier builds

---

## 8. Monetization Strategy

### 8.1 Primary Revenue Types

- Cosmetics: skins, name colors, avatar frames
- Battle pass: seasonal progression with optional premium tier
- Convenience: inventory expansion, repair bundles, insurance
- Premium entry modes: exclusive events with optional fees

### 8.2 Monetization Rules

- No stat-enhancing purchases
- No guaranteed win items
- Monetization should accelerate progression, not define it
- Free players should remain competitive with smart play

### 8.3 Player-Friendly Offers

- Cosmetic bundles priced 5–50 CVT
- Seasonal event passes with bonus loot
- Limited-time convenience packs that save time
- Value-oriented storefront items to support retention

---

## 9. Expansion Framework

### 9.1 Content Roadmap

Future expansions should include:
- New classes
- New dungeons
- New cosmetic sets
- Seasonal events
- PvP modes and social systems

### 9.2 Architecture Requirements

System must support:
- Adding content without breaking balance
- Rotating metas every season
- New loot pools with minimal code changes
- Modular class and dungeon definitions

### 9.3 Seasonal Rotation

- Season length: 6–8 weeks
- Each season introduces a new theme, event, and reward track
- Rotation allows older content to remain accessible while spotlighting fresh goals

---

## 10. Optimization Directives

Continuously improve:
- Load times
- UI clarity
- Matchmaking speed

Test for:
- Player frustration points
- Drop-off areas
- Overpowered builds

Goal: Relentless refinement until gameplay feels smooth, fair, and addictive.

---

## 11. System Architecture

### 11.1 Frontend

- React + Vite with Tailwind
- Wallet auth via MetaMask / Wallet Connect
- Fast UI with minimal transitions
- Responsive dashboard, combat HUD, and match screens

### 11.2 Backend

- Node.js + Express or similar
- REST API + WebSockets for real-time combat updates
- Combat engine separate from persistence layer
- Matchmaking and session management

### 11.3 Persistence

- PostgreSQL for accounts, characters, inventory, and transactions
- Redis for matchmaking and live session state
- Audit logs for economy and security

### 11.4 Blockchain

- ERC-20 CVT token
- Staking / rewards contract
- Marketplace contract for item sales and fees
- Optional NFT contract for characters or cosmetics

---

## 12. Player Experience Flow

### 12.1 Login
- MetaMask / wallet login
- Optional account binding and settings
- Quick tutorial for first-time players

### 12.2 Hub
- Character roster
- Wallet balance and currency overview
- Ongoing quests and event notices
- Recommended next activity

### 12.3 Game Modes
- Dungeon browser
- Arena queue
- Market and inventory management
- Upgrade screen

### 12.4 Post-Game Summary
- Rewards earned
- Loot received
- Progress toward goals
- Suggested next action

---

## 13. Metrics for Success

Track and optimize:
- Daily active users
- Session length
- Retention (D1, D7, D30)
- Conversion to premium purchases
- Economy balance (earn/spend ratio)
- PvP match completion rate

## 14. Name Transition

While the legacy project name is CryptoVault, the upgraded identity for this core game experience is **VaultCrawler**. The product should keep the wallet/crypto positioning while emphasizing fast, tactical dungeon progression.
| `/inventory` | Manage gear, repair, sell |
| `/marketplace` | Buy/sell gear & characters |
| `/shop` | Buy CVT, battle pass, cosmetics |
| `/leaderboards` | Global rankings by category |
| `/withdrawal` | Cash out to wallet |
| `/settings` | Security, notifications |
| `/docs` | Game rules, tokenomics, roadmap |

### 6.5 Security & Compliance
- **2FA:** SMS or authenticator app for withdraws >50 CVT
- **Rate Limiting:** 60 API calls/min per user
- **KYC:** For withdrawals >10,000 CVT (integrate KYC provider)
- **Audit:** Annual smart contract audit (CertiK / Consensys recommended)
- **Insurance Fund:** 5% of transaction fees → insurance pool for hacks/exploits
- **Rugpull Safeguards:** Token locked 6 months, team vesting, multi-sig treasury

---

## 7. Monetization & Business Model

### 7.1 Revenue Streams (Projected Year 1)
| Source | % of Revenue | Method |
|--------|-------------|--------|
| Platform Fees (deposits/withdraws) | 35% | 1-2% transaction fee |
| Marketplace Commission | 25% | 5% on player trades |
| Battle Pass | 15% | 10 CVT/month × active users |
| Cosmetics & Premium | 20% | Skins, name changes, pets |
| Staking Rewards | 5% | Interest spread (8% to players, 3% to treasury) |

### 7.2 Unit Economics (Target in Year 1)
- **Cost per Active User (CAC):** $5-10 (ads, influencers)
- **Lifetime Value (LTV):** $150-500 (depends on retention)
- **CAC Payback:** 30-60 days
- **Monthly Active Users (MAU):** 50K-100K
- **Revenue Target Year 1:** $500K-2M

---

## 8. Unique Selling Points (USPs)

1. **Real Permadeath** — Lose characters permanently; creates genuine tension
2. **True Crypto Rewards** — Withdraw anytime to wallet; not locked in-game
3. **Minimalist Aesthetic** — Fast-loading, low bandwidth, accessible globally
4. **Player Economy** — Gear trading creates emergent meta & arbitrage opportunities
5. **Cross-chain Accessible** — Low fees via Polygon; high security via Ethereum
6. **Low Barrier to Entry** — Start with free tier, optional deposits for power-ups
7. **Skill-Based PvP** — ELO ranking separates whales from skilled players

---

## 9. Roadmap

### Phase 1 (MVP - Month 1-2)
- [ ] Game core (combat, 2 dungeon tiers, 1 arena mode)
- [ ] 4 character classes, 20 gear items
- [ ] Basic marketplace
- [ ] Smart contract deployment (Polygon testnet)
- [ ] Website (dashboard, shop, withdrawal)

### Phase 2 (Expansion - Month 3-4)
- [ ] Advanced dungeons (boss mechanics, special events)
- [ ] PvP ranking system & leaderboards
- [ ] Crafting & enchanting
- [ ] Mobile-responsive UI
- [ ] Mainnet launch (Polygon + Ethereum)

### Phase 3 (Economy - Month 5-6)
- [ ] Trading house with auctions
- [ ] Guild system (co-op dungeons)
- [ ] Seasonal events & tournaments
- [ ] CharacterNFT trading (OpenSea)
- [ ] DAO governance token (holders vote on game changes)

### Phase 4 (Scale - Month 7-12)
- [ ] Mobile app (iOS/Android)
- [ ] More dungeons & bosses
- [ ] Farming & resource economy
- [ ] Multi-language support
- [ ] Community tournaments (prize pool)

---

## 10. Key Necessities Checklist

### Legal & Compliance
- [ ] Terms of Service (include gambling/crypto disclaimers)
- [ ] Privacy Policy (GDPR, data handling)
- [ ] Smart contract audit (CertiK / OpenZeppelin)
- [ ] KYC/AML integration provider
- [ ] Gambling license (if applicable by jurisdiction)

### Marketing & Community
- [ ] Discord server (announcements, support, trading)
- [ ] Twitter account (updates, tournaments, memes)
- [ ] YouTube channel (tutorials, combat highlights, lore videos)
- [ ] Influencer partnerships (gaming streamers, crypto YouTubers)
- [ ] Reddit community

### Operations
- [ ] 24/7 monitoring (uptime, exploit detection)
- [ ] Customer support (Discord tickets, in-game help)
- [ ] Patch & maintenance schedule
- [ ] Bug bounty program (Immunefi, minimum $100/bug)
- [ ] Community council (Top 20 players vote on balance changes)

### Infrastructure Vendors
- [ ] VPS hosting (AWS, Vercel, or dedicated server)
- [ ] Database backup services
- [ ] CDN for asset delivery
- [ ] SMS/Email provider (2FA, notifications)
- [ ] Payment processor (Stripe or similar)
- [ ] Analytics (Mixpanel, Plausible)

---

## 11. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Smart contract exploit | Lost funds, reputation | Audit before launch, insurance fund, pause mechanism |
| Whale domination | Unfair PvP | Skill-based matching, gear rebalancing, soft caps on stats |
| Lack of players | Dead game | Freemium model, influencer program, Discord community |
| Crypto bear market | Players cash out, token crashes | Focus on gameplay, not hype; diversified revenue |
| Regulatory crackdown | Forced shutdown | Legal counsel, avoid targeting US if unregistered, prepare pivot |
| RNG manipulation | Player distrust | Transparent drop rates, provable randomness (Chainlink VRF) |

---

## 12. Success Metrics

- **DAU/MAU:** 5K+ daily, 20K+ monthly by Month 3
- **Revenue:** $10K/month by Month 2, $100K+/month by Month 6
- **Token Price:** $0.01 → $0.50 by EOY (post-launch hype, then stabilize)
- **Player Retention:** 40% D30 retention (industry average for P2E: 30%)
- **PvP Match Time:** <60 seconds queue
- **Smart Contract Uptime:** >99.9%
- **Community Size:** 50K+ Discord members, 100K+ Twitter followers

---

## 13. Quick Reference: Core Loop

```
1. Player creates character (free or pays CVT)
2. Equips starter gear
3. Enters dungeon or arena
4. Takes damage, wins loot drop (CVT + items)
5. Repairs gear, upgrades, repeats
6. Sells items to other players (gets CVT)
7. Withdraws CVT to real wallet
8. Rinse and repeat
```

---

## 14. Next Steps

1. **Smart Contract Developer:** Write & test CryptoVault.sol
2. **Game Dev Lead:** Build combat engine & UI
3. **Designer:** Create pixel art assets (characters, items, animations)
4. **Marketing:** Set up socials, reach out to influencers
5. **Legal:** Draft ToS, privacy policy, regulatory compliance
6. **QA:** Internal testing on testnet, bug bounty program

