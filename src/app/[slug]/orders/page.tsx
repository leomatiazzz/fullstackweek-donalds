import { db } from "@/lib/prisma";

import { SupportAgentWidget } from "../components/support-agent-widget";
import { isValidCpf, removeCpfPunctuation } from "../menu/helpers/cpf";
import CpfForm from "./components/cpf-form";
import OrderList from "./components/order-list";

interface OrdersPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cpf: string }>;
}

const OrdersPage = async ({ params, searchParams }: OrdersPageProps) => {
  const { slug } = await params;
  const { cpf } = await searchParams;

  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { name: true },
  });

  const restaurantName = restaurant?.name || "Restaurante";

  if (!cpf || !isValidCpf(cpf)) {
    return (
      <div className="relative">
        <CpfForm />
        <SupportAgentWidget slug={slug} restaurantName={restaurantName} />
      </div>
    );
  }

  const orders = await db.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      customerCpf: removeCpfPunctuation(cpf),
    },
    include: {
      restaurant: {
        select: {
          name: true,
          avatarImageUrl: true,
        },
      },
      orderProducts: {
        include: {
          product: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-muted/20 md:py-8">
      <OrderList orders={orders} />
      <SupportAgentWidget slug={slug} restaurantName={restaurantName} />
    </div>
  );
};

export default OrdersPage;
