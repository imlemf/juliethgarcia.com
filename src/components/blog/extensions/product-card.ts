import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ProductCardView } from './product-card-view';

export interface ProductCardOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    productCard: {
      setProductCard: (options: {
        productId: string;
        productUrl: string;
        productName: string;
        productPrice: string;
        productImage?: string;
        cardType: 'square' | 'horizontal';
      }) => ReturnType;
    };
  }
}

export const ProductCard = Node.create<ProductCardOptions>({
  name: 'productCard',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      productId: {
        default: null,
      },
      productUrl: {
        default: null,
      },
      productName: {
        default: null,
      },
      productPrice: {
        default: null,
      },
      productImage: {
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
        tag: 'div[data-product-card]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          return {
            productId: element.getAttribute('data-product-id'),
            productUrl: element.getAttribute('data-product-url'),
            productName: element.getAttribute('data-product-name'),
            productPrice: element.getAttribute('data-product-price'),
            productImage: element.getAttribute('data-product-image') || null,
            cardType: element.getAttribute('data-card-type') || 'square',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { productId, productUrl, productName, productPrice, productImage, cardType } = HTMLAttributes;
    const cardClass = cardType === 'horizontal' ? 'product-card product-card-horizontal' : 'product-card product-card-square';

    // Build complete HTML structure for storage and public display
    const imageElement: (string | Record<string, string>)[] = productImage
      ? ['img', { src: productImage, alt: productName, class: 'product-card-image' }]
      : ['div', { class: 'product-card-image-placeholder' }];

    return ['div', mergeAttributes(this.options.HTMLAttributes, {
      'data-product-card': '',
      'data-product-id': productId,
      'data-product-url': productUrl,
      'data-product-name': productName,
      'data-product-price': productPrice,
      'data-product-image': productImage || '',
      'data-card-type': cardType,
      'class': cardClass,
    }),
      ['a', { href: productUrl, class: 'product-card-link' },
        imageElement,
        ['div', { class: 'product-card-content' },
          ['div', { class: 'product-card-name' }, productName],
          ['div', { class: 'product-card-price' }, productPrice],
        ],
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProductCardView);
  },

  addCommands() {
    return {
      setProductCard:
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
