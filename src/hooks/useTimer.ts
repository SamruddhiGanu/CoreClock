import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerProps {
  totalDuration: number; // in seconds
  workoutDuration: number; // in seconds
  breakDuration: number; // in seconds
  onComplete: () => void;
}

interface TimerState {
  currentTime: number;
  isWorkout: boolean;
  isRunning: boolean;
  currentCycle: number;
  totalCycles: number;
  totalTimeRemaining: number;
}

export const useTimer = ({
  totalDuration,
  workoutDuration,
  breakDuration,
  onComplete,
}: UseTimerProps) => {
  const cycleDuration = workoutDuration + breakDuration;
  const totalCycles = Math.floor(totalDuration / cycleDuration);
  
  const [state, setState] = useState<TimerState>({
    currentTime: workoutDuration,
    isWorkout: true,
    isRunning: false,
    currentCycle: 1,
    totalCycles,
    totalTimeRemaining: totalDuration,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio context for beeps
  const playBeep = useCallback((isTransition: boolean = false) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = isTransition ? 880 : 440;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.log('Audio not available');
    }
  }, []);

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.totalTimeRemaining <= 1) {
        playBeep(true);
        onComplete();
        return { ...prev, isRunning: false, totalTimeRemaining: 0, currentTime: 0 };
      }

      const newTotalRemaining = prev.totalTimeRemaining - 1;

      if (prev.currentTime <= 1) {
        // Phase transition
        playBeep(true);
        
        if (prev.isWorkout) {
          // Switch to break
          return {
            ...prev,
            currentTime: breakDuration,
            isWorkout: false,
            totalTimeRemaining: newTotalRemaining,
          };
        } else {
          // Switch to workout (next cycle)
          return {
            ...prev,
            currentTime: workoutDuration,
            isWorkout: true,
            currentCycle: prev.currentCycle + 1,
            totalTimeRemaining: newTotalRemaining,
          };
        }
      }

      // Countdown beep for last 3 seconds
      if (prev.currentTime <= 4 && prev.currentTime > 1) {
        playBeep(false);
      }

      return {
        ...prev,
        currentTime: prev.currentTime - 1,
        totalTimeRemaining: newTotalRemaining,
      };
    });
  }, [breakDuration, workoutDuration, onComplete, playBeep]);

  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, tick]);

  const toggle = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  const reset = useCallback(() => {
    setState({
      currentTime: workoutDuration,
      isWorkout: true,
      isRunning: false,
      currentCycle: 1,
      totalCycles,
      totalTimeRemaining: totalDuration,
    });
  }, [workoutDuration, totalCycles, totalDuration]);

  const phaseDuration = state.isWorkout ? workoutDuration : breakDuration;

  return {
    ...state,
    phaseDuration,
    totalDuration,
    toggle,
    reset,
  };
};
