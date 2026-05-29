import { describe, expect, it } from "vitest";
import type { Product, WeeklyTable } from "../types";
import {
  getCalculationWarnings,
  getListStatus,
  getVisibleFinalPrice,
  mergeHistory,
  normalizeText,
  normalizeWeeklyTable,
  numberValue,
  recalculateProducts,
} from "../pages/weeklyTableUtils";

const baseTable: WeeklyTable = {
  id: "t-1",
  supplier: "Yara",
  expiresAt: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 dias no futuro
  ptax: 5.18,
  freight: 82,
  icms: 7,
  marginIcms: 10.8,
  importedAt: new Date().toISOString(),
  importedBy: "Teste",
  active: true,
  products: [],
};

const baseProduct: Product = {
  id: "p-1",
  code: "YB-1020",
  group: "Fertilizantes",
  description: "YaraBasa 10-20-20",
  reference: "Base",
  characteristic: "Granulado",
  packaging: "Big bag",
  supplier: "Yara",
  producerPrice: 3550,
  resellerPrice: 3720,
  discount: 0,
  desvioPrecificacao: 0,
  finalPrice: 3980,
  available: true,
};

// --- normalizeText ---
describe("normalizeText", () => {
  it("remove acentos e converte para minúsculas", () => {
    expect(normalizeText("Fertilizações")).toBe("fertilizacoes");
    expect(normalizeText("PTAX Câmbio")).toBe("ptax cambio");
  });

  it("remove espaços no início e fim", () => {
    expect(normalizeText("  teste  ")).toBe("teste");
  });

  it("retorna string vazia para string vazia", () => {
    expect(normalizeText("")).toBe("");
  });
});

// --- numberValue ---
describe("numberValue", () => {
  it("converte string numérica para número", () => {
    expect(numberValue("3.14")).toBe(3.14);
    expect(numberValue("3,14")).toBe(3.14);
    expect(numberValue("1000")).toBe(1000);
  });

  it("retorna 0 para string inválida", () => {
    expect(numberValue("")).toBe(0);
    expect(numberValue("abc")).toBe(0);
  });
});

// --- getListStatus ---
describe("getListStatus", () => {
  it("retorna 'Lista válida' para vencimento no futuro", () => {
    const future = new Date(Date.now() + 86400000 * 10).toISOString();
    expect(getListStatus(future).tone).toBe("green");
    expect(getListStatus(future).label).toBe("Lista válida");
  });

  it("retorna 'Vencendo' para vencimento em até 3 dias", () => {
    const soon = new Date(Date.now() + 86400000 * 2).toISOString();
    expect(getListStatus(soon).tone).toBe("amber");
    expect(getListStatus(soon).label).toBe("Vencendo");
  });

  it("retorna 'Lista vencida' para vencimento no passado", () => {
    const past = new Date(Date.now() - 86400000 * 5).toISOString();
    expect(getListStatus(past).tone).toBe("red");
    expect(getListStatus(past).label).toBe("Lista vencida");
  });

  it("retorna 'Lista vencida' para string vazia", () => {
    expect(getListStatus("").tone).toBe("red");
  });
});

// --- getVisibleFinalPrice ---
describe("getVisibleFinalPrice", () => {
  it("usa calculatedFinalPrice quando disponível e positivo", () => {
    const product = { ...baseProduct, calculatedFinalPrice: 4200 };
    expect(getVisibleFinalPrice(product)).toBe(4200);
  });

  it("usa finalPrice quando calculatedFinalPrice é null", () => {
    const product = { ...baseProduct, calculatedFinalPrice: null };
    expect(getVisibleFinalPrice(product)).toBe(3980);
  });

  it("usa finalPrice quando calculatedFinalPrice é 0", () => {
    const product = { ...baseProduct, calculatedFinalPrice: 0 };
    expect(getVisibleFinalPrice(product)).toBe(3980);
  });
});

// --- recalculateProducts ---
describe("recalculateProducts", () => {
  it("define calculationStatus como 'ok' quando os preços coincidem", () => {
    const table = normalizeWeeklyTable({ ...baseTable, products: [baseProduct] });
    const recalculated = table.products[0];
    expect(recalculated.calculationStatus).toBeDefined();
  });

  it("mantém desvioPrecificacao padrão em 0 quando não informado", () => {
    const product = { ...baseProduct, desvioPrecificacao: undefined as unknown as number };
    const table = { ...baseTable, products: [product] };
    const result = recalculateProducts(table);
    expect(result[0].desvioPrecificacao).toBe(0);
  });

  it("mantém discount padrão em 0 quando não informado", () => {
    const product = { ...baseProduct, discount: undefined as unknown as number };
    const table = { ...baseTable, products: [product] };
    const result = recalculateProducts(table);
    expect(result[0].discount).toBe(0);
  });
});

// --- getCalculationWarnings ---
describe("getCalculationWarnings", () => {
  it("retorna aviso quando resellerPrice é 0", () => {
    const product = { ...baseProduct, resellerPrice: 0 };
    const warnings = getCalculationWarnings(product, baseTable);
    expect(warnings.some((w) => w.includes("Revenda"))).toBe(true);
  });

  it("retorna aviso quando PTAX é 0", () => {
    const table = { ...baseTable, ptax: 0 };
    const warnings = getCalculationWarnings(baseProduct, table);
    expect(warnings.some((w) => w.includes("PTAX"))).toBe(true);
  });

  it("retorna array vazio para produto e tabela válidos", () => {
    const product = { ...baseProduct, resellerPrice: 3720, calculatedFinalPrice: 4000, finalPriceDifference: 20 };
    const warnings = getCalculationWarnings(product, baseTable);
    expect(warnings).toHaveLength(0);
  });
});

// --- mergeHistory ---
describe("mergeHistory", () => {
  it("adiciona entradas novas sem duplicar", () => {
    const table = { ...baseTable, products: [baseProduct] };
    const existing = mergeHistory([], table);
    const merged = mergeHistory(existing, table);
    const ids = merged.map((e) => e.id);
    expect(ids.length).toBe(new Set(ids).size); // sem duplicatas
  });

  it("limita o histórico a 5000 entradas", () => {
    const manyEntries = Array.from({ length: 5100 }, (_, i) => ({
      id: `e-${i}`,
      tableId: "t-old",
      importedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      productCode: `P${i}`,
      productDescription: `Produto ${i}`,
      group: "G",
      packaging: "P",
      ptax: 5,
      freight: 80,
      icms: 7,
      marginIcms: 10,
      resellerPrice: 100,
      discount: 0,
      desvioPrecificacao: 0,
      finalPrice: 200,
    }));
    const table = { ...baseTable, products: [] };
    const result = mergeHistory(manyEntries, table);
    expect(result.length).toBeLessThanOrEqual(5000);
  });
});
