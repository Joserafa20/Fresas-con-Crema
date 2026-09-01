"use client";
import { useState } from "react";
import Image from "next/image";

type PaymentMethod = "EFECTIVO" | "NEQUI" | "DAVIPLATA" | "LLAVE_BRE_B";

interface PaymentFormProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const METHODS: { value: PaymentMethod; label: string; note: string; icon: string; qr?: string; instructions: string[] }[] = [
  {
    value: "EFECTIVO",
    label: "Efectivo",
    note: "Pagás al recoger",
    icon: "💵",
    instructions: ["Pagás cuando recibís tu pedido", "Efectivo o transferencia"],
  },
  {
    value: "NEQUI",
    label: "Nequi",
    note: "Escaneá el QR",
    icon: "📱",
    qr: "/payments/nequi.jpg",
    instructions: [
      "Escaneá el QR con tu app Nequi",
      "Enviá el comprobante por WhatsApp",
      "Tu pedido se confirma al verificar el pago",
    ],
  },
  {
    value: "DAVIPLATA",
    label: "Daviplata",
    note: "Escaneá el QR",
    icon: "📱",
    qr: "/payments/daviplata.jpg",
    instructions: [
      "Escaneá el QR con tu app Daviplata",
      "Enviá el comprobante por WhatsApp",
      "Tu pedido se confirma al verificar el pago",
    ],
  },
  {
    value: "LLAVE_BRE_B",
    label: "Llave BRE-B",
    note: "Escaneá el QR",
    icon: "📱",
    qr: "/payments/bre-b.jpg",
    instructions: [
      "Escaneá el QR con tu app BRE-B",
      "Enviá el comprobante por WhatsApp",
      "Tu pedido se confirma al verificar el pago",
    ],
  },
];

export function PaymentForm({ value, onChange }: PaymentFormProps) {
  const [showQR, setShowQR] = useState(false);
  const selected = METHODS.find((m) => m.value === value);
  const hasQR = selected?.qr;

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
          <input type="radio" name="payment" checked={value === m.value} onChange={() => { onChange(m.value); setShowQR(false); }} style={{ accentColor: "#e11d48" }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{m.icon} {m.label}</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>{m.note}</div>
          </div>
        </label>
      ))}

      {/* QR Display */}
      {hasQR && (
        <div style={{ marginTop: 8, padding: 16, background: "#fff1f2", borderRadius: 12, textAlign: "center" }}>
          {!showQR ? (
            <button
              onClick={() => setShowQR(true)}
              style={{
                padding: "12px 24px",
                borderRadius: 8,
                border: "2px solid #e11d48",
                background: "#fff",
                color: "#e11d48",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                width: "100%",
              }}
            >
              📱 Ver QR de {selected?.label}
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative", width: 220, height: 220, background: "#fff", borderRadius: 12, overflow: "hidden", border: "2px solid #e11d48" }}>
                <Image
                  src={selected.qr!}
                  alt={`QR ${selected.label}`}
                  fill
                  style={{ objectFit: "contain", padding: 8 }}
                  sizes="220px"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, textAlign: "left" }}>
                {selected.instructions.map((inst, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: "#e11d48", fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>
                    <span>{inst}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowQR(false)}
                style={{
                  marginTop: 4,
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                  opacity: 0.7,
                }}
              >
                Ocultar QR
              </button>
            </div>
          )}
        </div>
      )}

      {/* Efectivo info */}
      {value === "EFECTIVO" && (
        <div style={{ marginTop: 8, padding: 16, background: "#f0fdf4", borderRadius: 12, fontSize: 13 }}>
          <div style={{ fontWeight: 600, marginBottom: 6, color: "#16a34a" }}>💵 Pago en efectivo</div>
          <div>Pagás cuando recibís tu pedido en el local o cuando te lo lleven a domicilio.</div>
        </div>
      )}
    </div>
  );
}
