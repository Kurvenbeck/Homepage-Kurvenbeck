"use client";

import { useMemo, useState } from "react";
import { IconPrinter, IconSearch, IconAlertTriangle } from "@tabler/icons-react";
import type { BacktagInput } from "@/app/admin/order-actions";
import type { BackstubeOrdersView } from "@/lib/backstubeOrders";
import { formatAmount } from "@/lib/ingredients";
import { BacktagAdmin } from "@/components/admin/BacktagAdmin";
import { OrdersInbox } from "@/components/admin/OrdersInbox";

type Tab = "backtag" | "backliste" | "bestellungen";

/**
 * Unter-Reiter der Backstube-Bestellungen:
 *   1. Backtag anlegen      → BacktagAdmin
 *   2. Backliste & Zutaten  → was zu backen ist + hochgerechneter Zutaten-Bedarf
 *   3. Bestellungen         → Einzelbestellungen mit Namens-Suche
 */
export function BestellungenTabs({
  backtag,
  view,
}: {
  backtag: BacktagInput;
  view: BackstubeOrdersView;
}) {
  const [tab, setTab] = useState<Tab>("backtag");

  const tabs: { key: Tab; label: string }[] = [
    { key: "backtag", label: "Backtag" },
    { key: "backliste", label: "Backliste & Zutaten" },
    { key: "bestellungen", label: `Bestellungen (${view.orders.length})` },
  ];

  return (
    <>
      <div className="admin-subtabs" role="tablist" aria-label="Bestellungen-Bereiche">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`admin-subtab${tab === t.key ? " is-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "backtag" && (
        <section>
          <h2 className="admin-subhead">Aktiver Backtag</h2>
          <BacktagAdmin initial={backtag} />
        </section>
      )}

      {tab === "backliste" && <BakingSection view={view} />}

      {tab === "bestellungen" && <OrdersSection view={view} />}
    </>
  );
}

function BakingSection({ view }: { view: BackstubeOrdersView }) {
  return (
    <section className="baking-print">
      <div className="admin-subhead-row">
        <h2 className="admin-subhead">
          Backliste{" "}
          <span className="admin-subhead-note">
            (alle offenen Bestellungen zusammengezählt)
          </span>
        </h2>
        {view.bakingList.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost no-print"
            onClick={() => window.print()}
          >
            <IconPrinter size={18} stroke={1.75} aria-hidden />
            Drucken
          </button>
        )}
      </div>

      {view.bakingList.length === 0 ? (
        <p className="inbox-empty">
          Noch nichts zu backen — es liegen keine offenen Bestellungen vor.
        </p>
      ) : (
        <>
          <ul className="baking-list">
            {view.bakingList.map((entry) => (
              <li key={entry.id}>
                <div className="baking-row">
                  <span className="baking-qty">{entry.qty}×</span>
                  <span className="baking-name">{entry.name}</span>
                </div>
                {entry.missingRecipe ? (
                  <p className="baking-norecipe">
                    <IconAlertTriangle size={14} stroke={1.75} aria-hidden /> Kein
                    Rezept hinterlegt — Zutaten fehlen in der Gesamtliste.
                  </p>
                ) : (
                  <ul className="baking-ingredients">
                    {entry.ingredients.map((ing) => (
                      <li key={ing.name}>
                        {ing.name}:{" "}
                        <strong>
                          {formatAmount(ing.amount)} {ing.unit}
                        </strong>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <h2 className="admin-subhead">
            Zutaten gesamt{" "}
            <span className="admin-subhead-note">(Einkaufsliste für den Backtag)</span>
          </h2>
          {view.ingredientTotals.length === 0 ? (
            <p className="inbox-empty">
              Noch keine Zutaten berechenbar — hinterlege Rezepte bei den Backwaren
              (Speisekarte → Backstube).
            </p>
          ) : (
            <ul className="ingredient-totals">
              {view.ingredientTotals.map((ing) => (
                <li key={`${ing.name} ${ing.unit}`}>
                  <span className="ingredient-total-name">{ing.name}</span>
                  <span className="ingredient-total-amount">
                    {formatAmount(ing.amount)} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function OrdersSection({ view }: { view: BackstubeOrdersView }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return view.orders;
    return view.orders.filter((o) => o.customerName.toLowerCase().includes(q));
  }, [query, view.orders]);

  return (
    <section>
      <h2 className="admin-subhead">Einzelne Bestellungen</h2>

      <div className="orders-search">
        <IconSearch size={18} stroke={1.75} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nach Name suchen (z. B. Otto Schmid)"
          aria-label="Bestellungen nach Name durchsuchen"
        />
      </div>

      {query.trim() && filtered.length === 0 ? (
        <p className="inbox-empty">
          Keine Bestellung für „{query.trim()}" gefunden.
        </p>
      ) : (
        <OrdersInbox orders={filtered} />
      )}
    </section>
  );
}
