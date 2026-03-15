import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { query } from '../db';

const router = express.Router();

function getUserId(req: Request): string | null {
  return (req as any).userId ?? null;
}

// GET /api/workouts?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { startDate, endDate } = req.query;
    const params: any[] = [userId];
    let sql = `SELECT * FROM workout_logs WHERE user_id = $1`;

    if (startDate) { params.push(startDate); sql += ` AND date >= $${params.length}`; }
    if (endDate)   { params.push(endDate);   sql += ` AND date <= $${params.length}`; }

    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);
    return res.json(result.rows);
  } catch (err) {
    console.error('[workouts GET] error:', err);
    return res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// POST /api/workouts
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Log body so you can confirm fields are arriving
    console.log('[workouts POST] body:', req.body);

    const workout_name = req.body?.workout_name;
    const duration     = req.body?.duration     ?? 0;
    const date         = req.body?.date         ?? new Date().toISOString().split('T')[0];
    const notes        = req.body?.notes        ?? '';

    if (!workout_name) {
      return res.status(400).json({ error: 'workout_name is required' });
    }

    const result = await query(
      `INSERT INTO workout_logs (user_id, workout_name, duration, date, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, workout_name, duration, date, notes]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[workouts POST] error:', err);
    return res.status(500).json({ error: 'Failed to create workout' });
  }
});

// DELETE /api/workouts/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await query(
      `DELETE FROM workout_logs WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('[workouts DELETE] error:', err);
    return res.status(500).json({ error: 'Failed to delete workout' });
  }
});

export default router;