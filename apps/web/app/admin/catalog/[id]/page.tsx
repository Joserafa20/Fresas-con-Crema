import { AdminEditClient } from "./client";

async function getProduct(id: string) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${base}/api/v1/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export default async function AdminEditPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) return <main style={{ padding: 20 }}>Producto no encontrado</main>;
  return <AdminEditClient product={product} />;
}
