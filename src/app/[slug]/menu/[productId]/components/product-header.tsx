"use client";

import { Product } from "@prisma/client";
import { ChevronLeftIcon, ScrollTextIcon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface ProductHeaderProps {
  product: Pick<Product, "name" | "imageUrl">;
}

const ProductHeader = ({ product }: ProductHeaderProps) => {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const handleBackClick = () => router.back();
  const handleOrdersClick = () => router.push(`/${slug}/orders`);
  return (
    <div className="relative min-h-[300px] w-full bg-muted/20 md:flex md:min-h-[480px] md:items-center md:justify-center">
      <Button
        variant="secondary"
        size="icon"
        className="absolute left-4 top-4 z-50 rounded-full bg-white/80 shadow-sm backdrop-blur-sm hover:bg-white"
        onClick={handleBackClick}
      >
        <ChevronLeftIcon />
      </Button>

      <div className="relative h-[300px] w-full md:h-[400px]">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-contain p-6"
          priority
        />
      </div>

      <Button
        variant="secondary"
        size="icon"
        className="absolute right-4 top-4 z-50 rounded-full bg-white/80 shadow-sm backdrop-blur-sm hover:bg-white"
        onClick={handleOrdersClick}
      >
        <ScrollTextIcon />
      </Button>
    </div>
  );
};

export default ProductHeader;
