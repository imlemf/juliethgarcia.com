import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, Users, Flame, Minus, Plus, Play, ChevronLeft, ChevronDown, Check } from 'lucide-react';
import { RecipeTimer } from './RecipeTimer';
import {
  useRecipeProgress,
  formatTime,
  formatQuantity,
  getUnitLabel,
  processInstructionHTML,
  DIFFICULTY_LABELS,
  type Recipe,
  type Preparation,
} from '@/lib/recipes';

interface RecipeViewProps {
  recipe: Recipe;
}

export function RecipeView({ recipe }: RecipeViewProps) {
  const progress = useRecipeProgress({ recipe });

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    prep: Preparation | null;
    action: 'next' | 'complete' | 'reset';
  }>({ open: false, prep: null, action: 'next' });

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
      {/* Header */}
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Image */}
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 max-w-[300px]">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          {recipe.categoryName && (
            <span className="inline-block text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              {recipe.categoryName}
            </span>
          )}

          <h1 className="text-3xl font-bold">{recipe.name}</h1>

          {recipe.description && (
            <div
              className="text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: recipe.description }}
            />
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(recipe.estimatedTime)}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100">
              {DIFFICULTY_LABELS[recipe.difficulty]}
            </span>
            {progress.totalCalories && (
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4" />
                {progress.totalCalories} kcal total
              </span>
            )}
          </div>

          {/* Servings selector */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-100">
            <Users className="h-5 w-5 text-gray-500" />
            <span className="font-medium">Comensales:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => progress.adjustServings(-1)}
                disabled={progress.servings <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-bold text-lg">{progress.servings}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => progress.adjustServings(1)}
                disabled={progress.servings >= 50}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {progress.servings !== recipe.servings && (
              <span className="text-sm text-gray-500">(original: {recipe.servings})</span>
            )}
          </div>
        </div>
      </div>

      {/* All ingredients */}
      {progress.allIngredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ingredientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {progress.allIngredients.map((ing, index) => (
                <li key={`${ing.id}-${index}`} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-900" />
                  <span className="font-medium">
                    {formatQuantity(ing.quantity, progress.servings, recipe.servings)}
                  </span>
                  <span className="text-gray-500">{getUnitLabel(ing.unit)}</span>
                  <span>{ing.name}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Preparations */}
      {recipe.preparations.map((prep) => {
        const info = progress.getPrepInfo(prep);

        return (
          <Card key={prep.id} className={info.isCompleted ? 'border-green-500/50 bg-green-500/5' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <button className="flex-1 text-left" onClick={() => progress.toggleCollapse(prep.id)}>
                <div className="flex items-center gap-2">
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${info.isCollapsed ? '-rotate-90' : ''}`} />
                  <CardTitle>{prep.title}</CardTitle>
                  {info.isCompleted && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      ✓ Completada
                    </span>
                  )}
                  {info.isInProgress && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                      En preparación
                    </span>
                  )}
                </div>
                {info.isInProgress && (
                  <div className="mt-2 ml-6 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-32 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gray-900 h-1.5 rounded-full transition-all"
                          style={{ width: `${((info.currentStepIndex + 1) / info.totalSteps) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        Paso {info.currentStepIndex + 1}/{info.totalSteps}
                      </span>
                    </div>
                    {info.isCollapsed && info.currentStep?.timerSeconds && (
                      <div className="ml-auto">
                        <RecipeTimer
                          seconds={info.currentStep.timerSeconds}
                          stepInstruction={info.currentStep.instruction}
                          timerState={progress.getTimerState(info.currentStep.id, info.currentStep.timerSeconds)}
                          onTimerStateChange={(state) => progress.updateTimerState(info.currentStep!.id, state)}
                          compact
                        />
                      </div>
                    )}
                  </div>
                )}
              </button>
              {prep.steps.length > 0 && (
                <div className="flex items-center gap-2">
                  {!info.isCollapsed && (info.isInProgress || info.isCompleted) && (
                    <Button size="sm" variant="ghost" onClick={() => handleResetPrep(prep)}>
                      Reiniciar
                    </Button>
                  )}
                  {!info.isCompleted && !info.isInProgress && (
                    <Button size="sm" onClick={() => progress.startPrep(prep.id)}>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>

            {/* Current step */}
            {!info.isCollapsed && info.isInProgress && info.currentStep && (
              <CardContent className="pt-0">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                        {info.currentStepIndex + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        Paso {info.currentStepIndex + 1} de {info.totalSteps}
                      </span>
                    </div>
                  </div>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: processInstructionHTML(info.currentStep.instruction, prep.ingredients, progress.servings, recipe.servings)
                    }}
                  />
                  {info.currentStep.timerSeconds && (
                    <div className="mt-4">
                      <RecipeTimer
                        seconds={info.currentStep.timerSeconds}
                        stepInstruction={info.currentStep.instruction}
                        timerState={progress.getTimerState(info.currentStep.id, info.currentStep.timerSeconds)}
                        onTimerStateChange={(state) => progress.updateTimerState(info.currentStep!.id, state)}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => progress.goToPrevStep(prep.id)}
                      disabled={info.currentStepIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    {info.currentStepIndex === info.totalSteps - 1 ? (
                      <Button size="sm" onClick={() => handleCompletePrep(prep)}>
                        <Check className="h-4 w-4 mr-1" />
                        Finalizar
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleNextStep(prep)}>
                        <Check className="h-4 w-4 mr-1" />
                        Hecho
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            )}

            {/* Collapsible content */}
            {!info.isCollapsed && (
              <CardContent className={`space-y-6 ${info.isInProgress ? 'pt-0' : ''}`}>
                {prep.ingredients.length > 0 && (
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <h4 className="font-medium mb-2">Ingredientes:</h4>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {prep.ingredients.map((ing) => (
                        <li key={ing.id} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gray-900" />
                          <span className="font-medium">
                            {formatQuantity(ing.quantity, progress.servings, recipe.servings)}
                          </span>
                          <span className="text-gray-500">{getUnitLabel(ing.unit)}</span>
                          <span>{ing.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <ol className="space-y-4">
                  {prep.steps.map((step, stepIndex) => {
                    const isCurrentStep = info.isInProgress && stepIndex === info.currentStepIndex;
                    const isCompletedStep = info.isInProgress && stepIndex < info.currentStepIndex;

                    return (
                      <li
                        key={step.id}
                        className={`flex gap-4 ${isCurrentStep ? 'opacity-50' : ''} ${isCompletedStep ? 'opacity-40' : ''}`}
                      >
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                          isCompletedStep ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'
                        }`}>
                          {isCompletedStep ? '✓' : stepIndex + 1}
                        </span>
                        <div className="flex-1 space-y-2">
                          <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: processInstructionHTML(step.instruction, prep.ingredients, progress.servings, recipe.servings)
                            }}
                          />
                          {step.timerSeconds && !isCurrentStep && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
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
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, prep: null, action: 'next' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'reset' ? 'Reiniciar preparación' : 'Timer incompleto'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'next'
                ? 'El timer de este paso no ha terminado. ¿Deseas pasar al siguiente paso?'
                : confirmDialog.action === 'complete'
                ? 'El timer de este paso no ha terminado. ¿Deseas finalizar la preparación?'
                : '¿Deseas reiniciar esta preparación? Se perderá todo el progreso y los temporizadores.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {confirmDialog.action === 'next' ? 'Siguiente paso' : confirmDialog.action === 'complete' ? 'Finalizar' : 'Reiniciar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
