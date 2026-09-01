"use client";
import Link from "next/link";

function formatCop(cents: number): string {
  return `$${cents.toLocaleString("es-CO")}`;
}

type OrderListItem = {
  code: string;
  status: string;
  customerName: string;
  customerPhone: string;
  totalCents: number;
  createdAt: string | Date;
  payment?: { status: string } | null;
};

const STATUS_COLORS: Record<string, string> = {
  NUEVO: "#f59e0b",
  CONFIRMADO: "#3b82f6",
  EN_PREPARACION: "#8b5cf6",
  LISTO: "#10b981",
  EN_CAMINO: "#06b6d4",
  ENTREGADO: "#22c55e",
  CANCELADO: "#ef4444",
};

const PAYMENT_COLORS: Record<string, string> = {
  PENDIENTE: "#f59e0b",
  VERIFICANDO: "#3b82f6",
  CONFIRMADO: "#22c55e",
  RECHAZADO: "#ef4444",
  NO_APLICA: "#6b7280",
};

export function OrderRow({ order }: { order: OrderListItem }) {
  const created = new Date(order.createdAt);
  const timeStr = created.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  const dateStr = created.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" });

  return (
    <Link
      href={`/admin/orders/${order.code}`}
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto auto auto",
        gap: "8px 12px",
        alignItems: "center",
        padding: "10px 14px",
        borderBottom: "1px solid #eee",
        textDecoration: "none",
        color: "inherit",
        background: order.status === "NUEVO" ? "#fffbeb" : "#fff",
        fontSize: 13,
      }}
    >
      {/* Status dot */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: STATUS_COLORS[order.status] ?? "#ccc",
        }}
      />

      {/* Code + customer */}
      <div>
        <div style={{ fontWeight: 600, fontFamily: "monospace" }}>{order.code}</div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>{order.customerName} · {order.customerPhone}</div>
      </div>

      {/* Status badge */}
      <span
        style={{
          padding: "2px 8px",
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600,
          background: STATUS_COLORS[order.status] ?? "#eee",
          color: order.status === "CANCELADO" ? "#fff" : "#fff",
        }}
      >
        {order.status.replace("_", " ")}
      </span>

      {/* Payment */}
      <span
        style={{
          padding: "2px 8px",
          borderRadius: 12,
          fontSize: 11,
          background: order.payment?.status ? (PAYMENT_COLORS[order.payment.status] ?? "#eee") : "#eee",
          color: "#fff",
        }}
      >
        {order.payment?.status ?? "—"}
      </span>

      {/* Total + time */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 600 }}>{formatCop(order.totalCents)}</div>
        <div style={{ fontSize: 11, opacity: 0.5 }}>{dateStr} {timeStr}</div>
      </div>
    </Link>
  );
}
