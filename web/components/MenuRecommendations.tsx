import { IconStar } from "@tabler/icons-react";
import type { MenuItem } from "@/lib/menu";

/**
 * Hervorgehobene „Empfehlungen des Hauses" — Sonder-Einträge (z. B. spontaner
 * Schweinebraten), die oben stehen und nicht in der normalen Karte auftauchen.
 * Rendert nichts, wenn keine Empfehlung gepflegt ist.
 */
export function MenuRecommendations({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="menu-recommendations">
      {items.map((item) => (
        <div className="menu-recommendation" key={item.id}>
          <p className="menu-recommendation-eyebrow">
            <IconStar size={16} stroke={1.75} aria-hidden />
            Empfehlung des Hauses
          </p>
          <div className="menu-recommendation-head">
            <span className="menu-recommendation-name">{item.name}</span>
            <span className="menu-recommendation-price">{item.price}</span>
          </div>
          {item.description && (
            <p className="menu-recommendation-desc">{item.description}</p>
          )}
          {(item.tags.length > 0 || item.allergens.length > 0) && (
            <p className="menu-recommendation-meta">
              {item.tags.map((tag) => (
                <span className="menu-tag" key={tag}>
                  {tag}
                </span>
              ))}
              {item.allergens.length > 0 && (
                <span className="mi-allergens">({item.allergens.join(", ")})</span>
              )}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
