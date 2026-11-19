import { FunctionDeclaration, Type } from "@google/genai";
import { ComplaintCategory, OrderStatus } from "@prisma/client";
import { z } from "zod";

import { maskCpf } from "@/app/[slug]/menu/helpers/cpf";
import { formatCurrency } from "@/helpers/format-currency";
import { db } from "@/lib/prisma";

import { getRefundPolicyByTopic } from "./refund-policies";

// ==========================================
// SCHEMAS DE VALIDAÇÃO ZOD (ESTRITA VALIDAÇÃO)
// ==========================================

export const getOrderByIdSchema = z.object({
  orderId: z.coerce.number().int().positive({
    message: "O identificador do pedido deve ser um número inteiro positivo.",
  }),
});

export const checkDeliveryStatusSchema = z.object({
  orderId: z.coerce.number().int().positive({
    message: "O identificador do pedido deve ser um número inteiro positivo.",
  }),
});

export const getRefundPolicySchema = z.object({
  topic: z
    .enum(["cancellation", "delay", "wrong_item", "quality", "general"])
    .default("general"),
});

export const registerComplaintSchema = z.object({
  orderId: z.coerce.number().int().positive({
    message: "O identificador do pedido deve ser um número inteiro positivo.",
  }),
  category: z.nativeEnum(ComplaintCategory, {
    message:
      "Categoria inválida. Opções: DELAY, WRONG_ITEM, QUALITY, REFUND_REQUEST, OTHER.",
  }),
  description: z.string().trim().min(8, {
    message: "A descrição da reclamação deve conter no mínimo 8 caracteres.",
  }),
});

// ==========================================
// DECLARAÇÃO DAS FERRAMENTAS PARA O GEMINI
// ==========================================

export const agentToolDeclarations: FunctionDeclaration[] = [
  {
    name: "get_order_by_id",
    description:
      "Consulta os detalhes completos de um pedido pelo seu número (#ID), incluindo itens pedidos, valores, data de criação e dados protegidos do cliente.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        orderId: {
          type: Type.INTEGER,
          description:
            "Número identificador do pedido informado pelo cliente (ex: 4, 12).",
        },
      },
      required: ["orderId"],
    },
  },
  {
    name: "check_delivery_status",
    description:
      "Verifica o status atual de preparação/entrega de um pedido (Pendente, Em Preparo ou Finalizado), método de consumo e tempo decorrido desde o envio para a cozinha.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        orderId: {
          type: Type.INTEGER,
          description: "Número identificador do pedido.",
        },
      },
      required: ["orderId"],
    },
  },
  {
    name: "get_refund_policy",
    description:
      "Consulta as regras e políticas oficiais da plataforma para cancelamento de pedidos, estornos, atrasos excessivos ou produtos avariados/trocados.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        topic: {
          type: Type.STRING,
          description:
            "Tópico da política desejada: 'cancellation' (cancelamento), 'delay' (atraso), 'wrong_item' (item incorreto), 'quality' (avaria/frio), ou 'general' (geral).",
        },
      },
      required: ["topic"],
    },
  },
  {
    name: "register_complaint",
    description:
      "Registra formalmente uma reclamação vinculada a um pedido no banco de dados para análise da equipe de suporte e gerência do restaurante.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        orderId: {
          type: Type.INTEGER,
          description: "ID do pedido que motivou a reclamação.",
        },
        category: {
          type: Type.STRING,
          description:
            "Categoria da queixa: 'DELAY' (atraso), 'WRONG_ITEM' (item errado/faltando), 'QUALITY' (qualidade/comida fria), 'REFUND_REQUEST' (solicitação de estorno) ou 'OTHER' (outro).",
        },
        description: {
          type: Type.STRING,
          description:
            "Explicação clara e detalhada do problema relatado pelo cliente.",
        },
      },
      required: ["orderId", "category", "description"],
    },
  },
];

// ==========================================
// EXECUTORES DAS FERRAMENTAS (COM LGPD E RESILIÊNCIA)
// ==========================================

export interface ToolExecutionResult {
  toolName: string;
  argsSanitized: Record<string, unknown>;
  output: Record<string, unknown>;
  durationMs: number;
  success: boolean;
  error?: string;
}

export const executeAgentTool = async (
  name: string,
  args: Record<string, unknown>,
  restaurantId: string,
): Promise<ToolExecutionResult> => {
  const startTime = Date.now();

  try {
    switch (name) {
      case "get_order_by_id": {
        const parsed = getOrderByIdSchema.parse(args);

        const order = await db.order.findFirst({
          where: {
            id: parsed.orderId,
            restaurantId,
          },
          include: {
            orderProducts: {
              include: {
                product: true,
              },
            },
            complaints: {
              select: {
                id: true,
                category: true,
                status: true,
                createdAt: true,
              },
            },
          },
        });

        if (!order) {
          const durationMs = Date.now() - startTime;
          return {
            toolName: name,
            argsSanitized: parsed,
            output: {
              found: false,
              message: `Pedido #${parsed.orderId} não foi encontrado nesta unidade. Por favor, confirme o número do pedido.`,
            },
            durationMs,
            success: false,
            error: "ORDER_NOT_FOUND",
          };
        }

        const durationMs = Date.now() - startTime;
        return {
          toolName: name,
          argsSanitized: parsed,
          output: {
            found: true,
            orderId: order.id,
            customerName: order.customerName,
            customerCpf: maskCpf(order.customerCpf), // Proteção LGPD
            status: order.status,
            consumptionMethod:
              order.consumptionMethod === "DINE_IN"
                ? "Para comer aqui"
                : "Para levar",
            total: formatCurrency(order.total),
            createdAt: order.createdAt.toISOString(),
            items: order.orderProducts.map((op) => ({
              productName: op.product.name,
              quantity: op.quantity,
              price: formatCurrency(op.price),
            })),
            activeComplaintsCount: order.complaints.length,
          },
          durationMs,
          success: true,
        };
      }

      case "check_delivery_status": {
        const parsed = checkDeliveryStatusSchema.parse(args);

        const order = await db.order.findFirst({
          where: {
            id: parsed.orderId,
            restaurantId,
          },
          select: {
            id: true,
            status: true,
            consumptionMethod: true,
            createdAt: true,
          },
        });

        if (!order) {
          const durationMs = Date.now() - startTime;
          return {
            toolName: name,
            argsSanitized: parsed,
            output: {
              found: false,
              message: `Pedido #${parsed.orderId} não encontrado para consulta de status.`,
            },
            durationMs,
            success: false,
            error: "ORDER_NOT_FOUND",
          };
        }

        const elapsedMinutes = Math.floor(
          (Date.now() - new Date(order.createdAt).getTime()) / 60000,
        );

        let statusDescription = "";
        if (order.status === OrderStatus.PENDING) {
          statusDescription =
            "Pendente: O pedido foi recebido pelo sistema e está na fila para a chapa.";
        } else if (order.status === OrderStatus.IN_PREPARATION) {
          statusDescription =
            "Em Preparo: Os lanches estão sendo montados na cozinha agora.";
        } else {
          statusDescription =
            order.consumptionMethod === "DINE_IN"
              ? "Finalizado: O pedido está pronto e já foi servido ou aguarda na bandeja."
              : "Finalizado: O pedido está embalado e pronto para retirada no balcão.";
        }

        const durationMs = Date.now() - startTime;
        return {
          toolName: name,
          argsSanitized: parsed,
          output: {
            found: true,
            orderId: order.id,
            currentStatus: order.status,
            statusDescription,
            consumptionMethod: order.consumptionMethod,
            elapsedMinutes: `${elapsedMinutes} minuto(s) atrás`,
            isDelayed: elapsedMinutes > 30 && order.status !== OrderStatus.FINISHED,
          },
          durationMs,
          success: true,
        };
      }

      case "get_refund_policy": {
        const parsed = getRefundPolicySchema.parse(args);
        const policy = getRefundPolicyByTopic(parsed.topic);

        const durationMs = Date.now() - startTime;
        return {
          toolName: name,
          argsSanitized: parsed,
          output: {
            topic: policy.topic,
            title: policy.title,
            summary: policy.summary,
            rules: policy.rules,
            requiresComplaint: policy.requiresComplaint,
          },
          durationMs,
          success: true,
        };
      }

      case "register_complaint": {
        const parsed = registerComplaintSchema.parse(args);

        const order = await db.order.findFirst({
          where: {
            id: parsed.orderId,
            restaurantId,
          },
        });

        if (!order) {
          const durationMs = Date.now() - startTime;
          return {
            toolName: name,
            argsSanitized: {
              orderId: parsed.orderId,
              category: parsed.category,
            },
            output: {
              registered: false,
              message: `Não foi possível registrar a reclamação porque o Pedido #${parsed.orderId} não existe nesta unidade.`,
            },
            durationMs,
            success: false,
            error: "ORDER_NOT_FOUND",
          };
        }

        const complaint = await db.complaint.create({
          data: {
            orderId: parsed.orderId,
            restaurantId,
            category: parsed.category,
            description: parsed.description,
            status: "OPEN",
          },
        });

        const durationMs = Date.now() - startTime;
        return {
          toolName: name,
          argsSanitized: {
            orderId: parsed.orderId,
            category: parsed.category,
          },
          output: {
            registered: true,
            complaintId: complaint.id,
            protocol: `REC-${complaint.id.slice(0, 8).toUpperCase()}`,
            status: complaint.status,
            orderId: complaint.orderId,
            message:
              "Reclamação registrada com sucesso! Ela foi encaminhada imediatamente para a gerência na cozinha.",
          },
          durationMs,
          success: true,
        };
      }

      default: {
        const durationMs = Date.now() - startTime;
        return {
          toolName: name,
          argsSanitized: args,
          output: {
            error: `Ferramenta '${name}' desconhecida ou não suportada.`,
          },
          durationMs,
          success: false,
          error: "UNKNOWN_TOOL",
        };
      }
    }
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    const errorMessage =
      err instanceof z.ZodError
        ? err.errors.map((e) => e.message).join("; ")
        : err instanceof Error
          ? err.message
          : "Erro desconhecido na execução da ferramenta.";

    return {
      toolName: name,
      argsSanitized: args,
      output: {
        success: false,
        validationError: errorMessage,
      },
      durationMs,
      success: false,
      error: errorMessage,
    };
  }
};
