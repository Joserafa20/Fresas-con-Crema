import { AdminEditClient } from "./client";

async function getProduct(slug: string) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${base}/api/v1/products/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export default async function AdminEditPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) return <main style={{ padding: 20 }}>Producto no encontrado</main>;
  return <AdminEditClient product={product} />;
}
