// ── Make sure your server.ts / index.ts has these lines BEFORE all routes ──
// Without express.json(), req.body is always undefined — causing the 400 error

import express from 'express';
import cors from 'cors';

const app = express();

// ✅ These two must come BEFORE any route registration
app.use(cors());
app.use(express.json());          // parses application/json body
app.use(express.urlencoded({ extended: true })); // parses form body

// Then your routes
import workoutsRouter from './routes/workouts';
import caloriesRouter from './routes/calories';
import authRouter     from './routes/auth';

app.use('/api/workouts', workoutsRouter);
app.use('/api/calories', caloriesRouter);
app.use('/api/auth',     authRouter);

app.listen(3000, () => console.log('Server running on port 3000'));