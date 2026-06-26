"use client";

import { products, formatEUR } from "@/lib/products";
import { backstubePhotos } from "@/lib/images";
import { Photo } from "../Photo";
import { useCart } from "./CartContext";

export function ProductGrid() {
  const { addToCart } = useCart();
  return (
    <div className="shop-grid">
      {products.map((p) => (
        <article className="product" key={p.id}>
          <Photo
            img={backstubePhotos[p.id] ?? null}
            label={p.photo}
            sizes="(max-width: 600px) 100vw, (max-width: 980px) 50vw, 33vw"
          />
          <div className="product-body">
            {p.badge ? <span className="badge">{p.badge}</span> : null}
            <h3>{p.name}</h3>
            <p className="desc">{p.desc}</p>
            <div className="product-foot">
              <span className="price">
                {formatEUR(p.price)}
                <small>pro Stück</small>
              </span>
              <button
                type="button"
                className="add-btn"
                onClick={() => addToCart(p.id)}
                aria-label={`${p.name} in den Warenkorb`}
              >
                + In den Korb
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
