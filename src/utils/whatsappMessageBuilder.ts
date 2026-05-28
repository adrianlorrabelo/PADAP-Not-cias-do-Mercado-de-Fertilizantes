import type { Quotation } from "../types";
import { formatarMoedaBRL } from "./currency";
import { quotationItemTotals, quotationSummary } from "./pricingCalculations";

export function buildConsultantQuotationMessage(quotation: Quotation): string {
  const status = quotation.trafficLight.status;

  if (status === "Em análise") {
    return `Olá, ${quotation.consultant || "consultor"}.\n\nCotação em análise. Motivo: ${quotation.trafficLight.reason || "revisão comercial"}.\nPrevisão: ${quotation.trafficLight.expectedReturn || "a confirmar"}.`;
  }

  if (status === "Requer aprovação") {
    return `Olá, ${quotation.consultant || "consultor"}.\n\nCotação depende de aprovação interna antes do envio. Motivo: ${quotation.trafficLight.reason || "condição comercial"}.`;
  }

  if (status === "Bloqueada") {
    return `Olá, ${quotation.consultant || "consultor"}.\n\nCotação bloqueada/revisar. Motivo: ${quotation.trafficLight.reason || "condição comercial não liberada"}.`;
  }

  if (status === "Vencida/Inativa") {
    return `Olá, ${quotation.consultant || "consultor"}.\n\nCotação vencida/inativa. Recomenda-se atualizar preço, validade, frete e disponibilidade antes de enviar.`;
  }

  const items = quotation.items.map((item, index) => {
    const totals = quotationItemTotals(item);
    return `${index + 1}. ${item.product || "Produto"}\nQuantidade: ${item.quantity} ${item.unit}\nPreço final: ${formatarMoedaBRL(item.finalPrice)}/${item.unit}\nValor total: ${formatarMoedaBRL(totals.revenueTotal)}`;
  }).join("\n\n");
  const summary = quotationSummary(quotation);

  return `Olá, ${quotation.consultant || "consultor"}.\n\nSegue condição para negociação:\n\nCliente: ${quotation.client || "cliente"}\n\nItens cotados:\n${items}\n\nCondição de pagamento: ${quotation.term || "a confirmar"}\nFrete: ${quotation.freightMode || "a confirmar"}\nValor total da cotação: ${formatarMoedaBRL(summary.revenueTotal)}\n\nObservação:\nValores sujeitos à confirmação de disponibilidade, fornecedor e validade da condição.`;
}
