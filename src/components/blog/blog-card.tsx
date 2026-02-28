interface BlogCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  publishedAt?: Date | null;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function BlogCard({
  title,
  slug,
  excerpt,
  coverImage,
  categoryName,
  categorySlug,
  publishedAt,
}: BlogCardProps) {
  return (
    <article className="group">
      <a href={`/blog/${slug}`} className="block">
        {coverImage ? (
          <div className="aspect-video overflow-hidden rounded-lg mb-4 bg-muted">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-video rounded-lg mb-4 bg-muted flex items-center justify-center">
            <span className="text-4xl text-muted-foreground">📝</span>
          </div>
        )}

        <div className="space-y-2">
          {categoryName && (
            <a
              href={`/blog/categoria/${categorySlug}`}
              className="inline-block text-xs font-medium text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {categoryName}
            </a>
          )}

          <h2 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h2>

          {excerpt && (
            <p className="text-muted-foreground line-clamp-3">{excerpt}</p>
          )}

          {publishedAt && (
            <p className="text-sm text-muted-foreground">
              {formatDate(new Date(publishedAt))}
            </p>
          )}
        </div>
      </a>
    </article>
  );
}
