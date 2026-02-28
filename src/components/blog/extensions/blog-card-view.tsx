import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

export function BlogCardView({ node }: NodeViewProps) {
  const { blogUrl, blogTitle, blogExcerpt, blogImage, cardType } = node.attrs;

  const isHorizontal = cardType === 'horizontal';

  if (isHorizontal) {
    return (
      <NodeViewWrapper className="blog-card blog-card-horizontal">
        <a
          href={blogUrl}
          className="blog-card-link"
          onClick={(e) => e.preventDefault()}
        >
          {blogImage ? (
            <img
              src={blogImage}
              alt={blogTitle}
              className="blog-card-image"
              style={{ margin: 0, padding: 0, borderRadius: 0 }}
            />
          ) : (
            <div className="blog-card-image-placeholder" style={{ margin: 0 }} />
          )}
          <div className="blog-card-content">
            <span className="blog-card-title">{blogTitle}</span>
            {blogExcerpt && <span className="blog-card-excerpt">{blogExcerpt}</span>}
          </div>
        </a>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="blog-card blog-card-square">
      <a href={blogUrl} className="blog-card-link" onClick={(e) => e.preventDefault()}>
        {blogImage ? (
          <img
            src={blogImage}
            alt={blogTitle}
            className="blog-card-image"
            style={{ margin: 0, padding: 0, borderRadius: 0 }}
          />
        ) : (
          <div className="blog-card-image-placeholder" style={{ margin: 0 }} />
        )}
        <div className="blog-card-content">
          <span className="blog-card-title">{blogTitle}</span>
          {blogExcerpt && <span className="blog-card-excerpt">{blogExcerpt}</span>}
        </div>
      </a>
    </NodeViewWrapper>
  );
}
