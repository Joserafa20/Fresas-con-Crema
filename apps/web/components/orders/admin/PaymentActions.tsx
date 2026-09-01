"use client";
import { useState } from "react";
import type { PaymentStatus } from "@maison-fraise/shared";

interface PaymentActionsProps {
  orderId: string;
  paymentStatus: PaymentStatus | null;
  onStatusChanged: () => void;
}

const PAYMENT_LABELS: Record<string, string> = {
  VERIFICANDO: "Marcar verificando",
  CONFIRMADO: "Confirmar pago",
  RECHAZADO: "Rechazar pago",
};

export function PaymentActions({ orderId, paymentStatus, onStatusChanged }: PaymentActionsProps) {
  const [loading, setLoading] = useState(false);

  if (!paymentStatus) return null;
  if (paymentStatus === "CONFIRMADO" || paymentStatus === "RECHAZADO" || paymentStatus === "NO_APLICA") {
    return (
      <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, background: paymentStatus === "CONFIRMADO" ? "#dcfce7" : paymentStatus === "RECHAZADO" ? "#fee2e2" : "#f3f4f6", fontWeight: 600 }}>
        {paymentStatus === "CONFIRMADO" ? "✓ Pago confirmado" : paymentStatus === "RECHAZADO" ? "✗ Pago rechazado" : "Sin verificación"}
      </span>
    );
  }

  const handleAction = async (status: PaymentStatus) => {
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      await fetch(`${base}/api/v1/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onStatusChanged();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const actions: { status: PaymentStatus; label: string; color: string }[] = [];
  if (paymentStatus === "PENDIENTE") {
    actions.push({ status: "VERIFICANDO", label: "Verificar", color: "#3b82f6" });
  }
  if (paymentStatus === "VERIFICANDO") {
    actions.push({ status: "CONFIRMADO", label: "Confirmar", color: "#22c55e" });
    actions.push({ status: "RECHAZADO", label: "Rechazar", color: "#ef4444" });
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {actions.map((a) => (
        <button
          key={a.status}
          onClick={() => handleAction(a.status)}
          disabled={loading}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "none",
            background: a.color,
            color: "#fff",
            fontWeight: 600,
            fontSize: 11,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
