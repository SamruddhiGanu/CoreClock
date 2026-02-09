import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Flame } from 'lucide-react';

interface CompletionScreenProps {
  totalCycles: number;
  totalTime: number;
  onRestart: () => void;
  onNewWorkout: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  totalCycles,
  totalTime,
  onRestart,
  onNewWorkout,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-8">
      {/* Trophy Animation */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent blur-3xl opacity-30 animate-pulse-slow" />
        <div className="relative p-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 inline-block glow-cyan animate-float">
          <Trophy className="w-24 h-24 text-primary" />
        </div>
      </div>

      {/* Congratulations */}
      <div className="space-y-2">
        <h1 className="font-display text-4xl md:text-5xl font-black text-glow-cyan text-primary tracking-wider">
          INCREDIBLE!
        </h1>
        <p className="text-xl text-muted-foreground">
          You crushed that workout! 🔥
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="gradient-border rounded-2xl p-6 bg-card/50 backdrop-blur-sm">
          <div className="p-3 rounded-xl bg-workout/20 inline-block mb-3">
            <Flame className="w-8 h-8 text-workout" />
          </div>
          <div className="font-display text-3xl font-bold text-workout text-glow-green">
            {totalCycles}
          </div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider">
            Rounds Complete
          </div>
        </div>

        <div className="gradient-border rounded-2xl p-6 bg-card/50 backdrop-blur-sm">
          <div className="p-3 rounded-xl bg-primary/20 inline-block mb-3">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <div className="font-display text-3xl font-bold text-primary text-glow-cyan">
            {formatTime(totalTime)}
          </div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider">
            Total Time
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-workout/10 to-break/10 border border-workout/20">
        <p className="text-lg font-semibold text-foreground">
          "The only bad workout is the one that didn't happen."
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          — Keep pushing! 💪
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="workout"
          size="xl"
          className="flex-1"
          onClick={onRestart}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          GO AGAIN
        </Button>
        <Button
          variant="neon"
          size="xl"
          className="flex-1"
          onClick={onNewWorkout}
        >
          NEW WORKOUT
        </Button>
      </div>
    </div>
  );
};

export default CompletionScreen;