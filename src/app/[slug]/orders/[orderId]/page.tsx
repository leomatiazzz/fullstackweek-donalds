import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";

import OrderStatusTracker from "./components/order-status-tracker";

interface OrderPageProps {
  params: Promise<{ slug: string; orderId: string }>;
}

export const dynamic = "force-dynamic";

const OrderDetailsPage = async ({ params }: OrderPageProps) => {
  const { slug, orderId } = await params;

  const orderIdNumber = Number(orderId);
  if (isNaN(orderIdNumber)) {
    return notFound();
  }

  const order = await db.order.findUnique({
    where: { id: orderIdNumber },
    include: {
      restaurant: {
        select: {
          name: true,
          avatarImageUrl: true,
          slug: true,
        },
      },
      orderProducts: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    return notFound();
  }

  if (order.restaurant.slug.toUpperCase() !== slug.toUpperCase()) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <OrderStatusTracker order={order} />
    </div>
  );
};

export default OrderDetailsPage;

