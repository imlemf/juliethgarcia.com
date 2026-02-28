import type { BlogDetailPageProps } from '../../types';
import { BlogCard } from './BlogCard';

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function BlogDetailPage({ config, blog, relatedBlogs, isAuthenticated, isPremium }: BlogDetailPageProps) {
  // Pastel colors from config
  const pastelPink = (config.pastelPink as string) || '#FFD6E8';
  const pastelPeach = (config.pastelPeach as string) || '#FFDAB9';
  const pastelMint = (config.pastelMint as string) || '#C7EAE4';
  const pastelLavender = (config.pastelLavender as string) || '#E6E6FA';
  const pastelGreenMint = (config.pastelGreenMint as string) || '#B8E6B8';
  const pastelTextDark = (config.pastelTextDark as string) || '#5A4A42';
  const pastelTextMedium = (config.pastelTextMedium as string) || '#8B7D77';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F5' }}>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pt-24 pb-32"
        style={{
          background: `linear-gradient(135deg, ${pastelLavender}60 0%, ${pastelPink}40 50%, ${pastelPeach}60 100%)`,
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
        <div
          className="absolute bottom-20 right-1/4 w-32 h-32 rounded-full opacity-30 blur-2xl"
          style={{ backgroundColor: pastelLavender }}
        />

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <a href="/blog" className="hover:underline" style={{ color: pastelTextMedium }}>
                  Blog
                </a>
              </li>
              {blog.categoryName && (
                <>
                  <li style={{ color: pastelTextMedium }}>/</li>
                  <li>
                    <a
                      href={`/blog/categoria/${blog.categorySlug}`}
                      className="hover:underline"
                      style={{ color: pastelTextMedium }}
                    >
                      {blog.categoryName}
                    </a>
                  </li>
                </>
              )}
              <li style={{ color: pastelTextMedium }}>/</li>
              <li style={{ color: pastelTextDark }} className="font-medium truncate max-w-[200px]">
                {blog.title}
              </li>
            </ol>
          </nav>

          <div className="max-w-4xl mx-auto text-center">
            {/* Category badge */}
            {blog.categoryName && (
              <a
                href={`/blog/categoria/${blog.categorySlug}`}
                className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 transition-transform hover:scale-105"
                style={{
                  backgroundColor: `${pastelMint}80`,
                  color: pastelTextDark,
                }}
              >
                {blog.categoryName}
              </a>
            )}

            {/* Title */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ color: pastelTextDark }}
            >
              {blog.title}
            </h1>

            {/* Date */}
            {blog.publishedAt && (
              <div className="flex items-center justify-center gap-2" style={{ color: pastelTextMedium }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time>{formatDate(blog.publishedAt)}</time>
              </div>
            )}
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

      {/* Cover Image */}
      {blog.coverImage && (
        <section className="px-4 -mt-16 relative z-20">
          <div className="container mx-auto max-w-4xl">
            <div
              className="aspect-video overflow-hidden rounded-3xl"
              style={{
                boxShadow: `0 25px 50px -12px ${pastelPink}50`,
              }}
            >
              <img src={blog.coverImage} alt={blog.title} loading="eager" decoding="async" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-12 px-4" style={{ backgroundColor: '#FFF8F5' }}>
        <div className="container mx-auto max-w-4xl">
          {/* Premium blog locked for non-premium users */}
          {blog.isPremium && !isPremium ? (
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
                  Artículo Premium
                </h2>
                <p
                  className="mb-8 text-lg"
                  style={{ color: pastelTextDark, opacity: 0.8 }}
                >
                  {isAuthenticated
                    ? 'El contenido de este artículo está disponible exclusivamente para miembros premium.'
                    : 'Inicia sesión o adquiere una suscripción premium para acceder al contenido completo de este artículo.'}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="/blog"
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-full font-medium transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      color: pastelTextDark,
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Volver al blog
                  </a>
                  <a
                    href={isAuthenticated ? '/tienda' : '/login'}
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
          ) : (
            <>
              <article
                className="rounded-2xl p-8 md:p-12"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: `0 4px 20px ${pastelLavender}30`,
                }}
              >
                {/* Blog content with Jeyla pastel styles */}
                <div
                  className="jeyla-blog-content"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </article>

              {/* Back link */}
              <div className="mt-8 text-center">
                <a
                  href="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                  style={{ backgroundColor: pastelMint, color: pastelTextDark }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver al blog
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Related Posts */}
      {relatedBlogs && relatedBlogs.length > 0 && (
        <section className="py-16 px-4" style={{ backgroundColor: `${pastelLavender}30` }}>
          <div className="container mx-auto max-w-6xl">
            <h2
              className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3"
              style={{ color: pastelTextDark }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: pastelPeach }}>
                <svg className="w-6 h-6" fill="none" stroke={pastelTextDark} viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              También te puede interesar
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedBlogs.map((post) => (
                <BlogCard
                  key={post.id}
                  blog={post}
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
          </div>
        </section>
      )}
    </div>
  );
}
