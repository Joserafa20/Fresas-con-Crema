"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StatusActions } from "../../../../components/orders/admin/StatusActions";
import { PaymentActions } from "../../../../components/orders/admin/PaymentActions";

function formatCop(cents: number): string {
  return `$${cents.toLocaleString("es-CO")}`;
}

type OrderStatus = "NUEVO" | "CONFIRMADO" | "EN_PREPARACION" | "LISTO" | "EN_CAMINO" | "ENTREGADO" | "CANCELADO";
type PaymentStatus = "PENDIENTE" | "VERIFICANDO" | "CONFIRMADO" | "RECHAZADO" | "NO_APLICA";

type OrderResponse = {
  id: string;
  code: string;
  status: OrderStatus;
  origin: string;
  deliveryMethod: string;
  customerName: string;
  customerPhone: string;
  address?: string | null;
  barrio?: string | null;
  reference?: string | null;
  notes?: string | null;
  totalCents: number;
  items: {
    id: string;
    productName: string;
    variantName: string;
    priceAtOrder: number;
    quantity: number;
    toppings: { toppingName: string; priceAtOrder: number }[];
  }[];
  payment?: { method: string; status: PaymentStatus } | null;
  statusHistory: {
    id: string;
    fromStatus: string;
    toStatus: string;
    note?: string | null;
    createdAt: string | Date;
  }[];
  createdAt: string | Date;
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

const STATUS_LABELS: Record<string, string> = {
  NUEVO: "Nuevo",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  LISTO: "Listo",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
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
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) return <main style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Cargando pedido...</main>;
  if (error) return <main style={{ padding: "2rem", textAlign: "center" }}><p style={{ color: "#e11d48" }}>{error}</p><button onClick={() => router.push("/admin/orders")} style={{ marginTop: 8, padding: "8px 16px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>← Volver</button></main>;
  if (!order) return <main style={{ padding: "2rem", textAlign: "center" }}>Pedido no encontrado</main>;

  const created = new Date(order.createdAt);
  const whatsappPhone = order.customerPhone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/57${whatsappPhone}?text=${encodeURIComponent(`Hola ${order.customerName}, tu pedido ${order.code} está ${STATUS_LABELS[order.status]?.toLowerCase() ?? order.status.toLowerCase()}. ¡Gracias por comprar en MAISON FRAISE! 🍓`)}`;

  return (
    <main style={{ padding: "1rem", maxWidth: 640, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => router.push("/admin/orders")} style={{ fontSize: 13, background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>← Volver</button>
      </div>

      {/* Order code + status */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <h1 style={{ margin: 0, fontFamily: "monospace", fontSize: 24, letterSpacing: 1 }}>{order.code}</h1>
        <span
          style={{
            padding: "4px 12px",
            borderRadius: 12,
            background: STATUS_COLORS[order.status] ?? "#ccc",
            color: "#fff",
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>
      <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 20 }}>
        {created.toLocaleDateString("es-CO")} {created.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })} · {order.origin}
      </div>

      {/* Total */}
      <div style={{ padding: 16, background: "#fff1f2", borderRadius: 12, marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#e11d48" }}>{formatCop(order.totalCents)}</div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>Total del pedido</div>
      </div>

      {/* Actions grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {/* Status actions */}
        <div style={{ padding: 12, background: "#f9fafb", borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, marginBottom: 6, textTransform: "uppercase" }}>Estado</div>
          <StatusActions orderId={order.id} currentStatus={order.status} onStatusChanged={fetchOrder} />
        </div>
        {/* Payment actions */}
        <div style={{ padding: 12, background: "#f9fafb", borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, marginBottom: 6, textTransform: "uppercase" }}>Pago</div>
          <PaymentActions orderId={order.id} paymentStatus={order.payment?.status ?? null} onStatusChanged={fetchOrder} />
        </div>
      </div>

      {/* Customer info */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Cliente</h3>
        <div style={{ padding: 12, background: "#f9fafb", borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{order.customerName}</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>{order.customerPhone}</div>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "#25d366",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              💬 WhatsApp
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
            <div><span style={{ opacity: 0.5 }}>Entrega: </span>{order.deliveryMethod === "pickup" ? "🏪 Recoger en local" : "🚗 Domicilio"}</div>
            {order.address && <div><span style={{ opacity: 0.5 }}>Dirección: </span>{order.address}</div>}
            {order.barrio && <div><span style={{ opacity: 0.5 }}>Barrio: </span>{order.barrio}</div>}
            {order.reference && <div><span style={{ opacity: 0.5 }}>Referencia: </span>{order.reference}</div>}
            <div><span style={{ opacity: 0.5 }}>Pago: </span>{order.payment?.method ?? "—"}</div>
            {order.notes && <div style={{ gridColumn: "span 2" }}><span style={{ opacity: 0.5 }}>Notas: </span>{order.notes}</div>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Items</h3>
        <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
          {order.items.map((item) => {
            const toppingsTotal = item.toppings.reduce((t, tp) => t + tp.priceAtOrder, 0);
            const lineTotal = (item.priceAtOrder + toppingsTotal) * item.quantity;
            return (
              <div key={item.id} style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span><strong>{item.productName}</strong> · {item.variantName} × {item.quantity}</span>
                  <span style={{ fontWeight: 700 }}>{formatCop(lineTotal)}</span>
                </div>
                {item.toppings.length > 0 && (
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>+{item.toppings.map((t) => t.toppingName).join(", ")}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status history */}
      {order.statusHistory.length > 0 && (
        <div>
          <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Historial</h3>
          <div style={{ borderLeft: "2px solid #e2e8f0", paddingLeft: 16 }}>
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
                  <strong>{STATUS_LABELS[h.fromStatus] ?? h.fromStatus}</strong> → <strong>{STATUS_LABELS[h.toStatus] ?? h.toStatus}</strong>
                </div>
                <div style={{ fontSize: 11, opacity: 0.5 }}>
                  {new Date(h.createdAt).toLocaleString("es-CO")}
                  {h.note && ` — ${h.note}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
