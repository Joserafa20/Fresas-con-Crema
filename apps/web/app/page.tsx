import { APP_NAME, LOCALE, CURRENCY } from "@maison-fraise/shared";

export default function Home() {
  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1>{APP_NAME}</h1>
      <p>Bienvenidos a {APP_NAME} — fresas con crema artesanales en Sabanalarga.</p>
      <p>
        Haz tu pedido privado. Frescura garantizada, entrega local.
        <br />
        <small>
          Locale: {LOCALE} · Moneda: {CURRENCY}
        </small>
      </p>
      <p style={{ marginTop: "2rem", opacity: 0.7 }}>
        Catálogo, pedidos e inventario — próximamente.
      </p>
    </main>
  );
}
