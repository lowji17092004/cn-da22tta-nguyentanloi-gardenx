import React from 'react';

export default function CartItem({ item }) {
  return (
    <div>
      <span>{item?.name}</span>
      <span>{item?.quantity}</span>
    </div>
  );
}
