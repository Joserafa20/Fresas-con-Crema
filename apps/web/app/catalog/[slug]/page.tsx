import { notFound } from "next/navigation";
import { CatalogDetailClient } from "./client";

async function getProduct(slug: string) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${base}/api/v1/products/${slug}`, { next: { revalidate: 60 } });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const revalidate = 60;

export default async function CatalogDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();
  return <CatalogDetailClient product={product} />;
}
