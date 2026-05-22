import type {
  ProductAvailability,
  ProductClassification,
  PricingStrategySuggestion,
  QuotationAssistantInput,
  QuotationDiagnosis,
  QuotationSecurityScore
} from "../types";

const emptyInput: QuotationAssistantInput = {
  client: "",
  consultant: "",
  product: "",
  quantity: "",
  unit: "",
  term: "",
  freightMode: "",
  deliveryCity: "",
  supplierOrPriceOrigin: "",
  basePrice: "",
  validity: "",
  availability: "Não verificada",
  productType: "Não identificado",
  pricingStrategy: "",
  suggestedSupplier: "",
  suggestedMinimumMargin: ""
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function getLineValue(lines: string[], key: string) {
  const normalizedKey = normalize(key);
  const line = lines.find((item) => normalize(item).startsWith(normalizedKey));
  return line?.replace(new RegExp(`^${key}\\s*:?\\s*`, "i"), "").trim() || "";
}

export function parseWhatsAppQuotationMessage(message: string): QuotationAssistantInput {
  const lines = message.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const full = lines.join(" ");
  const normalized = normalize(full);

  const quantityMatch = full.match(/(\d+(?:[,.]\d+)?)\s*(toneladas?|tons?|t|litros?|lts?|l|gal(?:a|ã)o(?:es)?|kg|sacas?)/i);
  const freightLine = lines.find((line) => /\b(CIF|FOB)\b/i.test(line)) || "";
  const termMatch = getLineValue(lines, "Prazo") || full.match(/prazo\s*:?\s*([^\n,;.]+?)(?:\s+frete|\s+CIF|\s+FOB|$)/i)?.[1]?.trim() || "";
  const freightMatch = freightLine.match(/\b(CIF|FOB)\b\s*([^,;.]*)/i) || full.match(/\b(CIF|FOB)\b\s*([^,;.]*)/i);
  const client = getLineValue(lines, "Cliente");
  const consultant = getLineValue(lines, "Consultor");
  const quantity = quantityMatch?.[1]?.replace(",", ".") || "";
  const unit = quantityMatch?.[2] || "";

  const productLine = lines.find((line) => {
    const item = normalize(line);
    return !item.startsWith("cliente") && !item.startsWith("consultor") && !item.startsWith("prazo") && !item.includes("frete") && /\d/.test(item);
  });
  const product = productLine
    ?.replace(quantityMatch?.[0] || "", "")
    .replace(/\bprazo\b.*$/i, "")
    .replace(/\b(CIF|FOB)\b.*$/i, "")
    .trim() || "";

  const input: QuotationAssistantInput = {
    ...emptyInput,
    client,
    consultant,
    product,
    quantity,
    unit,
    term: termMatch,
    freightMode: (freightMatch?.[1]?.toUpperCase() as "CIF" | "FOB" | undefined) || "",
    deliveryCity: freightMatch?.[2]?.replace(/^s[aã]o\s+gotardo$/i, "São Gotardo").trim() || ""
  };

  if (!input.deliveryCity && normalized.includes("sao gotardo")) input.deliveryCity = "São Gotardo";

  const suggestion = suggestPricingStrategy(classifyProductType(input.product), input);
  return {
    ...input,
    productType: suggestion.productType,
    pricingStrategy: suggestion.strategy,
    suggestedSupplier: suggestion.suggestedSupplier,
    suggestedMinimumMargin: String(suggestion.minimumMargin)
  };
}

export function classifyProductType(product: string): ProductClassification {
  const value = normalize(product);
  if (!value) return "Não identificado";

  if (["yaramila", "yarabela", "yaraliva", "yararega", "yaratera krista", "yaratera", "yarabasa", "yaravera"].some((term) => value.includes(term))) {
    return "Adubo especialidade";
  }

  if (["ureia", "map", "kcl", "cloreto de potassio", "sulfato de amonio", "super simples", "super triplo", "dap", "nitrato", "fosfatado", "potassico"].some((term) => value.includes(term))) {
    return "Adubo commodity";
  }

  if (["yaravita", "santa clara", "aqua", "fort green", "foliar", "micronutriente", "zinco", "boro", "cobre", "manganes"].some((term) => value.includes(term))) {
    return "Foliar";
  }

  if (value.includes("pacote")) return "Pacote comercial";
  if (value.includes("estoque")) return "Produto em estoque";
  return "Não identificado";
}

export function suggestPricingStrategy(productType: ProductClassification, input: QuotationAssistantInput): PricingStrategySuggestion {
  const hasBasePrice = Boolean(input.basePrice);

  if (productType === "Adubo especialidade") {
    return {
      productType,
      suggestedSupplier: "Yara",
      strategy: "Lista Yara / Tabela da Semana",
      minimumMargin: 10,
      needsSupplierQuote: false,
      nextAction: hasBasePrice ? "Usar lista Yara e validar prazo/frete antes de liberar." : "Informar preço base da lista Yara antes de concluir."
    };
  }

  if (productType === "Adubo commodity") {
    return {
      productType,
      suggestedSupplier: "Comparar fornecedores",
      strategy: "Cotar fornecedores",
      minimumMargin: 10,
      needsSupplierQuote: true,
      suggestedSuppliers: ["Fertipar", "Fertigran", "Sibra", "Outros"],
      nextAction: "Produto classificado como commodity. Recomenda-se cotar fornecedores antes de formar preço."
    };
  }

  if (productType === "Foliar") {
    return {
      productType,
      suggestedSupplier: input.supplierOrPriceOrigin || "Lista de foliares / estoque",
      strategy: "Lista de foliares / estoque",
      minimumMargin: 30,
      needsSupplierQuote: !input.supplierOrPriceOrigin,
      nextAction: "Produto identificado como foliar. Recomenda-se verificar lista de foliares ou estoque."
    };
  }

  if (productType === "Pacote comercial") {
    return {
      productType,
      suggestedSupplier: "Pacote comercial",
      strategy: "Avaliar margem média do pacote",
      minimumMargin: 10,
      needsSupplierQuote: !hasBasePrice,
      nextAction: "Avaliar margem média do pacote antes de liberar a cotação."
    };
  }

  return {
    productType,
    suggestedSupplier: input.supplierOrPriceOrigin || "Revisar manualmente",
    strategy: "Revisar manualmente",
    minimumMargin: 10,
    needsSupplierQuote: !hasBasePrice,
    nextAction: "Produto não identificado. Revise manualmente e confirme origem do preço."
  };
}

export function validateQuotationRequiredFields(input: QuotationAssistantInput): string[] {
  const pending: string[] = [];
  if (!input.client) pending.push("Cliente");
  if (!input.consultant) pending.push("Consultor");
  if (!input.product) pending.push("Produto");
  if (!input.quantity) pending.push("Quantidade");
  if (!input.unit) pending.push("Unidade");
  if (!input.term) pending.push("Prazo");
  if (!input.freightMode) pending.push("Frete CIF/FOB");
  if (!input.deliveryCity) pending.push("Cidade/local de entrega");
  if (!input.supplierOrPriceOrigin) pending.push("Fornecedor ou origem do preço");
  if (!input.basePrice) pending.push("Preço de custo ou preço base");
  if (!input.validity) pending.push("Validade da cotação");
  if (!input.availability || input.availability === "Não verificada") pending.push("Disponibilidade do produto");
  if (input.availability === "Aguardando fornecedor") pending.push("Disponibilidade aguardando fornecedor");
  if (input.availability === "Indisponível") pending.push("Produto indisponível");
  return pending;
}

export function calculateQuotationSecurityScore(input: QuotationAssistantInput): QuotationSecurityScore {
  const checks = [
    ["Cliente informado", Boolean(input.client), "Cliente não informado"],
    ["Consultor informado", Boolean(input.consultant), "Consultor não informado"],
    ["Produto informado", Boolean(input.product), "Produto não informado"],
    ["Quantidade e unidade informadas", Boolean(input.quantity && input.unit), "Quantidade ou unidade não informada"],
    ["Prazo informado", Boolean(input.term), "Prazo não informado"],
    ["Frete e local de entrega informados", Boolean(input.freightMode && input.deliveryCity), "Frete ou local de entrega não informado"],
    ["Fornecedor ou origem do preço informado", Boolean(input.supplierOrPriceOrigin), "Fornecedor ou origem do preço não informado"],
    ["Preço de custo/base informado", Boolean(input.basePrice), "Preço de custo/base não informado"],
    ["Validade da cotação informada", Boolean(input.validity), "Validade da cotação não informada"],
    ["Disponibilidade confirmada ou verificada", input.availability === "Confirmada", "Disponibilidade não confirmada"]
  ] as const;

  const positives = checks.filter(([, ok]) => ok).map(([label]) => label);
  const pending = checks.filter(([, ok]) => !ok).map(([, , label]) => label);
  const percentage = positives.length * 10;
  const classification = percentage >= 90 ? "Alta" : percentage >= 70 ? "Boa" : percentage >= 50 ? "Média" : "Baixa";

  return {
    percentage,
    classification,
    positives,
    pending,
    recommendation: buildQuotationRecommendation(input)
  };
}

export function buildQuotationRecommendation(input: QuotationAssistantInput): string {
  const productType = input.productType || classifyProductType(input.product);
  if (!input.basePrice) return "Informe o preço de custo/base antes de concluir a precificação.";
  if (input.availability === "Aguardando fornecedor" || input.availability === "Não verificada") return "Confirme disponibilidade antes de liberar a cotação ao consultor.";
  if (input.availability === "Indisponível") return "Produto indisponível. Reavaliar alternativa antes de seguir.";
  if (productType === "Adubo commodity") return "Produto classificado como commodity. Recomenda-se cotar fornecedores antes de formar preço.";
  if (productType === "Adubo especialidade") return "Produto identificado como especialidade. Recomenda-se usar Lista Yara / Tabela da Semana.";
  if (productType === "Foliar") return "Produto identificado como foliar. Recomenda-se verificar lista de foliares ou estoque.";
  return validateQuotationRequiredFields(input).length ? "Cotação incompleta. Revise as informações antes de enviar ao consultor." : "Cotação com informações suficientes para seguir para precificação.";
}

export function buildQuotationDiagnosis(input: QuotationAssistantInput): QuotationDiagnosis {
  const productType = input.productType || classifyProductType(input.product);
  return {
    ...suggestPricingStrategy(productType, input),
    productType,
    strategy: input.pricingStrategy || suggestPricingStrategy(productType, input).strategy,
    suggestedSupplier: input.suggestedSupplier || suggestPricingStrategy(productType, input).suggestedSupplier,
    minimumMargin: Number(input.suggestedMinimumMargin || suggestPricingStrategy(productType, input).minimumMargin),
    availability: input.availability
  };
}

export function createEmptyQuotationInput(): QuotationAssistantInput {
  return { ...emptyInput };
}
