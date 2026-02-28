import { useRecipeTimer, formatTimerSeconds, type TimerState } from '@/lib/recipes';

interface RecipeColors {
  pink: string;
  peach: string;
  mint: string;
  lavender: string;
  greenMint: string;
  textDark: string;
  textMedium: string;
}

interface RecipeTimerProps {
  seconds: number;
  stepInstruction?: string;
  timerState?: TimerState;
  onTimerStateChange?: (state: TimerState) => void;
  compact?: boolean;
  colors?: RecipeColors;
}

const defaultColors: RecipeColors = {
  pink: '#FFD6E8',
  peach: '#FFDAB9',
  mint: '#C7EAE4',
  lavender: '#E6E6FA',
  greenMint: '#B8E6B8',
  textDark: '#5A4A42',
  textMedium: '#8B7D77',
};

export function RecipeTimer({
  seconds,
  stepInstruction,
  timerState,
  onTimerStateChange,
  compact,
  colors = defaultColors,
}: RecipeTimerProps) {
  const c = { ...defaultColors, ...colors };
  const timer = useRecipeTimer({
    seconds,
    stepInstruction,
    timerState,
    onTimerStateChange,
  });

  const getTimerColor = () => {
    if (timer.isFinished) return c.greenMint;
    if (timer.timeLeft <= 10) return c.pink;
    return c.peach;
  };

  const getTextColor = () => {
    if (timer.isFinished) return '#22c55e';
    if (timer.timeLeft <= 10) return '#ef4444';
    return c.textDark;
  };

  // Compact mode
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: getTimerColor() }}
        >
          <svg className="w-3 h-3" fill="none" stroke={c.textDark} viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        </div>
        <span
          className={`font-mono font-bold text-sm ${timer.timeLeft <= 10 && !timer.isFinished ? 'animate-pulse' : ''}`}
          style={{ color: getTextColor() }}
        >
          {formatTimerSeconds(timer.timeLeft)}
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-3"
      style={{
        backgroundColor: `${getTimerColor()}25`,
        border: `1px solid ${getTimerColor()}50`,
      }}
    >
      {/* Main row: Progress + Time + Controls */}
      <div className="flex items-center gap-3">
        {/* Progress bar */}
        <div
          className="flex-1 h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: `${c.lavender}50` }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, Math.max(0, timer.progress))}%`,
              backgroundColor: timer.isFinished ? '#22c55e' : c.peach,
            }}
          />
        </div>

        {/* Time display */}
        <div
          className={`font-mono font-bold text-lg min-w-[4.5rem] text-center ${
            timer.timeLeft <= 10 && !timer.isFinished ? 'animate-pulse' : ''
          }`}
          style={{ color: getTextColor() }}
        >
          {formatTimerSeconds(timer.timeLeft)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={timer.toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: timer.isRunning ? c.lavender : c.greenMint,
              color: c.textDark,
            }}
          >
            {timer.isRunning ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={timer.reset}
            disabled={!timer.canReset}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{
              backgroundColor: `${c.lavender}70`,
              color: c.textDark,
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>

          {/* Add time buttons */}
          <button
            type="button"
            onClick={() => timer.addTime(1)}
            className="w-8 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 text-xs font-medium"
            style={{
              backgroundColor: `${c.mint}50`,
              color: c.textDark,
            }}
          >
            +1
          </button>
          <button
            type="button"
            onClick={() => timer.addTime(5)}
            className="w-8 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 text-xs font-medium"
            style={{
              backgroundColor: `${c.mint}50`,
              color: c.textDark,
            }}
          >
            +5
          </button>
        </div>
      </div>

      {/* Finished state */}
      {timer.isFinished && (
        <div className="mt-2 flex justify-center">
          {timer.isAlarmPlaying ? (
            <button
              type="button"
              onClick={timer.stopAlarm}
              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 animate-pulse"
              style={{ backgroundColor: c.pink, color: c.textDark }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
              Detener
            </button>
          ) : (
            <span
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: '#16a34a' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              ¡Listo!
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export type { TimerState };
