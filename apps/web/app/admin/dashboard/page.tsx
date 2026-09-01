"use client";
import { useState, useEffect } from "react";

function formatCop(cents: number): string {
  return `$${cents.toLocaleString("es-CO")}`;
}

type Stats = {
  totals: { orders: number; revenue: number; avgOrderValue: number };
  today: { orders: number; revenue: number };
  week: { orders: number; revenue: number };
  month: { orders: number; revenue: number };
  topProducts: { name: string; quantity: number; revenue: number }[];
  byPayment: { method: string; count: number; revenue: number }[];
  byDelivery: { method: string; count: number; revenue: number }[];
  byStatus: { status: string; count: number }[];
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
  NUEVO: "Nuevos",
  CONFIRMADO: "Confirmados",
  EN_PREPARACION: "Preparando",
  LISTO: "Listos",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregados",
  CANCELADO: "Cancelados",
};

const PAYMENT_LABELS: Record<string, string> = {
  EFECTIVO: "💵 Efectivo",
  NEQUI: "📱 Nequi",
  DAVIPLATA: "📱 Daviplata",
  LLAVE_BRE_B: "📱 BRE-B",
};

const DELIVERY_LABELS: Record<string, string> = {
  pickup: "🏪 Recoger en local",
  delivery: "🚗 Domicilio",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    fetch(`${base}/api/v1/orders/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Cargando estadísticas...</main>;
  if (!stats) return <main style={{ padding: "2rem", textAlign: "center", color: "#e11d48" }}>Error al cargar estadísticas</main>;

  return (
    <main>
      <h1 style={{ margin: "0 0 20px", fontSize: 20 }}>Dashboard de Ventas</h1>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard title="Hoy" value={formatCop(stats.today.revenue)} subtitle={`${stats.today.orders} pedidos`} color="#e11d48" />
        <StatCard title="Esta semana" value={formatCop(stats.week.revenue)} subtitle={`${stats.week.orders} pedidos`} color="#3b82f6" />
        <StatCard title="Este mes" value={formatCop(stats.month.revenue)} subtitle={`${stats.month.orders} pedidos`} color="#8b5cf6" />
        <StatCard title="Total" value={formatCop(stats.totals.revenue)} subtitle={`${stats.totals.orders} pedidos · Promedio ${formatCop(stats.totals.avgOrderValue)}`} color="#10b981" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Top products */}
        <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>🍓 Productos más vendidos</h3>
          {stats.topProducts.length === 0 ? (
            <p style={{ opacity: 0.5, fontSize: 13 }}>Sin ventas aún</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stats.topProducts.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 11, opacity: 0.5 }}>{p.quantity} vendidos</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#e11d48" }}>{formatCop(p.revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By payment method */}
        <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>💳 Por método de pago</h3>
          {stats.byPayment.length === 0 ? (
            <p style={{ opacity: 0.5, fontSize: 13 }}>Sin ventas aún</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stats.byPayment.map((p) => (
                <div key={p.method} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 13 }}>{PAYMENT_LABELS[p.method] ?? p.method}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{formatCop(p.revenue)}</div>
                    <div style={{ fontSize: 11, opacity: 0.5 }}>{p.count} pedidos</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* By delivery method */}
        <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>🚗 Por tipo de entrega</h3>
          {stats.byDelivery.length === 0 ? (
            <p style={{ opacity: 0.5, fontSize: 13 }}>Sin ventas aún</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stats.byDelivery.map((d) => (
                <div key={d.method} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 13 }}>{DELIVERY_LABELS[d.method] ?? d.method}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{formatCop(d.revenue)}</div>
                    <div style={{ fontSize: 11, opacity: 0.5 }}>{d.count} pedidos</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By status */}
        <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>📊 Por estado</h3>
          {stats.byStatus.length === 0 ? (
            <p style={{ opacity: 0.5, fontSize: 13 }}>Sin ventas aún</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stats.byStatus.map((s) => (
                <div key={s.status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[s.status] ?? "#ccc" }} />
                    <span style={{ fontSize: 13 }}>{STATUS_LABELS[s.status] ?? s.status}</span>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p style={{ fontSize: 11, opacity: 0.4, marginTop: 20, textAlign: "center" }}>Datos actualizados al cargar la página</p>
    </main>
  );
}

function StatCard({ title, value, subtitle, color }: { title: string; value: string; subtitle: string; color: string }) {
  return (
    <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: `2px solid ${color}20`, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11, opacity: 0.5 }}>{subtitle}</div>
    </div>
  );
}
