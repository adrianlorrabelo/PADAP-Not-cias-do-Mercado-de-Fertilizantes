import type { MarketAlert, MarketNews } from "../types";

const now = new Date();
const isoMinutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();

export const mockTrustedMarketNews: MarketNews[] = [
  {
    id: "news-ptax",
    title: "PTAX avança e aumenta sensibilidade de propostas abertas",
    summary: "Câmbio mais firme exige cuidado com cotações emitidas com base anterior e validade longa.",
    tag: "Câmbio",
    category: "Câmbio",
    source: "Banco Central do Brasil",
    date: isoMinutesAgo(24),
    impact: "Pressiona tabela Yara e pacotes com insumos importados.",
    confidence: 100,
    url: "https://www.bcb.gov.br/estabilidadefinanceira/historicocotacoes",
    sourceStatus: "ativa"
  },
  {
    id: "news-globalfert",
    title: "Radar GlobalFert habilitado para fertilizantes",
    summary: "Fonte priorizada para notícias, importações, entregas, preços e análises do mercado brasileiro de fertilizantes.",
    tag: "Fertilizantes",
    category: "Fertilizantes",
    source: "GlobalFert",
    date: isoMinutesAgo(35),
    impact: "Ajuda compras e precificação a validar movimentos de ureia, MAP, KCl e disponibilidade regional.",
    confidence: 90,
    url: "https://globalfert.com.br/",
    sourceStatus: "ativa"
  },
  {
    id: "news-anda",
    title: "Radar ANDA habilitado para estatísticas setoriais",
    summary: "Fonte institucional para entregas, produção, importação e estatísticas do setor de adubos no Brasil.",
    tag: "Fertilizantes",
    category: "Oferta e demanda",
    source: "ANDA",
    date: isoMinutesAgo(42),
    impact: "Apoia leitura de volume, abastecimento e pressão de oferta no mercado nacional.",
    confidence: 95,
    url: "https://anda.org.br/",
    sourceStatus: "ativa"
  },
  {
    id: "news-noticias-agricolas",
    title: "Radar Notícias Agrícolas habilitado para insumos",
    summary: "Portal incluído para acompanhar fertilizantes, entregas, preços, importação, frete e geopolítica.",
    tag: "Fertilizantes",
    category: "Fertilizantes",
    source: "Notícias Agrícolas",
    date: isoMinutesAgo(50),
    impact: "Traz leitura frequente do mercado brasileiro e ajuda a orientar briefing comercial.",
    confidence: 80,
    url: "https://www.noticiasagricolas.com.br/",
    sourceStatus: "ativa"
  },
  {
    id: "news-agrolink",
    title: "Radar Agrolink Fertilizantes habilitado",
    summary: "Fonte adicionada para notícias, cotações, conteúdos técnicos e informações sobre nutrientes.",
    tag: "Fertilizantes",
    category: "Fertilizantes",
    source: "Agrolink",
    date: isoMinutesAgo(63),
    impact: "Complementa o monitoramento técnico de fertilizantes e nutrição vegetal.",
    confidence: 78,
    url: "https://www.agrolink.com.br/fertilizantes/nutrientes",
    sourceStatus: "monitorando"
  },
  {
    id: "news-cultivar",
    title: "Radar Revista Cultivar habilitado para fertilizantes",
    summary: "Fonte útil para notícias do setor, empresas, fábricas, fertilizantes especiais e nutrição vegetal.",
    tag: "Fertilizantes",
    category: "Fertilizantes",
    source: "Revista Cultivar",
    date: isoMinutesAgo(72),
    impact: "Apoia argumentos técnicos e acompanhamento de especialidades.",
    confidence: 78,
    url: "https://revistacultivar.com.br/noticias?categoria=fertilizantes",
    sourceStatus: "monitorando"
  },
  {
    id: "news-canal-rural",
    title: "Radar Canal Rural habilitado para custos e relação de troca",
    summary: "Fonte agro adicionada para insumos, fertilizantes, câmbio, custos de produção e relação de troca.",
    tag: "Mercado",
    category: "Culturas",
    source: "Canal Rural",
    date: isoMinutesAgo(81),
    impact: "Ajuda consultores a conectar fertilizantes com culturas e poder de compra do produtor.",
    confidence: 78,
    url: "https://www.canalrural.com.br/",
    sourceStatus: "monitorando"
  },
  {
    id: "news-money-times",
    title: "Radar Money Times habilitado para fertilizantes",
    summary: "Fonte econômica incluída para empresas, mercado financeiro e impactos macroeconômicos em fertilizantes.",
    tag: "Mercado",
    category: "Fertilizantes",
    source: "Money Times",
    date: isoMinutesAgo(88),
    impact: "Apoia leitura de preço, câmbio, empresas e risco macro para compras.",
    confidence: 80,
    url: "https://www.moneytimes.com.br/tag/fertilizantes/",
    sourceStatus: "monitorando"
  },
  {
    id: "news-infomoney",
    title: "Radar InfoMoney Agro/Business habilitado",
    summary: "Fonte adicionada para ANDA, empresas, importação, Petrobras, mercado brasileiro e custos de insumos.",
    tag: "Mercado",
    category: "Importações",
    source: "InfoMoney",
    date: isoMinutesAgo(96),
    impact: "Ajuda a cruzar dados setoriais com empresas e cenário econômico.",
    confidence: 80,
    url: "https://www.infomoney.com.br/business/",
    sourceStatus: "monitorando"
  },
  {
    id: "news-agribrasilis",
    title: "Radar AgriBrasilis habilitado para análises",
    summary: "Fonte em português e inglês para análises sobre mercado agro brasileiro, preços e tendência de fertilizantes.",
    tag: "Mercado",
    category: "Fertilizantes",
    source: "AgriBrasilis",
    date: isoMinutesAgo(108),
    impact: "Complementa a visão nacional com análises de contexto para briefing interno.",
    confidence: 78,
    url: "https://agribrasilis.com/",
    sourceStatus: "monitorando"
  },
  {
    id: "news-anba",
    title: "Radar ANBA habilitado para comércio Brasil-países árabes",
    summary: "Fonte adicionada para monitorar comércio, preços e importações com países relevantes na origem de fertilizantes.",
    tag: "Mercado",
    category: "Importações",
    source: "ANBA",
    date: isoMinutesAgo(116),
    impact: "Apoia leitura geopolítica e de disponibilidade de insumos importados.",
    confidence: 78,
    url: "https://anba.com.br/",
    sourceStatus: "monitorando"
  },
  {
    id: "news-cibra",
    title: "Radar Cibra habilitado para conteúdos comerciais",
    summary: "Fonte institucional adicionada para conteúdos sobre fertilizantes minerais, nutrição e mercado de insumos.",
    tag: "Fertilizantes",
    category: "Fertilizantes",
    source: "Cibra",
    date: isoMinutesAgo(125),
    impact: "Útil como leitura complementar, com menor peso por ser fonte institucional/comercial.",
    confidence: 70,
    url: "https://www.cibra.com/noticias-agricolas/",
    sourceStatus: "monitorando"
  },
  {
    id: "news-reuters",
    title: "Radar Reuters habilitado para commodities e geopolítica",
    summary: "Fonte internacional priorizada para mercado, Petrobras, importações e empresas globais de fertilizantes.",
    tag: "Mercado",
    category: "Geopolítica",
    source: "Reuters",
    date: isoMinutesAgo(132),
    impact: "Ajuda a antecipar riscos externos que podem afetar preço e disponibilidade no Brasil.",
    confidence: 90,
    url: "https://www.reuters.com/",
    sourceStatus: "monitorando"
  }
];

export const mockInternalMarketAlerts: MarketAlert[] = [
  { id: "alert-ptax", type: "Risco cambial", title: "PTAX em atenção", message: "PTAX subiu 0,73% e pode afetar propostas abertas. Confirme validade com compras antes de prometer preço.", relatedTo: "PTAX", priority: "Alta", resolved: false },
  { id: "alert-kcl", type: "Oportunidade", title: "KCl em oportunidade", message: "KCl recuou no mercado. Clientes com demanda de potássio podem ser trabalhados hoje.", relatedTo: "KCl", priority: "Alta", resolved: false },
  { id: "alert-margin", type: "Risco de margem", title: "Pacotes abaixo da meta", message: "Dois pacotes podem ficar abaixo da meta se a nova base cambial for aplicada.", relatedTo: "Pacotes", priority: "Crítica", resolved: false },
  { id: "alert-info", type: "Informativo", title: "Fechamento programado", message: "Resumo de fechamento do dia será gerado automaticamente às 17:00.", relatedTo: "Fechamento", priority: "Baixa", resolved: false }
];
