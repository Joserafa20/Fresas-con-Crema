"use client";
import type { OrderStatus } from "@maison-fraise/shared";

const TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: "NUEVO", label: "Recibido" },
  { status: "CONFIRMADO", label: "Confirmado" },
  { status: "EN_PREPARACION", label: "Preparando" },
  { status: "LISTO", label: "Listo" },
  { status: "EN_CAMINO", label: "En camino" },
  { status: "ENTREGADO", label: "Entregado" },
];

const STATUS_INDEX: Record<string, number> = {};
TIMELINE.forEach((item, i) => { STATUS_INDEX[item.status] = i; });

const COLOR_MAP: Record<string, string> = {
  NUEVO: "#f59e0b",
  CONFIRMADO: "#3b82f6",
  EN_PREPARACION: "#8b5cf6",
  LISTO: "#10b981",
  EN_CAMINO: "#06b6d4",
  ENTREGADO: "#22c55e",
  CANCELADO: "#ef4444",
};

export function StatusTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = STATUS_INDEX[status] ?? -1;
  const isCancelled = status === "CANCELADO";
  const isTerminal = status === "ENTREGADO" || status === "CANCELADO";

  return (
    <div style={{ padding: "16px 0" }}>
      {isCancelled ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>❌</div>
          <div style={{ fontWeight: 600, color: "#ef4444" }}>Pedido cancelado</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {TIMELINE.map((step, i) => {
            const isCompleted = currentIndex >= i;
            const isCurrent = currentIndex === i;
            const color = isCompleted ? COLOR_MAP[step.status] : "#d1d5db";

            return (
              <div key={step.status} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                {/* Vertical line + dot */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 24 }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: color,
                      border: isCurrent ? "3px solid #fff" : "none",
                      boxShadow: isCurrent ? `0 0 0 2px ${color}` : "none",
                    }}
                  />
                  {i < TIMELINE.length - 1 && (
                    <div style={{ width: 2, height: 24, background: isCompleted && currentIndex > i ? color : "#e5e7eb" }} />
                  )}
                </div>

                {/* Label */}
                <div style={{ paddingBottom: 8 }}>
                  <div style={{ fontWeight: isCurrent ? 700 : 400, fontSize: 14, color: isCompleted ? "#111" : "#9ca3af" }}>
                    {step.label}
                  </div>
                  {isCurrent && (
                    <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                      {isTerminal ? "Estado final" : "Estado actual"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
