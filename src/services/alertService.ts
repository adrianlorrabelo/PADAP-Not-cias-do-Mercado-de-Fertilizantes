import type { Alert, Proposal } from "../types";
import { calcularStatusProposta } from "../utils/marginCalculations";

export function gerarAlertasAutomaticos(proposals: Proposal[], currentPtax: number): Alert[] {
  const alerts: Alert[] = proposals
    .filter((proposal) => calcularStatusProposta(proposal, currentPtax) !== "Aprovado")
    .map((proposal) => ({
      id: `auto-${proposal.id}`,
      title: calcularStatusProposta(proposal, currentPtax),
      description: `Proposta ${proposal.id} precisa de revisão comercial antes do envio.`,
      priority: calcularStatusProposta(proposal, currentPtax).includes("cambial") ? "Risco cambial" : "Risco de margem",
      date: new Date().toISOString(),
      module: "Propostas",
      action: "Recalcular preço e validade"
    }));
  return alerts;
}
