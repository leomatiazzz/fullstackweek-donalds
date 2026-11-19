"use client";

import { AgentTrace, Complaint } from "@prisma/client";
import { BotIcon, ChefHatIcon } from "lucide-react";
import React, { useState } from "react";

import { Badge } from "@/components/ui/badge";

import { AgentObservability } from "./agent-observability";
import OrderBoard, { AdminOrder } from "./order-board";

interface ComplaintWithOrder extends Complaint {
  order: {
    id: number;
    customerName: string;
    customerCpf: string;
    total: number;
    status: string;
  };
}

interface AdminDashboardTabsProps {
  orders: AdminOrder[];
  complaints: ComplaintWithOrder[];
  traces: AgentTrace[];
  slug: string;
}

export const AdminDashboardTabs: React.FC<AdminDashboardTabsProps> = ({
  orders,
  complaints,
  traces,
  slug,
}) => {
  const [activeView, setActiveView] = useState<"kds" | "observability">("kds");

  const openComplaintsCount = complaints.filter(
    (c) => c.status === "OPEN",
  ).length;

  const activeOrdersCount = orders.filter((o) =>
    ["PENDING", "IN_PREPARATION"].includes(o.status),
  ).length;

  return (
    <div className="space-y-6">
      {/* SELETOR PRINCIPAL DE MÓDULOS */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2 rounded-2xl bg-muted/50 p-1.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveView("kds")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
              activeView === "kds"
                ? "bg-white text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ChefHatIcon className="h-4 w-4 text-primary" />
            <span>Fila da cozinha (KDS)</span>
            {activeOrdersCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 rounded-full px-2 text-[10px]"
              >
                {activeOrdersCount}
              </Badge>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveView("observability")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
              activeView === "observability"
                ? "bg-white text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BotIcon className="h-4 w-4 text-primary" />
            <span>IA e observabilidade</span>
            {openComplaintsCount > 0 ? (
              <Badge className="ml-1 h-5 rounded-full bg-rose-500 px-2 text-[10px] text-white">
                {openComplaintsCount}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="ml-1 h-5 rounded-full text-[10px]"
              >
                {traces.length}
              </Badge>
            )}
          </button>
        </div>

        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Sistema conectado via NeonDB & Gemini</span>
        </div>
      </div>

      {/* CONTEÚDO ATIVO */}
      {activeView === "kds" ? (
        <OrderBoard orders={orders} slug={slug} />
      ) : (
        <AgentObservability
          complaints={complaints}
          traces={traces}
          slug={slug}
        />
      )}
    </div>
  );
};
