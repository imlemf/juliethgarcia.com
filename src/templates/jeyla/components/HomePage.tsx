import type { HomePageProps } from '../../types';
import { RecipeCard } from './RecipeCard';
import { BlogCard } from './BlogCard';
import { FeaturedProduct } from './FeaturedProduct';
import { NewsletterForm } from '@/components/newsletter/newsletter-form';

// Wave SVG Component - creates curved wave transition at bottom of hero
function WaveShape({ nextSectionColor }: { nextSectionColor: string }) {
  return (
    <div className="absolute -bottom-1 left-0 right-0 overflow-hidden">
      {/* Decorative back wave - semi-transparent */}
      <svg
        viewBox="0 0 1440 150"
        className="w-full h-24 md:h-32"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <path
          fill="rgba(230, 230, 250, 0.4)"
          d="M0,60 Q360,120 720,60 T1440,60 L1440,150 L0,150 Z"
        />
      </svg>
      {/* Main wave - same color as next section, creates the curved cut */}
      <svg
        viewBox="0 0 1440 150"
        className="w-full h-20 md:h-28 -mt-16 md:-mt-20"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <path
          fill={nextSectionColor}
          d="M0,80 Q360,0 720,80 T1440,80 L1440,150 L0,150 Z"
        />
      </svg>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  colors
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  colors: { mint: string; lavender: string; textDark: string; textMedium: string };
}) {
  return (
    <div
      className="rounded-3xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        boxShadow: `0 8px 32px ${colors.lavender}40`
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: colors.mint }}
      >
        {icon}
      </div>
      <h3
        className="text-xl font-bold mb-2"
        style={{ color: colors.textDark }}
      >
        {title}
      </h3>
      <p style={{ color: colors.textMedium }}>{description}</p>
    </div>
  );
}

// Testimonial Card Component
function TestimonialCard({
  name,
  text,
  colors
}: {
  name: string;
  text: string;
  colors: { mint: string; textDark: string; textMedium: string; pink: string };
}) {
  return (
    <div
      className="rounded-3xl p-6 backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        boxShadow: `0 4px 24px ${colors.pink}30`
      }}
    >
      <p
        className="mb-4 italic"
        style={{ color: colors.textMedium }}
      >
        "{text}"
      </p>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: colors.mint, color: colors.textDark }}
        >
          {name.charAt(0)}
        </div>
        <span
          className="font-medium"
          style={{ color: colors.textDark }}
        >
          {name}
        </span>
      </div>
    </div>
  );
}

export function HomePage({
  config,
  featuredProduct,
  recentRecipes = [],
  recentBlogs = [],
}: HomePageProps) {
  // Config values
  const heroTitleDefault = 'Transforma tu cuerpo con recetas <em>bajas en calorías</em>';
  const heroTitle = (config.heroTitle as string) || heroTitleDefault;
  const heroSubtitle = (config.heroSubtitle as string) || 'Descubre el placer de comer rico con mi libro de recetas diseñado para bajar de peso';
  const showRecipes = config.showRecipesOnHome !== false;
  const showBlog = config.showBlogOnHome !== false;
  const showNewsletter = config.showNewsletter !== false;

  // Pastel colors from config with defaults
  const pastelPink = (config.pastelPink as string) || '#FFD6E8';
  const pastelPeach = (config.pastelPeach as string) || '#FFDAB9';
  const pastelMint = (config.pastelMint as string) || '#C7EAE4';
  const pastelLavender = (config.pastelLavender as string) || '#E6E6FA';
  const pastelCream = (config.pastelCream as string) || '#FFF8E7';
  const pastelGreenMint = (config.pastelGreenMint as string) || '#B8E6B8';
  const pastelTextDark = (config.pastelTextDark as string) || '#5A4A42';
  const pastelTextMedium = (config.pastelTextMedium as string) || '#8B7D77';

  // Colors for cards (wave no longer needs colors prop)
  const cardColors = { mint: pastelMint, lavender: pastelLavender, textDark: pastelTextDark, textMedium: pastelTextMedium };
  const testimonialColors = { mint: pastelMint, pink: pastelPink, textDark: pastelTextDark, textMedium: pastelTextMedium };

  // Features data
  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      title: '15 Recetas low-calorie',
      description: 'Accede a recetas deliciosas bajas en calorías, con nuevas recetas agregándose constantemente a la plataforma.'
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      ),
      title: 'Herramientas interactivas',
      description: 'Cocina guiada paso a paso y plan de recetas diario para que nunca te falte inspiración.'
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      title: 'Resultados garantizados*',
      description: 'Basado en mi experiencia personal: estas son las recetas que me ayudaron a transformar mi cuerpo.'
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
      title: 'Acceso a la plataforma**',
      description: 'Plataforma exclusiva con recetas premium, herramientas interactivas para cocinar y artículos de nutrición.'
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      name: 'María G.',
      text: 'Bajé 8 kilos en 2 meses siguiendo estas recetas. Son deliciosas y muy fáciles de preparar.'
    },
    {
      name: 'Carlos P.',
      text: 'Por fin encontré recetas que toda mi familia disfruta. Los niños ni notan que son saludables.'
    },
    {
      name: 'Ana L.',
      text: 'El plan nutricional me salvó. Ya no tengo que pensar qué cocinar cada día.'
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Wave */}
      <section
        className="relative min-h-[90vh] pb-24 md:pb-32"
        style={{
          background: `linear-gradient(135deg, ${pastelPink} 0%, ${pastelPeach} 50%, ${pastelLavender} 100%)`
        }}
      >
        <div className="container mx-auto px-4 pt-24 md:pt-28 pb-16 flex flex-col justify-center items-center text-center">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl leading-tight"
            style={{ color: pastelTextDark }}
            dangerouslySetInnerHTML={{ __html: heroTitle }}
          />
          <p
            className="text-lg md:text-xl mb-10 max-w-2xl"
            style={{ color: pastelTextMedium }}
          >
            {heroSubtitle}
          </p>

          {featuredProduct && (
            <div className="w-full mb-10">
              <FeaturedProduct
                product={featuredProduct}
                colors={{
                  pink: pastelPink,
                  mint: pastelMint,
                  greenMint: pastelGreenMint,
                  textDark: pastelTextDark,
                  textMedium: pastelTextMedium,
                }}
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={featuredProduct ? `/checkout/${featuredProduct.slug}` : '/store'}
              className="px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: pastelGreenMint,
                color: pastelTextDark,
                boxShadow: `0 8px 24px ${pastelGreenMint}60`
              }}
            >
              Comprar ahora
            </a>
            <a
              href="/recipes"
              className="px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 border-2"
              style={{
                borderColor: pastelTextDark,
                color: pastelTextDark,
                backgroundColor: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              Ver recetas gratis
            </a>
          </div>
        </div>

        {/* Wave at bottom - uses white/background color to create curved edge */}
        <WaveShape nextSectionColor="#ffffff" />
      </section>

      {/* Features Section */}
      <section
        className="py-20 px-4"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${pastelLavender}40 50%, ${pastelCream}60 100%)`
        }}
      >
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: pastelTextDark }}
            >
              ¿Por qué elegir mi libro?
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: pastelTextMedium }}
            >
              Todo lo que necesitas para alcanzar el cuerpo que siempre has deseado
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                colors={cardColors}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section - Hidden
      <section
        className="py-20 px-4"
        style={{
          background: `linear-gradient(180deg, ${pastelCream}60 0%, ${pastelPink}30 100%)`
        }}
      >
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: pastelTextDark }}
            >
              Lo que dicen mis lectores
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: pastelTextMedium }}
            >
              Miles de personas ya han transformado su alimentación con mis recetas
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                name={testimonial.name}
                text={testimonial.text}
                colors={testimonialColors}
              />
            ))}
          </div>
        </div>
      </section>
      */}

      {/* Recipes Section */}
      {showRecipes && recentRecipes.length > 0 && (
        <section
          className="py-20 px-4"
          style={{
            background: `linear-gradient(180deg, ${pastelPink}30 0%, ${pastelLavender}40 100%)`
          }}
        >
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: pastelTextDark }}
              >
                Recetas destacadas
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: pastelTextMedium }}
              >
                Prueba algunas de mis recetas más populares
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={{
                    ...recipe,
                    categoryName: null,
                  }}
                />
              ))}
            </div>

            <div className="text-center mt-10">
              <a
                href="/recipes"
                className="inline-block px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: pastelGreenMint,
                  color: pastelTextDark,
                  boxShadow: `0 8px 24px ${pastelGreenMint}60`
                }}
              >
                Ver todas las recetas
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Blog Section */}
      {showBlog && recentBlogs.length > 0 && (
        <section
          className="py-20 px-4"
          style={{
            background: `linear-gradient(180deg, ${pastelCream}60 0%, ${pastelPeach}40 100%)`
          }}
        >
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: pastelTextDark }}
              >
                Últimos artículos
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: pastelTextMedium }}
              >
                Tips, consejos y más sobre alimentación saludable
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentBlogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={{
                    ...blog,
                    categoryName: blog.categoryName || 'General',
                    categorySlug: blog.categorySlug || null,
                  }}
                  colors={{
                    pink: pastelPink,
                    peach: pastelPeach,
                    mint: pastelMint,
                    textDark: pastelTextDark,
                    textMedium: pastelTextMedium,
                  }}
                />
              ))}
            </div>

            <div className="text-center mt-10">
              <a
                href="/blog"
                className="inline-block px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: pastelGreenMint,
                  color: pastelTextDark,
                  boxShadow: `0 8px 24px ${pastelGreenMint}60`
                }}
              >
                Ver todos los artículos
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section
        className="py-20 px-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${pastelPeach} 0%, ${pastelPink} 100%)`
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl opacity-60"
          style={{ backgroundColor: pastelLavender }}
        />
        <div
          className="absolute bottom-10 right-10 w-40 h-40 rounded-full blur-3xl opacity-60"
          style={{ backgroundColor: pastelMint }}
        />

        <div className="container mx-auto text-center relative z-10">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            style={{ color: pastelTextDark }}
          >
            ¿Lista para empezar tu transformación?
          </h2>
          <p
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
            style={{ color: pastelTextMedium }}
          >
            Únete ahora y comienza a ver resultados desde la primera semana*
          </p>
          <a
            href={featuredProduct ? `/checkout/${featuredProduct.slug}` : '/store'}
            className="inline-block px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: pastelGreenMint,
              color: pastelTextDark,
              boxShadow: `0 12px 32px ${pastelGreenMint}70`
            }}
          >
            Obtener el libro ahora
          </a>
        </div>
      </section>

      {/* Newsletter Section */}
      {showNewsletter && (
        <section
          className="py-20 px-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${pastelPink}90 0%, ${pastelPeach}70 50%, ${pastelMint}60 100%)`
          }}
        >
          {/* Decorative elements */}
          <div
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-40 blur-3xl"
            style={{ backgroundColor: pastelPink }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-30 blur-3xl"
            style={{ backgroundColor: pastelMint }}
          />
          <div
            className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full opacity-20 blur-2xl hidden md:block"
            style={{ backgroundColor: pastelPeach }}
          />

          <div className="container mx-auto max-w-4xl relative z-10">
            <div
              className="rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 md:p-12 backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                boxShadow: `0 25px 50px -12px ${pastelPink}50, 0 0 0 1px rgba(255,255,255,0.5)`
              }}
            >
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* Left side - Content */}
                <div className="text-center md:text-left">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                    style={{
                      backgroundColor: `${pastelMint}80`,
                      color: pastelTextDark
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                    100% gratis
                  </div>
                  <h3
                    className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
                    style={{ color: pastelTextDark }}
                  >
                    Recibe recetas nuevas cada semana
                  </h3>
                  <p
                    className="text-lg mb-6 md:mb-0"
                    style={{ color: pastelTextMedium }}
                  >
                    Únete a nuestra comunidad y recibe en tu correo las mejores recetas, tips de cocina y contenido exclusivo.
                  </p>

                  {/* Trust badges */}
                  <div className="hidden md:flex items-center gap-6 mt-8">
                    <div className="flex items-center gap-2" style={{ color: pastelTextMedium }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span className="text-sm">Sin spam</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ color: pastelTextMedium }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span className="text-sm">Datos seguros</span>
                    </div>
                  </div>
                </div>

                {/* Right side - Form */}
                <div
                  className="rounded-2xl p-4 sm:p-6 md:p-8"
                  style={{
                    backgroundColor: `${pastelPeach}30`,
                    border: `1px solid ${pastelPeach}60`
                  }}
                >
                  <NewsletterForm className="space-y-4" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Disclaimer Section */}
      <section
        className="py-6 px-4"
        style={{ backgroundColor: pastelCream }}
      >
        <div className="container mx-auto">
          <p
            className="text-xs text-center"
            style={{ color: pastelTextMedium }}
          >
            * Los resultados pueden variar. Para obtener los mejores resultados, se recomienda seguir una alimentación basada 100% en las recetas de este libro.
          </p>
          <p
            className="text-xs text-center mt-1"
            style={{ color: pastelTextMedium }}
          >
            ** Acceso a la plataforma por 6 meses a partir de la fecha de compra.
          </p>
        </div>
      </section>
    </div>
  );
}
