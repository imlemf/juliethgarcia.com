import { Clock, Users, Flame } from 'lucide-react';

interface RecipeCardProps {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  estimatedTime: number;
  calories: number | null;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  categoryName: string | null;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

const difficultyLabels = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function RecipeCard({
  name,
  slug,
  description,
  imageUrl,
  estimatedTime,
  calories,
  servings,
  difficulty,
  categoryName,
}: RecipeCardProps) {
  return (
    <a
      href={`/recipes/${slug}`}
      className="group block rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-video relative overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🍽️
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${difficultyColors[difficulty]}`}
          >
            {difficultyLabels[difficulty]}
          </span>
        </div>
        {categoryName && (
          <div className="absolute top-2 left-2">
            <span className="text-xs font-medium px-2 py-1 rounded bg-primary/90 text-primary-foreground">
              {categoryName}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
          {name}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTime(estimatedTime)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {servings}
          </span>
          {calories && (
            <span className="flex items-center gap-1">
              <Flame className="h-4 w-4" />
              {calories} kcal
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
