import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimerState } from '../types';

interface UseRecipeTimerOptions {
  seconds: number;
  stepInstruction?: string;
  // Controlled mode
  timerState?: TimerState;
  onTimerStateChange?: (state: TimerState) => void;
  // Callbacks
  onComplete?: () => void;
  // Sound
  soundUrl?: string;
}

const createInitialState = (seconds: number): TimerState => ({
  timeLeft: seconds,
  isRunning: false,
  isFinished: false,
  startedAt: null,
  pausedTimeLeft: null,
});

export function useRecipeTimer({
  seconds,
  stepInstruction,
  timerState,
  onTimerStateChange,
  onComplete,
  soundUrl = '/sounds/timer-end.mp3',
}: UseRecipeTimerOptions) {
  // Internal state if not controlled
  const [internalState, setInternalState] = useState<TimerState>(() => createInitialState(seconds));

  const isControlled = timerState !== undefined && onTimerStateChange !== undefined;
  const state = isControlled ? timerState : internalState;
  const { isRunning, isFinished, startedAt, pausedTimeLeft } = state;

  const [displayTimeLeft, setDisplayTimeLeft] = useState(() => {
    if (isFinished) return 0;
    if (!isRunning) return pausedTimeLeft ?? seconds;
    if (!startedAt) return seconds;
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const baseTime = pausedTimeLeft ?? seconds;
    return Math.max(0, baseTime - elapsed);
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false);
  const prevSecondsRef = useRef(seconds);

  // Calculate time left based on timestamps
  const calculateTimeLeft = useCallback((): number => {
    if (isFinished) return 0;
    if (!isRunning) return pausedTimeLeft ?? seconds;
    if (!startedAt) return seconds;
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const baseTime = pausedTimeLeft ?? seconds;
    return Math.max(0, baseTime - elapsed);
  }, [isFinished, isRunning, pausedTimeLeft, seconds, startedAt]);

  // Update state helper
  const updateState = useCallback((newState: Partial<TimerState>) => {
    const updated: TimerState = {
      timeLeft: newState.timeLeft ?? state.timeLeft,
      isRunning: newState.isRunning ?? state.isRunning,
      isFinished: newState.isFinished ?? state.isFinished,
      startedAt: newState.startedAt !== undefined ? newState.startedAt : state.startedAt,
      pausedTimeLeft: newState.pausedTimeLeft !== undefined ? newState.pausedTimeLeft : state.pausedTimeLeft,
    };

    if (isControlled) {
      onTimerStateChange(updated);
    } else {
      setInternalState(updated);
    }
  }, [state, isControlled, onTimerStateChange]);

  // Stop alarm
  const stopAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
    setIsAlarmPlaying(false);
  }, []);

  // Handle timer complete
  const handleTimerComplete = useCallback(() => {
    // Play sound (max 10 seconds)
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setIsAlarmPlaying(true);
      alarmTimeoutRef.current = setTimeout(stopAlarm, 10000);
    }

    // Send notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const plainText = stepInstruction
          ? stepInstruction.replace(/<[^>]*>/g, '').trim()
          : 'El tiempo ha terminado';

        new Notification('Timer completado', {
          body: plainText,
          icon: '/favicon.svg',
          tag: 'recipe-timer',
        });
      } catch (e) {
        console.log('Notification error:', e);
      }
    }

    onComplete?.();
  }, [stepInstruction, stopAlarm, onComplete]);

  // Request notification permission
  const requestNotification = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  }, []);

  // Toggle timer (start/pause)
  const toggle = useCallback(() => {
    if (isFinished) {
      // Reset and start
      hasCompletedRef.current = false;
      updateState({
        timeLeft: seconds,
        isRunning: true,
        isFinished: false,
        startedAt: Date.now(),
        pausedTimeLeft: seconds
      });
      setDisplayTimeLeft(seconds);
      return;
    }

    if (isRunning) {
      // Pause
      const currentTimeLeft = calculateTimeLeft();
      updateState({
        isRunning: false,
        pausedTimeLeft: currentTimeLeft,
        startedAt: null,
        timeLeft: currentTimeLeft
      });
    } else {
      // Start/Resume
      if (notificationPermission === 'default') {
        requestNotification();
      }
      const currentTimeLeft = pausedTimeLeft ?? seconds;
      updateState({
        isRunning: true,
        startedAt: Date.now(),
        pausedTimeLeft: currentTimeLeft,
        timeLeft: currentTimeLeft
      });
    }
  }, [isFinished, isRunning, calculateTimeLeft, updateState, notificationPermission, requestNotification, pausedTimeLeft, seconds]);

  // Reset timer
  const reset = useCallback(() => {
    hasCompletedRef.current = false;
    updateState({
      timeLeft: seconds,
      isRunning: false,
      isFinished: false,
      startedAt: null,
      pausedTimeLeft: null
    });
    setDisplayTimeLeft(seconds);
  }, [seconds, updateState]);

  // Add time
  const addTime = useCallback((minutesToAdd: number) => {
    stopAlarm();

    if (notificationPermission === 'default') {
      requestNotification();
    }

    const secondsToAdd = minutesToAdd * 60;
    const currentTimeLeft = isRunning ? calculateTimeLeft() : (pausedTimeLeft ?? displayTimeLeft);
    const newTimeLeft = currentTimeLeft + secondsToAdd;

    updateState({
      pausedTimeLeft: newTimeLeft,
      startedAt: Date.now(),
      timeLeft: newTimeLeft,
      isRunning: true,
      isFinished: false
    });
    setDisplayTimeLeft(newTimeLeft);
  }, [stopAlarm, notificationPermission, requestNotification, isRunning, calculateTimeLeft, pausedTimeLeft, displayTimeLeft, updateState]);

  // Initialize audio and check permissions
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    audioRef.current = new Audio(soundUrl);
    audioRef.current.volume = 0.7;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
    };
  }, [soundUrl]);

  // Update display when seconds prop changes
  useEffect(() => {
    if (prevSecondsRef.current !== seconds) {
      prevSecondsRef.current = seconds;
      if (!isRunning && pausedTimeLeft === null) {
        setDisplayTimeLeft(seconds);
      }
    }
  }, [seconds, isRunning, pausedTimeLeft]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning) {
        const currentTimeLeft = calculateTimeLeft();
        setDisplayTimeLeft(currentTimeLeft);

        if (currentTimeLeft <= 0 && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          updateState({
            timeLeft: 0,
            isRunning: false,
            isFinished: true,
            startedAt: null,
            pausedTimeLeft: null
          });
          handleTimerComplete();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, calculateTimeLeft, updateState, handleTimerComplete]);

  // Timer tick effect
  useEffect(() => {
    if (isRunning && !isFinished) {
      hasCompletedRef.current = false;

      intervalRef.current = setInterval(() => {
        const currentTimeLeft = calculateTimeLeft();
        setDisplayTimeLeft(currentTimeLeft);

        if (currentTimeLeft <= 0 && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          updateState({
            timeLeft: 0,
            isRunning: false,
            isFinished: true,
            startedAt: null,
            pausedTimeLeft: null
          });
          handleTimerComplete();
        }
      }, 250);
    } else {
      setDisplayTimeLeft(calculateTimeLeft());
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isFinished, calculateTimeLeft, updateState, handleTimerComplete]);

  const progress = ((seconds - displayTimeLeft) / seconds) * 100;

  return {
    // State
    timeLeft: displayTimeLeft,
    isRunning,
    isFinished,
    isAlarmPlaying,
    progress,
    // Actions
    toggle,
    reset,
    addTime,
    stopAlarm,
    // Utilities
    canReset: displayTimeLeft !== seconds || isFinished || isRunning,
  };
}
