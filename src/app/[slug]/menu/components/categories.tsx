"use client";

import { Prisma } from "@prisma/client";
import { ClockIcon } from "lucide-react";
import Image from "next/image";
import { useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/helpers/format-currency";

import { CartContext } from "../contexts/cart";
import CartSheet from "./cart-sheet";
import Products from "./products";

interface RestaurantCategoriesProps {
  restaurant: Prisma.RestaurantGetPayload<{
    include: {
      menuCategories: {
        include: { products: true };
      };
    };
  }>;
}

type MenuCategoriesWithProducts = Prisma.MenuCategoryGetPayload<{
  include: { products: true };
}>;

const RestaurantCategories = ({ restaurant }: RestaurantCategoriesProps) => {
  const [selectedCategory, setSelectedCategory] =
    useState<MenuCategoriesWithProducts>(restaurant.menuCategories[0]);
  const { products, total, toggleCart, totalQuantity } =
    useContext(CartContext);
  const handleCategoryClick = (category: MenuCategoriesWithProducts) => {
    setSelectedCategory(category);
  };
  const getCategoryButtonVariant = (category: MenuCategoriesWithProducts) => {
    return selectedCategory.id === category.id ? "default" : "secondary";
  };
  return (
    <div className="relative z-10 mt-[-1.5rem] rounded-t-3xl bg-white md:mt-[-2rem]">
      <div className="p-5 md:p-8">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl shadow-sm md:h-14 md:w-14">
            <Image
              src={restaurant.avatarImageUrl}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight md:text-xl">
              {restaurant.name}
            </h2>
            <p className="text-xs text-muted-foreground md:text-sm">
              {restaurant.description}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-green-600">
          <ClockIcon size={14} />
          <p>Aberto!</p>
        </div>
      </div>

      <ScrollArea className="w-full">
        <div className="flex w-max space-x-3 px-5 pb-4 md:px-8">
          {restaurant.menuCategories.map((category) => (
            <Button
              onClick={() => handleCategoryClick(category)}
              key={category.id}
              variant={getCategoryButtonVariant(category)}
              size="sm"
              className="rounded-full font-medium"
            >
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <h3 className="px-5 pt-2 text-base font-semibold md:px-8 md:text-lg">
        {selectedCategory.name}
      </h3>
      <div className="pb-28 pt-3 md:pb-16">
        <Products products={selectedCategory.products} />
      </div>

      {products.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 px-5 py-3 shadow-lg backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total dos pedidos</p>
              <p className="text-sm font-semibold">
                {formatCurrency(total)}
                <span className="text-xs font-normal text-muted-foreground">
                  / {totalQuantity} {totalQuantity > 1 ? "itens" : "item"}
                </span>
              </p>
            </div>
            <Button
              onClick={toggleCart}
              className="rounded-full px-6 font-medium"
            >
              Ver sacola
            </Button>
          </div>
          <CartSheet />
        </div>
      )}
    </div>
  );
};

export default RestaurantCategories;
