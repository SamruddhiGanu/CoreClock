import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import ProgressRing from './ProgressRing';
import TimerDisplay from './TimerDisplay';
import MotivationalQuote from './MotivationalQuote';
import { cn } from '@/lib/utils';

interface ActiveTimerProps {
  currentTime: number;
  isWorkout: boolean;
  isRunning: boolean;
  currentCycle: number;
  totalCycles: number;
  phaseDuration: number;
  totalTimeRemaining: number;
  totalDuration: number;
  onToggle: () => void;
  onReset: () => void;
  onStop: () => void;
}

const ActiveTimer: React.FC<ActiveTimerProps> = ({
  currentTime,
  isWorkout,
  isRunning,
  currentCycle,
  totalCycles,
  phaseDuration,
  totalTimeRemaining,
  totalDuration,
  onToggle,
  onReset,
  onStop,
}) => {
  const phaseProgress = ((phaseDuration - currentTime) / phaseDuration) * 100;
  const totalProgress = ((totalDuration - totalTimeRemaining) / totalDuration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-primary text-glow-cyan tracking-wider">
          ROUND {currentCycle} / {totalCycles}
        </h2>
        <p className="text-muted-foreground mt-1">
          {formatTime(totalTimeRemaining)} remaining
        </p>
      </div>

      {/* Total Progress Bar */}
      <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            "bg-gradient-to-r from-primary via-secondary to-accent"
          )}
          style={{ width: `${totalProgress}%` }}
        />
      </div>

      {/* Main Timer Ring */}
      <div className="flex justify-center">
        <ProgressRing
          progress={phaseProgress}
          isWorkout={isWorkout}
          size={320}
          strokeWidth={14}
        >
          <TimerDisplay seconds={currentTime} isWorkout={isWorkout} />
        </ProgressRing>
      </div>

      {/* Motivational Quote */}
      <div className="h-12">
        <MotivationalQuote isWorkout={isWorkout} isRunning={isRunning} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <Button
          variant="control"
          size="icon-lg"
          onClick={onStop}
          className="rounded-full"
        >
          <X className="w-6 h-6" />
        </Button>
        
        <Button
          variant={isWorkout ? "workout" : "break"}
          size="icon-lg"
          onClick={onToggle}
          className="w-20 h-20 rounded-full text-2xl"
        >
          {isRunning ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </Button>
        
        <Button
          variant="control"
          size="icon-lg"
          onClick={onReset}
          className="rounded-full"
        >
          <RotateCcw className="w-6 h-6" />
        </Button>
      </div>

      {/* Phase Indicator */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalCycles }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              index < currentCycle - 1
                ? "bg-accent"
                : index === currentCycle - 1
                ? isWorkout
                  ? "bg-workout glow-green"
                  : "bg-break glow-purple"
                : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default ActiveTimer;