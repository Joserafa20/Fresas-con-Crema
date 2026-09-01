"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { formatCop } from "@maison-fraise/shared";
import { StatusTimeline } from "../../../components/orders/tracking/StatusTimeline";
import type { OrderResponse } from "@maison-fraise/shared";

export default function TrackingPage() {
  const params = useParams();
  const code = params.code as string;
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failures, setFailures] = useState(0);

  const fetchOrder = useCallback(async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const res = await fetch(`${base}/api/v1/orders/${code}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Pedido no encontrado");
      const data = await res.json();
      setOrder(data);
      setError(null);
      setFailures(0);
    } catch (err: any) {
      setFailures((f) => f + 1);
      if (failures >= 2) setError("Sin conexión. Verifica tu internet.");
    } finally {
      setLoading(false);
    }
  }, [code, failures]);

  useEffect(() => {
    fetchOrder();
    // Stop polling on terminal status
    if (order?.status === "ENTREGADO" || order?.status === "CANCELADO") return;
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [fetchOrder, order?.status]);

  if (loading) {
    return (
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🍓</div>
        <p style={{ opacity: 0.6 }}>Cargando pedido...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <h2>No se encontró el pedido</h2>
        <p style={{ opacity: 0.6, fontSize: 14 }}>{error}</p>
        <p style={{ fontSize: 13, opacity: 0.5 }}>Código: {code}</p>
      </main>
    );
  }

  if (!order) return null;

  const created = new Date(order.createdAt);

  return (
    <main style={{ padding: "1rem", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>{order.code}</div>
        <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
          {created.toLocaleDateString("es-CO")} · {created.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ padding: "0 8px" }}>
        <StatusTimeline status={order.status} />
      </div>

      {/* Items */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Tu pedido</h3>
        <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
          {order.items.map((item) => (
            <div key={item.id} style={{ padding: "6px 10px", borderBottom: "1px solid #f0f0f0", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
              <span>{item.productName} · {item.variantName} × {item.quantity}</span>
              <span style={{ fontWeight: 600 }}>{formatCop(item.priceAtOrder * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 10px", background: "#fff1f2", borderRadius: 8, marginTop: 6, fontWeight: 700, fontSize: 14, textAlign: "right" }}>
          Total: {formatCop(order.totalCents)}
        </div>
      </div>

      {/* Status info */}
      <div style={{ padding: "10px 12px", background: "#f9fafb", borderRadius: 8, fontSize: 13 }}>
        <div><strong>Entrega:</strong> {order.deliveryMethod === "pickup" ? "Recoger en local" : "Domicilio"}</div>
        {order.deliveryMethod === "delivery" && order.address && (
          <div style={{ marginTop: 2, opacity: 0.7 }}>{order.address}{order.barrio ? `, ${order.barrio}` : ""}</div>
        )}
      </div>

      {failures >= 3 && (
        <div style={{ marginTop: 12, padding: 8, background: "#fef2f2", borderRadius: 8, color: "#e11d48", fontSize: 12, textAlign: "center" }}>
          ⚠ Sin conexión. Se reintentará automáticamente.
        </div>
      )}

      <p style={{ fontSize: 11, opacity: 0.4, marginTop: 16, textAlign: "center" }}>Actualización automática cada 15s</p>
    </main>
  );
}
