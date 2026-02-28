// Shared types for recipe functionality

export interface Ingredient {
  id: string;
  name: string;
  quantity: number; // stored as x100
  unit: string;
  calories: number | null;
  order: number;
}

export interface Step {
  id: string;
  instruction: string;
  order: number;
  timerSeconds: number | null;
}

export interface Preparation {
  id: string;
  title: string;
  order: number;
  steps: Step[];
  ingredients: Ingredient[];
}

export interface Recipe {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  estimatedTime: number;
  calories: number | null;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  categoryName: string | null;
  preparations: Preparation[];
}

export interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  isFinished: boolean;
  startedAt: number | null;
  pausedTimeLeft: number | null;
}

export interface PrepProgress {
  currentStepIndex: number;
  started: boolean;
  completed: boolean;
}

export interface StoredProgress {
  prepProgress: Record<string, PrepProgress>;
  timerStates: Record<string, TimerState>;
  servings: number;
  savedAt: number;
}
