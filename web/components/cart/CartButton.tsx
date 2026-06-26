"use client";

import { useCart } from "./CartContext";

export function CartButton() {
  const { count, openCart } = useCart();
  return (
    <button
      type="button"
      className="cart-btn"
      onClick={openCart}
      aria-label={`Warenkorb öffnen, ${count} Artikel`}
    >
      Warenkorb <span className="cart-count">{count}</span>
    </button>
  );
}
