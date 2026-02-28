import { useState, useEffect, useCallback } from 'react';
import type { Recipe, Preparation, Step, TimerState, PrepProgress, StoredProgress } from '../types';

const getStorageKey = (recipeId: string) => `recipe-progress-${recipeId}`;

function loadProgress(recipeId: string, defaultServings: number): StoredProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(getStorageKey(recipeId));
    if (!stored) return null;

    const parsed: StoredProgress = JSON.parse(stored);

    // Check if saved less than 24 hours ago
    const hoursSaved = (Date.now() - parsed.savedAt) / (1000 * 60 * 60);
    if (hoursSaved > 24) {
      localStorage.removeItem(getStorageKey(recipeId));
      return null;
    }

    // Recalculate running timers based on elapsed time
    const updatedTimerStates: Record<string, TimerState> = {};
    for (const [stepId, timer] of Object.entries(parsed.timerStates)) {
      if (timer.isRunning && timer.startedAt) {
        const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000);
        const baseTime = timer.pausedTimeLeft ?? timer.timeLeft;
        const newTimeLeft = Math.max(0, baseTime - elapsed);

        if (newTimeLeft <= 0) {
          updatedTimerStates[stepId] = {
            ...timer,
            timeLeft: 0,
            isRunning: false,
            isFinished: true,
            startedAt: null,
            pausedTimeLeft: null
          };
        } else {
          updatedTimerStates[stepId] = {
            ...timer,
            timeLeft: newTimeLeft,
          };
        }
      } else {
        updatedTimerStates[stepId] = timer;
      }
    }

    return {
      ...parsed,
      timerStates: updatedTimerStates
    };
  } catch {
    return null;
  }
}

function saveProgress(recipeId: string, data: Omit<StoredProgress, 'savedAt'>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(recipeId), JSON.stringify({
      ...data,
      savedAt: Date.now()
    }));
  } catch {
    // Ignore storage errors
  }
}

interface UseRecipeProgressOptions {
  recipe: Recipe;
}

export function useRecipeProgress({ recipe }: UseRecipeProgressOptions) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize with default values (same on server and client)
  const getDefaultPrepProgress = () => {
    const initial: Record<string, PrepProgress> = {};
    recipe.preparations.forEach((prep) => {
      initial[prep.id] = { currentStepIndex: 0, started: false, completed: false };
    });
    return initial;
  };

  // Servings state
  const [servings, setServings] = useState(recipe.servings);

  // Preparation progress state
  const [prepProgress, setPrepProgress] = useState<Record<string, PrepProgress>>(getDefaultPrepProgress);

  // Timer states
  const [timerStates, setTimerStates] = useState<Record<string, TimerState>>({});

  // Collapsed preparations state
  const [collapsedPreps, setCollapsedPreps] = useState<Record<string, boolean>>({});

  // Load from localStorage after hydration (client-only)
  useEffect(() => {
    const stored = loadProgress(recipe.id, recipe.servings);
    if (stored) {
      if (stored.servings) setServings(stored.servings);
      if (stored.prepProgress) setPrepProgress(stored.prepProgress);
      if (stored.timerStates) setTimerStates(stored.timerStates);
    }
    setIsHydrated(true);
  }, [recipe.id, recipe.servings]);

  // Save progress to localStorage when state changes (after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    saveProgress(recipe.id, { prepProgress, timerStates, servings });
  }, [prepProgress, timerStates, servings, recipe.id, isHydrated]);

  // Toggle collapse
  const toggleCollapse = useCallback((prepId: string) => {
    setCollapsedPreps((prev) => ({ ...prev, [prepId]: !prev[prepId] }));
  }, []);

  // Adjust servings
  const adjustServings = useCallback((delta: number) => {
    setServings((prev) => {
      const newServings = prev + delta;
      if (newServings >= 1 && newServings <= 50) {
        return newServings;
      }
      return prev;
    });
  }, []);

  // Get timer state for a step
  const getTimerState = useCallback((stepId: string, seconds: number): TimerState => {
    return timerStates[stepId] ?? {
      timeLeft: seconds,
      isRunning: false,
      isFinished: false,
      startedAt: null,
      pausedTimeLeft: null
    };
  }, [timerStates]);

  // Update timer state
  const updateTimerState = useCallback((stepId: string, state: TimerState) => {
    setTimerStates((prev) => ({ ...prev, [stepId]: state }));
  }, []);

  // Check if timer is incomplete
  const checkTimerIncomplete = useCallback((step: Step | undefined): boolean => {
    if (!step?.timerSeconds) return false;
    const timerState = timerStates[step.id];
    const isTimerRunning = timerState?.isRunning;
    const timerNeverStarted = !timerState || (!timerState.isFinished && timerState.pausedTimeLeft === null && !timerState.isRunning);
    return isTimerRunning || timerNeverStarted;
  }, [timerStates]);

  // Start preparation
  const startPrep = useCallback((prepId: string) => {
    setPrepProgress((prev) => {
      const existing = prev[prepId] || { currentStepIndex: 0, started: false, completed: false };
      return {
        ...prev,
        [prepId]: {
          currentStepIndex: existing.currentStepIndex ?? 0,
          started: true,
          completed: existing.completed ?? false,
        },
      };
    });
    // Expand if collapsed
    setCollapsedPreps((prev) => ({ ...prev, [prepId]: false }));
  }, []);

  // Go to next step
  const goToNextStep = useCallback((prep: Preparation, skipTimerCheck = false): boolean => {
    const progress = prepProgress[prep.id];
    if (!progress) return false;

    const currentStepIndex = progress.currentStepIndex;
    const currentStep = prep.steps[currentStepIndex];

    // Check if timer is incomplete
    if (!skipTimerCheck && checkTimerIncomplete(currentStep)) {
      return false; // Return false to indicate confirmation needed
    }

    if (currentStepIndex < prep.steps.length - 1) {
      // Pause current step's timer if running
      if (currentStep) {
        const currentTimerState = timerStates[currentStep.id];
        if (currentTimerState?.isRunning && currentTimerState.startedAt) {
          const elapsed = Math.floor((Date.now() - currentTimerState.startedAt) / 1000);
          const baseTime = currentTimerState.pausedTimeLeft ?? (currentStep.timerSeconds ?? 0);
          const timeLeft = Math.max(0, baseTime - elapsed);
          setTimerStates((prev) => ({
            ...prev,
            [currentStep.id]: {
              ...currentTimerState,
              isRunning: false,
              pausedTimeLeft: timeLeft,
              timeLeft: timeLeft,
              startedAt: null
            }
          }));
        }
      }

      setPrepProgress((prev) => ({
        ...prev,
        [prep.id]: { ...prev[prep.id], currentStepIndex: currentStepIndex + 1 },
      }));
    }

    return true;
  }, [prepProgress, timerStates, checkTimerIncomplete]);

  // Go to previous step
  const goToPrevStep = useCallback((prepId: string) => {
    const progress = prepProgress[prepId];
    if (!progress || progress.currentStepIndex <= 0) return;

    setPrepProgress((prev) => ({
      ...prev,
      [prepId]: { ...prev[prepId], currentStepIndex: progress.currentStepIndex - 1 },
    }));
  }, [prepProgress]);

  // Reset preparation
  const resetPrep = useCallback((prep: Preparation) => {
    setPrepProgress((prev) => ({
      ...prev,
      [prep.id]: { currentStepIndex: 0, started: false, completed: false },
    }));
    // Reset all timers for this preparation
    setTimerStates((prev) => {
      const newStates = { ...prev };
      prep.steps.forEach((step) => {
        delete newStates[step.id];
      });
      return newStates;
    });
  }, []);

  // Complete preparation
  const completePrep = useCallback((prep: Preparation, skipTimerCheck = false): boolean => {
    const progress = prepProgress[prep.id];
    if (!progress) return true;

    const currentStep = prep.steps[progress.currentStepIndex];

    // Check if timer is incomplete
    if (!skipTimerCheck && checkTimerIncomplete(currentStep)) {
      return false; // Return false to indicate confirmation needed
    }

    setPrepProgress((prev) => ({
      ...prev,
      [prep.id]: { ...prev[prep.id], completed: true },
    }));

    return true;
  }, [prepProgress, checkTimerIncomplete]);

  // Get progress info for a preparation
  const getPrepInfo = useCallback((prep: Preparation) => {
    const progress = prepProgress[prep.id];
    const isCompleted = progress?.completed;
    const isInProgress = progress?.started && !isCompleted && progress.currentStepIndex < prep.steps.length;
    const currentStep = prep.steps[progress?.currentStepIndex ?? 0];
    const isCollapsed = collapsedPreps[prep.id] ?? false;

    return {
      progress,
      isCompleted,
      isInProgress,
      currentStep,
      isCollapsed,
      currentStepIndex: progress?.currentStepIndex ?? 0,
      totalSteps: prep.steps.length,
    };
  }, [prepProgress, collapsedPreps]);

  // Total calories adjusted for servings
  const totalCalories = recipe.calories ? recipe.calories * servings : null;

  // Collect all ingredients from all preparations
  const allIngredients = recipe.preparations.flatMap((prep) =>
    prep.ingredients.map((ing) => ({ ...ing, prepTitle: prep.title }))
  );

  return {
    // State
    servings,
    prepProgress,
    timerStates,
    collapsedPreps,
    totalCalories,
    allIngredients,
    // Actions
    adjustServings,
    setServings,
    toggleCollapse,
    startPrep,
    goToNextStep,
    goToPrevStep,
    resetPrep,
    completePrep,
    getTimerState,
    updateTimerState,
    getPrepInfo,
    checkTimerIncomplete,
  };
}
