"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { OrderRow } from "../../../components/orders/admin/OrderRow";
import { SoundAlert } from "../../../components/orders/admin/SoundAlert";

type StatusFilter = "" | "NUEVO" | "CONFIRMADO" | "EN_PREPARACION" | "LISTO" | "EN_CAMINO" | "ENTREGADO" | "CANCELADO";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "NUEVO", label: "Nuevos" },
  { value: "CONFIRMADO", label: "Confirmados" },
  { value: "EN_PREPARACION", label: "Preparando" },
  { value: "LISTO", label: "Listos" },
  { value: "EN_CAMINO", label: "En camino" },
  { value: "ENTREGADO", label: "Entregados" },
  { value: "CANCELADO", label: "Cancelados" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const prevCountRef = useRef(0);

  const fetchOrders = useCallback(async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const url = filter ? `${base}/api/v1/orders?status=${filter}` : `${base}/api/v1/orders`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Error al cargar pedidos");
      const data = await res.json();

      // Detect new NUEVO orders
      if (prevCountRef.current > 0 && data.length > prevCountRef.current) {
        const newOnes = data.filter((o: any) => o.status === "NUEVO" && !orders.some((existing) => existing.code === o.code));
        if (newOnes.length > 0) setNewOrderAlert(true);
      }
      prevCountRef.current = data.length;

      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [filter, orders]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Reset alert after sound plays
  useEffect(() => {
    if (newOrderAlert) {
      const timer = setTimeout(() => setNewOrderAlert(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [newOrderAlert]);

  const nuevoCount = orders.filter((o) => o.status === "NUEVO").length;

  return (
    <main style={{ padding: "1rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Pedidos</h1>
          {nuevoCount > 0 && (
            <span style={{ padding: "2px 10px", borderRadius: 12, background: "#e11d48", color: "#fff", fontWeight: 700, fontSize: 13 }}>
              {nuevoCount} nuevos
            </span>
          )}
        </div>
        <SoundAlert trigger={newOrderAlert} />
      </div>

      {/* Status filter */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", margin: "12px 0" }}>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            style={{
              padding: "4px 12px",
              borderRadius: 16,
              border: filter === opt.value ? "2px solid #e11d48" : "1px solid #ddd",
              background: filter === opt.value ? "#ffe4e6" : "#fff",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: filter === opt.value ? 600 : 400,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading && <p style={{ opacity: 0.6, fontSize: 13 }}>Cargando...</p>}
      {error && <p style={{ color: "#e11d48", fontSize: 13 }}>{error}</p>}
      {!loading && orders.length === 0 && <p style={{ opacity: 0.6, fontSize: 14 }}>No hay pedidos{filter ? ` con estado "${filter}"` : ""}.</p>}

      <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden", marginTop: 8 }}>
        {orders.map((order) => (
          <OrderRow key={order.code} order={order} />
        ))}
      </div>

      <p style={{ fontSize: 11, opacity: 0.4, marginTop: 12, textAlign: "center" }}>Actualización automática cada 30s</p>
    </main>
  );
}
