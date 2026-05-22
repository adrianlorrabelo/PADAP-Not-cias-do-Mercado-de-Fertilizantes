import type { Quotation } from "../types";
import { formatarMoedaBRL } from "./currency";
import { quotationItemTotals, quotationSummary } from "./pricingCalculations";

export function buildConsultantQuotationMessage(quotation: Quotation): string {
  const status = quotation.trafficLight.status;

  if (status === "Em análise") {
    return `Olá, ${quotation.consultant || "consultor"}.\n\nCotação em análise. Motivo: ${quotation.trafficLight.reason || "revisão comercial"}.\nPrevisão: ${quotation.trafficLight.expectedReturn || "a confirmar"}.`;
  }

  if (status === "Requer aprovação") {
    return `Olá, ${quotation.consultant || "consultor"}.\n\nCotação depende de aprovação interna antes do envio. Motivo: ${quotation.trafficLight.reason || "margem/condição comercial"}.`;
  }

  if (status === "Bloqueada") {
    return `Olá, ${quotation.consultant || "consultor"}.\n\nCotação bloqueada/revisar. Motivo: ${quotation.trafficLight.reason || "condição comercial não liberada"}.`;
  }

  if (status === "Vencida/Inativa") {
    return `Olá, ${quotation.consultant || "consultor"}.\n\nCotação vencida/inativa. Recomenda-se atualizar preço, validade, frete e disponibilidade antes de enviar.`;
  }

  const items = quotation.items.map((item, index) => {
    const totals = quotationItemTotals(item);
    return `${index + 1}. ${item.product || "Produto"} - ${item.quantity} ${item.unit} - ${formatarMoedaBRL(item.finalPrice)}/${item.unit} - Total ${formatarMoedaBRL(totals.revenueTotal)}`;
  }).join("\n");
  const summary = quotationSummary(quotation);

  return `Olá, ${quotation.consultant || "consultor"}.\n\nSegue cotação para o cliente ${quotation.client || "cliente"}${quotation.farm ? ` - ${quotation.farm}` : ""}:\n\n${items}\n\nValor total: ${formatarMoedaBRL(summary.revenueTotal)}\nPrazo: ${quotation.term || "a confirmar"}\nFrete: ${quotation.freightMode || "a confirmar"} ${quotation.deliveryCity ? `- ${quotation.deliveryCity}` : ""}\nValidade: ${quotation.validity || "a confirmar"}\n\nObservação:\nPreço sujeito à disponibilidade e confirmação no momento do pedido.`;
}
