import { useState, useCallback } from 'react';

export interface WorkoutEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: string;
  duration: number; // minutes
  caloriesBurned: number;
}

export interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  calories: number;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DayData {
  workouts: WorkoutEntry[];
  foods: FoodEntry[];
}

const STORAGE_KEY_WORKOUTS = 'fitpulse_workouts';
const STORAGE_KEY_FOODS = 'fitpulse_foods';

function loadFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useDashboardData() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(() => loadFromStorage(STORAGE_KEY_WORKOUTS));
  const [foods, setFoods] = useState<FoodEntry[]>(() => loadFromStorage(STORAGE_KEY_FOODS));

  const addWorkout = useCallback((entry: Omit<WorkoutEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setWorkouts(prev => {
      const updated = [...prev, newEntry];
      saveToStorage(STORAGE_KEY_WORKOUTS, updated);
      return updated;
    });
  }, []);

  const addFood = useCallback((entry: Omit<FoodEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setFoods(prev => {
      const updated = [...prev, newEntry];
      saveToStorage(STORAGE_KEY_FOODS, updated);
      return updated;
    });
  }, []);

  const removeWorkout = useCallback((id: string) => {
    setWorkouts(prev => {
      const updated = prev.filter(w => w.id !== id);
      saveToStorage(STORAGE_KEY_WORKOUTS, updated);
      return updated;
    });
  }, []);

  const removeFood = useCallback((id: string) => {
    setFoods(prev => {
      const updated = prev.filter(f => f.id !== id);
      saveToStorage(STORAGE_KEY_FOODS, updated);
      return updated;
    });
  }, []);

  const getDataForDate = useCallback((date: string): DayData => {
    return {
      workouts: workouts.filter(w => w.date === date),
      foods: foods.filter(f => f.date === date),
    };
  }, [workouts, foods]);

  const getDatesWithData = useCallback((): Set<string> => {
    const dates = new Set<string>();
    workouts.forEach(w => dates.add(w.date));
    foods.forEach(f => dates.add(f.date));
    return dates;
  }, [workouts, foods]);

  const getTotalCaloriesForDate = useCallback((date: string) => {
    const dayFoods = foods.filter(f => f.date === date);
    const dayWorkouts = workouts.filter(w => w.date === date);
    const consumed = dayFoods.reduce((sum, f) => sum + f.calories, 0);
    const burned = dayWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
    return { consumed, burned, net: consumed - burned };
  }, [workouts, foods]);

  return {
    workouts,
    foods,
    addWorkout,
    addFood,
    removeWorkout,
    removeFood,
    getDataForDate,
    getDatesWithData,
    getTotalCaloriesForDate,
  };
}
