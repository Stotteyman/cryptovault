import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'vault.db')
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Initialize schema
export function initializeDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      address TEXT UNIQUE NOT NULL,
      nickname TEXT DEFAULT 'Vault Traveler',
      cvtBalance REAL DEFAULT 100.0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      class TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      health INTEGER NOT NULL,
      attack INTEGER NOT NULL,
      defense INTEGER NOT NULL,
      nameColor TEXT,
      nameEffect TEXT,
      nameCost INTEGER DEFAULT 0,
      colorCost INTEGER DEFAULT 0,
      effectCost INTEGER DEFAULT 0,
      classCost INTEGER DEFAULT 0,
      ownerId TEXT NOT NULL,
      isTrading INTEGER DEFAULT 0,
      tradePrice REAL,
      tradeOfferedBy TEXT,
      experience INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ownerId) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      characterId TEXT NOT NULL,
      fromWallet TEXT NOT NULL,
      toWallet TEXT,
      price REAL NOT NULL,
      status TEXT DEFAULT 'listing',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (characterId) REFERENCES characters(id)
    );
  `)
}

// Account operations
export function getOrCreateAccount(address: string) {
  const stmt = db.prepare('SELECT * FROM accounts WHERE address = ?')
  let account = stmt.get(address) as any
  
  if (!account) {
    const id = `acc-${Date.now()}`
    db.prepare(`
      INSERT INTO accounts (id, address, nickname, cvtBalance)
      VALUES (?, ?, ?, ?)
    `).run(id, address, 'Vault Traveler', 100.0)
    account = { id, address, nickname: 'Vault Traveler', cvtBalance: 100.0 }
  }
  
  return account
}

export function getAccount(id: string) {
  return db.prepare('SELECT * FROM accounts WHERE id = ?').get(id)
}

export function updateAccountBalance(id: string, amount: number) {
  db.prepare('UPDATE accounts SET cvtBalance = cvtBalance + ? WHERE id = ?').run(amount, id)
  return getAccount(id)
}

export function updateAccountNickname(id: string, nickname: string) {
  db.prepare('UPDATE accounts SET nickname = ? WHERE id = ?').run(nickname, id)
}

// Character operations
export function createCharacter(character: any) {
  const id = `char-${Date.now()}`
  db.prepare(`
    INSERT INTO characters (
      id, name, class, level, health, attack, defense, 
      nameColor, nameEffect, nameCost, colorCost, effectCost, classCost, ownerId
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    character.name,
    character.class,
    character.level || 1,
    character.health,
    character.attack,
    character.defense,
    character.nameColor || null,
    character.nameEffect || null,
    character.nameCost || 0,
    character.colorCost || 0,
    character.effectCost || 0,
    character.classCost || 0,
    character.ownerId
  )
  return character
}

export function getCharacter(id: string) {
  return db.prepare('SELECT * FROM characters WHERE id = ?').get(id)
}

export function getCharactersByOwner(ownerId: string) {
  return db.prepare('SELECT * FROM characters WHERE ownerId = ?').all(ownerId)
}

export function updateCharacter(id: string, updates: any) {
  const keys = Object.keys(updates)
  const values = Object.values(updates)
  const setClause = keys.map(k => `${k} = ?`).join(', ')
  
  db.prepare(`UPDATE characters SET ${setClause} WHERE id = ?`)
    .run(...values, id)
  
  return getCharacter(id)
}

export function listCharacterForTrade(characterId: string, price: number, seller: string) {
  db.prepare(`
    UPDATE characters 
    SET isTrading = 1, tradePrice = ?, tradeOfferedBy = ?
    WHERE id = ?
  `).run(price, seller, characterId)
  
  const trade = db.prepare(`
    INSERT INTO trades (id, characterId, fromWallet, price, status)
    VALUES (?, ?, ?, ?, 'listing')
  `)
  
  const tradeId = `trade-${Date.now()}`
  trade.run(tradeId, characterId, seller, price)
  
  return { tradeId, characterId, price, status: 'listing' }
}

export function buyCharacter(characterId: string, buyerWallet: string, newOwnerId: string) {
  const character = getCharacter(characterId)
  
  db.prepare(`
    UPDATE characters 
    SET ownerId = ?, isTrading = 0, tradePrice = null, tradeOfferedBy = null
    WHERE id = ?
  `).run(newOwnerId, characterId)
  
  db.prepare(`
    UPDATE trades
    SET toWallet = ?, status = 'completed'
    WHERE characterId = ? AND status = 'listing'
  `).run(buyerWallet, characterId)
  
  return getCharacter(characterId)
}

export function getTradeListings() {
  return db.prepare(`
    SELECT * FROM trades 
    WHERE status = 'listing'
    ORDER BY createdAt DESC
  `).all()
}

export default db
