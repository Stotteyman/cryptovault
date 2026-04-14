import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() })
})

// Game API endpoints (stub)
app.get('/api/characters', (req: Request, res: Response) => {
  res.json({ characters: [] })
})

app.post('/api/characters', (req: Request, res: Response) => {
  res.status(201).json({ message: 'Character created (stub)' })
})

app.get('/api/dungeons', (req: Request, res: Response) => {
  res.json({
    dungeons: [
      { id: 1, name: 'Beginner Dungeon', difficulty: 1, maxPlayers: 1 },
      { id: 2, name: 'Novice Dungeon', difficulty: 2, maxPlayers: 1 },
    ]
  })
})

app.get('/api/leaderboard', (req: Request, res: Response) => {
  res.json({ leaderboard: [] })
})

app.get('/api/marketplace', (req: Request, res: Response) => {
  res.json({ items: [] })
})

// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`CryptoVault Server running on http://localhost:${PORT}`)
  console.log('Health check: http://localhost:' + PORT + '/health')
})

export default app
