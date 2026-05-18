import type { ImpactedProposal } from "../types";

export function summarizeCommercialImpact(proposals: ImpactedProposal[]) {
  const value = proposals.reduce((sum, proposal) => sum + proposal.value, 0);
  const urgent = proposals.filter((proposal) => proposal.priority === "Alta" || proposal.priority === "Crítica").length;
  const averageCurrent = proposals.reduce((sum, proposal) => sum + proposal.currentMargin, 0) / Math.max(proposals.length, 1);
  const averageSimulated = proposals.reduce((sum, proposal) => sum + proposal.simulatedMargin, 0) / Math.max(proposals.length, 1);

  return {
    affectedProposals: proposals.length + 11,
    impactedValue: value,
    opportunityClients: 4,
    packagesAttention: 2,
    urgentActions: urgent,
    currentMargin: Number(averageCurrent.toFixed(1)),
    simulatedMargin: Number(averageSimulated.toFixed(1)),
    recommendedAction: "Recalcular propostas de nitrogenados e revisar pacotes com margem próxima do limite."
  };
}
