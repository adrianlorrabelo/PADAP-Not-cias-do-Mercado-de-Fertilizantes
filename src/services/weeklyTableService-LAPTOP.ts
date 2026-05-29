import type { Product, WeeklyTable } from "../types";

const tableStorageKey = "padap.weeklyTable.active";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function getListStatus(expiresAt: string) {
  const expiration = new Date(expiresAt);
  if (!expiresAt || Number.isNaN(expiration.getTime())) return "vencida";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiration.setHours(0, 0, 0, 0);
  const daysToExpire = Math.ceil((expiration.getTime() - today.getTime()) / 86400000);
  if (daysToExpire < 0) return "vencida";
  if (daysToExpire <= 3) return "vencendo";
  return "ativa";
}

export function getActiveWeeklyTable(): WeeklyTable | null {
  try {
    const table = JSON.parse(localStorage.getItem(tableStorageKey) || "null") as WeeklyTable | null;
    return table?.active ? table : null;
  } catch {
    return null;
  }
}

export function findProductInActiveWeeklyList(query: string): {
  product: Product;
  finalPrice: number;
  calculatedFinalPrice?: number | null;
  finalPriceDifference?: number | null;
  desvioPrecificacao: number;
  resellerPrice: number;
  commercialParameters: {
    ptax: number;
    freight: number;
    icms: number;
    marginIcms: number;
  };
  group: string;
  packaging: string;
  expiresAt: string;
  listStatus: string;
} | null {
  const table = getActiveWeeklyTable();
  const search = normalizeSearch(query);
  if (!table || !search) return null;

  const product = table.products.find((item) => normalizeSearch([
    item.code,
    item.description,
    item.group,
    item.reference,
    item.packaging
  ].join(" ")).includes(search));

  if (!product) return null;

  return {
    product,
    finalPrice: product.finalPrice,
    calculatedFinalPrice: product.calculatedFinalPrice ?? null,
    finalPriceDifference: product.finalPriceDifference ?? null,
    desvioPrecificacao: product.desvioPrecificacao || 0,
    resellerPrice: product.resellerPrice,
    commercialParameters: {
      ptax: table.ptax,
      freight: table.freight,
      icms: table.icms,
      marginIcms: table.marginIcms
    },
    group: product.group,
    packaging: product.packaging,
    expiresAt: table.expiresAt,
    listStatus: getListStatus(table.expiresAt)
  };
}
