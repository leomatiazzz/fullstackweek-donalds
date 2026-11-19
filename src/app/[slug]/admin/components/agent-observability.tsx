"use client";

import {
  AgentTrace,
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
} from "@prisma/client";
import {
  ActivityIcon,
  AlertTriangleIcon,
  BotIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CpuIcon,
  FilterIcon,
  LayersIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
  WrenchIcon,
} from "lucide-react";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { updateComplaintStatus } from "../actions/update-complaint-status";

interface ComplaintWithOrder extends Complaint {
  order: {
    id: number;
    customerName: string;
    customerCpf: string;
    total: number;
    status: string;
  };
}

interface AgentObservabilityProps {
  complaints: ComplaintWithOrder[];
  traces: AgentTrace[];
  slug: string;
}

export const AgentObservability: React.FC<AgentObservabilityProps> = ({
  complaints,
  traces,
  slug,
}) => {
  const [activeTab, setActiveTab] = useState<"complaints" | "traces">(
    "complaints",
  );
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Métricas calculadas
  const totalInteractions = traces.length;
  const avgLatency =
    totalInteractions > 0
      ? Math.round(
          traces.reduce((acc, t) => acc + t.totalLatencyMs, 0) /
            totalInteractions,
        )
      : 0;

  const totalToolCalls = traces.reduce((acc, t) => {
    const tools = Array.isArray(t.toolsCalled)
      ? t.toolsCalled
      : typeof t.toolsCalled === "string"
        ? JSON.parse(t.toolsCalled)
        : [];
    return acc + (tools?.length || 0);
  }, 0);

  const errorRate =
    totalInteractions > 0
      ? Math.round(
          (traces.filter((t) => t.hasError).length / totalInteractions) * 100,
        )
      : 0;

  const openComplaintsCount = complaints.filter(
    (c) => c.status === "OPEN",
  ).length;

  const handleStatusChange = (
    complaintId: string,
    newStatus: ComplaintStatus,
  ) => {
    startTransition(async () => {
      const res = await updateComplaintStatus({
        complaintId,
        status: newStatus,
        slug,
      });

      if (res.success) {
        toast.success("Status da reclamação atualizado!");
      } else {
        toast.error(res.error || "Erro ao atualizar status.");
      }
    });
  };

  const getCategoryBadge = (category: ComplaintCategory) => {
    switch (category) {
      case "DELAY":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
            Atraso na entrega
          </Badge>
        );
      case "WRONG_ITEM":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">
            Item incorreto
          </Badge>
        );
      case "QUALITY":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
            Qualidade / frio
          </Badge>
        );
      case "REFUND_REQUEST":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">
            Estorno / reembolso
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-700">
            Outro
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <Badge className="bg-rose-500 text-white hover:bg-rose-600">
            Aberta
          </Badge>
        );
      case "IN_REVIEW":
        return (
          <Badge className="bg-sky-500 text-white hover:bg-sky-600">
            Em análise
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
            Resolvida
          </Badge>
        );
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filterCategory !== "ALL" && c.category !== filterCategory) return false;
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* CARDS DE RESUMO / TELEMETRIA */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs border-muted/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total de atendimentos IA
            </CardTitle>
            <BotIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalInteractions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalToolCalls} chamadas a ferramentas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-muted/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Latência média
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {avgLatency}ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tempo total ponta a ponta
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-muted/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Reclamações abertas
            </CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {openComplaintsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De {complaints.length} reclamações totais
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-muted/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Taxa de sucesso
            </CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {100 - errorRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Execuções sem exceção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SELETOR DE ABA INTERNA */}
      <div className="flex border-b border-border/80">
        <button
          onClick={() => setActiveTab("complaints")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === "complaints"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquareIcon className="h-4 w-4" />
          <span>Reclamações registradas</span>
          {openComplaintsCount > 0 && (
            <Badge className="ml-1 h-5 rounded-full bg-rose-500 px-1.5 text-[10px] text-white">
              {openComplaintsCount}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab("traces")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === "traces"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ActivityIcon className="h-4 w-4" />
          <span>Telemetria & traces do agente</span>
          <Badge
            variant="secondary"
            className="ml-1 h-5 rounded-full text-[10px]"
          >
            {traces.length}
          </Badge>
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: RECLAMAÇÕES */}
      {activeTab === "complaints" && (
        <div className="space-y-4">
          {/* BARRA DE FILTROS */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <FilterIcon className="h-4 w-4" />
              <span>Filtrar por:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">Todos os status</option>
                <option value="OPEN">Abertas</option>
                <option value="IN_REVIEW">Em análise</option>
                <option value="RESOLVED">Resolvidas</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">Todas as categorias</option>
                <option value="DELAY">Atraso</option>
                <option value="WRONG_ITEM">Item incorreto</option>
                <option value="QUALITY">Qualidade</option>
                <option value="REFUND_REQUEST">Reembolso</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
          </div>

          {/* LISTA DE RECLAMAÇÕES */}
          {filteredComplaints.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-sm text-muted-foreground">
                Nenhuma reclamação encontrada com os filtros selecionados.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((complaint) => (
                <Card
                  key={complaint.id}
                  className="overflow-hidden border-muted/80 shadow-xs transition-shadow hover:shadow-sm"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-foreground">
                          Pedido #{complaint.orderId}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        {getCategoryBadge(complaint.category)}
                        <span className="text-xs text-muted-foreground">•</span>
                        {getStatusBadge(complaint.status)}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <ClockIcon className="h-3 w-3" />
                        <span>
                          {new Date(complaint.createdAt).toLocaleString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-muted/30 p-3 text-xs leading-relaxed text-foreground">
                      <p className="font-semibold text-muted-foreground text-[11px] mb-1">
                        Relato registrado pelo agente IA:
                      </p>
                      {complaint.description}
                    </div>

                    <div className="mt-3 flex flex-col gap-2 pt-2 border-t border-muted/60 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-mono text-[10px]">
                          ID Protocolo: {complaint.id.slice(0, 8)}...
                        </span>
                        <span>•</span>
                        <span>
                          Cliente: {complaint.order.customerName} (
                          {complaint.order.customerCpf})
                        </span>
                      </div>

                      {/* AÇÕES DE GESTÃO DE STATUS */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Mudar para:
                        </span>
                        {complaint.status !== "OPEN" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={() =>
                              handleStatusChange(complaint.id, "OPEN")
                            }
                            className="h-7 text-xs rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                          >
                            Aberta
                          </Button>
                        )}
                        {complaint.status !== "IN_REVIEW" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={() =>
                              handleStatusChange(complaint.id, "IN_REVIEW")
                            }
                            className="h-7 text-xs rounded-lg border-sky-200 text-sky-700 hover:bg-sky-50"
                          >
                            Em análise
                          </Button>
                        )}
                        {complaint.status !== "RESOLVED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={() =>
                              handleStatusChange(complaint.id, "RESOLVED")
                            }
                            className="h-7 text-xs rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            Resolvida
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: TELEMETRIA & TRACES */}
      {activeTab === "traces" && (
        <div className="space-y-3">
          <div className="rounded-2xl border bg-white p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CpuIcon className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                Rastreabilidade completa de execuções (LLM + Function Calling)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <ShieldCheckIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                Parâmetros auditados & mascarados (LGPD)
              </span>
            </div>
          </div>

          {traces.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-sm text-muted-foreground">
                Nenhum trace de execução do agente registrado ainda.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {traces.map((trace) => {
                const tools: Array<{
                  tool: string;
                  args: Record<string, unknown>;
                  durationMs: number;
                  success: boolean;
                  output: unknown;
                }> = Array.isArray(trace.toolsCalled)
                  ? (trace.toolsCalled as never)
                  : typeof trace.toolsCalled === "string"
                    ? JSON.parse(trace.toolsCalled)
                    : [];

                const isExpanded = expandedTraceId === trace.id;

                return (
                  <Card
                    key={trace.id}
                    className="overflow-hidden border-muted/80 shadow-xs"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px]"
                          >
                            {trace.modelName}
                          </Badge>
                          <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                            <ClockIcon className="h-3 w-3" />
                            {trace.totalLatencyMs}ms
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <LayersIcon className="h-3 w-3" />
                            {trace.stepsCount} passo(s)
                          </span>
                          {trace.hasError ? (
                            <Badge className="bg-rose-100 text-rose-800 border-rose-200">
                              Erro tratado
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                              Sucesso
                            </Badge>
                          )}
                        </div>

                        <span className="text-[11px] text-muted-foreground">
                          {new Date(trace.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* MENSAGEM DO USUÁRIO */}
                      <div className="mt-3 rounded-xl border bg-muted/20 p-3 text-xs">
                        <p className="font-semibold text-muted-foreground text-[11px] mb-1">
                          👤 Mensagem do usuário:
                        </p>
                        <p className="text-foreground">{trace.userMessage}</p>
                      </div>

                      {/* RESPOSTA DO ASSISTENTE */}
                      <div className="mt-2 rounded-xl border bg-white p-3 text-xs">
                        <p className="font-semibold text-muted-foreground text-[11px] mb-1">
                          🤖 Resposta do agente:
                        </p>
                        <p className="text-foreground whitespace-pre-wrap">
                          {trace.assistantResponse}
                        </p>
                      </div>

                      {/* FERRAMENTAS EXECUTADAS */}
                      {tools.length > 0 && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedTraceId(isExpanded ? null : trace.id)
                            }
                            className="flex w-full items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                          >
                            <div className="flex items-center gap-2">
                              <WrenchIcon className="h-3.5 w-3.5 text-primary" />
                              <span>
                                {tools.length} ferramenta(s) executada(s):{" "}
                                {tools.map((t) => t.tool).join(", ")}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-2 rounded-xl bg-muted/30 p-3">
                              {tools.map((t, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-lg border bg-white p-2.5 shadow-2xs space-y-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <Badge
                                      variant="secondary"
                                      className="font-mono text-xs"
                                    >
                                      {t.tool}
                                    </Badge>
                                    <span className="font-mono text-xs text-muted-foreground">
                                      {t.durationMs}ms
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold text-muted-foreground">
                                      Parâmetros (LGPD):
                                    </p>
                                    <pre className="overflow-x-auto rounded bg-muted/60 p-1.5 font-mono text-[10px]">
                                      {JSON.stringify(t.args, null, 2)}
                                    </pre>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold text-muted-foreground">
                                      Retorno:
                                    </p>
                                    <pre className="max-h-28 overflow-y-auto rounded bg-muted/60 p-1.5 font-mono text-[10px]">
                                      {typeof t.output === "object"
                                        ? JSON.stringify(t.output, null, 2)
                                        : String(t.output)}
                                    </pre>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
