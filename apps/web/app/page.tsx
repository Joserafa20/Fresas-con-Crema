import Link from "next/link";

export const revalidate = 60;

async function getProducts() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${base}/api/v1/products`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function formatCop(cents: number): string {
  return `$${cents.toLocaleString("es-CO")}`;
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main style={{ margin: 0, padding: 0, fontFamily: "system-ui, sans-serif", background: "#fff" }}>
      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, #e11d48 0%, #be123c 50%, #9f1239 100%)",
        color: "#fff",
        textAlign: "center",
        padding: "80px 20px 60px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: -60, right: -60, width: 200, height: 200,
          borderRadius: "50%", background: "rgba(255,255,255,0.08)",
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: -40, width: 150, height: 150,
          borderRadius: "50%", background: "rgba(255,255,255,0.06)",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          {/* Logo text */}
          <div style={{
            fontSize: 14, letterSpacing: 6, textTransform: "uppercase",
            opacity: 0.85, marginBottom: 12, fontWeight: 500,
          }}>
            Sabanalarga, Atlántico
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 8vw, 64px)", margin: "0 0 8px",
            fontWeight: 800, letterSpacing: -1, lineHeight: 1.1,
          }}>
            MAISON FRAISE
          </h1>

          <div style={{
            width: 60, height: 3, background: "rgba(255,255,255,0.6)",
            margin: "16px auto", borderRadius: 2,
          }} />

          <p style={{
            fontSize: "clamp(16px, 3vw, 20px)", margin: "0 0 8px",
            fontWeight: 300, opacity: 0.95, lineHeight: 1.5,
          }}>
            Fresas con crema artesanales
          </p>
          <p style={{
            fontSize: 14, opacity: 0.75, margin: "0 0 32px",
          }}>
            Frescura garantizada · Entrega local · Pedidos privados
          </p>

          <Link href="/catalog" style={{
            display: "inline-block", background: "#fff", color: "#e11d48",
            padding: "14px 40px", borderRadius: 50, fontSize: 16, fontWeight: 700,
            textDecoration: "none", letterSpacing: 0.5,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            transition: "transform 0.2s",
          }}>
            Ver Catálogo
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "48px 20px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 32px", color: "#1a1a1a" }}>
          ¿Cómo funciona?
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 24 }}>
          {[
            { num: "1", title: "Elegí", desc: "Tu fresa favorita" },
            { num: "2", title: "Personalizá", desc: "Toppings y tamaño" },
            { num: "3", title: "Pedí", desc: "Recogida o domicilio" },
          ].map((step) => (
            <div key={step.num} style={{ textAlign: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "#fff1f2", color: "#e11d48",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 700, margin: "0 auto 12px",
                border: "2px solid #fecdd3",
              }}>
                {step.num}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: "#666" }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {products.length > 0 && (
        <section style={{
          padding: "48px 20px", maxWidth: 700, margin: "0 auto",
          background: "#fafafa", borderTop: "1px solid #f0f0f0",
          borderBottom: "1px solid #f0f0f0",
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 24px", textAlign: "center", color: "#1a1a1a" }}>
            Nuestros productos
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
            {products.slice(0, 4).map((p: any) => {
              const price = p.variants?.[0]?.priceCents ?? 0;
              return (
                <Link key={p.id} href={`/catalog/${p.slug}`} style={{
                  textDecoration: "none", color: "inherit",
                  background: "#fff", borderRadius: 16, overflow: "hidden",
                  border: "1px solid #f0f0f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}>
                  <div style={{
                    height: 140, background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 48,
                  }}>
                    🍓
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                    {p.description && (
                      <div style={{ fontSize: 12, color: "#888", marginBottom: 6, lineHeight: 1.3 }}>
                        {p.description.length > 50 ? p.description.slice(0, 50) + "…" : p.description}
                      </div>
                    )}
                    <div style={{ fontWeight: 700, color: "#e11d48", fontSize: 16 }}>
                      {formatCop(price)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/catalog" style={{
              display: "inline-block", background: "#e11d48", color: "#fff",
              padding: "10px 28px", borderRadius: 50, fontSize: 14, fontWeight: 600,
              textDecoration: "none",
            }}>
              Ver todo el catálogo →
            </Link>
          </div>
        </section>
      )}

      {/* BUSINESS INFO */}
      <section style={{ padding: "48px 20px", maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 24px", color: "#1a1a1a" }}>
          Información
        </h2>
        <div style={{
          display: "grid", gap: 16, textAlign: "left",
          background: "#fff", borderRadius: 16, padding: 24,
          border: "1px solid #f0f0f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>📍</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Ubicación</div>
              <div style={{ fontSize: 13, color: "#666" }}>Sabanalarga, Atlántico — Casco urbano</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>🕐</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Horario</div>
              <div style={{ fontSize: 13, color: "#666" }}>Sáb y Dom · 4:00 PM – 8:00 PM</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>🛵</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Domicilio</div>
              <div style={{ fontSize: 13, color: "#666" }}>Solo casco urbano · $3.000</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>💳</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Pagos</div>
              <div style={{ fontSize: 13, color: "#666" }}>Efectivo · Nequi · Daviplata · Llave BRE-B</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section style={{
        background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
        color: "#fff", textAlign: "center", padding: "48px 20px",
      }}>
        <p style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px" }}>
          ¿Listo para tu fresa favorita?
        </p>
        <p style={{ fontSize: 14, opacity: 0.85, margin: "0 0 24px" }}>
          Hacé tu pedido ahora — es rápido y fácil
        </p>
        <Link href="/catalog" style={{
          display: "inline-block", background: "#fff", color: "#e11d48",
          padding: "14px 40px", borderRadius: 50, fontSize: 16, fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}>
          Hacer Pedido
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{
        textAlign: "center", padding: "24px 20px", fontSize: 12, color: "#999",
        borderTop: "1px solid #f0f0f0",
      }}>
        <div style={{ fontWeight: 600, color: "#666", marginBottom: 4 }}>
          MAISON FRAISE
        </div>
        Fresas con crema artesanales · Sabanalarga, Atlántico
        <br />
        <span style={{ opacity: 0.7 }}>© {new Date().getFullYear()} · Pedidos privados</span>
      </footer>
    </main>
  );
}
