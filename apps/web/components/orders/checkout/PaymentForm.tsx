"use client";
import type { PaymentMethod } from "@maison-fraise/shared";

interface PaymentFormProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const METHODS: { value: PaymentMethod; label: string; note: string }[] = [
  { value: "EFECTIVO", label: "Efectivo", note: "Pagas al recoger" },
  { value: "NEQUI", label: "Nequi", note: "Envía comprobante" },
  { value: "DAVIPLATA", label: "Daviplata", note: "Envía comprobante" },
  { value: "LLAVE_BRE_B", label: "Llave BRE-B", note: "Envía comprobante" },
];

export function PaymentForm({ value, onChange }: PaymentFormProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <h3 style={{ margin: 0 }}>Método de pago</h3>
      {METHODS.map((m) => (
        <label
          key={m.value}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 8,
            border: value === m.value ? "2px solid #e11d48" : "1px solid #ddd",
            background: value === m.value ? "#ffe4e6" : "#fff",
            cursor: "pointer",
          }}
        >
          <input type="radio" name="payment" checked={value === m.value} onChange={() => onChange(m.value)} style={{ accentColor: "#e11d48" }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>{m.note}</div>
          </div>
        </label>
      ))}
    </div>
  );
}
