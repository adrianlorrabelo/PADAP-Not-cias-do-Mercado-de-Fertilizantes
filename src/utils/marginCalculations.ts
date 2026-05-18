import type { Client, CommercialPackage, CommercialStatus, PackageItem, Proposal } from "../types";

export function calcularCustoFinal(productCost: number, freight = 0, taxes = 0, commission = 0, otherExpenses = 0): number {
  return productCost + freight + taxes + commission + otherExpenses;
}

export function calcularPrecoMinimo(custoFinal: number, margemMinima: number): number {
  return custoFinal / (1 - margemMinima / 100);
}

export function calcularPrecoSugerido(custoFinal: number, margemDesejada: number): number {
  return custoFinal / (1 - margemDesejada / 100);
}

export function calcularMargemValor(precoVenda: number, custoFinal: number): number {
  return precoVenda - custoFinal;
}

export function calcularMargemPercentual(precoVenda: number, custoFinal: number): number {
  if (!precoVenda) return 0;
  return ((precoVenda - custoFinal) / precoVenda) * 100;
}

export function calcularStatusProposta(proposal: Proposal, currentPtax: number, minMargin = 10): CommercialStatus {
  const cost = calcularCustoFinal(proposal.productCost, proposal.freight, proposal.taxes, proposal.commission, proposal.otherExpenses);
  const margin = calcularMargemPercentual(proposal.salePrice, cost);
  if (proposal.salePrice < cost) return "Bloqueado";
  if (Math.abs(currentPtax - proposal.ptaxUsed) >= 0.01) return "Reconfirmar por alteração cambial";
  if (new Date(proposal.validity).getTime() < Date.now()) return "Reconfirmar por alteração cambial";
  if (margin < minMargin) return "Requer aprovação";
  if (margin < minMargin + 1.5) return "Atenção";
  return "Aprovado";
}

export function packageItemTotals(item: PackageItem) {
  const costTotal = item.quantity * item.unitCost;
  const saleTotal = item.quantity * item.unitSale;
  const marginValue = saleTotal - costTotal;
  const marginPercent = saleTotal ? (marginValue / saleTotal) * 100 : 0;
  return { costTotal, saleTotal, marginValue, marginPercent };
}

export function packageTotals(pkg: CommercialPackage) {
  const costTotal = pkg.items.reduce((sum, item) => sum + packageItemTotals(item).costTotal, 0);
  const saleTotal = pkg.items.reduce((sum, item) => sum + packageItemTotals(item).saleTotal, 0);
  const grossProfit = saleTotal - costTotal;
  const margin = saleTotal ? (grossProfit / saleTotal) * 100 : 0;
  return { costTotal, saleTotal, grossProfit, margin };
}

export function calcularVendaNecessariaParaMeta(custoTotal: number, margemDesejada: number): number {
  return custoTotal / (1 - margemDesejada / 100);
}

export function calcularFaltaParaMeta(custoTotal: number, vendaAtual: number, margemDesejada: number): number {
  return Math.max(0, calcularVendaNecessariaParaMeta(custoTotal, margemDesejada) - vendaAtual);
}

export function calcularStatusPacote(pkg: CommercialPackage, client?: Client, targetMargin = 10): "Pacote aprovado" | "Atenção" | "Requer aprovação" | "Bloqueado" {
  if (pkg.items.some((item) => item.unitSale < item.unitCost)) return "Bloqueado";
  const { margin } = packageTotals(pkg);
  if (margin >= targetMargin) return "Pacote aprovado";
  if (margin >= 9 && client?.profile === "Cliente estratégico") return "Atenção";
  if (margin >= 9) return "Requer aprovação";
  return "Requer aprovação";
}
