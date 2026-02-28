import { useState } from 'react';
import type { BlogPageProps } from '../../types';
import { BlogCard } from './BlogCard';

export function BlogPage({ config, blogs, categories }: BlogPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Pastel colors from config
  const pastelPink = (config.pastelPink as string) || '#FFD6E8';
  const pastelPeach = (config.pastelPeach as string) || '#FFDAB9';
  const pastelMint = (config.pastelMint as string) || '#C7EAE4';
  const pastelLavender = (config.pastelLavender as string) || '#E6E6FA';
  const pastelGreenMint = (config.pastelGreenMint as string) || '#B8E6B8';
  const pastelTextDark = (config.pastelTextDark as string) || '#5A4A42';
  const pastelTextMedium = (config.pastelTextMedium as string) || '#8B7D77';

  const filteredBlogs = selectedCategory
    ? blogs.filter((blog) => blog.categoryName === selectedCategory)
    : blogs;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF8F5' }}>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pt-24 pb-24"
        style={{
          background: `linear-gradient(135deg, ${pastelPeach}60 0%, ${pastelPink}40 50%, ${pastelLavender}60 100%)`
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-50 blur-3xl"
          style={{ backgroundColor: pastelPeach }}
        />
        <div
          className="absolute top-1/2 -right-20 w-48 h-48 rounded-full opacity-40 blur-3xl"
          style={{ backgroundColor: pastelPink }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: pastelTextDark }}
            >
              Blog
            </h1>
            <p
              className="text-lg"
              style={{ color: pastelTextMedium }}
            >
              Artículos sobre bienestar, nutrición y estilo de vida saludable
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  backgroundColor: selectedCategory === null ? pastelGreenMint : 'rgba(255, 255, 255, 0.8)',
                  color: pastelTextDark,
                  boxShadow: selectedCategory === null ? `0 4px 15px ${pastelGreenMint}50` : '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
                  style={{
                    backgroundColor: selectedCategory === category.name ? pastelGreenMint : 'rgba(255, 255, 255, 0.8)',
                    color: pastelTextDark,
                    boxShadow: selectedCategory === category.name ? `0 4px 15px ${pastelGreenMint}50` : '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
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
              style={{ fill: '#FDF8F5' }}
            />
          </svg>
        </div>
      </section>

      {/* Blog Grid */}
      <section
        className="py-16 px-4"
        style={{ backgroundColor: '#FDF8F5' }}
      >
        <div className="container mx-auto">
          {filteredBlogs.length === 0 ? (
            <div
              className="text-center py-16 rounded-3xl"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
            >
              <div
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: `${pastelPeach}60` }}
              >
                <svg className="w-10 h-10" fill="none" stroke={pastelTextMedium} viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                </svg>
              </div>
              <p style={{ color: pastelTextMedium }} className="text-lg">
                No hay artículos disponibles en esta categoría.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBlogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={{
                    ...blog,
                    categoryName: blog.categoryName || 'General',
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
          )}
        </div>
      </section>
    </div>
  );
}
