import { useState } from 'react';
import type { RecipeDetailPageProps } from '../../types';
import { PremiumDialog } from './PremiumDialog';
import { RecipeView } from './RecipeView';
import { RecipeViewReadOnly } from './RecipeViewReadOnly';

export function RecipeDetailPage({ config, recipe, isAuthenticated, isPremium, mainProductSlug }: RecipeDetailPageProps) {
  const [servings, setServings] = useState(recipe.servings);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);

  const checkoutUrl = mainProductSlug ? `/checkout/${mainProductSlug}` : undefined;

  const handleServingsChange = (delta: number) => {
    if (!isPremium) {
      setShowPremiumDialog(true);
      return;
    }
    setServings((prev) => Math.max(1, Math.min(50, prev + delta)));
  };

  // Pastel colors from config
  const pastelPink = (config.pastelPink as string) || '#FFD6E8';
  const pastelPeach = (config.pastelPeach as string) || '#FFDAB9';
  const pastelMint = (config.pastelMint as string) || '#C7EAE4';
  const pastelLavender = (config.pastelLavender as string) || '#E6E6FA';
  const pastelGreenMint = (config.pastelGreenMint as string) || '#B8E6B8';
  const pastelTextDark = (config.pastelTextDark as string) || '#5A4A42';
  const pastelTextMedium = (config.pastelTextMedium as string) || '#8B7D77';

  const colors = {
    pink: pastelPink,
    peach: pastelPeach,
    mint: pastelMint,
    lavender: pastelLavender,
    greenMint: pastelGreenMint,
    textDark: pastelTextDark,
    textMedium: pastelTextMedium,
  };

  const difficultyLabels = {
    easy: 'Fácil',
    medium: 'Intermedio',
    hard: 'Avanzado',
  };

  const difficultyColors = {
    easy: pastelGreenMint,
    medium: pastelPeach,
    hard: pastelPink,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F5' }}>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pt-24 pb-32"
        style={{
          background: `linear-gradient(135deg, ${pastelPink}60 0%, ${pastelPeach}40 50%, ${pastelLavender}60 100%)`
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-50 blur-3xl"
          style={{ backgroundColor: pastelPink }}
        />
        <div
          className="absolute top-1/2 -left-20 w-48 h-48 rounded-full opacity-40 blur-3xl"
          style={{ backgroundColor: pastelMint }}
        />

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <a
                  href="/recipes"
                  className="hover:underline"
                  style={{ color: pastelTextMedium }}
                >
                  Recetas
                </a>
              </li>
              {recipe.categoryName && (
                <>
                  <li style={{ color: pastelTextMedium }}>/</li>
                  <li>
                    <a
                      href="/recipes"
                      className="hover:underline"
                      style={{ color: pastelTextMedium }}
                    >
                      {recipe.categoryName}
                    </a>
                  </li>
                </>
              )}
              <li style={{ color: pastelTextMedium }}>/</li>
              <li style={{ color: pastelTextDark }} className="font-medium truncate max-w-[200px]">
                {recipe.name}
              </li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[400px_1fr] items-start">
            {/* Image */}
            <div
              className="aspect-square rounded-3xl overflow-hidden"
              style={{
                boxShadow: `0 25px 50px -12px ${pastelPink}50`
              }}
            >
              {recipe.imageUrl ? (
                <img
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: pastelLavender }}
                >
                  <svg className="w-24 h-24 opacity-40" fill="none" stroke={pastelTextMedium} viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              {/* Category & Difficulty badges */}
              <div className="flex flex-wrap items-center gap-3">
                {recipe.categoryName && (
                  <span
                    className="px-4 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${pastelLavender}80`,
                      color: pastelTextDark
                    }}
                  >
                    {recipe.categoryName}
                  </span>
                )}
                <span
                  className="px-4 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: difficultyColors[recipe.difficulty],
                    color: pastelTextDark
                  }}
                >
                  {difficultyLabels[recipe.difficulty]}
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-4xl md:text-5xl font-bold leading-tight"
                style={{ color: pastelTextDark }}
              >
                {recipe.name}
              </h1>

              {/* Description */}
              {recipe.description && (
                <div
                  className="text-lg leading-relaxed prose prose-lg max-w-none"
                  style={{ color: pastelTextMedium }}
                  dangerouslySetInnerHTML={{ __html: recipe.description }}
                />
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                {/* Calories */}
                {recipe.calories && (
                  <div
                    className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: pastelPink }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={2}>
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: pastelTextMedium }}>Calorías</p>
                      <p className="font-bold" style={{ color: pastelTextDark }}>{recipe.calories} kcal</p>
                    </div>
                  </div>
                )}

                {/* Time */}
                <div
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: pastelMint }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: pastelTextMedium }}>Tiempo</p>
                    <p className="font-bold" style={{ color: pastelTextDark }}>{recipe.estimatedTime} min</p>
                  </div>
                </div>

                {/* Servings Selector */}
                <div
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: pastelPeach }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={2}>
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: pastelTextMedium }}>Porciones</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleServingsChange(-1)}
                        disabled={servings <= 1}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-40 hover:scale-110"
                        style={{ backgroundColor: pastelMint, color: pastelTextDark }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-bold text-lg" style={{ color: pastelTextDark }}>
                        {servings}
                      </span>
                      <button
                        onClick={() => handleServingsChange(1)}
                        disabled={servings >= 50}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-40 hover:scale-110"
                        style={{ backgroundColor: pastelGreenMint, color: pastelTextDark }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto block"
            preserveAspectRatio="none"
            style={{ minHeight: '60px' }}
          >
            <path
              d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
              style={{ fill: '#FFF8F5' }}
            />
          </svg>
        </div>
      </section>

      {/* Recipe Content */}
      <section
        className="py-12 px-4"
        style={{ backgroundColor: '#FFF8F5' }}
      >
        <div className="container mx-auto max-w-5xl">
          {/* Premium recipe locked for non-premium users */}
          {recipe.isPremium && !isPremium ? (
            <div
              className="relative overflow-hidden rounded-[2rem] p-8 md:p-12"
              style={{
                background: `linear-gradient(135deg, ${pastelMint} 0%, ${pastelGreenMint} 100%)`,
                boxShadow: `0 25px 50px -12px ${pastelMint}40`
              }}
            >
              {/* Decorative elements */}
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-2xl"
                style={{ backgroundColor: pastelPink }}
              />
              <div
                className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-30 blur-2xl"
                style={{ backgroundColor: 'white' }}
              />

              <div className="relative z-10 text-center max-w-xl mx-auto">
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                >
                  <svg className="w-10 h-10" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>

                <h2
                  className="text-2xl md:text-3xl font-bold mb-3"
                  style={{ color: pastelTextDark }}
                >
                  Receta Premium
                </h2>
                <p
                  className="mb-8 text-lg"
                  style={{ color: pastelTextDark, opacity: 0.8 }}
                >
                  {isAuthenticated
                    ? 'Los ingredientes y la preparación de esta receta están disponibles exclusivamente para miembros premium.'
                    : 'Inicia sesión o adquiere una suscripción premium para acceder a los ingredientes y la preparación completa de esta receta.'}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="/recipes"
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-full font-medium transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      color: pastelTextDark,
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Volver a recetas
                  </a>
                  <a
                    href={isAuthenticated ? (checkoutUrl || '/tienda') : '/login'}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: 'white',
                      color: pastelTextDark,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  >
                    {isAuthenticated ? 'Obtener Premium' : 'Iniciar sesión'}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ) : isPremium ? (
            // Full interactive view for premium users (includes timer code)
            <RecipeView
              recipe={recipe}
              colors={colors}
              servings={servings}
              isPremium={isPremium}
              onPremiumFeature={() => setShowPremiumDialog(true)}
            />
          ) : (
            // Read-only view for non-premium users viewing non-premium recipes
            <RecipeViewReadOnly
              recipe={recipe}
              colors={colors}
              servings={servings}
              onPremiumFeature={() => setShowPremiumDialog(true)}
            />
          )}
        </div>
      </section>

      {/* Premium Dialog */}
      <PremiumDialog
        open={showPremiumDialog}
        onOpenChange={setShowPremiumDialog}
        checkoutUrl={checkoutUrl}
        colors={colors}
      />
    </div>
  );
}
