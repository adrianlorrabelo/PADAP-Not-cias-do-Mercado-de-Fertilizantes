import { mockInternalMarketAlerts } from "../data/mockMarketNews";
import { mockCommercialOpportunities, mockExchangeRatios } from "../data/mockMarketOpportunities";
import { mockMarketSources } from "../data/mockMarketSources";
import type { GeneratedMarketReport, MarketReportConfig } from "../types";

type MarketReportMovement = {
  indicator: string;
  movement: string;
  impact: string;
  action: string;
};

type MarketReportData = {
  title: string;
  generatedAt: string;
  period: string;
  generatedBy: string;
  summary: string;
  bullets: string[];
  movements: MarketReportMovement[];
  fertilizers: string[];
  crops: string[];
  exchangeRatios: string[];
  opportunities: { title: string; reason: string; action: string }[];
  alerts: string[];
  recommendation: string[];
  sources: { name: string; update: string; confidence: string }[];
};

export function getDefaultMarketReportConfig(): MarketReportConfig {
  return {
    period: "Hoje",
    type: "Briefing comercial rápido",
    crops: ["Café", "Milho", "Soja", "Cenoura", "Alho", "Cebola"],
    fertilizers: ["Ureia", "MAP", "KCl", "Fosfatados", "Potássicos", "Nitrogenados"],
    includeExchangeRatio: true,
    includeNews: true,
    includeOpportunities: true,
    includeRecommendations: true,
    includeSources: true
  };
}

export function validateMarketReportConfig(config: MarketReportConfig): string[] {
  const errors: string[] = [];
  if (!config.period) errors.push("Selecione o período do relatório.");
  if (!config.type) errors.push("Selecione o tipo de relatório.");
  if (!config.crops.length) errors.push("Selecione pelo menos uma cultura.");
  if (!config.fertilizers.length) errors.push("Selecione pelo menos um fertilizante.");
  return errors;
}

export function generateMarketReportFileName(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `Relatorio_Estrategico_Mercado_PADAP_${yyyy}-${mm}-${dd}.pdf`;
}

export function createGeneratedMarketReport(config: MarketReportConfig): GeneratedMarketReport {
  const generatedAt = new Date();
  return {
    id: `report-${generatedAt.getTime()}`,
    title: "Relatório Estratégico de Mercado",
    period: config.period,
    generatedAt: generatedAt.toISOString(),
    generatedBy: "PADAP Intelligence",
    config,
    fileName: generateMarketReportFileName(generatedAt)
  };
}

export function buildMarketReportData(report: GeneratedMarketReport): MarketReportData {
  const config = report.config;
  const generatedAt = new Date(report.generatedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  return {
    title: "Relatório Estratégico de Mercado",
    generatedAt,
    period: report.period,
    generatedBy: report.generatedBy,
    summary: "Mercado volátil, com pressão cambial, nitrogenados em atenção e oportunidade comercial em potássicos.",
    bullets: [
      "PTAX em alta pode pressionar propostas antigas.",
      "Ureia segue em monitoramento e exige revisão em nitrogenados.",
      "KCl apresenta oportunidade para clientes com demanda de potássio.",
      "Café exige atenção na relação de troca antes de prometer condição."
    ],
    movements: [
      { indicator: "PTAX", movement: "Alta", impact: "Pressiona tabela e propostas antigas", action: "Usar validade curta e reconfirmar condição" },
      { indicator: "Ureia", movement: "Volátil", impact: "Risco em nitrogenados", action: "Recalcular antes de enviar proposta" },
      { indicator: "KCl", movement: "Queda", impact: "Oportunidade comercial", action: "Ativar clientes com demanda de potássio" },
      { indicator: "Café", movement: "Alta", impact: "Pode melhorar poder de compra", action: "Usar argumento de relação de troca" }
    ],
    fertilizers: config.fertilizers.map((item) => `${item}: monitorar preço, disponibilidade e validade comercial.`),
    crops: config.crops.map((item) => `${item}: revisar relação de troca e janela de negociação.`),
    exchangeRatios: config.includeExchangeRatio
      ? mockExchangeRatios.slice(0, 4).map((item) => `${item.pair}: antes ${item.previous} ${item.unit}, agora ${item.current} ${item.unit}. ${item.interpretation}`)
      : ["Relação de troca não incluída nesta configuração."],
    opportunities: config.includeOpportunities
      ? mockCommercialOpportunities.slice(0, 4).map((item) => ({ title: item.opportunity, reason: item.justification, action: item.recommendedAction }))
      : [{ title: "Oportunidades não incluídas", reason: "Opção desmarcada na configuração.", action: "Gerar relatório completo quando necessário." }],
    alerts: [
      "Confirmar validade de proposta antes de enviar ao produtor.",
      "Revisar PTAX utilizada em propostas antigas.",
      "Recalcular nitrogenados antes de prometer preço.",
      "Confirmar disponibilidade com compras em produtos de maior giro.",
      ...mockInternalMarketAlerts.slice(0, 2).map((alert) => alert.message)
    ],
    recommendation: [
      "Revisar propostas impactadas por PTAX e ureia.",
      "Trabalhar clientes com demanda de potássio enquanto KCl estiver favorável.",
      "Enviar briefing WhatsApp aos consultores.",
      "Usar validade curta em cenários de maior volatilidade."
    ],
    sources: config.includeSources
      ? mockMarketSources.slice(0, 7).map((source) => ({
        name: source.name,
        update: source.lastUpdate,
        confidence: `${source.confidence}%`
      }))
      : [{ name: "Fontes não incluídas", update: generatedAt, confidence: "-" }]
  };
}

export async function createMarketReportPdfBlob(report: GeneratedMarketReport) {
  const data = buildMarketReportData(report);
  const pdfBytes = buildPdfBytes(data);
  return new Blob([pdfBytes], { type: "application/pdf" });
}

export async function downloadMarketReportPdf(report: GeneratedMarketReport) {
  const blob = await createMarketReportPdfBlob(report);
  if (!blob || blob.size < 1500) {
    throw new Error("PDF vazio ou inválido.");
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = report.fileName || generateMarketReportFileName();
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const downloadMarketReport = downloadMarketReportPdf;

function buildPdfBytes(data: MarketReportData) {
  const pages = paginateReportLines(buildReportLines(data));
  const objects: number[][] = [];
  const pageObjectIds: number[] = [];
  const fontObjectId = 3 + pages.length * 2;

  objects.push(ascii("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"));
  objects.push(ascii(`2 0 obj\n<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>\nendobj\n`));

  pages.forEach((page, index) => {
    const pageId = 3 + index * 2;
    const streamId = pageId + 1;
    pageObjectIds.push(pageId);
    objects.push(ascii(`${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${streamId} 0 R >>\nendobj\n`));
    const content = buildPageContent(page, index + 1, pages.length);
    objects.push(concatBytes(ascii(`${streamId} 0 obj\n<< /Length ${content.length} >>\nstream\n`), content, ascii("\nendstream\nendobj\n")));
  });

  objects.push(ascii(`${fontObjectId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`));

  let currentOffset = ascii("%PDF-1.4\n").length;
  const chunks: number[][] = [ascii("%PDF-1.4\n")];
  const offsets = [0];
  for (const object of objects) {
    offsets.push(currentOffset);
    chunks.push(object);
    currentOffset += object.length;
  }

  const xrefOffset = currentOffset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(ascii(xref));

  return new Uint8Array(chunks.flat());
}

function buildReportLines(data: MarketReportData) {
  const lines: { text: string; size?: number; bold?: boolean }[] = [
    { text: "PADAP Intelligence", size: 12, bold: true },
    { text: data.title, size: 18, bold: true },
    { text: `Data de geração: ${data.generatedAt}` },
    { text: `Período analisado: ${data.period}` },
    { text: `Gerado por: ${data.generatedBy}` },
    { text: "" },
    { text: "Resumo executivo", size: 13, bold: true },
    { text: data.summary }
  ];

  data.bullets.forEach((bullet) => lines.push({ text: `• ${bullet}` }));
  lines.push({ text: "" }, { text: "Principais movimentos do mercado", size: 13, bold: true });
  data.movements.forEach((item) => lines.push({ text: `${item.indicator} | ${item.movement} | ${item.impact} | ${item.action}` }));

  lines.push({ text: "" }, { text: "Fertilizantes em destaque", size: 13, bold: true });
  data.fertilizers.forEach((item) => lines.push({ text: `• ${item}` }));
  lines.push({ text: "" }, { text: "Culturas em destaque", size: 13, bold: true });
  data.crops.forEach((item) => lines.push({ text: `• ${item}` }));
  lines.push({ text: "" }, { text: "Relação de troca", size: 13, bold: true });
  data.exchangeRatios.forEach((item) => lines.push({ text: `• ${item}` }));
  lines.push({ text: "" }, { text: "Oportunidades comerciais", size: 13, bold: true });
  data.opportunities.forEach((item) => lines.push({ text: `• ${item.title}. Motivo: ${item.reason}. Ação recomendada: ${item.action}` }));
  lines.push({ text: "" }, { text: "Alertas para consultores", size: 13, bold: true });
  data.alerts.forEach((item) => lines.push({ text: `• ${item}` }));
  lines.push({ text: "" }, { text: "Recomendação comercial do dia", size: 13, bold: true });
  data.recommendation.forEach((item) => lines.push({ text: `• ${item}` }));
  lines.push({ text: "" }, { text: "Fontes e atualização", size: 13, bold: true });
  data.sources.forEach((source) => lines.push({ text: `• ${source.name} - ${source.update} - confiança ${source.confidence}` }));

  return lines.flatMap((line) => wrapLine(line, line.size && line.size > 12 ? 78 : 94));
}

function wrapLine(line: { text: string; size?: number; bold?: boolean }, limit: number) {
  if (!line.text || line.text.length <= limit) return [line];
  const words = line.text.split(" ");
  const wrapped: { text: string; size?: number; bold?: boolean }[] = [];
  let current = "";
  words.forEach((word) => {
    if (`${current} ${word}`.trim().length > limit) {
      wrapped.push({ ...line, text: current });
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  });
  if (current) wrapped.push({ ...line, text: current });
  return wrapped;
}

function paginateReportLines(lines: { text: string; size?: number; bold?: boolean }[]) {
  const pages: { text: string; size?: number; bold?: boolean }[][] = [];
  let current: { text: string; size?: number; bold?: boolean }[] = [];
  let y = 760;

  lines.forEach((line) => {
    const size = line.size ?? 9.5;
    const height = line.text ? size + 7 : 10;
    if (y - height < 64 && current.length) {
      pages.push(current);
      current = [];
      y = 760;
    }
    current.push(line);
    y -= height;
  });
  if (current.length) pages.push(current);
  return pages;
}

function buildPageContent(lines: { text: string; size?: number; bold?: boolean }[], pageNumber: number, totalPages: number) {
  const bytes: number[] = [];
  pushAscii(bytes, "0.047 0.294 0.239 rg\n0 808 595 34 re f\n");
  pushAscii(bytes, "1 1 1 rg\nBT /F1 10 Tf 34 820 Td ");
  pushPdfText(bytes, "PADAP Intelligence");
  pushAscii(bytes, " Tj ET\n");
  pushAscii(bytes, "0.12 0.16 0.20 rg\n");

  let y = 780;
  lines.forEach((line) => {
    const size = line.size ?? 9.5;
    if (!line.text) {
      y -= 10;
      return;
    }
    if (line.bold || size >= 13) pushAscii(bytes, "0.047 0.294 0.239 rg\n");
    else pushAscii(bytes, "0.12 0.16 0.20 rg\n");
    pushAscii(bytes, `BT /F1 ${size} Tf 42 ${y} Td `);
    pushPdfText(bytes, line.text);
    pushAscii(bytes, " Tj ET\n");
    y -= size + 7;
  });

  pushAscii(bytes, "0.45 0.50 0.56 rg\nBT /F1 7 Tf 42 34 Td ");
  pushPdfText(bytes, "PADAP Agronegócios - Inteligência comercial para decisões melhores.");
  pushAscii(bytes, " Tj ET\nBT /F1 7 Tf 520 34 Td ");
  pushPdfText(bytes, `${pageNumber}/${totalPages}`);
  pushAscii(bytes, " Tj ET\n");
  return bytes;
}

function pushPdfText(target: number[], text: string) {
  target.push("(".charCodeAt(0));
  for (const char of text) {
    if (char === "(" || char === ")" || char === "\\") target.push("\\".charCodeAt(0));
    if (char === "•") {
      target.push(149);
      continue;
    }
    const code = char.charCodeAt(0);
    target.push(code <= 255 ? code : "?".charCodeAt(0));
  }
  target.push(")".charCodeAt(0));
}

function ascii(value: string) {
  return Array.from(value).map((char) => char.charCodeAt(0));
}

function pushAscii(target: number[], value: string) {
  target.push(...ascii(value));
}

function concatBytes(...chunks: number[][]) {
  return chunks.flat();
}
