import { ArrowLeftIcon, ChefHatIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";

import OrderBoard from "./components/order-board";

interface AdminPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

const AdminPage = async ({ params }: AdminPageProps) => {
  const { slug } = await params;

  const restaurant = await db.restaurant.findUnique({
    where: { slug },
  });

  if (!restaurant) {
    return notFound();
  }

  const orders = await db.order.findMany({
    where: {
      restaurantId: restaurant.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      orderProducts: {
        include: {
          product: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      {/* HEADER DO PAINEL ADMIN */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-sm">
              <Image
                src={restaurant.avatarImageUrl}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-foreground sm:text-lg">
                  {restaurant.name}
                </h1>
                <span className="flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                  <ChefHatIcon className="h-3 w-3 text-primary" /> Cozinha (KDS)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Gestão e status de pedidos em tempo real
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-1.5 rounded-full"
          >
            <Link href={`/${slug}`}>
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ver Cardápio</span>
              <span className="sm:hidden">Voltar</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL (KANBAN BOARD) */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <OrderBoard orders={orders} slug={slug} />
      </main>
    </div>
  );
};

export default AdminPage;

