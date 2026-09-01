export const dynamic = "force-dynamic";

async function getProducts() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${base}/api/v1/products`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function AdminCatalogPage() {
  const products = await getProducts();
  return (
    <main style={{ padding: "1rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Admin — Catalogo</h1>
      <p style={{ fontSize: 12, opacity: 0.6 }}>NetworkOnly — admin no se cachea offline.</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th>Nombre</th>
            <th>Slug</th>
            <th>Activo</th>
            <th>Orden</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p: any) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
              <td><a href={`/admin/catalog/${p.id}`}>{p.name}</a></td>
              <td>{p.slug}</td>
              <td>{p.isActive ? "Sí" : "No"}</td>
              <td>{p.sortOrder}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && <p>No hay productos.</p>}
    </main>
  );
}
