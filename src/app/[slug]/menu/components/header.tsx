"use client";

import { Restaurant } from "@prisma/client";
import { ChefHatIcon, ChevronLeftIcon, ScrollTextIcon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface RestaurantHeaderProps {
  restaurant: Pick<Restaurant, "name" | "coverImageUrl">;
}

const RestaurantHeader = ({ restaurant }: RestaurantHeaderProps) => {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const handleBackClick = () => router.back();
  const handleOrdersClick = () => router.push(`/${slug}/orders`);
  const handleAdminClick = () => router.push(`/${slug}/admin`);

  return (
    <div className="relative h-[250px] w-full md:h-[320px]">
      <Button
        variant="secondary"
        size="icon"
        className="absolute left-4 top-4 z-50 rounded-full bg-white/80 shadow-sm backdrop-blur-sm hover:bg-white"
        onClick={handleBackClick}
      >
        <ChevronLeftIcon />
      </Button>
      <Image
        src={restaurant.coverImageUrl}
        alt={restaurant.name}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-white/80 shadow-sm backdrop-blur-sm hover:bg-white"
          onClick={handleAdminClick}
          title="Painel da Cozinha (KDS)"
        >
          <ChefHatIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-white/80 shadow-sm backdrop-blur-sm hover:bg-white"
          onClick={handleOrdersClick}
          title="Meus Pedidos"
        >
          <ScrollTextIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default RestaurantHeader;
