export type RefundPolicyTopic =
  | "cancellation"
  | "delay"
  | "wrong_item"
  | "quality"
  | "general";

export interface RefundPolicy {
  topic: RefundPolicyTopic;
  title: string;
  summary: string;
  rules: string[];
  requiresComplaint: boolean;
}

export const REFUND_POLICIES: Record<RefundPolicyTopic, RefundPolicy> = {
  cancellation: {
    topic: "cancellation",
    title: "Política de Cancelamento e Estorno Direto",
    summary:
      "Regras para cancelamento de pedidos conforme o estágio na cozinha.",
    rules: [
      "Pedidos com status PENDENTE (PENDING): Podem ser cancelados imediatamente com reembolso integral (100%) da cobrança.",
      "Pedidos EM PREPARO (IN_PREPARATION): Não é permitido cancelamento automático, pois os insumos já foram processados na chapa. O cliente deve registrar uma reclamação para análise da gerência.",
      "Pedidos FINALIZADOS (FINISHED): O pedido já está pronto para consumo/retirada. Cancelamento não aplicável; se houver problema, deve-se registrar reclamação formal.",
    ],
    requiresComplaint: false,
  },
  delay: {
    topic: "delay",
    title: "Política de Atraso na Entrega / Preparação",
    summary: "Compensações e procedimentos para atrasos excessivos.",
    rules: [
      "O tempo médio de preparo padrão é de até 25 minutos.",
      "Atrasos acima de 30 minutos sem atualização autorizam abertura de reclamação com prioridade alta.",
      "A gerência poderá conceder cupom de desconto de até 50% ou estorno proporcional mediante análise da reclamação registrada.",
    ],
    requiresComplaint: true,
  },
  wrong_item: {
    topic: "wrong_item",
    title: "Política de Item Incorreto ou Faltante",
    summary: "Resolução para divergências nos itens entregues.",
    rules: [
      "Se faltou algum produto ou foi entregue produto trocado, o cliente tem direito ao estorno integral do item ou reposição prioritária.",
      "É obrigatório registrar a reclamação informando quais itens divergiram para que a cozinha valide o despacho.",
    ],
    requiresComplaint: true,
  },
  quality: {
    topic: "quality",
    title: "Política de Qualidade e Avaria",
    summary: "Critérios para alimentos frios, embalagem violada ou avaria.",
    rules: [
      "Alimentos que chegarem fora dos padrões de temperatura, sabor ou higiene dão direito a crédito ou reembolso integral.",
      "A reclamação deve ser registrada com a descrição detalhada do problema observado.",
    ],
    requiresComplaint: true,
  },
  general: {
    topic: "general",
    title: "Condições Gerais de Atendimento e Reembolso",
    summary: "Prazos de compensação e canais oficiais.",
    rules: [
      "Reembolsos via PIX são processados em até 2 horas após aprovação da reclamação.",
      "Reembolsos via Cartão de Crédito são estornados em até 1 a 2 faturas dependendo da operadora.",
      "Toda solicitação formal deve estar vinculada ao número identificador (#ID) do pedido.",
    ],
    requiresComplaint: false,
  },
};

export const getRefundPolicyByTopic = (topic: string): RefundPolicy => {
  const normalized = topic.toLowerCase().trim() as RefundPolicyTopic;
  return REFUND_POLICIES[normalized] || REFUND_POLICIES.general;
};
