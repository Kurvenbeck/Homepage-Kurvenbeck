"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  IconArrowUp,
  IconArrowDown,
  IconTrash,
  IconPlus,
  IconDeviceFloppy,
  IconCheck,
  IconX,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import type { AdminMenu, AdminMenuCategory, AdminMenuItem } from "@/lib/menu";
import {
  createCategory,
  renameCategory,
  deleteCategory,
  moveCategory,
  setCategoryAvailability,
  createItem,
  updateItem,
  deleteItem,
  moveItem,
  type ActionResult,
  type ItemInput,
  type RecipeLineInput,
} from "@/app/admin/actions";
import type { MenuArea } from "@/lib/menuAreas";
import type { Ingredient } from "@/lib/ingredients";
import { MAX_RECIPE_LINES, formatAmount } from "@/lib/ingredients";
import { IngredientsAdmin } from "@/components/admin/IngredientsAdmin";

type Allergen = { code: string; label: string };

const ITEM_TAGS = ["vegetarisch", "vegan", "alkoholfrei"] as const;

/** Normalisiert eine Mengen-Eingabe zum Vergleich (dt. Komma → Zahl). */
function normAmount(s: string): number {
  return Number(s.trim().replace(/\s/g, "").replace(",", "."));
}

/** Rezept-Zeilen mengengleich? Leere Zeilen (ohne Zutat) werden ignoriert. */
function sameRecipe(a: RecipeLineInput[], b: RecipeLineInput[]): boolean {
  const clean = (list: RecipeLineInput[]) =>
    list.filter((l) => l.ingredientId.trim() !== "");
  const ca = clean(a);
  const cb = clean(b);
  if (ca.length !== cb.length) return false;
  return ca.every((l, i) => {
    const o = cb[i];
    return (
      l.ingredientId === o.ingredientId &&
      normAmount(l.amount) === normAmount(o.amount)
    );
  });
}

/** Bezeichnung eines Eintrags je Bereich (nur Copy — Datenmodell ist identisch). */
function itemNoun(area: MenuArea): string {
  return area === "backstube" ? "Backware" : "Gericht";
}

/** Zwei String-Listen mengengleich (Reihenfolge egal)? Für Tags/Allergene. */
function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((v) => set.has(v));
}

/** Deckt sich der bearbeitete Stand mit dem Live-Stand? Steuert den Save-Status. */
function sameItem(a: ItemInput, b: ItemInput): boolean {
  return (
    a.name.trim() === b.name.trim() &&
    a.description.trim() === b.description.trim() &&
    a.price.trim() === b.price.trim() &&
    a.sizeLabel.trim() === b.sizeLabel.trim() &&
    a.size2Label.trim() === b.size2Label.trim() &&
    a.size2Price.trim() === b.size2Price.trim() &&
    a.isAvailable === b.isAvailable &&
    a.isRecommendation === b.isRecommendation &&
    sameSet(a.tags, b.tags) &&
    sameSet(a.allergens, b.allergens) &&
    sameRecipe(a.recipe, b.recipe)
  );
}

export function MenuAdmin({
  menu,
  area,
  ingredients = [],
}: {
  menu: AdminMenu;
  area: MenuArea;
  /** Zutaten-Stammdaten (nur Backstube gepflegt/verwendet). */
  ingredients?: Ingredient[];
}) {
  const [newCategory, setNewCategory] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const noun = itemNoun(area);

  function run(action: () => Promise<ActionResult>) {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="admin">
      <div className="admin-areas">
        <Link
          href="/admin?area=biergarten"
          className={`admin-tab${area === "biergarten" ? " is-active" : ""}`}
          aria-current={area === "biergarten" ? "true" : undefined}
        >
          Biergarten
        </Link>
        <Link
          href="/admin?area=backstube"
          className={`admin-tab${area === "backstube" ? " is-active" : ""}`}
          aria-current={area === "backstube" ? "true" : undefined}
        >
          Backstube
        </Link>
        <button className="admin-tab" type="button" disabled>
          Catering
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {area === "backstube" && <IngredientsAdmin ingredients={ingredients} />}

      {menu.categories.map((category, index) => (
        <CategoryBlock
          key={category.id}
          category={category}
          area={area}
          noun={noun}
          allergens={menu.allergens}
          ingredients={ingredients}
          isFirst={index === 0}
          isLast={index === menu.categories.length - 1}
          disabled={pending}
          onRun={run}
        />
      ))}

      <form
        className="admin-add-category"
        onSubmit={(e) => {
          e.preventDefault();
          const title = newCategory;
          run(async () => {
            const r = await createCategory(area, title);
            if (r.ok) setNewCategory("");
            return r;
          });
        }}
      >
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Neue Kategorie (z. B. Nachtisch)"
          aria-label="Titel der neuen Kategorie"
        />
        <button type="submit" className="btn btn-ghost" disabled={pending}>
          <IconPlus size={18} stroke={1.75} aria-hidden />
          Kategorie
        </button>
      </form>
    </div>
  );
}

function CategoryBlock({
  category,
  area,
  noun,
  allergens,
  ingredients,
  isFirst,
  isLast,
  disabled,
  onRun,
}: {
  category: AdminMenuCategory;
  area: MenuArea;
  noun: string;
  allergens: Allergen[];
  ingredients: Ingredient[];
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
  onRun: (action: () => Promise<ActionResult>) => void;
}) {
  const [title, setTitle] = useState(category.title);

  return (
    <section className={`admin-category${category.isAvailable ? "" : " is-hidden"}`}>
      <header className="admin-category-head">
        <input
          className="admin-category-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title.trim() && title !== category.title) {
              onRun(() => renameCategory(area, category.id, title));
            }
          }}
          aria-label="Kategorie-Titel"
        />
        <div className="admin-actions">
          <button
            type="button"
            className="admin-icon-btn"
            title={
              category.isAvailable
                ? "Kategorie ausblenden (öffentlich nicht mehr sichtbar)"
                : "Kategorie einblenden (öffentlich wieder sichtbar)"
            }
            disabled={disabled}
            onClick={() =>
              onRun(() => setCategoryAvailability(area, category.id, !category.isAvailable))
            }
          >
            {category.isAvailable ? (
              <IconEye size={18} stroke={1.75} aria-hidden />
            ) : (
              <IconEyeOff size={18} stroke={1.75} aria-hidden />
            )}
          </button>
          <button
            type="button"
            className="admin-icon-btn"
            title="Nach oben"
            disabled={disabled || isFirst}
            onClick={() => onRun(() => moveCategory(area, category.id, "up"))}
          >
            <IconArrowUp size={18} stroke={1.75} aria-hidden />
          </button>
          <button
            type="button"
            className="admin-icon-btn"
            title="Nach unten"
            disabled={disabled || isLast}
            onClick={() => onRun(() => moveCategory(area, category.id, "down"))}
          >
            <IconArrowDown size={18} stroke={1.75} aria-hidden />
          </button>
          <button
            type="button"
            className="admin-icon-btn admin-icon-btn--danger"
            title="Kategorie löschen"
            disabled={disabled}
            onClick={() => {
              const n = category.items.length;
              const zusatz =
                n === 0
                  ? "Sie ist leer."
                  : n === 1
                    ? "Dabei wird 1 Eintrag mitgelöscht."
                    : `Dabei werden ${n} Einträge mitgelöscht.`;
              if (
                window.confirm(
                  `Kategorie „${category.title}" wirklich löschen?\n${zusatz}`,
                )
              ) {
                onRun(() => deleteCategory(area, category.id));
              }
            }}
          >
            <IconTrash size={18} stroke={1.75} aria-hidden />
          </button>
        </div>
      </header>

      <div className="admin-items">
        {category.items.map((item, index) => (
          <ItemEditor
            key={item.id}
            item={item}
            area={area}
            noun={noun}
            categoryId={category.id}
            categoryTitle={category.title}
            allergens={allergens}
            ingredients={ingredients}
            isFirst={index === 0}
            isLast={index === category.items.length - 1}
            parentDisabled={disabled}
            onRun={onRun}
          />
        ))}
        {category.items.length === 0 && (
          <p className="admin-empty">Noch keine Einträge in dieser Kategorie.</p>
        )}
      </div>

      <button
        type="button"
        className="btn btn-ghost admin-add-item"
        disabled={disabled}
        onClick={() => onRun(() => createItem(area, category.id))}
      >
        <IconPlus size={18} stroke={1.75} aria-hidden />
        {noun}
      </button>
    </section>
  );
}

function ItemEditor({
  item,
  area,
  noun,
  categoryId,
  categoryTitle,
  allergens,
  ingredients,
  isFirst,
  isLast,
  parentDisabled,
  onRun,
}: {
  item: AdminMenuItem;
  area: MenuArea;
  noun: string;
  categoryId: string;
  categoryTitle: string;
  allergens: Allergen[];
  ingredients: Ingredient[];
  isFirst: boolean;
  isLast: boolean;
  parentDisabled: boolean;
  onRun: (action: () => Promise<ActionResult>) => void;
}) {
  const hasSizes = categoryTitle === "Getränke";
  const live: ItemInput = {
    name: item.name,
    description: item.description ?? "",
    price: item.price,
    sizeLabel: item.sizeLabel,
    size2Label: item.size2Label,
    size2Price: item.size2Price,
    tags: item.tags,
    isAvailable: item.isAvailable,
    isRecommendation: item.isRecommendation,
    allergens: item.allergens,
    recipe: item.recipe.map((r) => ({
      ingredientId: r.ingredientId,
      amount: formatAmount(r.amount),
    })),
  };
  const [form, setForm] = useState<ItemInput>(live);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // „Deckungsgleich mit der Live-Seite?“ — steuert Farbe & Text des Speichern-Buttons.
  const dirty = !sameItem(form, live);

  function toggle(list: string[], value: string): string[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

  // --- Rezept-Zeilen bearbeiten (nur Backstube sichtbar) -------------------
  function setRecipe(recipe: RecipeLineInput[]) {
    setForm({ ...form, recipe });
  }
  function updateRecipeLine(index: number, patch: Partial<RecipeLineInput>) {
    setRecipe(form.recipe.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }
  function addRecipeLine() {
    setRecipe([...form.recipe, { ingredientId: "", amount: "" }]);
  }
  function removeRecipeLine(index: number) {
    setRecipe(form.recipe.filter((_, i) => i !== index));
  }
  const unitFor = (ingredientId: string) =>
    ingredients.find((i) => i.id === ingredientId)?.unit ?? "";

  function save() {
    setError("");
    startTransition(async () => {
      const r = await updateItem(area, item.id, form);
      if (!r.ok) setError(r.error);
      // Bei Erfolg lädt die Seite (revalidate) neu → `item` == `form` → Button wird grün.
    });
  }

  return (
    <div className={`admin-item${form.isAvailable ? "" : " is-hidden"}`}>
      <div className="admin-item-main">
        <div className="field">
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        {!hasSizes && (
          <div className="field admin-price">
            <label>Preis (€)</label>
            <input
              value={form.price}
              inputMode="decimal"
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="12,90"
            />
          </div>
        )}
      </div>
      {hasSizes && (
        <div className="admin-price-sizes">
          <div className="field admin-price">
            <label>Größe 1</label>
            <input
              value={form.sizeLabel}
              onChange={(e) => setForm({ ...form, sizeLabel: e.target.value })}
              placeholder="0,2 l"
            />
          </div>
          <div className="field admin-price">
            <label>Preis Größe 1 (€)</label>
            <input
              value={form.price}
              inputMode="decimal"
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="2,50"
            />
          </div>
          <div className="field admin-price">
            <label>Größe 2 (optional)</label>
            <input
              value={form.size2Label}
              onChange={(e) => setForm({ ...form, size2Label: e.target.value })}
              placeholder="0,4 l"
            />
          </div>
          <div className="field admin-price">
            <label>Preis Größe 2 (€)</label>
            <input
              value={form.size2Price}
              inputMode="decimal"
              onChange={(e) => setForm({ ...form, size2Price: e.target.value })}
              placeholder="4,50"
            />
          </div>
        </div>
      )}

      <div className="field">
        <label>Beschreibung</label>
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="z. B. mit Bergkäse & gerösteten Zwiebeln"
        />
      </div>

      <div className="admin-checks">
        <fieldset>
          <legend>Kennzeichnung</legend>
          {ITEM_TAGS.map((tag) => (
            <label key={tag} className="admin-check">
              <input
                type="checkbox"
                checked={form.tags.includes(tag)}
                onChange={() => setForm({ ...form, tags: toggle(form.tags, tag) })}
              />
              {tag}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Allergene</legend>
          <div className="admin-allergen-grid">
            {allergens.map((a) => (
              <label key={a.code} className="admin-check">
                <input
                  type="checkbox"
                  checked={form.allergens.includes(a.code)}
                  onChange={() =>
                    setForm({ ...form, allergens: toggle(form.allergens, a.code) })
                  }
                />
                {a.code} – {a.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {area === "backstube" && (
        <fieldset className="admin-recipe">
          <legend>Rezept (Zutaten je 1 Stück)</legend>
          {ingredients.length === 0 ? (
            <p className="admin-recipe-hint">
              Lege zuerst oben unter „Zutaten-Stammdaten" deine Zutaten an — dann
              kannst du sie hier auswählen.
            </p>
          ) : (
            <>
              {form.recipe.length > 0 && (
                <ul className="recipe-lines">
                  {form.recipe.map((line, index) => (
                    <li key={index} className="recipe-line">
                      <select
                        className="recipe-ingredient"
                        value={line.ingredientId}
                        onChange={(e) =>
                          updateRecipeLine(index, { ingredientId: e.target.value })
                        }
                        aria-label="Zutat"
                      >
                        <option value="">– Zutat wählen –</option>
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name}
                          </option>
                        ))}
                      </select>
                      <input
                        className="recipe-amount"
                        value={line.amount}
                        inputMode="decimal"
                        onChange={(e) =>
                          updateRecipeLine(index, { amount: e.target.value })
                        }
                        placeholder="Menge"
                        aria-label="Menge"
                      />
                      <span className="recipe-unit">{unitFor(line.ingredientId)}</span>
                      <button
                        type="button"
                        className="admin-icon-btn admin-icon-btn--danger"
                        title="Zutat entfernen"
                        onClick={() => removeRecipeLine(index)}
                      >
                        <IconX size={16} stroke={1.75} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {form.recipe.length < MAX_RECIPE_LINES && (
                <button
                  type="button"
                  className="btn btn-ghost recipe-add"
                  onClick={addRecipeLine}
                >
                  <IconPlus size={16} stroke={1.75} aria-hidden />
                  Zutat hinzufügen
                </button>
              )}
            </>
          )}
        </fieldset>
      )}

      <div className="admin-item-foot">
        <div className="admin-item-flags">
          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
            />
            Verfügbar (öffentlich sichtbar)
          </label>
          <label className="admin-check" title="Wird oben hervorgehoben und steht nicht in der normalen Liste.">
            <input
              type="checkbox"
              checked={form.isRecommendation}
              onChange={(e) =>
                setForm({ ...form, isRecommendation: e.target.checked })
              }
            />
            Empfehlung des Hauses
          </label>
        </div>

        <div className="admin-actions">
          <button
            type="button"
            className="admin-icon-btn"
            title="Nach oben"
            disabled={parentDisabled || pending || isFirst}
            onClick={() => onRun(() => moveItem(area, item.id, categoryId, "up"))}
          >
            <IconArrowUp size={18} stroke={1.75} aria-hidden />
          </button>
          <button
            type="button"
            className="admin-icon-btn"
            title="Nach unten"
            disabled={parentDisabled || pending || isLast}
            onClick={() => onRun(() => moveItem(area, item.id, categoryId, "down"))}
          >
            <IconArrowDown size={18} stroke={1.75} aria-hidden />
          </button>
          <button
            type="button"
            className="admin-icon-btn admin-icon-btn--danger"
            title={`${noun} löschen`}
            disabled={parentDisabled || pending}
            onClick={() => {
              if (window.confirm(`${noun} „${item.name}" löschen?`)) {
                onRun(() => deleteItem(area, item.id));
              }
            }}
          >
            <IconTrash size={18} stroke={1.75} aria-hidden />
          </button>
          <button
            type="button"
            className={`btn admin-save ${dirty ? "admin-save--dirty" : "admin-save--clean"}`}
            disabled={pending || !dirty}
            onClick={save}
            title={
              dirty
                ? "Änderung noch nicht gespeichert"
                : "Deckungsgleich mit der Live-Seite"
            }
          >
            {dirty ? (
              <IconDeviceFloppy size={18} stroke={1.75} aria-hidden />
            ) : (
              <IconCheck size={18} stroke={1.75} aria-hidden />
            )}
            {pending ? "Speichert …" : dirty ? "Speichern" : "Gespeichert"}
          </button>
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}
