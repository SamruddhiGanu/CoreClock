import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../db';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let sql = 'SELECT * FROM calorie_logs WHERE user_id = $1';
    const params: any[] = [req.userId];
    
    if (startDate) {
      sql += ' AND date >= $2';
      params.push(startDate);
    }
    
    if (endDate) {
      const paramIndex = params.length + 1;
      sql += ` AND date <= $${paramIndex}`;
      params.push(endDate);
    }
    
    sql += ' ORDER BY date DESC, created_at DESC';
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { date, mealName, calories, protein, carbs, fats, mealType, notes } = req.body;
    
    const result = await query(
      `INSERT INTO calorie_logs 
        (user_id, date, meal_name, calories, protein, carbs, fats, meal_type, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [req.userId, date, mealName, calories, protein, carbs, fats, mealType, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM calorie_logs WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Calorie log not found' });
    }
    
    res.json({ message: 'Calorie log deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;