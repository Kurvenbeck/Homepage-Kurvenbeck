/**
 * Beschrifteter Bild-Platzhalter (echte Fotos laut README §10 noch ausstehend).
 * Beim Vorliegen echter Fotos durch next/image ersetzen (Hero mit priority).
 */
export function Placeholder({
  label,
  className = "",
  dark = false,
  style,
}: {
  label: string;
  className?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`ph${dark ? " ph--dark" : ""}${className ? " " + className : ""}`}
      data-label={label}
      role="img"
      aria-label={label}
      style={style}
    />
  );
}
