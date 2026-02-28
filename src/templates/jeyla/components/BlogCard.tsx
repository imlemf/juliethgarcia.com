import type { BlogCardProps } from '../../types';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Lucide icon
const BadgeCheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

interface BlogCardExtendedProps extends BlogCardProps {
  colors?: {
    pink: string;
    peach: string;
    mint: string;
    textDark: string;
    textMedium: string;
  };
  variant?: 'default' | 'featured';
}

export function BlogCard({ blog, colors, variant = 'default' }: BlogCardExtendedProps) {
  const pastelPink = colors?.pink || '#FFD6E8';
  const pastelPeach = colors?.peach || '#FFDAB9';
  const pastelMint = colors?.mint || '#C7EAE4';
  const pastelTextDark = colors?.textDark || '#5A4A42';
  const pastelTextMedium = colors?.textMedium || '#8B7D77';

  const formattedDate = blog.publishedAt
    ? new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'short',
      }).format(new Date(blog.publishedAt))
    : null;

  if (variant === 'featured') {
    return (
      <a
        href={`/blog/${blog.slug}`}
        className="group block rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: `0 10px 40px ${pastelPink}30`
        }}
      >
        <div className="grid md:grid-cols-2">
          {blog.coverImage && (
            <div className="aspect-video md:aspect-auto md:h-full relative overflow-hidden">
              <img
                src={blog.coverImage}
                alt={blog.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${pastelPink}40 0%, transparent 100%)`
                }}
              />
            </div>
          )}
          <div className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              {blog.isPremium && (
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                  style={{
                    backgroundColor: `${pastelPink}`,
                    color: pastelTextDark
                  }}
                >
                  <BadgeCheckIcon />
                  Premium
                </span>
              )}
              {blog.categoryName && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                  style={{
                    backgroundColor: `${pastelMint}80`,
                    color: pastelTextDark
                  }}
                >
                  {blog.categoryName}
                </span>
              )}
              {formattedDate && (
                <span className="text-sm" style={{ color: pastelTextMedium }}>
                  {formattedDate}
                </span>
              )}
            </div>
            <h3
              className="text-2xl md:text-3xl font-bold mb-4 line-clamp-2 group-hover:underline decoration-2 underline-offset-4"
              style={{ color: pastelTextDark, textDecorationColor: pastelPink }}
            >
              {blog.title}
            </h3>
            {blog.excerpt && (
              <p className="text-base mb-6 line-clamp-3" style={{ color: pastelTextMedium }}>
                {stripHtml(blog.excerpt)}
              </p>
            )}
            <div
              className="inline-flex items-center gap-2 font-semibold text-sm group-hover:gap-3 transition-all"
              style={{ color: pastelTextDark }}
            >
              Leer artículo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={`/blog/${blog.slug}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        boxShadow: `0 4px 20px ${pastelPink}20`
      }}
    >
      {blog.coverImage && (
        <div className="aspect-[16/10] relative overflow-hidden">
          <img
            src={blog.coverImage}
            alt={blog.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(to top, ${pastelTextDark}60 0%, transparent 50%)`
            }}
          />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {blog.isPremium && (
              <div
                className="px-2.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center gap-1"
                style={{
                  backgroundColor: 'rgba(255, 214, 232, 0.95)',
                  color: pastelTextDark
                }}
              >
                <BadgeCheckIcon />
                Premium
              </div>
            )}
            {formattedDate && (
              <div
                className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: pastelTextDark
                }}
              >
                {formattedDate}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {blog.isPremium && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: pastelPink,
                color: pastelTextDark
              }}
            >
              <BadgeCheckIcon />
              Premium
            </span>
          )}
          {blog.categoryName && (
            <span
              className="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${pastelPeach}60`,
                color: pastelTextDark
              }}
            >
              {blog.categoryName}
            </span>
          )}
        </div>
        <h3
          className="font-bold text-lg mb-2 line-clamp-2"
          style={{ color: pastelTextDark }}
        >
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="text-sm line-clamp-2 mb-4" style={{ color: pastelTextMedium }}>
            {stripHtml(blog.excerpt)}
          </p>
        )}
        <div
          className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
          style={{ color: pastelTextDark }}
        >
          Leer artículo
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
}
