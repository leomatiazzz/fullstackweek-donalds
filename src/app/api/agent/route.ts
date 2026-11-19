import { NextResponse } from "next/server";
import { z } from "zod";

import { runSupportAgent } from "@/lib/agent/orchestrator";
import { db } from "@/lib/prisma";

const agentRequestSchema = z.object({
  slug: z.string().trim().min(1, { message: "Slug do restaurante é obrigatório." }),
  message: z.string().trim().min(1, { message: "Mensagem do usuário é obrigatória." }),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string(),
      }),
    )
    .optional()
    .default([]),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = agentRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const { slug, message, history } = parsed.data;

    // Busca o restaurante pelo slug para isolamento de dados
    const restaurant = await db.restaurant.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurante não encontrado." },
        { status: 404 },
      );
    }

    // Executa o agente autônomo com Tool Use
    const result = await runSupportAgent({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      history,
      message,
    });

    // Registra observabilidade / telemetria (AgentTrace) no PostgreSQL
    try {
      await db.agentTrace.create({
        data: {
          restaurantId: restaurant.id,
          userMessage: message,
          assistantResponse: result.assistantResponse,
          toolsCalled: result.toolsCalled as object,
          stepsCount: result.stepsCount,
          totalLatencyMs: result.totalLatencyMs,
          modelName: result.modelName,
          hasError: result.hasError,
        },
      });
    } catch (traceErr) {
      console.error("Falha ao salvar AgentTrace no banco:", traceErr);
    }

    return NextResponse.json({
      success: true,
      response: result.assistantResponse,
      toolsCalled: result.toolsCalled,
      stepsCount: result.stepsCount,
      totalLatencyMs: result.totalLatencyMs,
      modelName: result.modelName,
    });
  } catch (error: unknown) {
    console.error("Erro na rota /api/agent:", error);
    const message =
      error instanceof Error ? error.message : "Erro interno no servidor.";

    return NextResponse.json(
      {
        error: "Ocorreu uma falha ao processar a resposta do agente.",
        details: message,
      },
      { status: 500 },
    );
  }
}
