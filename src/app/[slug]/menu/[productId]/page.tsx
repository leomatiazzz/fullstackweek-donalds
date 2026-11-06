import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";

import ProductDetails from "./components/product-details";
import ProductHeader from "./components/product-header";

interface ProductPageProps {
  params: Promise<{ slug: string; productId: string }>;
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { slug, productId } = await params;
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      restaurant: {
        select: {
          name: true,
          avatarImageUrl: true,
          slug: true,
        },
      },
    },
  });
  if (!product) {
    return notFound();
  }
  if (product.restaurant.slug.toUpperCase() !== slug.toUpperCase()) {
    return notFound();
  }
  return (
    <div className="min-h-screen bg-muted/20 md:py-10">
      <div className="mx-auto flex h-full max-w-4xl flex-col bg-white md:grid md:grid-cols-2 md:overflow-hidden md:rounded-3xl md:border md:shadow-sm">
        <ProductHeader product={product} />
        <ProductDetails product={product} />
      </div>
    </div>
  );
};

export default ProductPage;
