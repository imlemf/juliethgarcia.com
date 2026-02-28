import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

export function ProductCardView({ node }: NodeViewProps) {
  const { productUrl, productName, productPrice, productImage, cardType } = node.attrs;

  const isHorizontal = cardType === 'horizontal';

  if (isHorizontal) {
    return (
      <NodeViewWrapper className="product-card product-card-horizontal">
        <a
          href={productUrl}
          className="product-card-link"
          onClick={(e) => e.preventDefault()}
        >
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              className="product-card-image"
              style={{ margin: 0, padding: 0, borderRadius: 0 }}
            />
          ) : (
            <div className="product-card-image-placeholder" style={{ margin: 0 }} />
          )}
          <div className="product-card-content">
            <span className="product-card-name">{productName}</span>
            <span className="product-card-price">{productPrice}</span>
          </div>
        </a>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="product-card product-card-square">
      <a href={productUrl} className="product-card-link" onClick={(e) => e.preventDefault()}>
        {productImage ? (
          <img
            src={productImage}
            alt={productName}
            className="product-card-image"
            style={{ margin: 0, padding: 0, borderRadius: 0 }}
          />
        ) : (
          <div className="product-card-image-placeholder" style={{ margin: 0 }} />
        )}
        <div className="product-card-content">
          <span className="product-card-name">{productName}</span>
          <span className="product-card-price">{productPrice}</span>
        </div>
      </a>
    </NodeViewWrapper>
  );
}
