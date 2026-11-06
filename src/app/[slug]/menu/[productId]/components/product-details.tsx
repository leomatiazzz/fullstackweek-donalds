"use client";

import { Prisma } from "@prisma/client";
import { ChefHatIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/helpers/format-currency";

import CartSheet from "../../components/cart-sheet";
import { CartContext } from "../../contexts/cart";

interface ProductDetailsProps {
  product: Prisma.ProductGetPayload<{
    include: {
      restaurant: {
        select: {
          name: true;
          avatarImageUrl: true;
        };
      };
    };
  }>;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const { toggleCart, addProduct } = useContext(CartContext);
  const [quantity, setQuantity] = useState<number>(1);
  const handleDecreaseQuantity = () => {
    setQuantity((prev) => {
      if (prev === 1) {
        return 1;
      }
      return prev - 1;
    });
  };
  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };
  const handleAddToCart = () => {
    addProduct({
      ...product,
      quantity,
    });
    toggleCart();
  };
  return (
    <>
      <div className="relative z-10 mt-[-1.5rem] flex flex-auto flex-col justify-between rounded-t-3xl bg-white p-6 md:mt-0 md:rounded-none md:p-8">
        <div className="flex-auto space-y-4">
          {/* RESTAURANTE */}
          <div className="flex items-center gap-2">
            <div className="relative h-5 w-5 overflow-hidden rounded-full">
              <Image
                src={product.restaurant.avatarImageUrl}
                alt={product.restaurant.name}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {product.restaurant.name}
            </p>
          </div>

          {/* NOME DO PRODUTO */}
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
            {product.name}
          </h2>

          {/* PREÇO E QUANTIDADE */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-xl font-bold text-foreground md:text-2xl">
              {formatCurrency(product.price)}
            </h3>
            <div className="flex items-center gap-3 text-center">
              <Button
                variant="outline"
                className="h-8 w-8 rounded-xl"
                onClick={handleDecreaseQuantity}
              >
                <ChevronLeftIcon />
              </Button>
              <p className="w-4 font-semibold">{quantity}</p>
              <Button
                variant="destructive"
                className="h-8 w-8 rounded-xl"
                onClick={handleIncreaseQuantity}
              >
                <ChevronRightIcon />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[220px] pr-2 md:h-[260px]">
            {/* SOBRE */}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold">Sobre</h4>
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            </div>

            {/* INGREDIENTES */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-1.5">
                <ChefHatIcon size={18} />
                <h4 className="text-sm font-semibold">Ingredientes</h4>
              </div>
              <ul className="space-y-1 px-5 text-sm text-muted-foreground list-disc">
                {product.ingredients.map((ingredient) => (
                  <li key={ingredient}>{ingredient}</li>
                ))}
              </ul>
            </div>
          </ScrollArea>
        </div>

        <div className="pt-6">
          <Button
            className="w-full rounded-full font-medium"
            onClick={handleAddToCart}
          >
            Adicionar à sacola
          </Button>
        </div>
      </div>
      <CartSheet />
    </>
  );
};

export default ProductDetails;
