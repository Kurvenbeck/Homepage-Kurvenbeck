"use client";

import { useEffect } from "react";
import { productById, formatEUR } from "@/lib/products";
import { useCart } from "./CartContext";

export function CartDrawer() {
  const { cart, total, isOpen, changeQty, closeCart } = useCart();

  // Esc schließt den Drawer.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  const lines = Object.entries(cart);

  return (
    <>
      <div
        className={`drawer-scrim${isOpen ? " open" : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className={`drawer${isOpen ? " open" : ""}`}
        aria-label="Warenkorb"
        aria-hidden={!isOpen}
      >
        <div className="drawer-head">
          <h3>Dein Warenkorb</h3>
          <button
            type="button"
            className="drawer-close"
            onClick={closeCart}
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        <div className="drawer-body">
          {lines.length === 0 ? (
            <p className="drawer-empty">
              Noch nichts drin — schnapp dir eine Brezel, bevor sie weg ist.
            </p>
          ) : (
            lines.map(([id, qty]) => {
              const p = productById(id);
              if (!p) return null;
              return (
                <div className="cart-line" key={id}>
                  <span className="cl-name">{p.name}</span>
                  <span className="cl-price">{formatEUR(p.price * qty)}</span>
                  <div className="qty">
                    <button
                      type="button"
                      onClick={() => changeQty(id, -1)}
                      aria-label={`${p.name} weniger`}
                    >
                      –
                    </button>
                    <span>{qty}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(id, 1)}
                      aria-label={`${p.name} mehr`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="drawer-foot">
          <div className="drawer-total">
            <span className="t-label">Summe (Abholung)</span>
            <span className="t-val">{formatEUR(total)}</span>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={lines.length === 0}
          >
            Zur Abholung bestellen
          </button>
          <p className="demo-note">Demo-Warenkorb — keine echte Bestellung.</p>
        </div>
      </aside>
    </>
  );
}
