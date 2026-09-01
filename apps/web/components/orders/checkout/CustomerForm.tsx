"use client";

export interface CustomerData {
  name: string;
  phone: string;
  address: string;
  barrio: string;
  reference: string;
  notes: string;
  deliveryMethod: "pickup" | "delivery";
}

interface CustomerFormProps {
  value: CustomerData;
  onChange: (data: CustomerData) => void;
  errors?: Partial<Record<keyof CustomerData, string>>;
}

export function CustomerForm({ value, onChange, errors }: CustomerFormProps) {
  const set = (field: keyof CustomerData, val: string) => onChange({ ...value, [field]: val });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h3 style={{ margin: 0 }}>Tus datos</h3>

      {/* Delivery method toggle */}
      <div style={{ display: "flex", gap: 8 }}>
        {(["pickup", "delivery"] as const).map((m) => (
          <button
            key={m}
            onClick={() => set("deliveryMethod", m)}
            style={{
              flex: 1,
              padding: "10px 8px",
              borderRadius: 8,
              border: value.deliveryMethod === m ? "2px solid #e11d48" : "1px solid #ddd",
              background: value.deliveryMethod === m ? "#ffe4e6" : "#fff",
              cursor: "pointer",
              fontWeight: value.deliveryMethod === m ? 600 : 400,
              fontSize: 13,
            }}
          >
            {m === "pickup" ? "Recoger en local" : "Domicilio"}
          </button>
        ))}
      </div>

      <Field label="Nombre" value={value.name} onChange={(v) => set("name", v)} error={errors?.name} placeholder="Tu nombre" />
      <Field label="Teléfono" value={value.phone} onChange={(v) => set("phone", v)} error={errors?.phone} placeholder="300 123 4567" type="tel" />

      {value.deliveryMethod === "delivery" && (
        <>
          <Field label="Dirección" value={value.address} onChange={(v) => set("address", v)} error={errors?.address} placeholder="Calle 123 #45-67" />
          <Field label="Barrio" value={value.barrio} onChange={(v) => set("barrio", v)} error={errors?.barrio} placeholder="Centro" />
          <Field label="Referencia" value={value.reference} onChange={(v) => set("reference", v)} placeholder="Frente a la plaza" />
        </>
      )}

      <Field label="Notas (opcional)" value={value.notes} onChange={(v) => set("notes", v)} placeholder="Instrucciones especiales..." multiline />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: error ? "2px solid #e11d48" : "1px solid #ddd",
    fontSize: 14,
    boxSizing: "border-box",
    resize: multiline ? ("vertical" as const) : undefined,
  };

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} rows={2} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
      )}
      {error && <span style={{ fontSize: 12, color: "#e11d48" }}>{error}</span>}
    </div>
  );
}
