"use client";

import { OrderStatus, Prisma } from "@prisma/client";
import { ChevronLeftIcon, ScrollTextIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/helpers/format-currency";

interface OrderListProps {
  orders: Array<
    Prisma.OrderGetPayload<{
      include: {
        restaurant: {
          select: {
            name: true;
            avatarImageUrl: true;
          };
        };
        orderProducts: {
          include: {
            product: true;
          };
        };
      };
    }>
  >;
}

const getStatusLabel = (status: OrderStatus) => {
  if (status === "FINISHED") return "Finalizado";
  if (status === "IN_PREPARATION") return "Em preparo";
  if (status === "PENDING") return "Pendente";
  return "";
};

const OrderList = ({ orders }: OrderListProps) => {
  const router = useRouter();
  const handleBackClick = () => router.back();
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 md:rounded-3xl md:border md:bg-white md:shadow-sm">
      <div className="flex items-center justify-between">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full shadow-sm"
          onClick={handleBackClick}
        >
          <ChevronLeftIcon />
        </Button>
        <div className="flex items-center gap-2">
          <ScrollTextIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight">Meus Pedidos</h2>
        </div>
        <div className="w-9" />
      </div>

      {orders.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-sm">Nenhum pedido encontrado para este CPF.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="transition-all hover:shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === OrderStatus.FINISHED
                        ? "bg-green-500 text-white"
                        : order.status === OrderStatus.IN_PREPARATION
                          ? "bg-amber-500 text-white"
                          : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {getStatusLabel(order.status)}
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    Pedido #{order.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative h-6 w-6 overflow-hidden rounded-full">
                    <Image
                      src={order.restaurant.avatarImageUrl}
                      alt={order.restaurant.name}
                      className="object-cover"
                      fill
                    />
                  </div>
                  <p className="text-sm font-semibold">
                    {order.restaurant.name}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  {order.orderProducts.map((orderProduct) => (
                    <div
                      key={orderProduct.id}
                      className="flex items-center gap-2"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30 text-xs font-semibold">
                        {orderProduct.quantity}
                      </div>
                      <p className="text-sm">{orderProduct.product.name}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <p className="text-sm font-bold">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;
