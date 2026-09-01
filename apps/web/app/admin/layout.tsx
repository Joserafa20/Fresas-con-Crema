"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin/orders", label: "📋 Pedidos", match: "/admin/orders" },
  { href: "/admin/catalog", label: "🍓 Catálogo", match: "/admin/catalog" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Top bar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "10px 16px",
          background: "#1e293b",
          color: "#fff",
          borderBottom: "2px solid #e11d48",
        }}
      >
        <Link href="/admin/orders" style={{ fontWeight: 700, fontSize: 16, color: "#fff", textDecoration: "none", marginRight: 16 }}>
          🍓 MAISON FRAISE
        </Link>
        {NAV.map((item) => {
          const active = pathname.startsWith(item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: active ? "#e11d48" : "transparent",
                color: "#fff",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
              }}
            >
              {item.label}
            </Link>
          );
        })}
        <div style={{ flex: 1 }} />
        <Link href="/" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none" }}>
          Ver tienda →
        </Link>
      </nav>

      {/* Content */}
      <div style={{ padding: "1rem", maxWidth: 960, margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}
