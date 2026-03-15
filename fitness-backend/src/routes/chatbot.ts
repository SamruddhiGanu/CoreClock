import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../db';

const router = express.Router();

// Ollama configuration
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// TypeScript interface for Ollama response
interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

router.post('/message', authenticate, async (req: AuthRequest, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log('Received message:', message);
    console.log('Ollama URL:', OLLAMA_URL);
    console.log('Ollama Model:', OLLAMA_MODEL);
    
    // Get conversation history
    const historyResult = await query(
      `SELECT role, content FROM chat_messages 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10`,
      [req.userId]
    );
    
    const conversationHistory = historyResult.rows.reverse();
    
    // Build messages for Ollama
    const messages = [
      {
        role: 'system',
        content: `You are an expert fitness and nutrition coach named "FitPulse AI". Provide personalized, motivating advice on:
- Workout routines and exercise form
- Nutrition and meal planning
- Weight loss and muscle building strategies
- Recovery and injury prevention
- Goal setting and motivation

Be encouraging, supportive, and provide actionable advice. Keep responses concise (2-3 paragraphs max) but informative. Use emojis occasionally to keep it engaging.`
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];
    
    console.log('Calling Ollama API...');
    
    // Call Ollama API
    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 200
        }
      }),
    });
    
    console.log('Ollama response status:', ollamaResponse.status);
    
    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error('Ollama API error:', errorText);
      return res.status(500).json({ 
        error: `Ollama API error: ${ollamaResponse.status}. Make sure Ollama is running and model '${OLLAMA_MODEL}' is available.` 
      });
    }
    
    const ollamaData = await ollamaResponse.json() as OllamaResponse;
    console.log('Ollama response received');
    
    const assistantMessage = ollamaData.message.content;
    
    // Save both messages to database
    await query(
      `INSERT INTO chat_messages (user_id, role, content) VALUES ($1, $2, $3)`,
      [req.userId, 'user', message]
    );
    
    await query(
      `INSERT INTO chat_messages (user_id, role, content) VALUES ($1, $2, $3)`,
      [req.userId, 'assistant', assistantMessage]
    );
    
    console.log('Messages saved to database');
    
    res.json({ message: assistantMessage });
    
  } catch (error: any) {
    console.error('Chatbot error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: `Failed to get response: ${error.message}. Make sure Ollama is running (ollama serve)` 
    });
  }
});

// Get chat history
router.get('/history', authenticate, async (req: AuthRequest, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const result = await query(
      `SELECT * FROM chat_messages 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2`,
      [req.userId, limit]
    );
    
    res.json(result.rows.reverse());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;