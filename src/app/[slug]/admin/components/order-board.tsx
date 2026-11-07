"use client";

import { ConsumptionMethod, OrderStatus, Prisma } from "@prisma/client";
import {
  CheckCircle2Icon,
  ClockIcon,
  FlameIcon,
  Loader2Icon,
  RefreshCwIcon,
  ShoppingBagIcon,
  Undo2Icon,
  UtensilsCrossedIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/helpers/format-currency";

import { maskCpf } from "../../menu/helpers/cpf";
import { updateOrderStatus } from "../actions/update-order-status";

export type AdminOrder = Prisma.OrderGetPayload<{
  include: {
    orderProducts: {
      include: {
        product: true;
      };
    };
  };
}>;

interface OrderBoardProps {
  orders: AdminOrder[];
  slug: string;
}

const OrderBoard = ({ orders, slug }: OrderBoardProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [consumptionFilter, setConsumptionFilter] = useState<
    "ALL" | ConsumptionMethod
  >("ALL");
  const [mobileTab, setMobileTab] = useState<OrderStatus>("PENDING");

  const filteredOrders = useMemo(() => {
    if (consumptionFilter === "ALL") return orders;
    return orders.filter((o) => o.consumptionMethod === consumptionFilter);
  }, [orders, consumptionFilter]);

  const pendingOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === OrderStatus.PENDING),
    [filteredOrders],
  );

  const inPreparationOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === OrderStatus.IN_PREPARATION),
    [filteredOrders],
  );

  const finishedOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === OrderStatus.FINISHED),
    [filteredOrders],
  );

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    startTransition(async () => {
      try {
        await updateOrderStatus({
          orderId,
          status: newStatus,
          slug,
        });
        toast.success(`Pedido #${orderId} atualizado!`);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao atualizar o status do pedido.");
      } finally {
        setUpdatingOrderId(null);
      }
    });
  };

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      toast.info("Fila de pedidos atualizada.");
    });
  };

  const formatOrderTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const renderOrderCard = (order: AdminOrder) => {
    const isThisOrderUpdating = updatingOrderId === order.id;

    return (
      <Card
        key={order.id}
        className="overflow-hidden border border-border/80 shadow-sm transition-all hover:shadow-md"
      >
        <CardHeader className="bg-muted/30 p-4 pb-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-base font-bold text-foreground">
              #{order.id}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ClockIcon className="h-3.5 w-3.5" />
              <span>{formatOrderTime(order.createdAt)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {order.customerName}
              </p>
              <p className="text-xs text-muted-foreground">
                CPF: {maskCpf(order.customerCpf)}
              </p>
            </div>
            <Badge
              variant={
                order.consumptionMethod === ConsumptionMethod.DINE_IN
                  ? "secondary"
                  : "outline"
              }
              className="gap-1 text-[11px]"
            >
              {order.consumptionMethod === ConsumptionMethod.DINE_IN ? (
                <>
                  <UtensilsCrossedIcon className="h-3 w-3" /> Comer aqui
                </>
              ) : (
                <>
                  <ShoppingBagIcon className="h-3 w-3" /> Para levar
                </>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4">
          {/* ITENS DO PEDIDO */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Itens ({order.orderProducts.length})
            </p>
            <div className="space-y-1.5">
              {order.orderProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 font-bold text-primary-foreground">
                      {item.quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      {item.product.name}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-sm font-bold text-foreground">
              {formatCurrency(order.total)}
            </span>
          </div>

          {/* AÇÕES DE STATUS */}
          <div className="pt-2">
            {order.status === OrderStatus.PENDING && (
              <Button
                className="w-full gap-2 rounded-xl font-medium"
                disabled={isThisOrderUpdating || isPending}
                onClick={() =>
                  handleStatusChange(order.id, OrderStatus.IN_PREPARATION)
                }
              >
                {isThisOrderUpdating ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <FlameIcon className="h-4 w-4 text-amber-300" />
                )}
                Iniciar preparo
              </Button>
            )}

            {order.status === OrderStatus.IN_PREPARATION && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  title="Voltar para Pendente"
                  disabled={isThisOrderUpdating || isPending}
                  onClick={() =>
                    handleStatusChange(order.id, OrderStatus.PENDING)
                  }
                >
                  <Undo2Icon className="h-4 w-4" />
                </Button>
                <Button
                  className="flex-1 gap-2 rounded-xl bg-emerald-600 font-medium hover:bg-emerald-700"
                  disabled={isThisOrderUpdating || isPending}
                  onClick={() =>
                    handleStatusChange(order.id, OrderStatus.FINISHED)
                  }
                >
                  {isThisOrderUpdating ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2Icon className="h-4 w-4" />
                  )}
                  Finalizar Pedido
                </Button>
              </div>
            )}

            {order.status === OrderStatus.FINISHED && (
              <div className="flex items-center justify-between rounded-xl bg-green-50 p-2 text-green-700">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <CheckCircle2Icon className="h-4 w-4" />
                  Pronto / Entregue
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  disabled={isThisOrderUpdating || isPending}
                  onClick={() =>
                    handleStatusChange(order.id, OrderStatus.IN_PREPARATION)
                  }
                >
                  Reabrir
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* FILTROS E AÇÕES GLOBAIS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={consumptionFilter === "ALL" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setConsumptionFilter("ALL")}
          >
            Todos ({orders.length})
          </Button>
          <Button
            size="sm"
            variant={
              consumptionFilter === ConsumptionMethod.DINE_IN
                ? "default"
                : "outline"
            }
            className="rounded-full gap-1.5"
            onClick={() => setConsumptionFilter(ConsumptionMethod.DINE_IN)}
          >
            <UtensilsCrossedIcon className="h-3.5 w-3.5" />
            Comer aqui (
            {
              orders.filter((o) => o.consumptionMethod === ConsumptionMethod.DINE_IN)
                .length
            }
            )
          </Button>
          <Button
            size="sm"
            variant={
              consumptionFilter === ConsumptionMethod.TAKEAWAY
                ? "default"
                : "outline"
            }
            className="rounded-full gap-1.5"
            onClick={() => setConsumptionFilter(ConsumptionMethod.TAKEAWAY)}
          >
            <ShoppingBagIcon className="h-3.5 w-3.5" />
            Para levar (
            {
              orders.filter(
                (o) => o.consumptionMethod === ConsumptionMethod.TAKEAWAY,
              ).length
            }
            )
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-full self-start sm:self-auto"
          onClick={handleRefresh}
          disabled={isPending}
        >
          <RefreshCwIcon
            className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`}
          />
          Atualizar fila
        </Button>
      </div>

      {/* SELETOR DE COLUNAS MOBILE */}
      <div className="grid grid-cols-3 gap-2 lg:hidden">
        <Button
          size="sm"
          variant={mobileTab === OrderStatus.PENDING ? "default" : "outline"}
          className="rounded-xl flex flex-col py-3 h-auto"
          onClick={() => setMobileTab(OrderStatus.PENDING)}
        >
          <span className="text-xs">Pendentes</span>
          <span className="font-bold text-sm">({pendingOrders.length})</span>
        </Button>
        <Button
          size="sm"
          variant={
            mobileTab === OrderStatus.IN_PREPARATION ? "default" : "outline"
          }
          className="rounded-xl flex flex-col py-3 h-auto"
          onClick={() => setMobileTab(OrderStatus.IN_PREPARATION)}
        >
          <span className="text-xs">Em Preparo</span>
          <span className="font-bold text-sm">
            ({inPreparationOrders.length})
          </span>
        </Button>
        <Button
          size="sm"
          variant={mobileTab === OrderStatus.FINISHED ? "default" : "outline"}
          className="rounded-xl flex flex-col py-3 h-auto"
          onClick={() => setMobileTab(OrderStatus.FINISHED)}
        >
          <span className="text-xs">Finalizados</span>
          <span className="font-bold text-sm">({finishedOrders.length})</span>
        </Button>
      </div>

      {/* VISÃO MOBILE (UMA COLUNA ATIVA) */}
      <div className="lg:hidden">
        {mobileTab === OrderStatus.PENDING && (
          <div className="space-y-4">
            {pendingOrders.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhum pedido pendente no momento.
              </p>
            ) : (
              pendingOrders.map(renderOrderCard)
            )}
          </div>
        )}
        {mobileTab === OrderStatus.IN_PREPARATION && (
          <div className="space-y-4">
            {inPreparationOrders.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhum pedido em preparação.
              </p>
            ) : (
              inPreparationOrders.map(renderOrderCard)
            )}
          </div>
        )}
        {mobileTab === OrderStatus.FINISHED && (
          <div className="space-y-4">
            {finishedOrders.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhum pedido finalizado ainda.
              </p>
            ) : (
              finishedOrders.map(renderOrderCard)
            )}
          </div>
        )}
      </div>

      {/* VISÃO DESKTOP (3 COLUNAS KANBAN LADO A LADO) */}
      <div className="hidden grid-cols-3 gap-6 lg:grid">
        {/* COLUNA 1: PENDENTES */}
        <div className="rounded-3xl border bg-muted/20 p-4">
          <div className="mb-4 flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              <CardTitle className="text-base font-bold">Pendentes</CardTitle>
            </div>
            <Badge variant="secondary" className="font-bold">
              {pendingOrders.length}
            </Badge>
          </div>
          <div className="space-y-4">
            {pendingOrders.length === 0 ? (
              <p className="py-12 text-center text-xs text-muted-foreground">
                Sem pedidos pendentes
              </p>
            ) : (
              pendingOrders.map(renderOrderCard)
            )}
          </div>
        </div>

        {/* COLUNA 2: EM PREPARO */}
        <div className="rounded-3xl border bg-muted/20 p-4">
          <div className="mb-4 flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
              <CardTitle className="text-base font-bold">Em preparo</CardTitle>
            </div>
            <Badge variant="secondary" className="font-bold">
              {inPreparationOrders.length}
            </Badge>
          </div>
          <div className="space-y-4">
            {inPreparationOrders.length === 0 ? (
              <p className="py-12 text-center text-xs text-muted-foreground">
                Nenhum pedido em preparo
              </p>
            ) : (
              inPreparationOrders.map(renderOrderCard)
            )}
          </div>
        </div>

        {/* COLUNA 3: FINALIZADOS */}
        <div className="rounded-3xl border bg-muted/20 p-4">
          <div className="mb-4 flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <CardTitle className="text-base font-bold">Finalizados</CardTitle>
            </div>
            <Badge variant="secondary" className="font-bold">
              {finishedOrders.length}
            </Badge>
          </div>
          <div className="space-y-4">
            {finishedOrders.length === 0 ? (
              <p className="py-12 text-center text-xs text-muted-foreground">
                Nenhum pedido finalizado
              </p>
            ) : (
              finishedOrders.map(renderOrderCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBoard;
