import { useState, useCallback } from 'react';
import { RecipeTimer } from './RecipeTimer';
import { ConfirmDialog } from './ConfirmDialog';
import {
  useRecipeProgress,
  formatTime,
  formatQuantity,
  getUnitLabel,
  processInstructionHTML,
  type Recipe,
  type Preparation,
} from '@/lib/recipes';

interface RecipeColors {
  pink: string;
  peach: string;
  mint: string;
  lavender: string;
  greenMint: string;
  textDark: string;
  textMedium: string;
}

interface RecipeViewProps {
  recipe: Recipe;
  colors?: RecipeColors;
  servings?: number;
  isPremium?: boolean;
  onPremiumFeature?: () => void;
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

export function RecipeView({ recipe, colors = defaultColors, servings: externalServings, isPremium, onPremiumFeature }: RecipeViewProps) {
  const c = { ...defaultColors, ...colors };
  const progress = useRecipeProgress({ recipe });

  // Use external servings if provided, otherwise use hook's internal servings
  const servings = externalServings ?? progress.servings;

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    prep: Preparation | null;
    action: 'next' | 'complete' | 'reset';
  }>({ open: false, prep: null, action: 'next' });

  const handleStartPrep = useCallback((prepId: string) => {
    if (!isPremium) {
      onPremiumFeature?.();
      return;
    }
    progress.startPrep(prepId);
  }, [isPremium, onPremiumFeature, progress]);

  const handleNextStep = useCallback((prep: Preparation) => {
    const success = progress.goToNextStep(prep, false);
    if (!success) {
      setConfirmDialog({ open: true, prep, action: 'next' });
    }
  }, [progress]);

  const handleCompletePrep = useCallback((prep: Preparation) => {
    const success = progress.completePrep(prep, false);
    if (!success) {
      setConfirmDialog({ open: true, prep, action: 'complete' });
    }
  }, [progress]);

  const handleResetPrep = useCallback((prep: Preparation) => {
    setConfirmDialog({ open: true, prep, action: 'reset' });
  }, []);

  const handleConfirmAction = useCallback(() => {
    if (!confirmDialog.prep) return;

    if (confirmDialog.action === 'next') {
      progress.goToNextStep(confirmDialog.prep, true);
    } else if (confirmDialog.action === 'complete') {
      progress.completePrep(confirmDialog.prep, true);
    } else if (confirmDialog.action === 'reset') {
      progress.resetPrep(confirmDialog.prep);
    }
    setConfirmDialog({ open: false, prep: null, action: 'next' });
  }, [confirmDialog, progress]);

  return (
    <div className="space-y-8">
      {/* All Ingredients */}
      {progress.allIngredients.length > 0 && (
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: `0 4px 20px ${c.mint}20`
          }}
        >
          <h2
            className="text-2xl font-bold mb-6 flex items-center gap-3"
            style={{ color: c.textDark }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: c.mint }}
            >
              <svg className="w-5 h-5" fill="none" stroke={c.textDark} viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            Ingredientes
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {progress.allIngredients.map((ing, index) => (
              <li
                key={`${ing.id}-${index}`}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: `${c.lavender}30` }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.greenMint }}
                />
                <span className="font-semibold" style={{ color: c.textDark }}>
                  {formatQuantity(ing.quantity, servings, recipe.servings)}
                </span>
                <span style={{ color: c.textMedium }}>{getUnitLabel(ing.unit)}</span>
                <span style={{ color: c.textDark }}>{ing.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preparations */}
      {recipe.preparations.map((prep) => {
        const info = progress.getPrepInfo(prep);

        return (
          <div
            key={prep.id}
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: info.isCompleted ? `${c.greenMint}20` : 'rgba(255, 255, 255, 0.8)',
              boxShadow: `0 4px 20px ${info.isCompleted ? c.greenMint : c.pink}20`,
              border: info.isCompleted ? `2px solid ${c.greenMint}60` : 'none'
            }}
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
              <div
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => progress.toggleCollapse(prep.id)}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform"
                  style={{
                    backgroundColor: info.isCompleted ? c.greenMint : c.peach,
                    transform: info.isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'
                  }}
                >
                  {info.isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke={c.textDark} viewBox="0 0 24 24" strokeWidth={2}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke={c.textDark} viewBox="0 0 24 24" strokeWidth={2}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: c.textDark }}>
                    {prep.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {info.isCompleted && (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: c.greenMint, color: c.textDark }}
                      >
                        ✓ Completada
                      </span>
                    )}
                    {info.isInProgress && (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: c.peach, color: c.textDark }}
                      >
                        Paso {info.currentStepIndex + 1}/{info.totalSteps}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!info.isCollapsed && (info.isInProgress || info.isCompleted) && (
                  <button
                    type="button"
                    onClick={() => handleResetPrep(prep)}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                    style={{ backgroundColor: `${c.lavender}60`, color: c.textDark }}
                  >
                    Reiniciar
                  </button>
                )}
                {!info.isCompleted && !info.isInProgress && prep.steps.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleStartPrep(prep.id)}
                    className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
                    style={{ backgroundColor: c.greenMint, color: c.textDark }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Iniciar
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar for in-progress */}
            {info.isInProgress && (
              <div className="px-6">
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: `${c.peach}40` }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: c.greenMint,
                      width: `${((info.currentStepIndex + 1) / info.totalSteps) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Current step (when in progress) */}
            {!info.isCollapsed && info.isInProgress && info.currentStep && (
              <div className="p-6 pt-4">
                <div
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: `${c.peach}20`,
                    border: `2px solid ${c.peach}40`
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: c.peach, color: c.textDark }}
                    >
                      {info.currentStepIndex + 1}
                    </span>
                    <span className="text-sm font-medium" style={{ color: c.textMedium }}>
                      Paso {info.currentStepIndex + 1} de {info.totalSteps}
                    </span>
                  </div>

                  <div
                    className="prose prose-lg max-w-none mb-4"
                    style={{ color: c.textDark }}
                    dangerouslySetInnerHTML={{
                      __html: processInstructionHTML(info.currentStep.instruction, prep.ingredients, servings, recipe.servings)
                    }}
                  />

                  {info.currentStep.timerSeconds && (
                    <div className="mb-4">
                      <RecipeTimer
                        seconds={info.currentStep.timerSeconds}
                        stepInstruction={info.currentStep.instruction}
                        timerState={progress.getTimerState(info.currentStep.id, info.currentStep.timerSeconds)}
                        onTimerStateChange={(state) => progress.updateTimerState(info.currentStep!.id, state)}
                        colors={c}
                      />
                    </div>
                  )}

                  <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: `1px solid ${c.peach}40` }}
                  >
                    <button
                      onClick={() => progress.goToPrevStep(prep.id)}
                      disabled={info.currentStepIndex === 0}
                      className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-40"
                      style={{ backgroundColor: `${c.lavender}60`, color: c.textDark }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      Anterior
                    </button>
                    {info.currentStepIndex === info.totalSteps - 1 ? (
                      <button
                        onClick={() => handleCompletePrep(prep)}
                        className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
                        style={{ backgroundColor: c.greenMint, color: c.textDark }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Finalizar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNextStep(prep)}
                        className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
                        style={{ backgroundColor: c.greenMint, color: c.textDark }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Hecho
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Collapsible content */}
            {!info.isCollapsed && (
              <div className={`p-6 space-y-6 ${info.isInProgress ? 'pt-0' : ''}`}>
                {/* Prep ingredients */}
                {prep.ingredients.length > 0 && (
                  <div
                    className="rounded-xl p-4"
                    style={{ backgroundColor: `${c.lavender}30` }}
                  >
                    <h4 className="font-semibold mb-3" style={{ color: c.textDark }}>
                      Ingredientes para esta preparación:
                    </h4>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {prep.ingredients.map((ing) => (
                        <li key={ing.id} className="flex items-center gap-2 text-sm">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: c.greenMint }}
                          />
                          <span className="font-medium" style={{ color: c.textDark }}>
                            {formatQuantity(ing.quantity, servings, recipe.servings)}
                          </span>
                          <span style={{ color: c.textMedium }}>{getUnitLabel(ing.unit)}</span>
                          <span style={{ color: c.textDark }}>{ing.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* All steps */}
                <ol className="space-y-4">
                  {prep.steps.map((step, stepIndex) => {
                    const isCurrentStep = info.isInProgress && stepIndex === info.currentStepIndex;
                    const isCompletedStep = info.isInProgress && stepIndex < info.currentStepIndex;

                    return (
                      <li
                        key={step.id}
                        className={`flex gap-4 transition-opacity ${isCurrentStep ? 'opacity-40' : ''} ${isCompletedStep ? 'opacity-50' : ''}`}
                      >
                        <span
                          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                          style={{
                            backgroundColor: isCompletedStep ? c.greenMint : c.peach,
                            color: c.textDark
                          }}
                        >
                          {isCompletedStep ? '✓' : stepIndex + 1}
                        </span>
                        <div className="flex-1 space-y-2">
                          <div
                            className="prose prose-sm max-w-none"
                            style={{ color: c.textDark }}
                            dangerouslySetInnerHTML={{
                              __html: processInstructionHTML(step.instruction, prep.ingredients, servings, recipe.servings)
                            }}
                          />
                          {step.timerSeconds && !isCurrentStep && (
                            <div className="flex items-center gap-2 text-sm" style={{ color: c.textMedium }}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12,6 12,12 16,14" />
                              </svg>
                              <span>
                                {Math.floor(step.timerSeconds / 60) > 0 && `${Math.floor(step.timerSeconds / 60)} min `}
                                {step.timerSeconds % 60 > 0 && `${step.timerSeconds % 60} seg`}
                              </span>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>
        );
      })}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, prep: null, action: 'next' })}
        title={confirmDialog.action === 'reset' ? 'Reiniciar preparación' : 'Timer incompleto'}
        description={
          confirmDialog.action === 'next'
            ? 'El timer de este paso no ha terminado. ¿Deseas pasar al siguiente paso?'
            : confirmDialog.action === 'complete'
            ? 'El timer de este paso no ha terminado. ¿Deseas finalizar la preparación?'
            : '¿Deseas reiniciar esta preparación? Se perderá todo el progreso y los temporizadores.'
        }
        confirmLabel={
          confirmDialog.action === 'next' ? 'Siguiente paso' : confirmDialog.action === 'complete' ? 'Finalizar' : 'Reiniciar'
        }
        onConfirm={handleConfirmAction}
        variant={confirmDialog.action === 'reset' ? 'danger' : 'warning'}
        colors={c}
      />
    </div>
  );
}
