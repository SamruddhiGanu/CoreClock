import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  isWorkout: boolean;
  children?: React.ReactNode;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 320,
  strokeWidth = 12,
  isWorkout,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Glow effect */}
      <div
        className={cn(
          "absolute rounded-full blur-3xl opacity-30 transition-colors duration-500",
          isWorkout ? "bg-workout" : "bg-break"
        )}
        style={{ width: size * 0.8, height: size * 0.8 }}
      />
      
      {/* Pulse rings */}
      <div
        className={cn(
          "absolute rounded-full animate-pulse-ring",
          isWorkout ? "border-workout/30" : "border-break/30"
        )}
        style={{
          width: size,
          height: size,
          borderWidth: 2,
        }}
      />
      
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-30"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isWorkout ? "hsl(var(--workout))" : "hsl(var(--break))"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-out"
          style={{
            filter: `drop-shadow(0 0 10px ${isWorkout ? 'hsl(var(--workout))' : 'hsl(var(--break))'})`,
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ProgressRing;
