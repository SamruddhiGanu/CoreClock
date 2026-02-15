import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../db';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT w.*, 
        json_agg(
          json_build_object(
            'id', e.id,
            'exercise_name', e.exercise_name,
            'sets', e.sets,
            'reps', e.reps,
            'weight', e.weight
          ) ORDER BY e.created_at
        ) FILTER (WHERE e.id IS NOT NULL) as exercises
      FROM workout_logs w
      LEFT JOIN exercise_sets e ON w.id = e.workout_log_id
      WHERE w.user_id = $1
      GROUP BY w.id 
      ORDER BY w.date DESC 
      LIMIT 20`,
      [req.userId]
    );
    
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { date, workoutName, duration, notes, exercises } = req.body;
    
    await query('BEGIN');
    
    const workoutResult = await query(
      `INSERT INTO workout_logs (user_id, date, workout_name, duration, notes)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, date, workoutName, duration, notes]
    );
    
    const workout = workoutResult.rows[0];
    
    if (exercises && exercises.length > 0) {
      for (const exercise of exercises) {
        await query(
          `INSERT INTO exercise_sets 
            (workout_log_id, exercise_name, sets, reps, weight, rest_time, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [workout.id, exercise.exerciseName, exercise.sets, exercise.reps, 
           exercise.weight, exercise.restTime, exercise.notes]
        );
      }
    }
    
    await query('COMMIT');
    
    res.status(201).json(workout);
  } catch (error: any) {
    await query('ROLLBACK');
    res.status(400).json({ error: error.message });
  }
});

export default router;