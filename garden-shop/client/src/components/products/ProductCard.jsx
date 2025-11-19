import React from 'react';

export default function ProductCard({ product }) {
  return (
    <article>
      <h3>{product?.name || 'Product'}</h3>
      <p>{product?.price ? `$${product.price}` : '---'}</p>
    </article>
  );
}
