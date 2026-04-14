# CryptoVault API Documentation

## Base URL
- Development: `http://localhost:5000`
- Production: same-origin API routes via Netlify Functions (`/api/...`)

## Endpoints

### Authentication

#### Connect Wallet
```
POST /api/auth/connect
Body: { signature: string, wallet: string }
Response: { token: string, user: { wallet, balance } }
```

### Characters

#### Get Characters
```
GET /api/characters
Auth: Required (Bearer token)
Response: { characters: Character[] }
```

#### Create Character
```
POST /api/characters
Auth: Required
Body: { class: "Knight" | "Rogue" | "Mage" | "Ranger" }
Response: { character: Character, id: number }
```

#### Get Character Details
```
GET /api/characters/:id
Auth: Required
Response: { character: Character }
```

### Dungeons

#### Get Dungeons
```
GET /api/dungeons
Response: { dungeons: Dungeon[] }
```

#### Enter Dungeon
```
POST /api/dungeons/:id/enter
Auth: Required
Body: { characterId: number }
Response: { encounterState: EncounterState }
```

#### Execute Combat Turn
```
POST /api/combat/turn
Auth: Required
Body: { action: "attack" | "defend" | "flee", characterId: number, encounterId: string }
Response: { turn: Turn, isComplete: boolean }
```

### Arena

#### Get Rankings
```
GET /api/arena/rankings
Response: { rankings: Ranking[] }
```

#### Queue for Battle
```
POST /api/arena/queue
Auth: Required
Body: { characterId: number, mode: "duel" | "3v3" }
Response: { queueId: string, position: number, estimatedWait: number }
```

### Marketplace

#### Get Items
```
GET /api/marketplace?rarity=rare&sort=price
Response: { items: MarketplaceItem[] }
```

#### List Item
```
POST /api/marketplace/list
Auth: Required
Body: { itemId: number, price: number }
Response: { listing: MarketplaceItem }
```

#### Buy Item
```
POST /api/marketplace/:itemId/buy
Auth: Required
Response: { transaction: Transaction }
```

### Account

#### Get Balance
```
GET /api/account/balance
Auth: Required
Response: { cvt: number, usdc: number }
```

#### Withdraw CVT
```
POST /api/account/withdraw
Auth: Required
Body: { amount: number, wallet: string }
Response: { txHash: string, status: "pending" }
```

## Error Responses

```json
{
  "error": "Unauthorized",
  "code": "AUTH_001",
  "message": "Invalid or expired token"
}
```

Common codes:
- `AUTH_001` - Authentication required
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input
- `INSUFFICIENT_BALANCE` - Not enough CVT
- `CHARACTER_DEAD` - Character is dead (restart required)

## Rate Limiting

- 60 requests per minute per authenticated user
- 20 requests per minute per IP (unauthenticated)

Headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
