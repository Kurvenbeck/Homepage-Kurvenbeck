"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { products } from "@/lib/products";

type Cart = Record<string, number>; // productId -> qty

type CartContextValue = {
  cart: Cart;
  count: number;
  total: number;
  isOpen: boolean;
  addToCart: (id: string) => void;
  changeQty: (id: string, delta: number) => void;
  openCart: () => void;
  closeCart: () => void;
};

const STORAGE_KEY = "kurvenbeck-cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({});
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Persistenz laden (README §8: Korb soll Reload überstehen).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw) as Cart);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* ignore quota errors */
    }
  }, [cart, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addToCart = useCallback((id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setIsOpen(true); // Drawer öffnet automatisch beim Hinzufügen
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setCart((prev) => {
      const next = { ...prev };
      const qty = (next[id] || 0) + delta;
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }, []);

  const count = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b, 0),
    [cart],
  );

  const total = useMemo(
    () =>
      Object.entries(cart).reduce((sum, [id, qty]) => {
        const p = products.find((x) => x.id === id);
        return p ? sum + p.price * qty : sum;
      }, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      count,
      total,
      isOpen,
      addToCart,
      changeQty,
      openCart,
      closeCart,
    }),
    [cart, count, total, isOpen, addToCart, changeQty, openCart, closeCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
