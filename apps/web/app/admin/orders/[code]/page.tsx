"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatCop } from "@maison-fraise/shared";
import { StatusActions } from "../../../../components/orders/admin/StatusActions";
import { PaymentActions } from "../../../../components/orders/admin/PaymentActions";
import type { OrderResponse } from "@maison-fraise/shared";

const STATUS_COLORS: Record<string, string> = {
  NUEVO: "#f59e0b",
  CONFIRMADO: "#3b82f6",
  EN_PREPARACION: "#8b5cf6",
  LISTO: "#10b981",
  EN_CAMINO: "#06b6d4",
  ENTREGADO: "#22c55e",
  CANCELADO: "#ef4444",
};

export default function AdminOrderDetailPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const res = await fetch(`${base}/api/v1/orders/${params.code}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Pedido no encontrado");
      const data = await res.json();
      setOrder(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params.code]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) return <main style={{ padding: "2rem", textAlign: "center" }}>Cargando...</main>;
  if (error) return <main style={{ padding: "2rem", textAlign: "center" }}><p style={{ color: "#e11d48" }}>{error}</p></main>;
  if (!order) return <main style={{ padding: "2rem", textAlign: "center" }}>Pedido no encontrado</main>;

  const created = new Date(order.createdAt);

  return (
    <main style={{ padding: "1rem", maxWidth: 640, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => router.push("/admin/orders")} style={{ fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>← Volver</button>
        <h1 style={{ margin: 0, fontFamily: "monospace", fontSize: 20 }}>{order.code}</h1>
        <span
          style={{
            padding: "2px 10px",
            borderRadius: 12,
            background: STATUS_COLORS[order.status] ?? "#ccc",
            color: "#fff",
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          {order.status.replace("_", " ")}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20, padding: 12, background: "#f9fafb", borderRadius: 8 }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>Estado del pedido</div>
          <StatusActions orderId={order.id} currentStatus={order.status} onStatusChanged={fetchOrder} />
        </div>
        <div>
          <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>Pago</div>
          <PaymentActions orderId={order.id} paymentStatus={order.payment?.status ?? null} onStatusChanged={fetchOrder} />
        </div>
      </div>

      {/* Order info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <InfoBox label="Cliente" value={order.customerName} />
        <InfoBox label="Teléfono" value={order.customerPhone} />
        <InfoBox label="Entrega" value={order.deliveryMethod === "pickup" ? "Recoger en local" : "Domicilio"} />
        <InfoBox label="Origen" value={order.origin} />
        {order.address && <InfoBox label="Dirección" value={order.address} />}
        {order.barrio && <InfoBox label="Barrio" value={order.barrio} />}
        {order.reference && <InfoBox label="Referencia" value={order.reference} />}
        {order.notes && <InfoBox label="Notas" value={order.notes} />}
        <InfoBox label="Pago" value={order.payment?.method ?? "—"} />
        <InfoBox label="Fecha" value={`${created.toLocaleDateString("es-CO")} ${created.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`} />
      </div>

      {/* Items */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 8px" }}>Items</h3>
        <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
          {order.items.map((item) => {
            const toppingsTotal = item.toppings.reduce((t, tp) => t + tp.priceAtOrder, 0);
            const lineTotal = (item.priceAtOrder + toppingsTotal) * item.quantity;
            return (
              <div key={item.id} style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span><strong>{item.productName}</strong> · {item.variantName} × {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>{formatCop(lineTotal)}</span>
                </div>
                {item.toppings.length > 0 && (
                  <div style={{ fontSize: 11, opacity: 0.6 }}>+{item.toppings.map((t) => t.toppingName).join(", ")}</div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ padding: "10px 12px", background: "#fff1f2", borderRadius: 8, marginTop: 8, fontWeight: 700, fontSize: 15, textAlign: "right" }}>
          Total: {formatCop(order.totalCents)}
        </div>
      </div>

      {/* Status history */}
      <div>
        <h3 style={{ margin: "0 0 8px" }}>Historial</h3>
        <div style={{ borderLeft: "2px solid #eee", paddingLeft: 16 }}>
          {order.statusHistory.map((h) => (
            <div key={h.id} style={{ marginBottom: 12, position: "relative" }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: STATUS_COLORS[h.toStatus] ?? "#ccc",
                  position: "absolute",
                  left: -22,
                  top: 4,
                }}
              />
              <div style={{ fontSize: 13 }}>
                <strong>{h.fromStatus}</strong> → <strong>{h.toStatus}</strong>
              </div>
              <div style={{ fontSize: 11, opacity: 0.5 }}>
                {new Date(h.createdAt).toLocaleString("es-CO")}
                {h.note && ` — ${h.note}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "6px 10px", background: "#f9fafb", borderRadius: 6 }}>
      <div style={{ fontSize: 11, opacity: 0.5 }}>{label}</div>
      <div style={{ fontSize: 13 }}>{value}</div>
    </div>
  );
}
