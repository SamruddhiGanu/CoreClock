import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Timer, Dumbbell, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerSetupProps {
  totalMinutes: number;
  workoutDuration: number;
  breakDuration: number;
  onTotalChange: (value: number) => void;
  onWorkoutChange: (value: number) => void;
  onBreakChange: (value: number) => void;
  onStart: () => void;
}

const TimerSetup: React.FC<TimerSetupProps> = ({
  totalMinutes,
  workoutDuration,
  breakDuration,
  onTotalChange,
  onWorkoutChange,
  onBreakChange,
  onStart,
}) => {
  const totalCycles = Math.floor((totalMinutes * 60) / (workoutDuration + breakDuration));

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-4xl md:text-5xl font-black text-glow-cyan text-primary tracking-wider">
          FIT TIMER
        </h1>
        <p className="text-muted-foreground">Configure your workout session</p>
      </div>

      {/* Settings Cards */}
      <div className="space-y-4">
        {/* Total Duration */}
        <div className="gradient-border rounded-2xl p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Timer className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Total Duration</span>
            </div>
            <span className="font-display text-2xl text-primary text-glow-cyan">
              {totalMinutes} min
            </span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="control"
              size="icon-lg"
              onClick={() => onTotalChange(Math.max(5, totalMinutes - 5))}
            >
              <Minus className="w-6 h-6" />
            </Button>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${(totalMinutes / 60) * 100}%` }}
              />
            </div>
            <Button
              variant="control"
              size="icon-lg"
              onClick={() => onTotalChange(Math.min(60, totalMinutes + 5))}
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Workout Duration */}
        <div className="gradient-border rounded-2xl p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-workout/20">
                <Dumbbell className="w-5 h-5 text-workout" />
              </div>
              <span className="font-semibold text-foreground">Workout</span>
            </div>
            <span className="font-display text-2xl text-workout text-glow-green">
              {workoutDuration} sec
            </span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="control"
              size="icon-lg"
              onClick={() => onWorkoutChange(Math.max(15, workoutDuration - 15))}
            >
              <Minus className="w-6 h-6" />
            </Button>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-workout transition-all duration-300"
                style={{ width: `${(workoutDuration / 120) * 100}%` }}
              />
            </div>
            <Button
              variant="control"
              size="icon-lg"
              onClick={() => onWorkoutChange(Math.min(120, workoutDuration + 15))}
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Break Duration */}
        <div className="gradient-border rounded-2xl p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-break/20">
                <Coffee className="w-5 h-5 text-break" />
              </div>
              <span className="font-semibold text-foreground">Break</span>
            </div>
            <span className="font-display text-2xl text-break text-glow-purple">
              {breakDuration} sec
            </span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="control"
              size="icon-lg"
              onClick={() => onBreakChange(Math.max(10, breakDuration - 10))}
            >
              <Minus className="w-6 h-6" />
            </Button>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-break transition-all duration-300"
                style={{ width: `${(breakDuration / 60) * 100}%` }}
              />
            </div>
            <Button
              variant="control"
              size="icon-lg"
              onClick={() => onBreakChange(Math.min(60, breakDuration + 10))}
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">
          <span className="text-foreground font-semibold">{totalCycles}</span> cycles • 
          <span className="text-workout font-semibold"> {workoutDuration}s</span> work / 
          <span className="text-break font-semibold"> {breakDuration}s</span> rest
        </p>
      </div>

      {/* Start Button */}
      <Button
        variant="workout"
        size="xl"
        className="w-full text-xl"
        onClick={onStart}
      >
        🚀 START WORKOUT
      </Button>
    </div>
  );
};

export default TimerSetup;