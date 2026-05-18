import type { ScenarioSimulationInput, ScenarioSimulationResult } from "../types";

export function calculateScenario(input: ScenarioSimulationInput): ScenarioSimulationResult {
  const pressure =
    input.ptaxVariation * 0.55 +
    input.ureaVariation * 0.35 +
    input.mapVariation * 0.28 +
    input.kclVariation * 0.2 -
    input.coffeeVariation * 0.12 -
    input.cornVariation * 0.08;

  const affectedProposals = Math.max(3, Math.round(7 + Math.abs(pressure) * 2.4 + (input.applyOpenProposals ? 3 : 0)));
  const impactedValue = Math.round((380000 + affectedProposals * 29000 + Math.abs(pressure) * 42000) / 1000) * 1000;
  const averageMarginBefore = 10.8;
  const averageMarginAfter = Number(Math.max(7.2, averageMarginBefore - pressure * 0.42).toFixed(1));
  const packagesBelowTarget = Math.max(0, Math.round((averageMarginBefore - averageMarginAfter) * 1.4));
  const sensitiveProducts = [
    input.ureaVariation !== 0 ? "Ureia" : "",
    input.mapVariation !== 0 ? "MAP" : "",
    input.kclVariation !== 0 ? "KCl" : "",
    input.ptaxVariation !== 0 ? "PTAX" : ""
  ].filter(Boolean);

  return {
    affectedProposals,
    impactedValue,
    averageMarginBefore,
    averageMarginAfter,
    packagesBelowTarget,
    sensitiveProducts,
    recommendedAction: pressure > 0 ? "Revisar propostas antes de enviar ao consultor e reduzir validade." : "Ativar oportunidades com clientes sensíveis a preço e acelerar fechamento."
  };
}
