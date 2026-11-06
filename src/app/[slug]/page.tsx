import Image from "next/image";
import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";

import ConsumptionMethodOption from "./components/consumption-method-option";

interface RestaurantPageProps {
  params: Promise<{ slug: string }>;
}

const RestaurantPage = async ({ params }: RestaurantPageProps) => {
  const { slug } = await params;
  const restaurant = await db.restaurant.findUnique({ where: { slug } });
  if (!restaurant) {
    return notFound();
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50/60 to-white px-6 py-12">
      <div className="flex w-full max-w-md flex-col items-center">
        {/* LOGO E TITULO */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl shadow-sm md:h-24 md:w-24">
            <Image
              src={restaurant.avatarImageUrl}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
            {restaurant.name}
          </h2>
        </div>

        {/* BEM VINDO */}
        <div className="space-y-2 pt-10 text-center md:pt-14">
          <h3 className="text-2xl font-bold md:text-3xl">Seja bem-vindo!</h3>
          <p className="text-sm text-muted-foreground md:text-base">
            Escolha como prefere aproveitar sua refeição. Estamos aqui para
            oferecer praticidade e sabor em cada detalhe!
          </p>
        </div>

        {/* OPÇÕES DE CONSUMO */}
        <div className="grid w-full grid-cols-2 gap-4 pt-10 md:gap-6">
          <ConsumptionMethodOption
            slug={slug}
            option="DINE_IN"
            buttonText="Para comer aqui"
            imageAlt="Comer aqui"
            imageUrl="/dine_in.png"
          />
          <ConsumptionMethodOption
            slug={slug}
            option="TAKEAWAY"
            buttonText="Para levar"
            imageAlt="Para levar"
            imageUrl="/takeaway.png"
          />
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage;
