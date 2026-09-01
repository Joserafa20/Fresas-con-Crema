import { ProductCard } from "../../components/catalog/ProductCard";

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

export default async function CatalogPage() {
  const products = await getProducts();
  return (
    <main style={{ padding: "1rem", maxWidth: 1200, margin: "0 auto" }}>
      <h1>Catalogo</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
          maxWidth: 600,
          margin: "0 auto",
        }}
      >
        {products.map((p: any) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && <p>No hay productos disponibles.</p>}
      </div>
    </main>
  );
}
