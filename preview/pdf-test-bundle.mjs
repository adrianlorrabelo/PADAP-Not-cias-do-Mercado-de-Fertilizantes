// <stdin>
import React2 from "react";
import { renderToBuffer } from "@react-pdf/renderer";

// src/components/market/report/MarketReportDocument.tsx
import { Document, Font, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import React from "react";
Font.registerHyphenationCallback((word) => [word]);
var colors = {
  page: "#0B1412",
  pageSoft: "#101E1A",
  panel: "#13231F",
  panelAlt: "#172A25",
  line: "#29443C",
  lineSoft: "#1F352F",
  text: "#E9F5EF",
  muted: "#9CB4AB",
  faint: "#6F877D",
  green: "#00C800",
  greenDark: "#00843D",
  amber: "#F2B84B",
  red: "#F87171",
  blue: "#38BDF8",
  gray: "#94A3B8",
  white: "#FFFFFF"
};
var pagePaddingX = 34;
var styles = StyleSheet.create({
  page: {
    backgroundColor: colors.page,
    color: colors.text,
    fontFamily: "Helvetica",
    fontSize: 8.4,
    lineHeight: 1.35,
    paddingBottom: 44
  },
  hero: {
    backgroundColor: "#07110F",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    paddingHorizontal: pagePaddingX,
    paddingTop: 28,
    paddingBottom: 24
  },
  pageContent: {
    paddingHorizontal: pagePaddingX,
    paddingTop: 18
  },
  header: {
    alignItems: "center",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: pagePaddingX,
    paddingBottom: 11,
    paddingTop: 18
  },
  brand: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  brandText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 700
  },
  headerMeta: {
    color: colors.muted,
    fontSize: 7.2,
    textAlign: "right"
  },
  tag: {
    alignSelf: "flex-start",
    borderColor: colors.green,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.green,
    fontSize: 7,
    fontWeight: 700,
    marginBottom: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.white,
    fontSize: 25,
    fontWeight: 700,
    lineHeight: 1.05,
    maxWidth: 430
  },
  heroSubtitle: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 9,
    maxWidth: 390
  },
  metaStrip: {
    borderColor: colors.line,
    borderRadius: 7,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    padding: 10
  },
  metaItem: {
    flex: 1
  },
  label: {
    color: colors.faint,
    fontSize: 6.5,
    fontWeight: 700,
    marginBottom: 3,
    textTransform: "uppercase"
  },
  value: {
    color: colors.text,
    fontSize: 8.2,
    fontWeight: 700
  },
  section: {
    marginBottom: 14
  },
  sectionHeader: {
    alignItems: "flex-end",
    borderBottomColor: colors.lineSoft,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 9,
    paddingBottom: 7
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 700
  },
  sectionKicker: {
    color: colors.muted,
    fontSize: 7
  },
  paragraph: {
    color: colors.text,
    fontSize: 9.5,
    lineHeight: 1.42,
    marginBottom: 8
  },
  panel: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 7,
    borderWidth: 1,
    padding: 11
  },
  callout: {
    backgroundColor: "#0E261E",
    borderColor: colors.greenDark,
    borderRadius: 7,
    borderWidth: 1,
    marginTop: 10,
    padding: 11
  },
  calloutTitle: {
    color: colors.green,
    fontSize: 9.2,
    fontWeight: 700,
    marginBottom: 5
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 4
  },
  bulletDot: {
    color: colors.green,
    fontSize: 9,
    fontWeight: 700,
    marginRight: 5,
    marginTop: -1
  },
  bulletText: {
    color: colors.text,
    flex: 1,
    fontSize: 8.2,
    lineHeight: 1.35
  },
  trendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  trendCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 7,
    borderWidth: 1,
    minHeight: 77,
    padding: 10,
    width: "31.9%"
  },
  trendCardWide: {
    width: "48.9%"
  },
  cardTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7
  },
  cardTitle: {
    color: colors.white,
    fontSize: 10.2,
    fontWeight: 700
  },
  cardValue: {
    color: colors.text,
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 4
  },
  miniText: {
    color: colors.muted,
    fontSize: 7.5,
    lineHeight: 1.32
  },
  table: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 7,
    borderWidth: 1,
    overflow: "hidden"
  },
  tableHeader: {
    backgroundColor: "#073B3D",
    color: colors.white,
    flexDirection: "row",
    fontSize: 6.7,
    fontWeight: 700,
    textTransform: "uppercase"
  },
  row: {
    borderTopColor: colors.lineSoft,
    borderTopWidth: 1,
    flexDirection: "row",
    minHeight: 34
  },
  rowAlt: {
    backgroundColor: colors.panelAlt
  },
  cell: {
    borderRightColor: colors.lineSoft,
    borderRightWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 6
  },
  cellLast: {
    borderRightWidth: 0
  },
  strongCell: {
    color: colors.white,
    fontWeight: 700
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    fontSize: 6.6,
    fontWeight: 700,
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  recommendationGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10
  },
  recommendationColumn: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 7,
    borderWidth: 1,
    padding: 10,
    width: "32.2%"
  },
  recommendationTitle: {
    color: colors.white,
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 6
  },
  footer: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: 1,
    bottom: 16,
    color: colors.muted,
    flexDirection: "row",
    fontSize: 6.8,
    justifyContent: "space-between",
    left: pagePaddingX,
    paddingTop: 8,
    position: "absolute",
    right: pagePaddingX
  },
  footerLeft: {
    width: "72%"
  },
  footerBrand: {
    color: colors.green,
    fontWeight: 700
  },
  pageNumber: {
    color: colors.text,
    fontSize: 7,
    fontWeight: 700
  }
});
function MarketReportDocument({ data }) {
  return data.audience === "client" ? /* @__PURE__ */ React.createElement(ClientReport, { data }) : /* @__PURE__ */ React.createElement(ConsultantReport, { data });
}
function ClientReport({ data }) {
  return /* @__PURE__ */ React.createElement(Document, { title: data.title, author: "PADAP Intelligence", subject: "Relat\xF3rio de mercado para produtor" }, /* @__PURE__ */ React.createElement(Page, { size: "A4", style: styles.page, wrap: true }, /* @__PURE__ */ React.createElement(ReportHeader, { data, cover: true, label: "Cliente / Produtor" }), /* @__PURE__ */ React.createElement(View, { style: styles.pageContent }, /* @__PURE__ */ React.createElement(ExecutiveSummary, { data, mode: "client" }), /* @__PURE__ */ React.createElement(TrendCards, { items: data.trendCards })), /* @__PURE__ */ React.createElement(ReportFooter, { data })), /* @__PURE__ */ React.createElement(ReportPage, { data, label: "Produtos acompanhados" }, /* @__PURE__ */ React.createElement(ProductTrendTable, { items: data.productTrends })), /* @__PURE__ */ React.createElement(ReportPage, { data, label: "Impacto por cultura" }, /* @__PURE__ */ React.createElement(CultureImpactTable, { items: data.cultureImpacts })), /* @__PURE__ */ React.createElement(ReportPage, { data, label: "Frete, d\xF3lar e recomenda\xE7\xE3o" }, /* @__PURE__ */ React.createElement(FreightLogisticsTable, { items: data.freightLogistics.slice(0, 4), simple: true }), /* @__PURE__ */ React.createElement(RecommendationBlock, { recommendation: data.recommendation, title: "Recomenda\xE7\xE3o PADAP da semana" })));
}
function ConsultantReport({ data }) {
  return /* @__PURE__ */ React.createElement(Document, { title: data.title, author: "PADAP Intelligence", subject: "Relat\xF3rio t\xE9cnico e comercial de mercado" }, /* @__PURE__ */ React.createElement(Page, { size: "A4", style: styles.page, wrap: true }, /* @__PURE__ */ React.createElement(ReportHeader, { data, cover: true, label: "Consultores" }), /* @__PURE__ */ React.createElement(View, { style: styles.pageContent }, /* @__PURE__ */ React.createElement(ExecutiveSummary, { data, mode: "consultant" }), /* @__PURE__ */ React.createElement(TrendCards, { items: data.trendCards })), /* @__PURE__ */ React.createElement(ReportFooter, { data })), /* @__PURE__ */ React.createElement(ReportPage, { data, label: "Fam\xEDlias de produto" }, /* @__PURE__ */ React.createElement(ProductFamilyAnalysis, { items: data.productFamilies })), /* @__PURE__ */ React.createElement(ReportPage, { data, label: "Pre\xE7os referenciais" }, /* @__PURE__ */ React.createElement(PriceReferenceTable, { items: data.priceReferences })), /* @__PURE__ */ React.createElement(ReportPage, { data, label: "Fretes e log\xEDstica" }, /* @__PURE__ */ React.createElement(FreightLogisticsTable, { items: data.freightLogistics })), /* @__PURE__ */ React.createElement(ReportPage, { data, label: "Argumentos de venda" }, /* @__PURE__ */ React.createElement(ConsultantSalesArguments, { items: data.salesArguments })), /* @__PURE__ */ React.createElement(ReportPage, { data, label: "Alertas internos" }, /* @__PURE__ */ React.createElement(InternalAlerts, { items: data.internalAlerts }), /* @__PURE__ */ React.createElement(RecommendationBlock, { recommendation: data.recommendation, title: "A\xE7\xE3o pr\xE1tica do consultor", compact: true })));
}
function ReportPage({ data, label, children }) {
  return /* @__PURE__ */ React.createElement(Page, { size: "A4", style: styles.page, wrap: true }, /* @__PURE__ */ React.createElement(ReportHeader, { data, label }), /* @__PURE__ */ React.createElement(View, { style: styles.pageContent }, children), /* @__PURE__ */ React.createElement(ReportFooter, { data }));
}
function ReportHeader({ data, cover = false, label }) {
  if (cover) {
    return /* @__PURE__ */ React.createElement(View, { style: styles.hero, wrap: false }, /* @__PURE__ */ React.createElement(View, { style: styles.brand }, /* @__PURE__ */ React.createElement(PadapMark, null), /* @__PURE__ */ React.createElement(Text, { style: styles.brandText }, "PADAP Intelligence")), /* @__PURE__ */ React.createElement(Text, { style: styles.tag }, label), /* @__PURE__ */ React.createElement(Text, { style: styles.heroTitle }, data.title), /* @__PURE__ */ React.createElement(Text, { style: styles.heroSubtitle }, data.subtitle), /* @__PURE__ */ React.createElement(View, { style: styles.metaStrip }, /* @__PURE__ */ React.createElement(MetaItem, { label: "Per\xEDodo", value: data.period }), /* @__PURE__ */ React.createElement(MetaItem, { label: "Data", value: data.reportDate }), /* @__PURE__ */ React.createElement(MetaItem, { label: "Gerado por", value: data.generatedBy })));
  }
  return /* @__PURE__ */ React.createElement(View, { style: styles.header, fixed: true }, /* @__PURE__ */ React.createElement(View, { style: styles.brand }, /* @__PURE__ */ React.createElement(PadapMark, { small: true }), /* @__PURE__ */ React.createElement(Text, { style: styles.brandText }, "PADAP Intelligence")), /* @__PURE__ */ React.createElement(Text, { style: styles.headerMeta }, label, " | ", data.reportDate));
}
function MetaItem({ label, value }) {
  return /* @__PURE__ */ React.createElement(View, { style: styles.metaItem }, /* @__PURE__ */ React.createElement(Text, { style: styles.label }, label), /* @__PURE__ */ React.createElement(Text, { style: styles.value }, value));
}
function ExecutiveSummary({ data, mode }) {
  const actionText = mode === "client" ? data.summary.producerReading : data.summary.consultantAction;
  const title = mode === "client" ? "Leitura da PADAP para o produtor" : "A\xE7\xE3o do consultor";
  return /* @__PURE__ */ React.createElement(Section, { title: data.summary.title, kicker: "Movimento geral da semana" }, /* @__PURE__ */ React.createElement(View, { style: styles.panel, wrap: false }, /* @__PURE__ */ React.createElement(Text, { style: styles.paragraph }, data.summary.text), data.summary.bullets.slice(0, 4).map((item) => /* @__PURE__ */ React.createElement(BulletLine, { key: item }, item))), /* @__PURE__ */ React.createElement(View, { style: styles.callout, wrap: false }, /* @__PURE__ */ React.createElement(Text, { style: styles.calloutTitle }, title), /* @__PURE__ */ React.createElement(Text, { style: styles.miniText }, actionText)));
}
function TrendCards({ items }) {
  return /* @__PURE__ */ React.createElement(Section, { title: "Cards de tend\xEAncia", kicker: "Indicadores acompanhados" }, /* @__PURE__ */ React.createElement(View, { style: styles.trendGrid }, items.map((item, index) => /* @__PURE__ */ React.createElement(View, { key: item.label, style: index > 2 ? [styles.trendCard, styles.trendCardWide] : styles.trendCard, wrap: false }, /* @__PURE__ */ React.createElement(View, { style: styles.cardTop }, /* @__PURE__ */ React.createElement(Text, { style: styles.cardTitle }, item.label), /* @__PURE__ */ React.createElement(Badge, { tone: item.tone }, item.trend)), /* @__PURE__ */ React.createElement(Text, { style: styles.cardValue }, item.value), /* @__PURE__ */ React.createElement(Text, { style: styles.miniText }, item.note)))));
}
function ProductTrendTable({ items }) {
  return /* @__PURE__ */ React.createElement(Section, { title: "Principais produtos acompanhados", kicker: "Detalhe por produto" }, /* @__PURE__ */ React.createElement(
    ReportTable,
    {
      headers: ["Produto", "Tend\xEAncia", "Motivo principal", "Aten\xE7\xE3o comercial"],
      widths: ["18%", "16%", "34%", "32%"],
      rows: items,
      render: (item) => [
        /* @__PURE__ */ React.createElement(Text, { style: styles.strongCell }, item.product),
        /* @__PURE__ */ React.createElement(Badge, { tone: item.tone }, item.trend),
        item.reason,
        item.commercialAttention
      ]
    }
  ));
}
function CultureImpactTable({ items }) {
  return /* @__PURE__ */ React.createElement(Section, { title: "Impacto por cultura", kicker: "Leitura agron\xF4mica e comercial" }, /* @__PURE__ */ React.createElement(
    ReportTable,
    {
      headers: ["Cultura", "Nutrientes sens\xEDveis", "Leitura da semana", "A\xE7\xE3o sugerida"],
      widths: ["16%", "25%", "31%", "28%"],
      rows: items,
      render: (item) => [/* @__PURE__ */ React.createElement(Text, { style: styles.strongCell }, item.culture), item.nutrients, item.weeklyReading, item.suggestedAction]
    }
  ));
}
function ProductFamilyAnalysis({ items }) {
  return /* @__PURE__ */ React.createElement(Section, { title: "An\xE1lise por fam\xEDlia de produto", kicker: "Tend\xEAncia, risco e a\xE7\xE3o comercial" }, /* @__PURE__ */ React.createElement(
    ReportTable,
    {
      headers: ["Fam\xEDlia", "Tend\xEAncia", "Motivo", "Risco", "Pra\xE7as afetadas", "A\xE7\xE3o comercial"],
      widths: ["15%", "13%", "22%", "16%", "16%", "18%"],
      rows: items,
      render: (item) => [
        /* @__PURE__ */ React.createElement(Text, { style: styles.strongCell }, item.family),
        /* @__PURE__ */ React.createElement(Badge, { tone: item.tone }, item.trend),
        item.reason,
        item.risk,
        item.affectedRegions,
        item.commercialAction
      ]
    }
  ));
}
function PriceReferenceTable({ items }) {
  return /* @__PURE__ */ React.createElement(Section, { title: "Tabela de pre\xE7os referenciais", kicker: "Dados sem repetir an\xE1lise textual" }, /* @__PURE__ */ React.createElement(
    ReportTable,
    {
      headers: ["Produto", "Pre\xE7o atual", "Semana anterior", "Varia\xE7\xE3o", "Tend\xEAncia", "Observa\xE7\xE3o"],
      widths: ["20%", "15%", "16%", "12%", "14%", "23%"],
      rows: items,
      render: (item) => [
        /* @__PURE__ */ React.createElement(Text, { style: styles.strongCell }, item.product),
        item.currentPrice,
        item.previousPrice,
        item.variation,
        /* @__PURE__ */ React.createElement(Badge, { tone: item.tone }, item.trend),
        item.observation
      ]
    }
  ));
}
function FreightLogisticsTable({ items, simple = false }) {
  if (simple) {
    const factors = items.map((item) => ({
      factor: item.origin,
      status: item.variation,
      impact: item.impact
    }));
    return /* @__PURE__ */ React.createElement(Section, { title: "Frete e d\xF3lar", kicker: "Fatores externos da decis\xE3o" }, /* @__PURE__ */ React.createElement(
      ReportTable,
      {
        headers: ["Fator", "Situa\xE7\xE3o", "Impacto"],
        widths: ["24%", "26%", "50%"],
        rows: factors,
        render: (item) => [/* @__PURE__ */ React.createElement(Text, { style: styles.strongCell }, item.factor), item.status, item.impact]
      }
    ));
  }
  return /* @__PURE__ */ React.createElement(Section, { title: "Fretes e log\xEDstica", kicker: "Apenas log\xEDstica e frete" }, /* @__PURE__ */ React.createElement(
    ReportTable,
    {
      headers: ["Origem", "Destino/regi\xE3o", "Frete atual", "Semana anterior", "Varia\xE7\xE3o", "Impacto"],
      widths: ["16%", "19%", "14%", "16%", "12%", "23%"],
      rows: items,
      render: (item) => [item.origin, item.destination, item.currentFreight, item.previousFreight, item.variation, item.impact]
    }
  ));
}
function ConsultantSalesArguments({ items }) {
  return /* @__PURE__ */ React.createElement(Section, { title: "Argumentos de venda por produto", kicker: "Obje\xE7\xE3o prov\xE1vel e resposta sugerida" }, /* @__PURE__ */ React.createElement(
    ReportTable,
    {
      headers: ["Produto", "Obje\xE7\xE3o prov\xE1vel do cliente", "Resposta sugerida"],
      widths: ["20%", "34%", "46%"],
      rows: items,
      render: (item) => [/* @__PURE__ */ React.createElement(Text, { style: styles.strongCell }, item.product), item.objection, item.suggestedAnswer]
    }
  ));
}
function InternalAlerts({ items }) {
  return /* @__PURE__ */ React.createElement(Section, { title: "Alertas internos", kicker: "Operacional e comercial" }, /* @__PURE__ */ React.createElement(
    ReportTable,
    {
      headers: ["Alerta", "Prioridade", "Descri\xE7\xE3o", "A\xE7\xE3o"],
      widths: ["21%", "15%", "36%", "28%"],
      rows: items,
      render: (item) => [/* @__PURE__ */ React.createElement(Text, { style: styles.strongCell }, item.type), item.priority, item.description, item.action]
    }
  ));
}
function RecommendationBlock({ recommendation, title, compact = false }) {
  const groups = [
    ["Comprar agora", recommendation.buyNow],
    ["Monitorar", recommendation.monitor],
    ["Aguardar", recommendation.wait]
  ];
  return /* @__PURE__ */ React.createElement(Section, { title, kicker: "Somente a\xE7\xE3o pr\xE1tica" }, /* @__PURE__ */ React.createElement(View, { style: styles.recommendationGrid, wrap: false }, groups.map(([groupTitle, items]) => /* @__PURE__ */ React.createElement(View, { key: groupTitle, style: styles.recommendationColumn }, /* @__PURE__ */ React.createElement(Text, { style: styles.recommendationTitle }, groupTitle), items.slice(0, compact ? 3 : 4).map((item) => /* @__PURE__ */ React.createElement(BulletLine, { key: item }, item))))), /* @__PURE__ */ React.createElement(View, { style: styles.callout, wrap: false }, /* @__PURE__ */ React.createElement(Text, { style: styles.calloutTitle }, "Recomenda\xE7\xE3o PADAP da semana"), /* @__PURE__ */ React.createElement(Text, { style: styles.miniText }, recommendation.finalText)));
}
function ReportFooter({ data }) {
  return /* @__PURE__ */ React.createElement(View, { style: styles.footer, fixed: true }, /* @__PURE__ */ React.createElement(View, { style: styles.footerLeft }, /* @__PURE__ */ React.createElement(Text, null, /* @__PURE__ */ React.createElement(Text, { style: styles.footerBrand }, "PADAP Intelligence"), " | ", data.footerNote), /* @__PURE__ */ React.createElement(Text, null, "Gerado em ", data.generatedAt)), /* @__PURE__ */ React.createElement(Text, { style: styles.pageNumber, render: ({ pageNumber, totalPages }) => `P\xE1gina ${pageNumber}/${totalPages}` }));
}
function Section({ title, kicker, children }) {
  return /* @__PURE__ */ React.createElement(View, { style: styles.section, minPresenceAhead: 120 }, /* @__PURE__ */ React.createElement(View, { style: styles.sectionHeader, wrap: false }, /* @__PURE__ */ React.createElement(Text, { style: styles.sectionTitle }, title), /* @__PURE__ */ React.createElement(Text, { style: styles.sectionKicker }, kicker)), children);
}
function ReportTable({ headers, widths, rows, render }) {
  return /* @__PURE__ */ React.createElement(View, { style: styles.table }, /* @__PURE__ */ React.createElement(View, { style: styles.tableHeader, wrap: false }, headers.map((header, index) => /* @__PURE__ */ React.createElement(Text, { key: header, style: index === headers.length - 1 ? [styles.cell, styles.cellLast, { width: widths[index] }] : [styles.cell, { width: widths[index] }] }, header))), rows.map((item, rowIndex) => {
    const cells = render(item);
    return /* @__PURE__ */ React.createElement(View, { key: rowIndex, style: rowIndex % 2 ? [styles.row, styles.rowAlt] : styles.row, wrap: false }, cells.map((cell, cellIndex) => /* @__PURE__ */ React.createElement(View, { key: cellIndex, style: cellIndex === cells.length - 1 ? [styles.cell, styles.cellLast, { width: widths[cellIndex] }] : [styles.cell, { width: widths[cellIndex] }] }, typeof cell === "string" ? /* @__PURE__ */ React.createElement(Text, null, cell) : cell)));
  }));
}
function BulletLine({ children }) {
  return /* @__PURE__ */ React.createElement(View, { style: styles.bulletRow }, /* @__PURE__ */ React.createElement(Text, { style: styles.bulletDot }, "\u2022"), /* @__PURE__ */ React.createElement(Text, { style: styles.bulletText }, children));
}
function Badge({ tone, children }) {
  const palette = {
    green: { backgroundColor: "#123B2B", color: colors.green },
    amber: { backgroundColor: "#3B2C12", color: colors.amber },
    red: { backgroundColor: "#3B1717", color: colors.red },
    blue: { backgroundColor: "#112E3B", color: colors.blue },
    gray: { backgroundColor: "#202A34", color: colors.gray }
  }[tone];
  return /* @__PURE__ */ React.createElement(Text, { style: [styles.badge, palette] }, children);
}
function PadapMark({ small = false }) {
  return /* @__PURE__ */ React.createElement(Svg, { width: small ? 18 : 30, height: small ? 20 : 34, viewBox: "0 0 184 208" }, /* @__PURE__ */ React.createElement(Path, { fillRule: "evenodd", d: "M15 168V88C15 48.2355 47.2355 16 87 16H169V96C169 135.765 136.765 168 97 168H45V190L15 168ZM45 124V88C45 64.2518 64.2518 45 88 45H140V81C140 104.748 120.748 124 97 124H45Z", fill: colors.green }));
}

// src/services/marketReportService.ts
import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";

// src/data/mockCommercialArguments.ts
var mockCommercialArguments = [
  { id: "arg-ptax-up", category: "PTAX subindo", argument: "Como os fertilizantes tem forte influencia do c\xE2mbio, a validade das cota\xE7\xF5es est\xE1 mais curta. O ideal e travar a condi\xE7\xE3o enquanto o pre\xE7o est\xE1 confirmado." },
  { id: "arg-ptax-down", category: "PTAX caindo", argument: "O c\xE2mbio deu algum al\xEDvio, mas a recomenda\xE7\xE3o e confirmar disponibilidade e validade antes de postergar a decis\xE3o de compra." },
  { id: "arg-trade-up", category: "Rela\xE7\xE3o de troca melhorando", argument: "A rela\xE7\xE3o de troca melhorou, ent\xE3o o produtor precisa entregar menos produto para comprar o mesmo volume de fertilizante. \xC9 uma janela interessante para planejamento." },
  { id: "arg-trade-down", category: "Rela\xE7\xE3o de troca piorando", argument: "A rela\xE7\xE3o de troca ficou menos favor\xE1vel. Antecipar decis\xE3o pode evitar comprar em uma condi\xE7\xE3o ainda mais pressionada." },
  { id: "arg-specialty", category: "Especialidade x commodity", argument: "Apesar do maior valor por tonelada, a especialidade entrega maior uniformidade, qualidade de formula\xE7\xE3o e seguran\xE7a nutricional, reduzindo risco operacional no campo." },
  { id: "arg-urea", category: "Ureia em alta", argument: "A ureia est\xE1 vol\xE1til. Antes de assumir uma condi\xE7\xE3o antiga, vale confirmar pre\xE7o e disponibilidade para proteger margem e prazo de entrega." },
  { id: "arg-kcl", category: "KCl em oportunidade", argument: "O KCl abriu uma janela de oportunidade. Para quem tem demanda de pot\xE1ssio, este e um bom momento para avaliar volume e compor pacote." },
  { id: "arg-validity", category: "Validade curta da proposta", argument: "A validade curta protege o produtor e a PADAP em um mercado de c\xE2mbio e fertilizantes oscilando durante o dia." },
  { id: "arg-factory", category: "Disponibilidade de f\xE1brica", argument: "Mesmo com pre\xE7o confirmado, a disponibilidade precisa ser reconfirmada para garantir entrega no prazo comercial combinado." },
  { id: "arg-crop-plan", category: "Planejamento de safra", argument: "Planejar agora reduz o risco de comprar em janela apertada, com frete pressionado ou produto indispon\xEDvel." }
];

// src/data/mockMarket.ts
var hist = (base2) => ["Seg", "Ter", "Qua", "Qui", "Sex"].map((label, i) => ({ label, value: Number((base2 + Math.sin(i) * base2 * 0.04 + i * 0.7).toFixed(2)) }));
var mockMarketIndicators = [
  { name: "PTAX", value: 5.18, variation: 0.95, unit: "R$/US$", history: hist(5.08) },
  { name: "Ureia", value: 3290, variation: 2.4, unit: "R$/t", history: hist(3180) },
  { name: "MAP", value: 5110, variation: 1.1, unit: "R$/t", history: hist(5020) },
  { name: "KCl", value: 3010, variation: -1.8, unit: "R$/t", history: hist(3090) },
  { name: "Caf\xE9", value: 1320, variation: 3.2, unit: "R$/sc", history: hist(1280) },
  { name: "Milho", value: 62, variation: -0.7, unit: "R$/sc", history: hist(64) },
  { name: "Soja", value: 128, variation: 1.6, unit: "R$/sc", history: hist(125) },
  { name: "Cenoura", value: 82, variation: 4.1, unit: "R$/cx", history: hist(77) }
];
var mockNews = [
  { id: "n-1", title: "PTAX avan\xE7a e pressiona cota\xE7\xF5es abertas", summary: "Movimento recomenda revisar propostas emitidas ontem para qu\xEDmicos importados.", tag: "C\xE2mbio", date: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "n-2", title: "KCl abre janela de compra", summary: "Queda semanal sugere oportunidade para travar volume em clientes estrat\xE9gicos.", tag: "Fertilizantes", date: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "n-3", title: "Frete segue sens\xEDvel no Alto Parana\xEDba", summary: "Disponibilidade log\xEDstica exige reconfirma\xE7\xE3o para entregas CIF de curto prazo.", tag: "Log\xEDstica", date: (/* @__PURE__ */ new Date()).toISOString() }
];
var mockAlerts = [
  { id: "a-1", title: "PTAX alterado", description: "Recalcular propostas abertas com base cambial anterior.", priority: "Risco cambial", date: (/* @__PURE__ */ new Date()).toISOString(), module: "Propostas", action: "Atualizar cota\xE7\xE3o com novo PTAX" },
  { id: "a-2", title: "Lista semanal vence hoje", description: "Tabela Yara precisa de confer\xEAncia antes de novas propostas.", priority: "Risco de validade", date: (/* @__PURE__ */ new Date()).toISOString(), module: "Tabela da Semana", action: "Importar ou reconfirmar tabela" },
  { id: "a-3", title: "KCl em queda", description: "Avaliar oportunidade de compra para pacotes de caf\xE9.", priority: "Oportunidade", date: (/* @__PURE__ */ new Date()).toISOString(), module: "Intelig\xEAncia de Mercado", action: "Simular pacote com KCl" }
];

// src/data/mockMarketIndicators.ts
var now = /* @__PURE__ */ new Date();
var minutesFromNow = (minutes) => new Date(now.getTime() + minutes * 6e4).toISOString();
var mockMarketUpdateStatuses = [
  { id: "ptax", label: "PTAX", lastUpdate: minutesFromNow(-18), nextManual: minutesFromNow(12), nextAutomatic: minutesFromNow(30), status: "atualizado" },
  { id: "fertilizers", label: "Fertilizantes", lastUpdate: minutesFromNow(-42), nextManual: minutesFromNow(18), nextAutomatic: new Date(now.setHours(16, 30, 0, 0)).toISOString(), status: "monitorando" },
  { id: "crops", label: "Culturas", lastUpdate: minutesFromNow(-36), nextManual: minutesFromNow(24), nextAutomatic: new Date((/* @__PURE__ */ new Date()).setHours(16, 30, 0, 0)).toISOString(), status: "atualizado" },
  { id: "news", label: "Not\xEDcias", lastUpdate: minutesFromNow(-25), nextManual: minutesFromNow(35), nextAutomatic: minutesFromNow(60), status: "monitorando" },
  { id: "exchange", label: "Rela\xE7\xE3o de troca", lastUpdate: minutesFromNow(-14), nextManual: minutesFromNow(16), nextAutomatic: "Apos mercado", status: "atualizado" },
  { id: "proposals", label: "Propostas impactadas", lastUpdate: minutesFromNow(-10), nextManual: minutesFromNow(20), nextAutomatic: "Apos PTAX", status: "aten\xE7\xE3o" },
  { id: "opportunities", label: "Oportunidades comerciais", lastUpdate: minutesFromNow(-9), nextManual: minutesFromNow(21), nextAutomatic: "Apos scores", status: "atualizado" }
];
var mockProductsAttention = [
  { product: "Ureia", movement: "Alta forte", dailyVariation: 2.3, weeklyVariation: 5.8, impact: "Alto", reason: "Pressao internacional e frete sens\xEDvel", recommendedAction: "Revisar nitrogenados", score: 82 },
  { product: "MAP", movement: "Alta moderada", dailyVariation: 1.1, weeklyVariation: 3.6, impact: "M\xE9dio", reason: "Demanda aquecida em fosfatados", recommendedAction: "Travar pre\xE7o em propostas grandes", score: 68 },
  { product: "KCl", movement: "Queda t\xE1tica", dailyVariation: -1.8, weeklyVariation: -4.2, impact: "Alto", reason: "Oferta pontual melhorou", recommendedAction: "Trabalhar clientes com demanda de K", score: 76 },
  { product: "Sulfato de Amonio", movement: "Est\xE1vel", dailyVariation: 0.2, weeklyVariation: 0.9, impact: "Baixo", reason: "Mercado lateral", recommendedAction: "Monitorar disponibilidade", score: 54 },
  { product: "Nitrato", movement: "Aten\xE7\xE3o", dailyVariation: 0.8, weeklyVariation: 2.1, impact: "M\xE9dio", reason: "Validade curta na industria", recommendedAction: "Confirmar tabela antes de cotar", score: 64 },
  { product: "Yara Especialidades", movement: "Alta seletiva", dailyVariation: 0.9, weeklyVariation: 2.8, impact: "M\xE9dio", reason: "Mix premium com c\xE2mbio sens\xEDvel", recommendedAction: "Defender valor t\xE9cnico", score: 71 },
  { product: "Caf\xE9", movement: "Alta", dailyVariation: 3.1, weeklyVariation: 4.4, impact: "Alto", reason: "Bolsa e f\xEDsico positivos", recommendedAction: "Explorar melhora na rela\xE7\xE3o de troca", score: 74 },
  { product: "Milho", movement: "Baixa leve", dailyVariation: -0.7, weeklyVariation: -1.9, impact: "M\xE9dio", reason: "Oferta regional pressiona", recommendedAction: "Cuidado com rela\xE7\xE3o milho x ureia", score: 59 },
  { product: "Soja", movement: "Est\xE1vel positiva", dailyVariation: 1.2, weeklyVariation: 1.6, impact: "M\xE9dio", reason: "C\xE2mbio sustenta pre\xE7o", recommendedAction: "Monitorar MAP e KCl", score: 67 },
  { product: "Cenoura", movement: "Alta", dailyVariation: 4.1, weeklyVariation: 6.2, impact: "M\xE9dio", reason: "Oferta curta regional", recommendedAction: "Reabrir conversas de pacote", score: 72 },
  { product: "Alho", movement: "Est\xE1vel", dailyVariation: 0.4, weeklyVariation: 1.1, impact: "Baixo", reason: "Demanda previsivel", recommendedAction: "Manter especialidades no radar", score: 62 },
  { product: "Cebola", movement: "Vol\xE1til", dailyVariation: -1.2, weeklyVariation: 2.4, impact: "M\xE9dio", reason: "Oscila\xE7\xE3o de oferta", recommendedAction: "Simular pacote antes de negociar", score: 61 }
];

// src/data/mockMarketNews.ts
var now2 = /* @__PURE__ */ new Date();
var isoMinutesAgo = (minutes) => new Date(now2.getTime() - minutes * 6e4).toISOString();
var mockTrustedMarketNews = [
  {
    id: "news-ptax",
    title: "PTAX avanca e aumenta sensibilidade de propostas abertas",
    summary: "C\xE2mbio mais firme exige cuidado com cota\xE7\xF5es emitidas com base anterior e validade longa.",
    tag: "C\xE2mbio",
    category: "C\xE2mbio",
    source: "Banco Central do Brasil",
    date: isoMinutesAgo(24),
    impact: "Pressiona tabela Yara e pacotes com insumos importados.",
    confidence: 100,
    url: "https://www.bcb.gov.br/estabilidadefinanceira/hist\xF3ricocota\xE7\xF5es",
    sourceStatus: "ativa"
  },
  {
    id: "news-kcl",
    title: "KCl mostra recuo pontual e abre janela em pot\xE1ssicos",
    summary: "Indicadores de oferta sugerem oportunidade t\xE1tica para pacotes de caf\xE9 e HF.",
    tag: "Fertilizantes",
    category: "Fertilizantes",
    source: "GlobalFert",
    date: isoMinutesAgo(52),
    impact: "Clientes com hist\xF3rico de pot\xE1ssio podem ser trabalhados hoje.",
    confidence: 85,
    url: "https://globalfert.com.br/",
    sourceStatus: "monitorando"
  },
  {
    id: "news-urea",
    title: "Nitrogenados seguem volateis no mercado internacional",
    summary: "Movimento externo e log\xEDstica elevam risco de reconfirma\xE7\xE3o em ureia.",
    tag: "Fertilizantes",
    category: "Mat\xE9rias-primas",
    source: "The Fertilizer Institute",
    date: isoMinutesAgo(71),
    impact: "Revisar propostas de nitrogenados e evitar prometer pre\xE7o antigo.",
    confidence: 85,
    url: "https://www.tfi.org/",
    sourceStatus: "ativa"
  },
  {
    id: "news-coffee",
    title: "Caf\xE9 melhora no f\xEDsico e fortalece argumento de troca",
    summary: "Pre\xE7o da cultura aumenta poder de compra relativo em itens de pot\xE1ssio.",
    tag: "Culturas",
    category: "Culturas",
    source: "CEPEA",
    date: isoMinutesAgo(96),
    impact: "Reabrir conversas de planejamento com produtores de caf\xE9.",
    confidence: 95,
    url: "https://www.cepea.esalq.usp.br/",
    sourceStatus: "ativa"
  }
];
var mockInternalMarketAlerts = [
  { id: "alert-ptax", type: "Risco cambial", title: "PTAX em aten\xE7\xE3o", message: "PTAX subiu 0,73% e pode afetar propostas abertas. Confirme validade com compras antes de prometer pre\xE7o.", relatedTo: "PTAX", priority: "Alta", resolved: false },
  { id: "alert-kcl", type: "Oportunidade", title: "KCl em oportunidade", message: "KCl recuou no mercado. Clientes com demanda de pot\xE1ssio podem ser trabalhados hoje.", relatedTo: "KCl", priority: "Alta", resolved: false },
  { id: "alert-margin", type: "Risco de margem", title: "Pacotes abaixo da meta", message: "Dois pacotes podem ficar abaixo da meta se a nova base cambial for aplicada.", relatedTo: "Pacotes", priority: "Cr\xEDtica", resolved: false },
  { id: "alert-info", type: "Informativo", title: "Fechamento programado", message: "Resumo de fechamento do dia sera gerado automaticamente \xE0s 17:00.", relatedTo: "Fechamento", priority: "Baixa", resolved: false }
];

// src/utils/date.ts
function addHours(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1e3).toISOString();
}

// src/data/mockProducts.ts
var mockWeeklyTable = {
  id: "wt-yara-2026-20",
  supplier: "Yara",
  expiresAt: addHours(36),
  ptax: 5.18,
  freight: 82,
  icms: 7,
  marginIcms: 10.8,
  importedAt: (/* @__PURE__ */ new Date()).toISOString(),
  importedBy: "Bruna Oliveira",
  active: true,
  products: [
    { id: "p-1", code: "YB-1020", group: "Fertilizantes", description: "YaraBasa 10-20-20", reference: "Base caf\xE9", characteristic: "Granulado", packaging: "Big bag", supplier: "Yara", producerPrice: 3550, resellerPrice: 3720, finalPrice: 3980, available: true },
    { id: "p-2", code: "YM-0830", group: "Fertilizantes", description: "YaraMila 08-30-10", reference: "Plantio", characteristic: "Mistura premium", packaging: "Saco 50 kg", supplier: "Yara", producerPrice: 4020, resellerPrice: 4210, finalPrice: 4490, available: true },
    { id: "p-3", code: "YV-CAL", group: "Foliares", description: "YaraVita Caltrac", reference: "C\xE1lcio", characteristic: "Suspens\xE3o", packaging: "Gal\xE3o 10 L", supplier: "Yara", producerPrice: 1480, resellerPrice: 1680, finalPrice: 2140, available: true },
    { id: "p-4", code: "KCL-STD", group: "Pot\xE1ssicos", description: "KCl Granulado", reference: "Cloreto de Pot\xE1ssio", characteristic: "Granulado", packaging: "Big bag", supplier: "Fertipar", producerPrice: 2680, resellerPrice: 2790, finalPrice: 3010, available: true },
    { id: "p-5", code: "MAP-1160", group: "Fosfatados", description: "MAP 11-60", reference: "Fosfatado", characteristic: "Importado", packaging: "Big bag", supplier: "Sibra", producerPrice: 4620, resellerPrice: 4780, finalPrice: 5110, available: false },
    { id: "p-6", code: "URE-PRL", group: "Nitrogenados", description: "Ureia Perolada", reference: "Nitrog\xEAnio", characteristic: "Perolada", packaging: "Saco 50 kg", supplier: "Fertigran", producerPrice: 2860, resellerPrice: 2990, finalPrice: 3290, available: true }
  ]
};

// src/services/marketReportService.ts
var fallback = "Informa\xE7\xE3o n\xE3o dispon\xEDvel nesta atualiza\xE7\xE3o.";
var clientSensitiveTerms = ["margem", "custo", "comiss\xE3o", "comissao", "aprova\xE7\xE3o", "aprovacao", "interno", "alerta interno"];
var productCatalog = ["Ureia", "Sulfato de Am\xF4nio", "MAP", "KCl", "SSP/TSP", "Yara Especialidades"];
var cropCatalog = ["Caf\xE9", "Alho", "Cenoura", "HF geral", "Milho", "Soja"];
function getDefaultMarketReportConfig() {
  return {
    reportAudience: "consultant",
    period: "\xDAltimos 7 dias",
    type: "Relat\xF3rio completo",
    crops: cropCatalog,
    fertilizers: productCatalog,
    includeExchangeRatio: true,
    includeNews: true,
    includeOpportunities: true,
    includeRecommendations: true,
    includeSources: false
  };
}
function generateMarketReportFileName(audience = "consultant", date = /* @__PURE__ */ new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const label = audience === "client" ? "Cliente" : "Consultor";
  return `Relatorio_${label}_Mercado_PADAP_${yyyy}-${mm}-${dd}.pdf`;
}
function createGeneratedMarketReport(config) {
  const generatedAt = /* @__PURE__ */ new Date();
  const title = config.reportAudience === "client" ? "Relat\xF3rio de Mercado para Produtor" : "Relat\xF3rio de Mercado para Consultores";
  return {
    id: `report-${config.reportAudience}-${generatedAt.getTime()}`,
    title,
    period: config.period,
    generatedAt: generatedAt.toISOString(),
    generatedBy: "PADAP Intelligence",
    config,
    fileName: generateMarketReportFileName(config.reportAudience, generatedAt)
  };
}
function buildStructuredMarketReportData(report) {
  const audience = report.config.reportAudience;
  const generatedDate = new Date(report.generatedAt);
  const reportDate = generatedDate.toLocaleDateString("pt-BR");
  const generatedAt = generatedDate.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const normalizedBlocks = normalizeReportBlocks(createReportBlocks(report), audience);
  const block = (id) => normalizedBlocks.find((item) => item.id === id)?.content;
  return {
    audience,
    title: audience === "client" ? "Relat\xF3rio de Mercado para Produtor" : "Relat\xF3rio de Mercado para Consultores",
    subtitle: audience === "client" ? "Leitura simples, comercial e objetiva para decis\xE3o de compra." : "Vis\xE3o t\xE9cnica, comercial e operacional para orientar a equipe.",
    reportDate,
    generatedAt,
    period: report.period,
    generatedBy: report.generatedBy,
    trendCards: buildTrendCards(),
    summary: block("resumo_geral"),
    productTrends: block("tendencia_produto"),
    cultureImpacts: block("impacto_cultura"),
    productFamilies: buildProductFamilies(),
    priceReferences: block("precos"),
    freightLogistics: block("fretes"),
    salesArguments: block("argumentos_venda"),
    internalAlerts: audience === "client" ? [] : block("alertas_internos"),
    recommendation: block("recomendacao"),
    footerNote: audience === "client" ? "Relat\xF3rio externo com leitura comercial objetiva para o produtor." : "Uso interno comercial e operacional. N\xE3o enviar esta vers\xE3o ao cliente."
  };
}
function normalizeReportBlocks(blocks, audience) {
  const seen = /* @__PURE__ */ new Set();
  const blockPriority = ["precos", "fretes", "tendencia_produto", "impacto_cultura", "recomendacao", "argumentos_venda", "alertas_internos", "resumo_geral"];
  const ordered = [...blocks].sort((a, b) => blockPriority.indexOf(a.id) - blockPriority.indexOf(b.id));
  const normalized = ordered.map((block) => ({
    id: block.id,
    content: normalizeValue(block.content, block.id, audience, seen)
  }));
  return blocks.map((block) => normalized.find((item) => item.id === block.id) ?? block);
}
function createReportBlocks(report) {
  const audience = report.config.reportAudience;
  return [
    { id: "resumo_geral", content: buildSummary(audience) },
    { id: "tendencia_produto", content: buildProductTrends(report.config.fertilizers, audience) },
    { id: "impacto_cultura", content: buildCultureImpacts(report.config.crops) },
    { id: "precos", content: buildPriceReferences(report.config.fertilizers) },
    { id: "fretes", content: buildFreightLogistics() },
    { id: "argumentos_venda", content: buildSalesArguments(report.config.fertilizers) },
    { id: "recomendacao", content: buildRecommendation(audience) },
    { id: "alertas_internos", content: buildInternalAlerts() }
  ];
}
function buildSummary(audience) {
  const text = audience === "client" ? "A semana segue com mercado seletivo. Nitrogenados pedem aten\xE7\xE3o, pot\xE1ssio mostra janela comercial e o c\xE2mbio continua relevante para a decis\xE3o." : "Cen\xE1rio vol\xE1til com c\xE2mbio pressionando importados, nitrogenados sens\xEDveis e oportunidade t\xE1tica em pot\xE1ssicos. A rotina comercial exige validade curta e checagem de disponibilidade.";
  return {
    title: audience === "client" ? "Resumo executivo da semana" : "Resumo comercial interno",
    text,
    bullets: audience === "client" ? ["Nitrogenados em aten\xE7\xE3o.", "Pot\xE1ssio com janela favor\xE1vel.", "Frete deve ser confirmado antes do fechamento.", "PTAX segue como fator de decis\xE3o."] : ["Recalcular propostas antigas antes do envio.", "Confirmar disponibilidade em itens cr\xEDticos.", "Priorizar KCl em clientes com demanda ativa.", "Usar validade curta em importados."],
    producerReading: "Para compras com necessidade pr\xF3xima, vale priorizar produtos em oportunidade e evitar alongar decis\xE3o nos itens mais sens\xEDveis ao c\xE2mbio.",
    consultantAction: "Revisar propostas abertas, confirmar tabela vigente e trabalhar KCl com clientes de caf\xE9, HF e soja antes da pr\xF3xima atualiza\xE7\xE3o."
  };
}
function buildTrendCards() {
  return [
    card("Nitrogenados", "Alta seletiva", "Aten\xE7\xE3o", "red", "Ureia permanece mais sens\xEDvel no curto prazo."),
    card("Fosfatados", "Alta moderada", "Monitorar", "amber", "MAP exige cuidado em pacotes maiores."),
    card("Pot\xE1ssio", "Recuo pontual", "Oportunidade", "green", "KCl abre janela comercial para demanda ativa."),
    card("Frete", `R$ ${formatNumber(mockWeeklyTable.freight)}/t`, "Sens\xEDvel", "amber", "Rotas CIF precisam de reconfirma\xE7\xE3o."),
    card("D\xF3lar/PTAX", ptaxLabel(), "Aten\xE7\xE3o", "blue", "C\xE2mbio ainda pesa em produtos importados."),
    card("Disponibilidade", "Mista", "Checar", "gray", "Alguns itens exigem confirma\xE7\xE3o antes da oferta.")
  ];
}
function card(label, value, trend, tone, note) {
  return { label, value, trend, tone, note };
}
function buildProductTrends(selected, audience) {
  const defaults = {
    Ureia: { trend: "Aten\xE7\xE3o", tone: "red", reason: "Nitrogenados seguem vol\xE1teis.", commercialAttention: audience === "client" ? "Comprar apenas com condi\xE7\xE3o confirmada." : "Reconfirmar pre\xE7o e validade antes de cotar." },
    "Sulfato de Am\xF4nio": { trend: "Est\xE1vel", tone: "blue", reason: "Mercado lateral na semana.", commercialAttention: "Monitorar disponibilidade regional." },
    MAP: { trend: "Monitorar", tone: "amber", reason: "Fosfatados com alta moderada.", commercialAttention: audience === "client" ? "Avaliar trava em compras maiores." : "Defender urg\xEAncia em pacotes fosfatados." },
    KCl: { trend: "Oportunidade", tone: "green", reason: "Pot\xE1ssicos com recuo pontual.", commercialAttention: "Priorizar demanda ativa de pot\xE1ssio." },
    "SSP/TSP": { trend: "Est\xE1vel", tone: "blue", reason: "Sem choque relevante na semana.", commercialAttention: "Acompanhar prazo e oferta local." },
    "Yara Especialidades": { trend: "Monitorar", tone: "amber", reason: "Mix premium sens\xEDvel ao c\xE2mbio.", commercialAttention: audience === "client" ? "Planejar compra conforme necessidade t\xE9cnica." : "Usar argumento de seguran\xE7a nutricional." }
  };
  return selected.map((product) => ({ product, ...defaults[product] ?? defaults["Yara Especialidades"] }));
}
function buildCultureImpacts(selected) {
  const defaults = {
    Caf\u00E9: { culture: "Caf\xE9", nutrients: "K e P", weeklyReading: "Rela\xE7\xE3o de troca melhora em pot\xE1ssio.", suggestedAction: "Avaliar compra de KCl e monitorar MAP." },
    Alho: { culture: "Alho", nutrients: "N, K e especiais", weeklyReading: "Demanda t\xE9cnica segue est\xE1vel.", suggestedAction: "Manter planejamento e confirmar disponibilidade." },
    Cenoura: { culture: "Cenoura", nutrients: "K e foliares", weeklyReading: "Cultura com janela favor\xE1vel para pacote.", suggestedAction: "Antecipar volumes de maior giro." },
    "HF geral": { culture: "HF geral", nutrients: "N, K e micronutrientes", weeklyReading: "Frete e disponibilidade pesam na decis\xE3o.", suggestedAction: "Comprar itens cr\xEDticos com validade confirmada." },
    Milho: { culture: "Milho", nutrients: "N", weeklyReading: "Ureia segue como ponto de aten\xE7\xE3o.", suggestedAction: "Evitar postergar nitrogenados essenciais." },
    Soja: { culture: "Soja", nutrients: "P e K", weeklyReading: "Fosfatados exigem monitoramento.", suggestedAction: "Monitorar MAP e aproveitar KCl se houver necessidade." }
  };
  return selected.map((culture) => defaults[culture] ?? { culture, nutrients: "NPK", weeklyReading: fallback, suggestedAction: "Manter acompanhamento comercial." });
}
function buildProductFamilies() {
  return [
    { family: "Nitrogenados", trend: "Alta", tone: "red", reason: "Ureia vol\xE1til.", risk: "Proposta defasada.", affectedRegions: "Milho e HF", commercialAction: "Reconfirmar tabela e validade." },
    { family: "Fosfatados", trend: "Aten\xE7\xE3o", tone: "amber", reason: "MAP pressionado.", risk: "Pacotes grandes.", affectedRegions: "Caf\xE9 e soja", commercialAction: "Defender trava de pre\xE7o." },
    { family: "Pot\xE1ssicos", trend: "Oportunidade", tone: "green", reason: "KCl recuou.", risk: "Janela curta.", affectedRegions: "Caf\xE9, HF e soja", commercialAction: "Ativar clientes com demanda." },
    { family: "Especialidades/Foliares", trend: "Est\xE1vel", tone: "blue", reason: "Demanda t\xE9cnica.", risk: "C\xE2mbio e disponibilidade.", affectedRegions: "HF e caf\xE9", commercialAction: "Defender valor t\xE9cnico." }
  ];
}
function buildPriceReferences(selected) {
  const products = selected.map((name) => findProductPrice(name));
  return products.map(({ product, current }) => {
    const previous = Math.round(current * previousFactor(product));
    const variation = current - previous;
    return {
      product,
      currentPrice: money(current),
      previousPrice: money(previous),
      variation: `${variation >= 0 ? "+" : ""}${formatNumber(variation / previous * 100)}%`,
      trend: trendFromVariation(variation),
      tone: toneFromVariation(variation),
      observation: observationForProduct(product)
    };
  });
}
function buildFreightLogistics() {
  return [
    { origin: "D\xF3lar/PTAX", destination: "Importados", currentFreight: ptaxLabel(), previousFreight: "R$ 5,13", variation: "Alta leve", impact: "Pode alterar condi\xE7\xE3o de produtos importados." },
    { origin: "Frete Alto Parana\xEDba", destination: "PADAP e regi\xE3o", currentFreight: money(mockWeeklyTable.freight), previousFreight: money(78), variation: "+5,1%", impact: "Confirmar CIF antes de fechar." },
    { origin: "Porto / misturadora", destination: "Caf\xE9", currentFreight: money(96), previousFreight: money(92), variation: "+4,3%", impact: "Aten\xE7\xE3o em entregas de curto prazo." },
    { origin: "Ind\xFAstria local", destination: "HF geral", currentFreight: money(72), previousFreight: money(74), variation: "-2,7%", impact: "Rota com condi\xE7\xE3o mais controlada." },
    { origin: "Base regional", destination: "Milho", currentFreight: money(84), previousFreight: money(82), variation: "+2,4%", impact: "Sem choque, mas exige agenda de carregamento." }
  ];
}
function buildSalesArguments(selected) {
  const argumentByProduct = {
    Ureia: { product: "Ureia", objection: "Cliente quer esperar pre\xE7o cair.", suggestedAnswer: argumentText("Ureia em alta") },
    "Sulfato de Am\xF4nio": { product: "Sulfato de Am\xF4nio", objection: "Cliente compara apenas pre\xE7o por tonelada.", suggestedAnswer: "Comparar tamb\xE9m disponibilidade, prazo e encaixe t\xE9cnico no manejo de nitrog\xEAnio." },
    MAP: { product: "MAP", objection: "Cliente acha o fosfatado caro.", suggestedAnswer: "Mostrar risco de alta e avaliar trava parcial para preservar planejamento." },
    KCl: { product: "KCl", objection: "Cliente quer adiar compra de pot\xE1ssio.", suggestedAnswer: argumentText("KCl em oportunidade") },
    "SSP/TSP": { product: "SSP/TSP", objection: "Cliente pede alternativa mais barata.", suggestedAnswer: "Comparar entrega nutricional, disponibilidade local e custo por hectare." },
    "Yara Especialidades": { product: "Yara Especialidades", objection: "Cliente v\xEA especialidade como item caro.", suggestedAnswer: argumentText("Especialidade x commodity") }
  };
  return selected.map((product) => argumentByProduct[product] ?? argumentByProduct["Yara Especialidades"]);
}
function buildInternalAlerts() {
  return [
    { type: "Cota\xE7\xE3o vencendo", priority: "Alta", description: "Tabela semanal pr\xF3xima do vencimento.", action: "Confirmar validade antes de enviar proposta." },
    { type: "D\xF3lar/PTAX alterado", priority: "Alta", description: "C\xE2mbio mudou desde propostas antigas.", action: "Recalcular importados antes do reenvio." },
    { type: "Baixa disponibilidade", priority: "M\xE9dia", description: "MAP e especialidades exigem checagem.", action: "Validar estoque antes de prometer entrega." },
    { type: "Margem abaixo do m\xEDnimo", priority: "Cr\xEDtica", description: "Algumas propostas podem exigir revis\xE3o gerencial.", action: "Acionar gestor antes de fechar." },
    { type: "Cliente estrat\xE9gico", priority: "Alta", description: "Contas de caf\xE9 e HF t\xEAm demanda ativa.", action: "Priorizar contato consultivo." },
    { type: "Frete fora do padr\xE3o", priority: "M\xE9dia", description: "Rotas CIF sens\xEDveis no curto prazo.", action: "Reconfirmar frete antes da proposta final." },
    ...mockInternalMarketAlerts.slice(0, 1).map((alert) => ({ type: cleanText(alert.title), priority: cleanText(alert.priority), description: cleanText(alert.message), action: "Tratar no painel de mercado." }))
  ].slice(0, 7);
}
function buildRecommendation(audience) {
  return {
    buyNow: ["KCl", "Pacotes com demanda imediata de pot\xE1ssio", audience === "client" ? "Itens com necessidade de curto prazo" : "Clientes de caf\xE9 com rela\xE7\xE3o de troca favor\xE1vel"],
    monitor: ["Ureia", "MAP", "Frete CIF em rotas sens\xEDveis"],
    wait: ["SSP/TSP sem urg\xEAncia", "Compras sem demanda definida", "Itens com disponibilidade incerta"],
    finalText: audience === "client" ? "Comprar agora apenas o que tem necessidade clara ou oportunidade confirmada. Monitorar nitrogenados e fosfatados antes de ampliar volume." : "Trabalhar KCl com prioridade, revisar propostas antigas e confirmar pre\xE7o, frete e disponibilidade antes de qualquer compromisso comercial."
  };
}
function normalizeValue(value, blockId, audience, seen) {
  if (typeof value === "string") return normalizeSentence(value, blockId, audience, seen);
  if (Array.isArray(value)) return value.map((item) => normalizeValue(item, blockId, audience, seen)).filter((item) => item !== "");
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeValue(item, blockId, audience, seen)]));
  }
  return value;
}
function normalizeSentence(value, blockId, audience, seen) {
  const clean = cleanText(value);
  if (audience === "client" && containsSensitiveTerm(clean)) return "";
  if (blockId === "resumo_geral" && seen.has(signature(clean))) return "";
  const parts = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  const unique = parts.filter((part) => {
    const key = signature(part);
    if (!key || seen.has(key)) return false;
    if (part.length > 18) seen.add(key);
    return true;
  });
  const result = unique.join(" ").trim();
  return result || clean;
}
function signature(value) {
  return stripAccents(value).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((word) => word.length > 3).slice(0, 8).join(" ");
}
function containsSensitiveTerm(value) {
  const normalized = stripAccents(value).toLowerCase();
  return clientSensitiveTerms.some((term) => normalized.includes(stripAccents(term).toLowerCase()));
}
function cleanText(value) {
  try {
    const decoded = decodeURIComponent(escape(value));
    return fixCommonEncoding(decoded);
  } catch {
    return fixCommonEncoding(value);
  }
}
function fixCommonEncoding(value) {
  return value.replaceAll("Amonio", "Am\xF4nio").replaceAll("potassico", "pot\xE1ssico").replaceAll("potassicos", "pot\xE1ssicos").replaceAll("preco", "pre\xE7o").replaceAll("urgencia", "urg\xEAncia").replaceAll("acessiveis", "acess\xEDveis").replaceAll("Revisao", "Revis\xE3o").replaceAll("pendencias", "pend\xEAncias").replaceAll("volatilidade", "volatilidade");
}
function stripAccents(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function findProductPrice(product) {
  const normalized = stripAccents(product).toLowerCase();
  const match = mockWeeklyTable.products.find((item) => {
    const haystack = stripAccents(`${item.description} ${item.reference} ${item.group}`).toLowerCase();
    return haystack.includes(normalized) || normalized.includes(stripAccents(item.reference).toLowerCase());
  });
  if (match) return { product, current: match.finalPrice };
  if (product === "Sulfato de Am\xF4nio") return { product, current: 2720 };
  if (product === "SSP/TSP") return { product, current: 2380 };
  return { product, current: 2140 };
}
function previousFactor(product) {
  if (product === "KCl") return 1.04;
  if (product === "Ureia") return 0.96;
  if (product === "MAP") return 0.985;
  return 0.99;
}
function trendFromVariation(variation) {
  if (variation > 50) return "Alta";
  if (variation < -50) return "Baixa";
  return "Est\xE1vel";
}
function toneFromVariation(variation) {
  if (variation > 50) return "amber";
  if (variation < -50) return "green";
  return "blue";
}
function observationForProduct(product) {
  const attention = mockProductsAttention.find((item) => item.product === product);
  return cleanText(attention?.movement ?? "Refer\xEAncia comercial da semana.");
}
function argumentText(category) {
  return cleanText(mockCommercialArguments.find((item) => item.category === category)?.argument ?? fallback);
}
function ptaxLabel() {
  const ptax = mockMarketIndicators.find((item) => item.name === "PTAX")?.value ?? mockWeeklyTable.ptax;
  return `R$ ${ptax.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function money(value) {
  return `R$ ${Math.round(value).toLocaleString("pt-BR")}`;
}
function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value);
}

// <stdin>
import fs from "node:fs/promises";
var base = getDefaultMarketReportConfig();
for (const audience of ["client", "consultant"]) {
  const report = createGeneratedMarketReport({ ...base, reportAudience: audience });
  const data = buildStructuredMarketReportData(report);
  const element = React2.createElement(MarketReportDocument, { data });
  const buffer = await renderToBuffer(element);
  const target = audience === "client" ? "preview/Relatorio_Cliente_Mercado_PADAP_TESTE.pdf" : "preview/Relatorio_Consultor_Mercado_PADAP_TESTE.pdf";
  await fs.writeFile(target, buffer);
  console.log(JSON.stringify({ audience, target, size: buffer.length, pages: audience === "client" ? 4 : 6, sensitiveLeak: audience === "client" ? JSON.stringify(data).toLowerCase().match(/margem|custo|comiss|aprova|interno/) : null }));
}
