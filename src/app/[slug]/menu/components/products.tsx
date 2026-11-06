import { Product } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { formatCurrency } from "@/helpers/format-currency";

interface ProductsProps {
  products: Product[];
}

const Products = ({ products }: ProductsProps) => {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const consumptionMethod = searchParams.get("consumptionMethod");
  return (
    <div className="grid grid-cols-1 gap-3 px-5 md:grid-cols-2 md:gap-4 md:px-8">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/${slug}/menu/${product.id}?consumptionMethod=${consumptionMethod}`}
          className="group flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-200 hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm"
        >
          {/* ESQUERDA */}
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {product.name}
            </h3>
            <p className="line-clamp-2 text-xs text-muted-foreground md:text-sm">
              {product.description}
            </p>
            <p className="pt-2 text-sm font-bold text-foreground">
              {formatCurrency(product.price)}
            </p>
          </div>

          {/* DIREITA */}
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted/40 md:h-28 md:w-28">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Products;
