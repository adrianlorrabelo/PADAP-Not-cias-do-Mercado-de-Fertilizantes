import type { ExchangeRatioItem } from "../types";

export function getMainExchangeRatio(items: ExchangeRatioItem[]) {
  return items.find((item) => item.status === "Favorável") ?? items[0];
}
