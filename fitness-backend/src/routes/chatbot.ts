import express, { response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../db';

const router = express.Router();

router.post('/message', authenticate, async (req: AuthRequest, res) => {
  try {
    const { message } = req.body;
    
    const historyResult = await query(
      `SELECT role, content FROM chat_messages 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10`,
      [req.userId]
    );
    
    const conversationHistory = historyResult.rows.reverse();
    
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }
    
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful fitness and nutrition assistant. Provide advice on workouts, nutrition, and wellness goals.'
      },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];
    
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
    
    if (!aiResponse.ok) {
      throw new Error('AI service error');
    }
    
    

    const aiData = await response.json() as any

    const assistantMessage = aiData.choices[0].message.content;
    
    await query(
      `INSERT INTO chat_messages (user_id, role, content) VALUES ($1, $2, $3)`,
      [req.userId, 'user', message]
    );
    
    await query(
      `INSERT INTO chat_messages (user_id, role, content) VALUES ($1, $2, $3)`,
      [req.userId, 'assistant', assistantMessage]
    );
    
    res.json({ message: assistantMessage });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;