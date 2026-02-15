
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import calorieRoutes from './routes/calories';
import workoutRoutes from './routes/workouts';
import calendarRoutes from './routes/calendar';
import chatbotRoutes from './routes/chatbot';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/calories', calorieRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});