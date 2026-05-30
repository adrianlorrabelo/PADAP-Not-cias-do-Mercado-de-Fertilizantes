import { calcularMargemPercentual } from "./marginCalculations";
import type { Quotation, QuotationItem, QuotationItemStatus } from "../types";

export function quotationItemTotals(item: QuotationItem) {
  const unitCostTotal = item.baseCost;
  const costTotal = unitCostTotal * item.quantity;
  const revenueTotal = item.finalPrice * item.quantity;
  const profit = revenueTotal - costTotal;
  const marginPercent = calcularMargemPercentual(revenueTotal, costTotal);
  const minimumPriceForTarget = item.minimumMargin < 100 ? unitCostTotal / (1 - item.minimumMargin / 100) : 0;
  const desiredPriceForTarget = item.desiredMargin < 100 ? unitCostTotal / (1 - item.desiredMargin / 100) : 0;
  const status = getQuotationItemStatus(item, marginPercent, revenueTotal, costTotal);

  return { unitCostTotal, costTotal, revenueTotal, profit, marginPercent, minimumPriceForTarget, desiredPriceForTarget, status };
}

export function getQuotationItemStatus(item: QuotationItem, marginPercent = quotationItemTotals(item).marginPercent, revenueTotal = quotationItemTotals(item).revenueTotal, costTotal = quotationItemTotals(item).costTotal): QuotationItemStatus {
  if (!item.finalPrice || revenueTotal < costTotal) return "Bloqueado";
  if (marginPercent < item.minimumMargin - 1) return "Requer aprovação";
  if (marginPercent < item.minimumMargin) return "Atenção";
  return "Pode enviar";
}

export function quotationSummary(quotation: Quotation) {
  const itemTotals = quotation.items.map(quotationItemTotals);
  const costTotal = itemTotals.reduce((sum, item) => sum + item.costTotal, 0);
  const revenueTotal = itemTotals.reduce((sum, item) => sum + item.revenueTotal, 0);
  const grossProfit = revenueTotal - costTotal;
  const averageMargin = calcularMargemPercentual(revenueTotal, costTotal);
  const requiredMargin = quotation.packageMode ? quotation.packageTargetMargin : Math.max(...quotation.items.map((item) => item.minimumMargin), 0);
  const requiredRevenue = requiredMargin < 100 ? costTotal / (1 - requiredMargin / 100) : 0;
  const missingToTarget = Math.max(0, requiredRevenue - revenueTotal);
  const differenceToTarget = averageMargin - requiredMargin;
  const worstStatus = itemTotals.some((item) => item.status === "Bloqueado")
    ? "Bloqueado"
    : itemTotals.some((item) => item.status === "Requer aprovação")
      ? "Requer aprovação"
      : itemTotals.some((item) => item.status === "Atenção")
        ? "Atenção"
        : "Pode enviar";

  return {
    itemCount: quotation.items.length,
    costTotal,
    revenueTotal,
    grossProfit,
    averageMargin,
    requiredMargin,
    missingToTarget,
    differenceToTarget,
    status: worstStatus
  };
}

export function createQuotationItem(partial: Partial<QuotationItem> = {}): QuotationItem {
  const baseCost = partial.baseCost ?? 0;
  const freight = partial.freight ?? 0;
  const taxes = partial.taxes ?? 0;
  const commission = partial.commission ?? 0;
  const interest = partial.interest ?? 0;
  const minimumMargin = partial.minimumMargin ?? 10;
  const suggestedFinalPrice = minimumMargin < 100 ? Math.round(baseCost / (1 - minimumMargin / 100)) : 0;

  return {
    id: partial.id || `item-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    product: partial.product || "",
    supplier: partial.supplier || "",
    quantity: partial.quantity ?? 1,
    unit: partial.unit || "Tonelada",
    baseCost,
    freight,
    taxes,
    commission,
    interest,
    desiredMargin: partial.desiredMargin ?? minimumMargin,
    minimumMargin,
    finalPrice: partial.finalPrice ?? (baseCost ? suggestedFinalPrice : 0)
  };
}
