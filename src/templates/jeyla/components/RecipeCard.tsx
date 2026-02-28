import type { RecipeCardProps } from '../../types';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

const difficultyLabels = {
  easy: 'Fácil',
  medium: 'Intermedio',
  hard: 'Avanzado',
};

const difficultyColors = {
  easy: { bg: '#B8E6B8', text: '#5A4A42' },
  medium: { bg: '#FFDAB9', text: '#5A4A42' },
  hard: { bg: '#FFD6E8', text: '#5A4A42' },
};

// Lucide icons as inline SVGs
const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const FlameIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BadgeCheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export function RecipeCard({ recipe }: RecipeCardProps) {
  const colors = difficultyColors[recipe.difficulty];

  return (
    <a
      href={`/recipes/${recipe.slug}`}
      className="group block rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.03]"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        boxShadow: '0 8px 30px rgba(255, 214, 232, 0.3)',
      }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: '#E6E6FA' }}
          >
            <svg className="w-12 h-12 opacity-40" fill="none" stroke="#8B7D77" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
            </svg>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {recipe.isPremium && (
            <div
              className="px-2.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center gap-1"
              style={{
                backgroundColor: 'rgba(255, 214, 232, 0.95)',
                color: '#5A4A42'
              }}
            >
              <BadgeCheckIcon />
              Premium
            </div>
          )}
          <div
            className="px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#5A4A42'
            }}
          >
            <ClockIcon />
            {recipe.estimatedTime} min
          </div>
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to top, rgba(255, 214, 232, 0.4) 0%, transparent 50%)'
          }}
        />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Difficulty badge */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {difficultyLabels[recipe.difficulty]}
          </span>
          {recipe.categoryName && (
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: '#E6E6FA', color: '#8B7D77' }}
            >
              {recipe.categoryName}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="font-bold text-lg mb-2 line-clamp-1"
          style={{ color: '#5A4A42' }}
        >
          {recipe.name}
        </h3>

        {/* Description */}
        {recipe.description && (
          <p
            className="text-sm mb-3 line-clamp-2"
            style={{ color: '#8B7D77' }}
          >
            {stripHtml(recipe.description)}
          </p>
        )}

        {/* Stats */}
        <div
          className="flex items-center gap-4 text-xs pt-3 border-t"
          style={{ borderColor: '#C7EAE440', color: '#8B7D77' }}
        >
          {recipe.calories && (
            <span className="flex items-center gap-1.5">
              <FlameIcon />
              {recipe.calories} kcal
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <UserIcon />
            {recipe.servings} porción{recipe.servings > 1 ? 'es' : ''}
          </span>
        </div>
      </div>
    </a>
  );
}
