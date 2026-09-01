"use client";
export function VariantPicker({ variants, value, onChange }: { variants: any[]; value: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {variants.map((v) => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          style={{
            padding: "8px 14px",
            borderRadius: 20,
            border: value === v.id ? "2px solid #e11d48" : "1px solid #ddd",
            background: value === v.id ? "#ffe4e6" : "#fff",
            cursor: "pointer",
          }}
        >
          {v.name} — {(v.priceCents / 100).toFixed(2)} COP
        </button>
      ))}
    </div>
  );
}
