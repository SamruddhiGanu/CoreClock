import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { query } from '../db';

const router = express.Router();

function getUserId(req: Request): string | null {
  // middleware sets req.userId directly (not req.user)
  return (req as any).userId ?? null;
}

// GET /api/calories?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      console.error('[calories GET] Cannot find userId. req.userId =', (req as any).userId);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { startDate, endDate } = req.query;
    const params: any[] = [userId];
    let sql = `SELECT * FROM calorie_logs WHERE user_id = $1`;

    if (startDate) { params.push(startDate); sql += ` AND date >= $${params.length}`; }
    if (endDate)   { params.push(endDate);   sql += ` AND date <= $${params.length}`; }

    sql += ` ORDER BY created_at ASC`;

    const result = await query(sql, params);
    return res.json(result.rows);
  } catch (err) {
    console.error('[calories GET] error:', err);
    return res.status(500).json({ error: 'Failed to fetch calories' });
  }
});

// POST /api/calories
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { meal_name, meal_type, calories, protein, carbs, fats, notes, date } = req.body;

    const result = await query(
      `INSERT INTO calorie_logs (user_id, date, meal_name, meal_type, calories, protein, carbs, fats, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [userId, date, meal_name, meal_type || 'snack', calories, protein || 0, carbs || 0, fats || 0, notes || '']
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[calories POST] error:', err);
    return res.status(500).json({ error: 'Failed to create calorie log' });
  }
});

// DELETE /api/calories/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await query(
      `DELETE FROM calorie_logs WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('[calories DELETE] error:', err);
    return res.status(500).json({ error: 'Failed to delete calorie log' });
  }
});

export default router;