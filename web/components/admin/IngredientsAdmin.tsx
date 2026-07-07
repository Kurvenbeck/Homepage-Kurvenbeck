"use client";

import { useState, useTransition } from "react";
import {
  IconPlus,
  IconTrash,
  IconDeviceFloppy,
  IconCheck,
} from "@tabler/icons-react";
import type { Ingredient } from "@/lib/ingredients";
import { INGREDIENT_UNITS } from "@/lib/ingredients";
import {
  createIngredient,
  updateIngredient,
  deleteIngredient,
  type ActionResult,
} from "@/app/admin/ingredient-actions";

/**
 * Zutaten-Stammdaten der Backstube: die zentrale Liste, aus der sich die
 * Rezept-Dropdowns speisen. Einmal angelegt (Name + feste Einheit), überall
 * wiederverwendbar — so bleibt „Wasser" eindeutig.
 */
export function IngredientsAdmin({ ingredients }: { ingredients: Ingredient[] }) {
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult>, onOk?: () => void) {
    setError("");
    startTransition(async () => {
      const r = await action();
      if (r.ok) onOk?.();
      else setError(r.error);
    });
  }

  return (
    <section className="admin-ingredients">
      <header className="admin-ingredients-head">
        <h3>Zutaten-Stammdaten</h3>
        <p className="admin-ingredients-hint">
          Lege deine Zutaten einmal an (Name + Einheit). Danach kannst du sie bei
          jeder Backware im Rezept auswählen — der Bedarf wird auf der Backliste
          automatisch hochgerechnet.
        </p>
      </header>

      {error && <p className="admin-error">{error}</p>}

      {ingredients.length > 0 && (
        <ul className="ingredient-list">
          {ingredients.map((ing) => (
            <IngredientRow
              key={ing.id}
              ingredient={ing}
              disabled={pending}
              onRun={run}
            />
          ))}
        </ul>
      )}

      <form
        className="ingredient-add"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => createIngredient(newName, newUnit),
            () => {
              setNewName("");
              setNewUnit("");
            },
          );
        }}
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Neue Zutat (z. B. Mehl)"
          aria-label="Name der neuen Zutat"
        />
        <input
          type="text"
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          placeholder="Einheit"
          list="ingredient-units"
          aria-label="Einheit der neuen Zutat"
          className="ingredient-unit-input"
        />
        <datalist id="ingredient-units">
          {INGREDIENT_UNITS.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
        <button type="submit" className="btn btn-ghost" disabled={pending}>
          <IconPlus size={18} stroke={1.75} aria-hidden />
          Zutat
        </button>
      </form>
    </section>
  );
}

function IngredientRow({
  ingredient,
  disabled,
  onRun,
}: {
  ingredient: Ingredient;
  disabled: boolean;
  onRun: (action: () => Promise<ActionResult>, onOk?: () => void) => void;
}) {
  const [name, setName] = useState(ingredient.name);
  const [unit, setUnit] = useState(ingredient.unit);

  const dirty = name.trim() !== ingredient.name || unit.trim() !== ingredient.unit;

  return (
    <li className="ingredient-item">
      <input
        className="ingredient-name-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Zutaten-Name"
      />
      <input
        className="ingredient-unit-input"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        list="ingredient-units"
        aria-label="Einheit"
      />
      <button
        type="button"
        className={`btn admin-save ${dirty ? "admin-save--dirty" : "admin-save--clean"}`}
        disabled={disabled || !dirty}
        onClick={() => onRun(() => updateIngredient(ingredient.id, name, unit))}
        title={dirty ? "Änderung noch nicht gespeichert" : "Gespeichert"}
      >
        {dirty ? (
          <IconDeviceFloppy size={16} stroke={1.75} aria-hidden />
        ) : (
          <IconCheck size={16} stroke={1.75} aria-hidden />
        )}
        {dirty ? "Speichern" : "Gespeichert"}
      </button>
      <button
        type="button"
        className="admin-icon-btn admin-icon-btn--danger"
        title="Zutat löschen"
        disabled={disabled}
        onClick={() => {
          if (window.confirm(`Zutat „${ingredient.name}" löschen?`)) {
            onRun(() => deleteIngredient(ingredient.id));
          }
        }}
      >
        <IconTrash size={16} stroke={1.75} aria-hidden />
      </button>
    </li>
  );
}
