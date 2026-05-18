import type { MarketSource } from "../types";

const lastUpdate = new Date().toISOString();

export const mockMarketSources: MarketSource[] = [
  { id: "bcb", name: "Banco Central do Brasil", tier: "Nível 1", type: "Oficial", category: "Câmbio", confidence: 100, lastUpdate, link: "https://www.bcb.gov.br/", status: "ativa", note: "Fonte base para PTAX e câmbio." },
  { id: "comex", name: "Comex Stat / MDIC", tier: "Nível 1", type: "Oficial", category: "Importações", confidence: 100, lastUpdate, link: "https://comexstat.mdic.gov.br/", status: "ativa", note: "Referência para fluxo de importação." },
  { id: "cepea", name: "CEPEA", tier: "Nível 1", type: "Oficial/Acadêmica", category: "Culturas", confidence: 95, lastUpdate, link: "https://www.cepea.esalq.usp.br/", status: "ativa", note: "Indicadores agropecuarios nacionais." },
  { id: "conab", name: "CONAB", tier: "Nível 1", type: "Oficial", category: "Oferta e demanda", confidence: 95, lastUpdate, link: "https://www.conab.gov.br/", status: "ativa", note: "Safras e abastecimento." },
  { id: "world-bank", name: "World Bank Pink Sheet", tier: "Nível 1", type: "Internacional", category: "Commodities", confidence: 95, lastUpdate, link: "https://www.worldbank.org/en/research/commodity-markets", status: "monitorando", note: "Série internacional de commodities." },
  { id: "fao", name: "FAO / AMIS", tier: "Nível 1", type: "Internacional", category: "Alimentos", confidence: 95, lastUpdate, link: "https://www.amis-outlook.org/", status: "monitorando", note: "Monitoramento global de alimentos." },
  { id: "ifastat", name: "IFASTAT", tier: "Nível 1", type: "Setorial", category: "Fertilizantes", confidence: 95, lastUpdate, link: "https://www.ifastat.org/", status: "monitorando", note: "Base setorial de fertilizantes." },
  { id: "argus", name: "Argus", tier: "Nível 2", type: "Inteligência", category: "Fertilizantes", confidence: 90, lastUpdate, link: "https://www.argusmedia.com/", status: "monitorando", note: "Referência especializada, integração futura." },
  { id: "icis", name: "ICIS", tier: "Nível 2", type: "Inteligência", category: "Químicos", confidence: 90, lastUpdate, link: "https://www.icis.com/", status: "monitorando", note: "Referência para matérias-primas." },
  { id: "cru", name: "CRU", tier: "Nível 2", type: "Inteligência", category: "Commodities", confidence: 90, lastUpdate, link: "https://www.crugroup.com/", status: "monitorando", note: "Preços e análises globais." },
  { id: "globalfert", name: "GlobalFert", tier: "Nível 2", type: "Inteligência", category: "Fertilizantes", confidence: 85, lastUpdate, link: "https://globalfert.com.br/", status: "ativa", note: "Inteligência nacional de fertilizantes." },
  { id: "tfi", name: "The Fertilizer Institute", tier: "Nível 2", type: "Setorial", category: "Fertilizantes", confidence: 85, lastUpdate, link: "https://www.tfi.org/", status: "ativa", note: "Referência setorial internacional." },
  { id: "reuters", name: "Reuters", tier: "Nível 2", type: "Notícias", category: "Macro", confidence: 90, lastUpdate, link: "https://www.reuters.com/", status: "monitorando", note: "Notícias globais confiáveis." },
  { id: "notícias-agricolas", name: "Notícias Agricolas", tier: "Nível 3", type: "Notícias", category: "Agro", confidence: 75, lastUpdate, link: "https://www.notíciasagricolas.com.br/", status: "ativa", note: "Apoio para leitura comercial." },
  { id: "agrolink", name: "Agrolink", tier: "Nível 3", type: "Notícias", category: "Agro", confidence: 75, lastUpdate, link: "https://www.agrolink.com.br/", status: "monitorando", note: "Apoio informativo." },
  { id: "cultivar", name: "Revista Cultivar", tier: "Nível 3", type: "Notícias", category: "Agro", confidence: 75, lastUpdate, link: "https://revistacultivar.com.br/", status: "monitorando", note: "Conteúdo técnico e mercado." },
  { id: "farmnews", name: "Farmnews", tier: "Nível 3", type: "Notícias", category: "Agro", confidence: 70, lastUpdate, link: "https://www.farmnews.com.br/", status: "monitorando", note: "Apoio de contexto." },
  { id: "comex-brasil", name: "Comex do Brasil", tier: "Nível 3", type: "Notícias", category: "Comércio exterior", confidence: 75, lastUpdate, link: "https://www.comexdobrasil.com/", status: "monitorando", note: "Apoio para comercio exterior." },
  { id: "agrofy", name: "Agrofy News", tier: "Nível 3", type: "Notícias", category: "Agro", confidence: 70, lastUpdate, link: "https://news.agrofy.com.br/", status: "monitorando", note: "Leitura complementar." }
];
