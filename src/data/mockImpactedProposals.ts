import type { ImpactedProposal } from "../types";

export const mockImpactedProposals: ImpactedProposal[] = [
  { id: "PROP-02541", client: "Fazenda Boa Vista", consultant: "Pedro", product: "Ureia", value: 128000, currentMargin: 10.8, simulatedMargin: 9.9, impactReason: "PTAX subiu", priority: "Alta", recommendedAction: "Recalcular" },
  { id: "PROP-02542", client: "Grupo Santa Clara", consultant: "Lucas", product: "KCl", value: 98000, currentMargin: 11.4, simulatedMargin: 12.1, impactReason: "KCl caiu", priority: "Alta", recommendedAction: "Trabalhar fechamento" },
  { id: "PROP-02543", client: "São Bento Agro", consultant: "Fernanda", product: "MAP", value: 184000, currentMargin: 10.2, simulatedMargin: 9.6, impactReason: "MAP em alta", priority: "Alta", recommendedAction: "Solicitar aprovação" },
  { id: "PROP-02544", client: "Diamante Agro", consultant: "Lucas", product: "YaraVita", value: 47000, currentMargin: 31.8, simulatedMargin: 30.4, impactReason: "PTAX e validade", priority: "Média", recommendedAction: "Gerar mensagem" },
  { id: "PROP-02545", client: "Irmãos Prado", consultant: "Thiago", product: "Ureia", value: 71000, currentMargin: 10.1, simulatedMargin: 8.8, impactReason: "Milho x Ureia piorou", priority: "Crítica", recommendedAction: "Recalcular e aprovar" }
];
