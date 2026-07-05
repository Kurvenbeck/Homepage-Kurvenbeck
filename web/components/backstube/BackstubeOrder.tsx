"use client";

import { useEffect, useMemo, useState } from "react";
import { IconStar, IconClock, IconShoppingBag } from "@tabler/icons-react";
import type { Menu, MenuItem } from "@/lib/menu";
import type { Backtag } from "@/lib/backtag";
import { submitBackstubeOrder } from "@/app/backstube/order-actions";

/**
 * Interaktive Backstube-Vorbestellung (menügetrieben, live aus der DB). Gäste
 * legen Mengen in den Warenkorb und bestellen für den aktiven Backtag. Ist kein
 * Backtag aktiv, wird die Karte read-only gezeigt (kein Bestellen möglich).
 *
 * Namen/Preise sind zum Bestellzeitpunkt egal — die Server Action übernimmt sie
 * autoritativ aus dem Live-Menü; hier zählt nur die Auswahl (id → Menge).
 */

const STORAGE_KEY = "kurvenbeck-backstube-order";

type Cart = Record<string, number>; // menuItemId -> qty

function formatEUR(n: number): string {
  return n.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

export function BackstubeOrder({
  menu,
  backtag,
}: {
  menu: Menu;
  backtag: Backtag;
}) {
  const [cart, setCart] = useState<Cart>({});
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [done, setDone] = useState(false);

  const canOrder = backtag.active;

  // Flache Liste aller bestellbaren Einträge (Empfehlungen + Kategorien) für
  // Preis-/Namens-Lookup im Warenkorb.
  const catalog = useMemo(() => {
    const map = new Map<string, MenuItem>();
    for (const item of [
      ...menu.recommendations,
      ...menu.categories.flatMap((c) => c.items),
    ]) {
      map.set(item.id, item);
    }
    return map;
  }, [menu]);

  // Persistenz laden.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw) as Cart);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart, hydrated]);

  // Esc schließt den Drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const changeQty = (id: string, delta: number) =>
    setCart((prev) => {
      const next = { ...prev };
      const qty = (next[id] || 0) + delta;
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, 100);
      return next;
    });

  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = catalog.get(id);
    return item ? sum + item.priceValue * qty : sum;
  }, 0);

  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ item: catalog.get(id), qty }))
    .filter((l): l is { item: MenuItem; qty: number } => Boolean(l.item));

  const clearCart = () => setCart({});

  return (
    <>
      <section id="bestellen" className="section">
        <div className="container" style={{ maxWidth: "56rem" }}>
          {canOrder ? (
            <div className="order-status order-status--open" role="status">
              <span className="order-status-dot" aria-hidden />
              <div>
                <strong>Vorbestellen für {backtag.dateLabel}</strong>
                <span>
                  Bestellschluss {backtag.deadlineText} · Abholung{" "}
                  {backtag.pickupText}
                </span>
              </div>
            </div>
          ) : (
            <div className="order-status order-status--closed" role="status">
              <IconClock size={20} stroke={1.75} aria-hidden />
              <div>
                <strong>Aktuell kein Backtag angekündigt</strong>
                <span>
                  Sobald der nächste Backtag feststeht, kannst du hier
                  vorbestellen. Schau bald wieder vorbei.
                </span>
              </div>
            </div>
          )}

          {menu.recommendations.length > 0 && (
            <div className="order-cat">
              <div className="order-list">
                {menu.recommendations.map((item) => (
                  <OrderRow
                    key={item.id}
                    item={item}
                    qty={cart[item.id] || 0}
                    canOrder={canOrder}
                    onChange={changeQty}
                    highlight
                  />
                ))}
              </div>
            </div>
          )}

          {menu.categories.map((cat) => (
            <div className="order-cat" key={cat.id}>
              <h2 className="order-cat-title">{cat.title}</h2>
              <div className="order-list">
                {cat.items.map((item) => (
                  <OrderRow
                    key={item.id}
                    item={item}
                    qty={cart[item.id] || 0}
                    canOrder={canOrder}
                    onChange={changeQty}
                  />
                ))}
              </div>
            </div>
          ))}

          {menu.legend.length > 0 && (
            <div className="menu-legend">
              <p className="eyebrow">Allergene</p>
              <dl>
                {menu.legend.map((a) => (
                  <div key={a.code}>
                    <dt>{a.code}</dt>
                    <dd>{a.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </section>

      {/* Schwebende Warenkorb-Leiste */}
      {canOrder && count > 0 && !drawerOpen && (
        <button
          type="button"
          className="order-bar"
          onClick={() => setDrawerOpen(true)}
        >
          <IconShoppingBag size={20} stroke={1.75} aria-hidden />
          <span className="order-bar-count">{count}</span>
          Warenkorb ansehen
          <span className="order-bar-total">{formatEUR(total)}</span>
        </button>
      )}

      <OrderDrawer
        open={drawerOpen}
        lines={lines}
        total={total}
        backtag={backtag}
        done={done}
        onClose={() => setDrawerOpen(false)}
        onChangeQty={changeQty}
        onSuccess={() => {
          setDone(true);
          clearCart();
        }}
        onReset={() => {
          setDone(false);
          setDrawerOpen(false);
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------

function OrderRow({
  item,
  qty,
  canOrder,
  onChange,
  highlight = false,
}: {
  item: MenuItem;
  qty: number;
  canOrder: boolean;
  onChange: (id: string, delta: number) => void;
  highlight?: boolean;
}) {
  return (
    <div className={`order-item${highlight ? " order-item--rec" : ""}`}>
      <div className="order-item-main">
        <span className="order-item-name">
          {highlight && (
            <span className="order-item-rec-flag">
              <IconStar size={14} stroke={1.75} aria-hidden />
              Empfehlung
            </span>
          )}
          {item.name}
          {item.allergens.length > 0 && (
            <span className="mi-allergens">({item.allergens.join(", ")})</span>
          )}
          {item.tags.map((tag) => (
            <span className="menu-tag" key={tag}>
              {tag}
            </span>
          ))}
        </span>
        {item.description && (
          <span className="mi-desc">{item.description}</span>
        )}
      </div>
      <span className="order-item-price">{item.price} €</span>
      {canOrder &&
        (qty > 0 ? (
          <div className="qty" aria-label={`Menge ${item.name}`}>
            <button
              type="button"
              onClick={() => onChange(item.id, -1)}
              aria-label={`${item.name} weniger`}
            >
              –
            </button>
            <span>{qty}</span>
            <button
              type="button"
              onClick={() => onChange(item.id, 1)}
              aria-label={`${item.name} mehr`}
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="add-btn"
            onClick={() => onChange(item.id, 1)}
            aria-label={`${item.name} vorbestellen`}
          >
            + Vorbestellen
          </button>
        ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

function OrderDrawer({
  open,
  lines,
  total,
  backtag,
  done,
  onClose,
  onChangeQty,
  onSuccess,
  onReset,
}: {
  open: boolean;
  lines: { item: MenuItem; qty: number }[];
  total: number;
  backtag: Backtag;
  done: boolean;
  onClose: () => void;
  onChangeQty: (id: string, delta: number) => void;
  onSuccess: () => void;
  onReset: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [company, setCompany] = useState(""); // Honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Bitte gib deinen Namen an.");
      return;
    }
    if (lines.length === 0) {
      setError("Dein Warenkorb ist leer.");
      return;
    }
    setSubmitting(true);
    const res = await submitBackstubeOrder({
      name,
      email,
      phone,
      note,
      company,
      items: lines.map((l) => ({ id: l.item.id, qty: l.qty })),
    });
    setSubmitting(false);
    if (res.ok) {
      setName("");
      setEmail("");
      setPhone("");
      setNote("");
      onSuccess();
    } else {
      setError(res.error);
    }
  };

  return (
    <>
      <div
        className={`drawer-scrim${open ? " open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`drawer${open ? " open" : ""}`}
        aria-label="Vorbestellung"
        aria-hidden={!open}
      >
        <div className="drawer-head">
          <h3>{done ? "Bestellung eingegangen" : "Deine Vorbestellung"}</h3>
          <button
            type="button"
            className="drawer-close"
            onClick={done ? onReset : onClose}
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        {done ? (
          <div className="drawer-body">
            <div className="order-done">
              <p className="order-done-lead">
                Danke! Deine Bestellung für <strong>{backtag.dateLabel}</strong>{" "}
                ist bei uns eingegangen.
              </p>
              <p>
                Abholung {backtag.pickupText}. Wir backen frisch — sei pünktlich,
                sonst isch&apos;s weg.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={onReset}
              >
                Alles klar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              {lines.length === 0 ? (
                <p className="drawer-empty">
                  Noch nichts drin — schnapp dir eine Brezel, bevor sie weg ist.
                </p>
              ) : (
                <>
                  {lines.map(({ item, qty }) => (
                    <div className="cart-line" key={item.id}>
                      <span className="cl-name">{item.name}</span>
                      <span className="cl-price">
                        {formatEUR(item.priceValue * qty)}
                      </span>
                      <div className="qty">
                        <button
                          type="button"
                          onClick={() => onChangeQty(item.id, -1)}
                          aria-label={`${item.name} weniger`}
                        >
                          –
                        </button>
                        <span>{qty}</span>
                        <button
                          type="button"
                          onClick={() => onChangeQty(item.id, 1)}
                          aria-label={`${item.name} mehr`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  <form
                    id="order-form"
                    className="order-form"
                    onSubmit={handleSubmit}
                  >
                    <label className="order-field">
                      <span>Dein Name *</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        required
                      />
                    </label>
                    <label className="order-field">
                      <span>E-Mail (optional, für die Bestätigung)</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </label>
                    <label className="order-field">
                      <span>Telefon (optional)</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                      />
                    </label>
                    <label className="order-field">
                      <span>Anmerkung (optional)</span>
                      <textarea
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </label>
                    {/* Honeypot: für Menschen unsichtbar */}
                    <div className="hp-field" aria-hidden="true">
                      <label>
                        Firma
                        <input
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      </label>
                    </div>
                    {error && <p className="order-error">{error}</p>}
                  </form>
                </>
              )}
            </div>

            <div className="drawer-foot">
              <div className="drawer-total">
                <span className="t-label">Summe (Abholung)</span>
                <span className="t-val">{formatEUR(total)}</span>
              </div>
              <button
                type="submit"
                form="order-form"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={lines.length === 0 || submitting}
              >
                {submitting ? "Wird gesendet …" : "Verbindlich vorbestellen"}
              </button>
              <p className="demo-note">
                Kostenlos & unverbindlich für dich — wir backen nach Bestellung.
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
