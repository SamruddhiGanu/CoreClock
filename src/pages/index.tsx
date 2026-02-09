import React, { useState, useCallback } from 'react';
import TimerSetup from '@/components/TimerSetup';
import ActiveTimer from '@/components/ActiveTimer';
import CompletionScreen from '@/components/CompletionScreen';
import { useTimer } from '@/hooks/useTimer';

type Phase = 'setup' | 'active' | 'complete';

const Index = () => {
  const [phase, setPhase] = useState<Phase>('setup');
  const [settings, setSettings] = useState({
    totalMinutes: 20,
    workoutDuration: 60, // 1 minute in seconds
    breakDuration: 30, // 30 seconds
  });

  const totalDuration = settings.totalMinutes * 60;
  const cycleDuration = settings.workoutDuration + settings.breakDuration;
  const totalCycles = Math.floor(totalDuration / cycleDuration);

  const handleComplete = useCallback(() => {
    setPhase('complete');
  }, []);

  const timer = useTimer({
    totalDuration,
    workoutDuration: settings.workoutDuration,
    breakDuration: settings.breakDuration,
    onComplete: handleComplete,
  });

  const handleStart = () => {
    setPhase('active');
  };

  const handleStop = () => {
    timer.reset();
    setPhase('setup');
  };

  const handleRestart = () => {
    timer.reset();
    setPhase('active');
  };

  const handleNewWorkout = () => {
    timer.reset();
    setPhase('setup');
  };

  return (
    <div className="min-h-screen bg-background bg-grid overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        {phase === 'setup' && (
          <TimerSetup
            totalMinutes={settings.totalMinutes}
            workoutDuration={settings.workoutDuration}
            breakDuration={settings.breakDuration}
            onTotalChange={(value) => setSettings(s => ({ ...s, totalMinutes: value }))}
            onWorkoutChange={(value) => setSettings(s => ({ ...s, workoutDuration: value }))}
            onBreakChange={(value) => setSettings(s => ({ ...s, breakDuration: value }))}
            onStart={handleStart}
          />
        )}

        {phase === 'active' && (
          <ActiveTimer
            currentTime={timer.currentTime}
            isWorkout={timer.isWorkout}
            isRunning={timer.isRunning}
            currentCycle={timer.currentCycle}
            totalCycles={timer.totalCycles}
            phaseDuration={timer.phaseDuration}
            totalTimeRemaining={timer.totalTimeRemaining}
            totalDuration={totalDuration}
            onToggle={timer.toggle}
            onReset={timer.reset}
            onStop={handleStop}
          />
        )}

        {phase === 'complete' && (
          <CompletionScreen
            totalCycles={totalCycles}
            totalTime={totalDuration}
            onRestart={handleRestart}
            onNewWorkout={handleNewWorkout}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
