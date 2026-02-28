import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { BlogCardView } from './blog-card-view';

export interface BlogCardOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blogCard: {
      setBlogCard: (options: {
        blogId: string;
        blogUrl: string;
        blogTitle: string;
        blogExcerpt?: string;
        blogImage?: string;
        cardType: 'square' | 'horizontal';
      }) => ReturnType;
    };
  }
}

export const BlogCard = Node.create<BlogCardOptions>({
  name: 'blogCard',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      blogId: {
        default: null,
      },
      blogUrl: {
        default: null,
      },
      blogTitle: {
        default: null,
      },
      blogExcerpt: {
        default: null,
      },
      blogImage: {
        default: null,
      },
      cardType: {
        default: 'square',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-blog-card]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          return {
            blogId: element.getAttribute('data-blog-id'),
            blogUrl: element.getAttribute('data-blog-url'),
            blogTitle: element.getAttribute('data-blog-title'),
            blogExcerpt: element.getAttribute('data-blog-excerpt') || null,
            blogImage: element.getAttribute('data-blog-image') || null,
            cardType: element.getAttribute('data-card-type') || 'square',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { blogId, blogUrl, blogTitle, blogExcerpt, blogImage, cardType } = HTMLAttributes;
    const cardClass = cardType === 'horizontal' ? 'blog-card blog-card-horizontal' : 'blog-card blog-card-square';

    // Build complete HTML structure for storage and public display
    const imageElement: (string | Record<string, string>)[] = blogImage
      ? ['img', { src: blogImage, alt: blogTitle, class: 'blog-card-image' }]
      : ['div', { class: 'blog-card-image-placeholder' }];

    const contentChildren: (string | Record<string, string> | (string | Record<string, string>)[])[] = [
      ['span', { class: 'blog-card-title' }, blogTitle],
    ];

    if (blogExcerpt) {
      contentChildren.push(['span', { class: 'blog-card-excerpt' }, blogExcerpt]);
    }

    return ['div', mergeAttributes(this.options.HTMLAttributes, {
      'data-blog-card': '',
      'data-blog-id': blogId,
      'data-blog-url': blogUrl,
      'data-blog-title': blogTitle,
      'data-blog-excerpt': blogExcerpt || '',
      'data-blog-image': blogImage || '',
      'data-card-type': cardType,
      'class': cardClass,
    }),
      ['a', { href: blogUrl, class: 'blog-card-link' },
        imageElement,
        ['div', { class: 'blog-card-content' }, ...contentChildren],
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlogCardView);
  },

  addCommands() {
    return {
      setBlogCard:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
