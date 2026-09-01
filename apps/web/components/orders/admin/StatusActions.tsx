"use client";
import { useState } from "react";
import type { OrderStatus } from "@maison-fraise/shared";

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NUEVO: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["LISTO", "CANCELADO"],
  LISTO: ["EN_CAMINO", "CANCELADO"],
  EN_CAMINO: ["ENTREGADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

const LABELS: Record<string, string> = {
  CONFIRMADO: "Confirmar",
  EN_PREPARACION: "Preparando",
  LISTO: "Listo",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelar",
};

interface StatusActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChanged: () => void;
}

export function StatusActions({ orderId, currentStatus, onStatusChanged }: StatusActionsProps) {
  const [loading, setLoading] = useState(false);
  const transitions = ORDER_TRANSITIONS[currentStatus] ?? [];

  if (transitions.length === 0) return <span style={{ fontSize: 12, opacity: 0.5 }}>Estado final</span>;

  const handleTransition = async (status: OrderStatus) => {
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      await fetch(`${base}/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onStatusChanged();
    } catch {
      // ignore — polling will refresh
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {transitions.map((s) => (
        <button
          key={s}
          onClick={() => handleTransition(s)}
          disabled={loading}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            background: s === "CANCELADO" ? "#fee2e2" : "#e11d48",
            color: s === "CANCELADO" ? "#e11d48" : "#fff",
            fontWeight: 600,
            fontSize: 12,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {LABELS[s] ?? s}
        </button>
      ))}
    </div>
  );
}
