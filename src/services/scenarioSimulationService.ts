import type { ScenarioSimulationInput } from "../types";
import { calculateScenario } from "../utils/scenarioCalculations";

export const defaultScenarioInput: ScenarioSimulationInput = {
  ptaxVariation: 1,
  ureaVariation: 0,
  mapVariation: 0,
  kclVariation: 0,
  coffeeVariation: 0,
  cornVariation: 0,
  period: "Próximos 7 dias",
  applyOpenProposals: true
};

export function runScenarioSimulation(input: ScenarioSimulationInput) {
  return calculateScenario(input);
}
