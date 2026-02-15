import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../db';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT * FROM calendar_events 
      WHERE user_id = $1 
      ORDER BY start_time ASC`,
      [req.userId]
    );
    
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, description, eventType, startTime, endTime } = req.body;
    
    const result = await query(
      `INSERT INTO calendar_events 
        (user_id, title, description, event_type, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, title, description, eventType, startTime, endTime]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;