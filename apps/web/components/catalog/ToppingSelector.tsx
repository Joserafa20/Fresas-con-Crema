"use client";
export function ToppingSelector({
  toppings,
  selected,
  onToggle,
}: {
  toppings: any[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {toppings.map((t) => {
        const name = t.topping?.name ?? t.name;
        const id = t.topping?.id ?? t.id ?? name;
        const checked = selected.includes(id);
        return (
          <label key={id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => onToggle(id)} />
            <span>{name}</span>
            <small style={{ opacity: 0.6 }}>+15.00 COP</small>
          </label>
        );
      })}
    </div>
  );
}
