export function confidenceLabel(confidence: number) {
  if (confidence >= 85) return "Alta";
  if (confidence >= 70) return "Média";
  return "Baixa";
}
