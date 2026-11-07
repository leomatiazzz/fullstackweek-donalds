"use client";

import { ConsumptionMethod, OrderStatus, Prisma } from "@prisma/client";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  FlameIcon,
  PartyPopperIcon,
  RefreshCwIcon,
  ShoppingBagIcon,
  UtensilsCrossedIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/helpers/format-currency";

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    restaurant: {
      select: {
        name: true;
        avatarImageUrl: true;
        slug: true;
      };
    };
    orderProducts: {
      include: {
        product: true;
      };
    };
  };
}>;

interface OrderStatusTrackerProps {
  order: OrderWithDetails;
}

const OrderStatusTracker = ({ order }: OrderStatusTrackerProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Polling automático a cada 5 segundos enquanto o pedido não estiver finalizado
  useEffect(() => {
    if (order.status === OrderStatus.FINISHED) return;

    const interval = setInterval(() => {
      startTransition(() => {
        router.refresh();
        setLastUpdated(new Date());
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [order.status, router]);

  const steps = [
    {
      id: OrderStatus.PENDING,
      title: "Pedido recebido",
      description: "Aguardando início do preparo pela equipe",
      icon: ClockIcon,
    },
    {
      id: OrderStatus.IN_PREPARATION,
      title: "Em preparação",
      description: "Seus lanches estão sendo preparados com carinho",
      icon: FlameIcon,
    },
    {
      id: OrderStatus.FINISHED,
      title: "Pronto!",
      description:
        order.consumptionMethod === ConsumptionMethod.DINE_IN
          ? "Pode retirar ou aguardar na mesa"
          : "Pronto para viagem no balcão de retirada",
      icon: PartyPopperIcon,
    },
  ];

  const getCurrentStepIndex = () => {
    if (order.status === OrderStatus.PENDING) return 0;
    if (order.status === OrderStatus.IN_PREPARATION) return 1;
    return 2;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full" asChild>
          <Link href={`/${order.restaurant.slug}`}>
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <div className="relative h-7 w-7 overflow-hidden rounded-full shadow-sm">
            <Image
              src={order.restaurant.avatarImageUrl}
              alt={order.restaurant.name}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-sm font-semibold text-foreground">
            {order.restaurant.name}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-full text-xs"
          onClick={() => {
            startTransition(() => {
              router.refresh();
              setLastUpdated(new Date());
            });
          }}
          disabled={isPending}
        >
          <RefreshCwIcon
            className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Atualizar</span>
        </Button>
      </div>

      {/* CARD PRINCIPAL DE STATUS */}
      <Card className="overflow-hidden border-border/80 shadow-md">
        <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Acompanhamento em tempo real
              </span>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Pedido #{order.id}
              </h1>
            </div>

            <Badge
              variant={
                order.status === OrderStatus.FINISHED ? "default" : "secondary"
              }
              className={`px-3 py-1 text-xs font-bold ${
                order.status === OrderStatus.FINISHED
                  ? "bg-emerald-600 text-white"
                  : order.status === OrderStatus.IN_PREPARATION
                    ? "bg-blue-500 text-white"
                    : "bg-amber-500 text-white"
              }`}
            >
              {order.status === OrderStatus.FINISHED
                ? "Pronto para Retirada"
                : order.status === OrderStatus.IN_PREPARATION
                  ? "Na Chapa / Preparando"
                  : "Aguardando Cozinha"}
            </Badge>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>Cliente: {order.customerName}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              {order.consumptionMethod === ConsumptionMethod.DINE_IN ? (
                <>
                  <UtensilsCrossedIcon className="h-3 w-3" /> Para comer aqui
                </>
              ) : (
                <>
                  <ShoppingBagIcon className="h-3 w-3" /> Para levar
                </>
              )}
            </span>
          </div>
        </div>

        {/* STEPPER PROGRESS BAR */}
        <CardContent className="p-6">
          <div className="space-y-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isDone = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.id} className="relative flex items-start gap-4">
                  {/* Linha vertical conectando os passos */}
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute left-5 top-10 h-10 w-0.5 -translate-x-1/2 transition-colors ${
                        index < currentStepIndex
                          ? "bg-emerald-500"
                          : "bg-muted"
                      }`}
                    />
                  )}

                  {/* Ícone com círculo de estado */}
                  <div
                    className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isDone
                        ? "bg-emerald-500 text-white shadow-sm"
                        : isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2Icon className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>

                  {/* Texto do Passo */}
                  <div className="flex-1 pt-1">
                    <p
                      className={`text-sm font-bold ${
                        isCurrent
                          ? "text-foreground"
                          : isDone
                            ? "text-emerald-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
            <span>Última verificação: {lastUpdated.toLocaleTimeString()}</span>
            {order.status !== OrderStatus.FINISHED && (
              <span className="flex items-center gap-1.5 text-primary font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                Atualização ao vivo
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RESUMO DOS ITENS PEDIDOS */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">
            Resumo dos itens ({order.orderProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {order.orderProducts.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-foreground">
                    {item.quantity}x
                  </span>
                  <div>
                    <p className="font-medium text-foreground">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} cada
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-foreground">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex items-center justify-between text-base font-bold">
            <span>Valor total</span>
            <span className="text-primary">{formatCurrency(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* AÇÕES DE NAVEGAÇÃO */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="flex-1 rounded-full font-medium">
          <Link href={`/${order.restaurant.slug}`}>Fazer novo pedido</Link>
        </Button>
        <Button
          variant="outline"
          asChild
          className="flex-1 rounded-full font-medium"
        >
          <Link href={`/${order.restaurant.slug}/orders?cpf=${order.customerCpf}`}>
            Ver todos meus pedidos
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default OrderStatusTracker;

