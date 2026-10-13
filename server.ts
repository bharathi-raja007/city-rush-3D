import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { authenticateUser, type AuthRequest } from './src/middleware/auth.ts';
import {
  getOrCreatePlayer,
  getPlayerData,
  submitGameRun,
  buyCharacter,
  buyItem,
  claimMission,
  selectCharacter,
  selectBoard,
  getGlobalLeaderboard,
} from './src/db/gameService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Routes

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Sync / Get current player data
app.get('/api/players/me', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { user } = await getOrCreatePlayer(req.user!);
    const data = await getPlayerData(user.id);
    res.json(data);
  } catch (error: any) {
    console.error('Error in /api/players/me:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch player data' });
  }
});

// Update player settings (equipped character, board)
app.patch('/api/players/me', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { user } = await getOrCreatePlayer(req.user!);
    const { characterCode, boardCode } = req.body;

    if (characterCode) {
      await selectCharacter(user.id, characterCode);
    }
    if (boardCode !== undefined) {
      await selectBoard(user.id, boardCode);
    }

    const updated = await getPlayerData(user.id);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating player:', error);
    res.status(400).json({ error: error.message || 'Failed to update player' });
  }
});

// Submit a completed game run
app.post('/api/scores', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { user } = await getOrCreatePlayer(req.user!);
    const { score, distance, coinsCollected, durationSeconds, characterCode, deathReason } = req.body;

    if (typeof score !== 'number' || typeof distance !== 'number' || typeof coinsCollected !== 'number') {
      return res.status(400).json({ error: 'Invalid score payload' });
    }

    const runResult = await submitGameRun(user.id, {
      score: Math.max(0, Math.floor(score)),
      distance: Math.max(0, Math.floor(distance)),
      coinsCollected: Math.max(0, Math.floor(coinsCollected)),
      durationSeconds: Math.max(1, Math.floor(durationSeconds || 1)),
      characterCode: characterCode || 'runner-dash',
      deathReason: deathReason || 'collision',
    });

    res.json({ success: true, ...runResult });
  } catch (error: any) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: error.message || 'Failed to save score' });
  }
});

// Buy character from shop
app.post('/api/shop/buy-character', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { user } = await getOrCreatePlayer(req.user!);
    const { characterCode } = req.body;
    if (!characterCode) return res.status(400).json({ error: 'Missing characterCode' });

    const result = await buyCharacter(user.id, characterCode);
    res.json(result);
  } catch (error: any) {
    console.error('Error buying character:', error);
    res.status(400).json({ error: error.message || 'Purchase failed' });
  }
});

// Buy item or hoverboard from shop
app.post('/api/shop/buy-item', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { user } = await getOrCreatePlayer(req.user!);
    const { itemCode } = req.body;
    if (!itemCode) return res.status(400).json({ error: 'Missing itemCode' });

    const result = await buyItem(user.id, itemCode);
    res.json(result);
  } catch (error: any) {
    console.error('Error buying item:', error);
    res.status(400).json({ error: error.message || 'Purchase failed' });
  }
});

// Claim mission reward
app.post('/api/missions/claim', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { user } = await getOrCreatePlayer(req.user!);
    const { missionCode } = req.body;
    if (!missionCode) return res.status(400).json({ error: 'Missing missionCode' });

    const result = await claimMission(user.id, missionCode);
    res.json(result);
  } catch (error: any) {
    console.error('Error claiming mission:', error);
    res.status(400).json({ error: error.message || 'Claim failed' });
  }
});

// Global leaderboard
app.get('/api/leaderboard', async (_req, res) => {
  try {
    const leaderboard = await getGlobalLeaderboard(50);
    res.json(leaderboard);
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

// Mount Vite or static files
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
