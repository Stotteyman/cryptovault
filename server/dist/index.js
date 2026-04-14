import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});
// Game API endpoints (stub)
app.get('/api/characters', (req, res) => {
    res.json({ characters: [] });
});
app.post('/api/characters', (req, res) => {
    res.status(201).json({ message: 'Character created (stub)' });
});
app.get('/api/dungeons', (req, res) => {
    res.json({
        dungeons: [
            { id: 1, name: 'Beginner Dungeon', difficulty: 1, maxPlayers: 1 },
            { id: 2, name: 'Novice Dungeon', difficulty: 2, maxPlayers: 1 },
        ]
    });
});
app.get('/api/leaderboard', (req, res) => {
    res.json({ leaderboard: [] });
});
app.get('/api/marketplace', (req, res) => {
    res.json({ items: [] });
});
// Error handling middleware
app.use((err, req, res) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(PORT, () => {
    console.log(`CryptoVault Server running on http://localhost:${PORT}`);
    console.log('Health check: http://localhost:' + PORT + '/health');
});
export default app;
