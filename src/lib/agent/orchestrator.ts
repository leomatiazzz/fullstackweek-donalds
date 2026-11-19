import {
  AGENT_MODEL_NAME,
  buildSystemInstruction,
  getGeminiClient,
} from "./config";
import {
  agentToolDeclarations,
  executeAgentTool,
  ToolExecutionResult,
} from "./tools";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface OrchestratorParams {
  restaurantId: string;
  restaurantName: string;
  history?: ChatMessage[];
  message: string;
}

export interface OrchestrationResult {
  assistantResponse: string;
  toolsCalled: ToolExecutionResult[];
  stepsCount: number;
  totalLatencyMs: number;
  modelName: string;
  hasError: boolean;
}

const MAX_TOOL_STEPS = 5;

export const runSupportAgent = async ({
  restaurantId,
  restaurantName,
  history = [],
  message,
}: OrchestratorParams): Promise<OrchestrationResult> => {
  const startTime = Date.now();
  const toolsCalled: ToolExecutionResult[] = [];
  let stepsCount = 0;
  let hasError = false;

  try {
    const ai = getGeminiClient();

    // Converte histórico simples para formato do SDK do Gemini
    const mappedHistory = history
      .filter((m) => m.text && m.text.trim().length > 0)
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

    // Cria sessão de chat com instruções e ferramentas
    const chat = ai.chats.create({
      model: AGENT_MODEL_NAME,
      config: {
        systemInstruction: buildSystemInstruction(restaurantName),
        tools: [{ functionDeclarations: agentToolDeclarations }],
        temperature: 0.3, // Menor temperatura para respostas mais precisas e sem alucinação
      },
      history: mappedHistory,
    });

    // Envia a nova mensagem do usuário para iniciar o raciocínio
    let currentResponse = await chat.sendMessage({
      message,
    });

    // Loop multi-step para lidar com decisões autônomas de Tool Calling
    while (
      currentResponse.functionCalls &&
      currentResponse.functionCalls.length > 0 &&
      stepsCount < MAX_TOOL_STEPS
    ) {
      stepsCount++;
      const toolResponses = [];

      for (const call of currentResponse.functionCalls) {
        if (!call.name) continue;
        const callArgs = (call.args as Record<string, unknown>) || {};
        const execResult = await executeAgentTool(
          call.name,
          callArgs,
          restaurantId,
        );

        toolsCalled.push(execResult);
        if (!execResult.success && execResult.error !== "ORDER_NOT_FOUND") {
          hasError = true;
        }

        toolResponses.push({
          functionResponse: {
            id: call.id,
            name: call.name,
            response: {
              output: execResult.output,
            },
          },
        });
      }

      // Envia as respostas das ferramentas de volta ao modelo para o próximo passo
      currentResponse = await chat.sendMessage({
        message: toolResponses,
      });
    }

    const assistantResponse =
      currentResponse.text ||
      "Recebi as informações, mas não foi possível gerar o texto de resposta. Como posso ajudar com seu pedido?";

    const totalLatencyMs = Date.now() - startTime;

    return {
      assistantResponse,
      toolsCalled,
      stepsCount,
      totalLatencyMs,
      modelName: AGENT_MODEL_NAME,
      hasError,
    };
  } catch (err: unknown) {
    const totalLatencyMs = Date.now() - startTime;
    console.error("Erro na orquestração do Agente de IA:", err);

    const errorMessage =
      err instanceof Error ? err.message : "Erro desconhecido";
    console.error(`Detalhes da falha: ${errorMessage}`);

    return {
      assistantResponse:
        "Desculpe, tive uma instabilidade temporária ao consultar as informações da sua unidade. Por favor, tente novamente em instantes ou verifique com um atendente.",
      toolsCalled,
      stepsCount,
      totalLatencyMs,
      modelName: AGENT_MODEL_NAME,
      hasError: true,
    };
  }
};
