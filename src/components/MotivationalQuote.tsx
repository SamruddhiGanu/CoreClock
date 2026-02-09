import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const workoutQuotes = [
  "PUSH YOUR LIMITS! 🔥",
  "NO PAIN, NO GAIN! 💪",
  "YOU'RE UNSTOPPABLE! ⚡",
  "FEEL THE BURN! 🌟",
  "CRUSH IT! 💥",
  "BEAST MODE ON! 🦁",
  "STRONGER EVERY REP! 💎",
  "YOU GOT THIS! 🚀",
  "DON'T STOP NOW! ⭐",
  "LEGENDARY EFFORT! 👑",
];

const breakQuotes = [
  "Breathe deep... 🌊",
  "Recovery is key 🧘",
  "Rest and reload ✨",
  "You earned this 💫",
  "Get ready... 🎯",
  "Almost there 🌙",
  "Stay focused 🔮",
  "Power up 🔋",
];

interface MotivationalQuoteProps {
  isWorkout: boolean;
  isRunning: boolean;
}

const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({ isWorkout, isRunning }) => {
  const [quote, setQuote] = useState('');
  const [key, setKey] = useState(0);

  useEffect(() => {
    const quotes = isWorkout ? workoutQuotes : breakQuotes;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
    setKey(prev => prev + 1);
  }, [isWorkout]);

  if (!isRunning) return null;

  return (
    <div
      key={key}
      className={cn(
        "text-center animate-fade-in",
        isWorkout ? "text-workout" : "text-break"
      )}
    >
      <p className="text-lg md:text-xl font-semibold tracking-wide animate-float">
        {quote}
      </p>
    </div>
  );
};

export default MotivationalQuote;