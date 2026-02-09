import React from 'react';
import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  seconds: number;
  isWorkout: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds, isWorkout }) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className="text-center">
      <div
        className={cn(
          "font-display text-7xl md:text-8xl font-black tracking-wider transition-all duration-300 animate-countdown",
          isWorkout ? "text-workout text-glow-green" : "text-break text-glow-purple"
        )}
        key={seconds} // Force re-render for animation
      >
        {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
      </div>
      <div
        className={cn(
          "mt-4 text-xl md:text-2xl font-display uppercase tracking-[0.3em] font-semibold transition-colors duration-300",
          isWorkout ? "text-workout/80" : "text-break/80"
        )}
      >
        {isWorkout ? '💪 WORKOUT' : '😌 REST'}
      </div>
    </div>
  );
};

export default TimerDisplay;