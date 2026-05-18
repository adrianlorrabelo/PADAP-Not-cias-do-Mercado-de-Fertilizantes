import type { MarketAlert, MarketNews } from "../types";

const now = new Date();
const isoMinutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();

export const mockTrustedMarketNews: MarketNews[] = [
  {
    id: "news-ptax",
    title: "PTAX avanca e aumenta sensibilidade de propostas abertas",
    summary: "Câmbio mais firme exige cuidado com cotações emitidas com base anterior e validade longa.",
    tag: "Câmbio",
    category: "Câmbio",
    source: "Banco Central do Brasil",
    date: isoMinutesAgo(24),
    impact: "Pressiona tabela Yara e pacotes com insumos importados.",
    confidence: 100,
    url: "https://www.bcb.gov.br/estabilidadefinanceira/históricocotações",
    sourceStatus: "ativa"
  },
  {
    id: "news-kcl",
    title: "KCl mostra recuo pontual e abre janela em potássicos",
    summary: "Indicadores de oferta sugerem oportunidade tática para pacotes de café e HF.",
    tag: "Fertilizantes",
    category: "Fertilizantes",
    source: "GlobalFert",
    date: isoMinutesAgo(52),
    impact: "Clientes com histórico de potássio podem ser trabalhados hoje.",
    confidence: 85,
    url: "https://globalfert.com.br/",
    sourceStatus: "monitorando"
  },
  {
    id: "news-urea",
    title: "Nitrogenados seguem volateis no mercado internacional",
  summary: "Movimento externo e logística elevam risco de reconfirmação em ureia.",
    tag: "Fertilizantes",
    category: "Matérias-primas",
    source: "The Fertilizer Institute",
    date: isoMinutesAgo(71),
    impact: "Revisar propostas de nitrogenados e evitar prometer preço antigo.",
    confidence: 85,
    url: "https://www.tfi.org/",
    sourceStatus: "ativa"
  },
  {
    id: "news-coffee",
    title: "Café melhora no físico e fortalece argumento de troca",
    summary: "Preço da cultura aumenta poder de compra relativo em itens de potássio.",
    tag: "Culturas",
    category: "Culturas",
    source: "CEPEA",
    date: isoMinutesAgo(96),
    impact: "Reabrir conversas de planejamento com produtores de café.",
    confidence: 95,
    url: "https://www.cepea.esalq.usp.br/",
    sourceStatus: "ativa"
  }
];

export const mockInternalMarketAlerts: MarketAlert[] = [
  { id: "alert-ptax", type: "Risco cambial", title: "PTAX em atenção", message: "PTAX subiu 0,73% e pode afetar propostas abertas. Confirme validade com compras antes de prometer preço.", relatedTo: "PTAX", priority: "Alta", resolved: false },
  { id: "alert-kcl", type: "Oportunidade", title: "KCl em oportunidade", message: "KCl recuou no mercado. Clientes com demanda de potássio podem ser trabalhados hoje.", relatedTo: "KCl", priority: "Alta", resolved: false },
  { id: "alert-margin", type: "Risco de margem", title: "Pacotes abaixo da meta", message: "Dois pacotes podem ficar abaixo da meta se a nova base cambial for aplicada.", relatedTo: "Pacotes", priority: "Crítica", resolved: false },
  { id: "alert-info", type: "Informativo", title: "Fechamento programado", message: "Resumo de fechamento do dia sera gerado automaticamente às 17:00.", relatedTo: "Fechamento", priority: "Baixa", resolved: false }
];
