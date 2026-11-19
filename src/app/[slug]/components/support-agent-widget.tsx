"use client";

import {
  AlertCircleIcon,
  BotIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  Loader2Icon,
  SendIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WrenchIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface ToolExecutionDetail {
  tool: string;
  args: Record<string, unknown>;
  success: boolean;
  durationMs: number;
  output: unknown;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  toolsCalled?: ToolExecutionDetail[];
  totalLatencyMs?: number;
  stepsCount?: number;
  hasError?: boolean;
}

interface SupportAgentWidgetProps {
  slug: string;
  restaurantName: string;
}

const QUICK_PROMPTS = [
  {
    label: "📦 Onde está meu pedido?",
    prompt: "Olá! Gostaria de consultar o status do meu pedido. O número dele é ",
  },
  {
    label: "⏱️ Meu pedido atrasou",
    prompt:
      "Meu pedido está muito atrasado! Gostaria de saber a estimativa e registrar uma reclamação.",
  },
  {
    label: "❌ Política de reembolso",
    prompt: "Como funciona a política de cancelamento e reembolso do restaurante?",
  },
  {
    label: "⚠️ Pedido veio com item errado",
    prompt:
      "Recebi meu pedido mas veio com um item errado. Como podemos resolver?",
  },
];

export const SupportAgentWidget: React.FC<SupportAgentWidgetProps> = ({
  slug,
  restaurantName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Foco no input ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const toggleToolDetails = (messageId: string) => {
    setExpandedTools((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Converte o histórico prévio para formato do endpoint
      const historyPayload = messages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        text: m.content,
      }));

      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          message: text,
          history: historyPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao processar solicitação.");
      }

      const assistantMessageId = `assistant-${Date.now()}`;
      const newAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: data.assistantResponse,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        toolsCalled: data.toolsCalled || [],
        totalLatencyMs: data.totalLatencyMs,
        stepsCount: data.stepsCount,
        hasError: data.hasError,
      };

      setMessages((prev) => [...prev, newAssistantMessage]);

      // Abre automaticamente os detalhes se houve tool call
      if (data.toolsCalled && data.toolsCalled.length > 0) {
        setExpandedTools((prev) => ({
          ...prev,
          [assistantMessageId]: true,
        }));
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      const errorAssistantMessage: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: "assistant",
        content: `Desculpe, ocorreu um erro temporário ao me comunicar com os serviços do restaurante: "${errorMessage}". Por favor, tente novamente em alguns instantes.`,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        hasError: true,
      };
      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatToolName = (name: string): string => {
    switch (name) {
      case "get_order_by_id":
        return "Consulta de pedido (DB)";
      case "check_delivery_status":
        return "Status de entrega & tracking";
      case "get_refund_policy":
        return "Base de políticas de reembolso";
      case "register_complaint":
        return "Registro formal de reclamação";
      default:
        return name;
    }
  };

  return (
    <>
      {/* BOTÃO FLUTUANTE (TRIGGER) */}
      <div className="fixed bottom-20 right-4 z-40 md:bottom-8 md:right-8">
        <Button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-primary/90 md:px-5 md:py-3.5"
          aria-label="Abrir assistente de inteligência artificial"
        >
          {/* Indicador de pulso verde (online) */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
          </span>

          <SparklesIcon className="h-4 w-4 animate-pulse md:h-5 md:w-5" />
          <span className="text-xs font-semibold md:text-sm">Suporte IA</span>

          {/* Badge sutil com Tool use */}
          <span className="hidden rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-medium tracking-tight text-white/90 sm:inline-block">
            Tool use
          </span>
        </Button>
      </div>

      {/* DRAWER / SHEET DO CHAT */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col p-0 sm:max-w-lg"
        >
          {/* CABEÇALHO */}
          <SheetHeader className="border-b bg-muted/30 px-5 py-4 text-left">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
                <BotIcon className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-base font-bold leading-tight">
                    Suporte inteligente
                  </SheetTitle>
                  <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/10 text-[10px] font-semibold text-primary"
                  >
                    Gemini 3.8 Flash
                  </Badge>
                </div>
                <SheetDescription className="text-xs text-muted-foreground">
                  Atendimento oficial de {restaurantName} com Tool Calling autônomo
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* ÁREA DE MENSAGENS COM SCROLL */}
          <div
            ref={scrollAreaRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          >
            {/* BOAS-VINDAS SE NÃO HOUVER MENSAGENS */}
            {messages.length === 0 && (
              <div className="space-y-4 pt-2">
                <Card className="border-dashed bg-muted/20 p-4 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <SparklesIcon className="h-4 w-4 text-primary" />
                    <span>Como posso ajudar você hoje?</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Sou o agente autônomo do {restaurantName}. Posso consultar seu
                    pedido em tempo real, explicar nossas políticas oficiais de
                    reembolso ou registrar reclamações diretamente para a gerência.
                  </p>
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] font-medium text-emerald-600">
                    <ShieldCheckIcon className="h-3.5 w-3.5" />
                    <span>Proteção LGPD ativa: Seus dados pessoais são mascarados.</span>
                  </div>
                </Card>

                {/* SUGESTÕES RÁPIDAS */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1">
                    Sugestões de atendimento:
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {QUICK_PROMPTS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputValue(item.prompt);
                          inputRef.current?.focus();
                        }}
                        className="rounded-xl border border-muted bg-white p-2.5 text-left text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LISTA DE MENSAGENS */}
            {messages.map((message) => {
              const isUser = message.role === "user";
              const hasTools =
                message.toolsCalled && message.toolsCalled.length > 0;
              const isToolExpanded = !!expandedTools[message.id];

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] text-muted-foreground">
                      {isUser ? "Você" : "Agente IA"} • {message.timestamp}
                    </span>
                  </div>

                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed sm:text-sm ${
                      isUser
                        ? "rounded-br-sm bg-primary text-white"
                        : "rounded-bl-sm border bg-card text-card-foreground shadow-xs"
                    }`}
                  >
                    {/* Renderiza o texto com suporte a quebras de linha e markdown simples */}
                    <div className="whitespace-pre-wrap space-y-1">
                      {message.content}
                    </div>

                    {/* TOOL INSPECTOR (TELEMETRIA E TOOL CALLING) */}
                    {hasTools && (
                      <div className="mt-3 border-t border-border/60 pt-2.5 text-xs text-foreground">
                        <button
                          type="button"
                          onClick={() => toggleToolDetails(message.id)}
                          className="flex w-full items-center justify-between rounded-lg bg-muted/60 px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-muted"
                        >
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <WrenchIcon className="h-3.5 w-3.5 text-primary" />
                            <span className="font-semibold text-foreground">
                              Tool inspector:
                            </span>
                            <span>
                              {message.toolsCalled?.length} ferramenta(s) acionada(s)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {message.totalLatencyMs && (
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                                <ClockIcon className="h-3 w-3" />
                                {message.totalLatencyMs}ms
                              </span>
                            )}
                            {isToolExpanded ? (
                              <ChevronUpIcon className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDownIcon className="h-3.5 w-3.5" />
                            )}
                          </div>
                        </button>

                        {/* DETALHES EXPANDIDOS DE TOOL CALLING */}
                        {isToolExpanded && (
                          <div className="mt-2 space-y-2 rounded-xl bg-muted/40 p-2.5 text-[11px]">
                            {message.toolsCalled?.map((call, idx) => (
                              <div
                                key={idx}
                                className="rounded-lg border bg-white p-2 shadow-2xs space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Badge
                                      variant="secondary"
                                      className="font-mono text-[10px] font-semibold"
                                    >
                                      {call.tool}
                                    </Badge>
                                    <span className="text-muted-foreground text-[10px]">
                                      {formatToolName(call.tool)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[10px] text-muted-foreground">
                                      {call.durationMs}ms
                                    </span>
                                    {call.success ? (
                                      <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
                                        <CheckCircle2Icon className="h-3 w-3" />
                                        Sucesso
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600">
                                        <AlertCircleIcon className="h-3 w-3" />
                                        Tratado
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* PARÂMETROS HIGIENIZADOS (LGPD) */}
                                <div>
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Parâmetros enviados:
                                  </p>
                                  <pre className="overflow-x-auto rounded bg-muted/70 p-1.5 font-mono text-[10px] text-foreground">
                                    {JSON.stringify(call.args, null, 2)}
                                  </pre>
                                </div>

                                {/* RETORNO DA FERRAMENTA */}
                                <div>
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Resultado da consulta:
                                  </p>
                                  <pre className="max-h-32 overflow-y-auto rounded bg-muted/70 p-1.5 font-mono text-[10px] text-foreground">
                                    {typeof call.output === "object"
                                      ? JSON.stringify(call.output, null, 2)
                                      : String(call.output)}
                                  </pre>
                                </div>
                              </div>
                            ))}

                            <div className="flex items-center gap-1 pt-1 text-[10px] font-medium text-emerald-700">
                              <ShieldCheckIcon className="h-3.5 w-3.5" />
                              <span>
                                LGPD: CPFs e dados sensíveis mascarados antes do envio.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* INDICADOR DE CARREGAMENTO / RACIOCÍNIO */}
            {isLoading && (
              <div className="flex flex-col items-start space-y-1">
                <span className="text-[10px] text-muted-foreground px-1">
                  Agente IA pensando...
                </span>
                <div className="flex items-center gap-2.5 rounded-2xl border bg-card px-4 py-3 text-xs text-muted-foreground shadow-xs">
                  <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
                  <span className="animate-pulse">
                    Analisando solicitação e executando ferramentas...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* RODAPÉ DO CHAT COM INPUT */}
          <div className="border-t bg-white p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Onde está o pedido #42? ou Política de reembolso..."
                className="h-10 text-xs sm:text-sm rounded-full bg-muted/30 focus-visible:ring-primary"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                aria-label="Enviar mensagem"
              >
                {isLoading ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-center text-[10px] text-muted-foreground">
              Ambiente seguro. Suas interações são auditadas com telemetria e rastreabilidade.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
