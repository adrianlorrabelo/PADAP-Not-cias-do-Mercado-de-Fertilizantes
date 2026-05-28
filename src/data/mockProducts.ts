import type { WeeklyTable } from "../types";
import { addHours } from "../utils/date";

export const mockWeeklyTable: WeeklyTable = {
  id: "wt-yara-2026-20",
  supplier: "Yara",
  expiresAt: addHours(36),
  ptax: 5.18,
  freight: 82,
  icms: 7,
  marginIcms: 10.8,
  importedAt: new Date().toISOString(),
  importedBy: "Bruna Oliveira",
  active: true,
  products: [
    { id: "p-1", code: "YB-1020", group: "Fertilizantes", description: "YaraBasa 10-20-20", reference: "Base café", characteristic: "Granulado", packaging: "Big bag", supplier: "Yara", producerPrice: 3550, resellerPrice: 3720, discount: 0, desvioPrecificacao: 0, finalPrice: 3980, available: true },
    { id: "p-2", code: "YM-0830", group: "Fertilizantes", description: "YaraMila 08-30-10", reference: "Plantio", characteristic: "Mistura premium", packaging: "Saco 50 kg", supplier: "Yara", producerPrice: 4020, resellerPrice: 4210, discount: 0, desvioPrecificacao: 0, finalPrice: 4490, available: true },
    { id: "p-3", code: "YV-CAL", group: "Foliares", description: "YaraVita Caltrac", reference: "Cálcio", characteristic: "Suspensão", packaging: "Galão 10 L", supplier: "Yara", producerPrice: 1480, resellerPrice: 1680, discount: 0, desvioPrecificacao: 0, finalPrice: 2140, available: true },
    { id: "p-4", code: "KCL-STD", group: "Potássicos", description: "KCl Granulado", reference: "Cloreto de Potássio", characteristic: "Granulado", packaging: "Big bag", supplier: "Fertipar", producerPrice: 2680, resellerPrice: 2790, discount: 0, desvioPrecificacao: 0, finalPrice: 3010, available: true },
    { id: "p-5", code: "MAP-1160", group: "Fosfatados", description: "MAP 11-60", reference: "Fosfatado", characteristic: "Importado", packaging: "Big bag", supplier: "Sibra", producerPrice: 4620, resellerPrice: 4780, discount: 0, desvioPrecificacao: 0, finalPrice: 5110, available: false },
    { id: "p-6", code: "URE-PRL", group: "Nitrogenados", description: "Ureia Perolada", reference: "Nitrogênio", characteristic: "Perolada", packaging: "Saco 50 kg", supplier: "Fertigran", producerPrice: 2860, resellerPrice: 2990, discount: 0, desvioPrecificacao: 0, finalPrice: 3290, available: true }
  ]
};
