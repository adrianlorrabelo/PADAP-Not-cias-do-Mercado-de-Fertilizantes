import type { Client, CommercialPackage, Consultant, Proposal } from "../types";
import { formatarMoedaBRL } from "../utils/currency";
import { packageTotals } from "../utils/marginCalculations";

export function gerarMensagemWhatsAppProposta(proposal: Proposal, client: Client, consultant: Consultant, productName: string): string {
  return `Olá, ${consultant.name}.

Segue cotação para o cliente ${client.name}:

Produto: ${productName}
Quantidade: ${proposal.quantity} ${proposal.unit}
Preço: ${formatarMoedaBRL(proposal.salePrice)}/${proposal.unit}
Prazo: ${proposal.term}
Frete: ${proposal.freightMode}
Validade: ${new Date(proposal.validity).toLocaleString("pt-BR")}

Observação:
Preço sujeito à disponibilidade e confirmação no momento do pedido.`;
}

export function gerarMensagemWhatsAppPacote(pkg: CommercialPackage, client: Client, consultant: Consultant): string {
  const items = pkg.items.map((item, index) => `${index + 1}. ${item.productName} - ${item.quantity} ${item.unit} - ${formatarMoedaBRL(item.unitSale)}`).join("\n");
  return `Olá, ${consultant.name}.

Segue proposta do pacote para o cliente ${client.name}:

${items}

Valor total: ${formatarMoedaBRL(packageTotals(pkg).saleTotal)}
Prazo: ${pkg.term}
Validade: ${new Date(pkg.validity).toLocaleString("pt-BR")}

Preço sujeito à disponibilidade e confirmação no pedido.`;
}

export async function copyToClipboard(message: string) {
  await navigator.clipboard.writeText(message);
}

export function whatsappHref(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
