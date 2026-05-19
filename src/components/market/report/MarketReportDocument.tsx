import { Document, Font, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import React from "react";
import type { ReactNode } from "react";
import type { ReportAudience } from "../../../types";

Font.registerHyphenationCallback((word) => [word]);

export type MarketReportBadgeTone = "green" | "amber" | "red" | "blue" | "gray";

export type TrendCardData = {
  label: string;
  value: string;
  trend: string;
  tone: MarketReportBadgeTone;
  note: string;
};

export type MarketReportData = {
  audience: ReportAudience;
  title: string;
  subtitle: string;
  reportDate: string;
  generatedAt: string;
  period: string;
  generatedBy: string;
  trendCards: TrendCardData[];
  summary: {
    title: string;
    text: string;
    bullets: string[];
    producerReading: string;
    consultantAction: string;
  };
  productTrends: {
    product: string;
    trend: string;
    tone: MarketReportBadgeTone;
    reason: string;
    commercialAttention: string;
  }[];
  cultureImpacts: {
    culture: string;
    nutrients: string;
    weeklyReading: string;
    suggestedAction: string;
  }[];
  productFamilies: {
    family: string;
    trend: string;
    tone: MarketReportBadgeTone;
    reason: string;
    risk: string;
    affectedRegions: string;
    commercialAction: string;
  }[];
  priceReferences: {
    product: string;
    currentPrice: string;
    previousPrice: string;
    variation: string;
    trend: string;
    tone: MarketReportBadgeTone;
    observation: string;
  }[];
  freightLogistics: {
    origin: string;
    destination: string;
    currentFreight: string;
    previousFreight: string;
    variation: string;
    impact: string;
  }[];
  salesArguments: {
    product: string;
    objection: string;
    suggestedAnswer: string;
  }[];
  internalAlerts: {
    type: string;
    priority: string;
    description: string;
    action: string;
  }[];
  recommendation: {
    buyNow: string[];
    monitor: string[];
    wait: string[];
    finalText: string;
  };
  footerNote: string;
};

const colors = {
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

const pagePaddingX = 34;

const styles = StyleSheet.create({
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

export function MarketReportDocument({ data }: { data: MarketReportData }) {
  return data.audience === "client" ? <ClientReport data={data} /> : <ConsultantReport data={data} />;
}

function ClientReport({ data }: { data: MarketReportData }) {
  return (
    <Document title={data.title} author="PADAP Intelligence" subject="Relatório de mercado para produtor">
      <Page size="A4" style={styles.page} wrap>
        <ReportHeader data={data} cover label="Cliente / Produtor" />
        <View style={styles.pageContent}>
          <ExecutiveSummary data={data} mode="client" />
          <TrendCards items={data.trendCards} />
        </View>
        <ReportFooter data={data} />
      </Page>
      <ReportPage data={data} label="Produtos acompanhados">
        <ProductTrendTable items={data.productTrends} />
      </ReportPage>
      <ReportPage data={data} label="Impacto por cultura">
        <CultureImpactTable items={data.cultureImpacts} />
      </ReportPage>
      <ReportPage data={data} label="Frete, dólar e recomendação">
        <FreightLogisticsTable items={data.freightLogistics.slice(0, 4)} simple />
        <RecommendationBlock recommendation={data.recommendation} title="Recomendação PADAP da semana" />
      </ReportPage>
    </Document>
  );
}

function ConsultantReport({ data }: { data: MarketReportData }) {
  return (
    <Document title={data.title} author="PADAP Intelligence" subject="Relatório técnico e comercial de mercado">
      <Page size="A4" style={styles.page} wrap>
        <ReportHeader data={data} cover label="Consultores" />
        <View style={styles.pageContent}>
          <ExecutiveSummary data={data} mode="consultant" />
          <TrendCards items={data.trendCards} />
        </View>
        <ReportFooter data={data} />
      </Page>
      <ReportPage data={data} label="Famílias de produto">
        <ProductFamilyAnalysis items={data.productFamilies} />
      </ReportPage>
      <ReportPage data={data} label="Preços referenciais">
        <PriceReferenceTable items={data.priceReferences} />
      </ReportPage>
      <ReportPage data={data} label="Fretes e logística">
        <FreightLogisticsTable items={data.freightLogistics} />
      </ReportPage>
      <ReportPage data={data} label="Argumentos de venda">
        <ConsultantSalesArguments items={data.salesArguments} />
      </ReportPage>
      <ReportPage data={data} label="Alertas internos">
        <InternalAlerts items={data.internalAlerts} />
        <RecommendationBlock recommendation={data.recommendation} title="Ação prática do consultor" compact />
      </ReportPage>
    </Document>
  );
}

function ReportPage({ data, label, children }: { data: MarketReportData; label: string; children: ReactNode }) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <ReportHeader data={data} label={label} />
      <View style={styles.pageContent}>{children}</View>
      <ReportFooter data={data} />
    </Page>
  );
}

export function ReportHeader({ data, cover = false, label }: { data: MarketReportData; cover?: boolean; label: string }) {
  if (cover) {
    return (
      <View style={styles.hero} wrap={false}>
        <View style={styles.brand}>
          <PadapMark />
          <Text style={styles.brandText}>PADAP Intelligence</Text>
        </View>
        <Text style={styles.tag}>{label}</Text>
        <Text style={styles.heroTitle}>{data.title}</Text>
        <Text style={styles.heroSubtitle}>{data.subtitle}</Text>
        <View style={styles.metaStrip}>
          <MetaItem label="Período" value={data.period} />
          <MetaItem label="Data" value={data.reportDate} />
          <MetaItem label="Gerado por" value={data.generatedBy} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.header} fixed>
      <View style={styles.brand}>
        <PadapMark small />
        <Text style={styles.brandText}>PADAP Intelligence</Text>
      </View>
      <Text style={styles.headerMeta}>{label} | {data.reportDate}</Text>
    </View>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function ExecutiveSummary({ data, mode }: { data: MarketReportData; mode: ReportAudience }) {
  const actionText = mode === "client" ? data.summary.producerReading : data.summary.consultantAction;
  const title = mode === "client" ? "Leitura da PADAP para o produtor" : "Ação do consultor";

  return (
    <Section title={data.summary.title} kicker="Movimento geral da semana">
      <View style={styles.panel} wrap={false}>
        <Text style={styles.paragraph}>{data.summary.text}</Text>
        {data.summary.bullets.slice(0, 4).map((item) => <BulletLine key={item}>{item}</BulletLine>)}
      </View>
      <View style={styles.callout} wrap={false}>
        <Text style={styles.calloutTitle}>{title}</Text>
        <Text style={styles.miniText}>{actionText}</Text>
      </View>
    </Section>
  );
}

export function TrendCards({ items }: { items: TrendCardData[] }) {
  return (
    <Section title="Cards de tendência" kicker="Indicadores acompanhados">
      <View style={styles.trendGrid}>
        {items.map((item, index) => (
          <View key={item.label} style={index > 2 ? [styles.trendCard, styles.trendCardWide] : styles.trendCard} wrap={false}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.label}</Text>
              <Badge tone={item.tone}>{item.trend}</Badge>
            </View>
            <Text style={styles.cardValue}>{item.value}</Text>
            <Text style={styles.miniText}>{item.note}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

export function ProductTrendTable({ items }: { items: MarketReportData["productTrends"] }) {
  return (
    <Section title="Principais produtos acompanhados" kicker="Detalhe por produto">
      <ReportTable
        headers={["Produto", "Tendência", "Motivo principal", "Atenção comercial"]}
        widths={["18%", "16%", "34%", "32%"]}
        rows={items}
        render={(item) => [
          <Text style={styles.strongCell}>{item.product}</Text>,
          <Badge tone={item.tone}>{item.trend}</Badge>,
          item.reason,
          item.commercialAttention
        ]}
      />
    </Section>
  );
}

export function CultureImpactTable({ items }: { items: MarketReportData["cultureImpacts"] }) {
  return (
    <Section title="Impacto por cultura" kicker="Leitura agronômica e comercial">
      <ReportTable
        headers={["Cultura", "Nutrientes sensíveis", "Leitura da semana", "Ação sugerida"]}
        widths={["16%", "25%", "31%", "28%"]}
        rows={items}
        render={(item) => [<Text style={styles.strongCell}>{item.culture}</Text>, item.nutrients, item.weeklyReading, item.suggestedAction]}
      />
    </Section>
  );
}

function ProductFamilyAnalysis({ items }: { items: MarketReportData["productFamilies"] }) {
  return (
    <Section title="Análise por família de produto" kicker="Tendência, risco e ação comercial">
      <ReportTable
        headers={["Família", "Tendência", "Motivo", "Risco", "Praças afetadas", "Ação comercial"]}
        widths={["15%", "13%", "22%", "16%", "16%", "18%"]}
        rows={items}
        render={(item) => [
          <Text style={styles.strongCell}>{item.family}</Text>,
          <Badge tone={item.tone}>{item.trend}</Badge>,
          item.reason,
          item.risk,
          item.affectedRegions,
          item.commercialAction
        ]}
      />
    </Section>
  );
}

export function PriceReferenceTable({ items }: { items: MarketReportData["priceReferences"] }) {
  return (
    <Section title="Tabela de preços referenciais" kicker="Dados sem repetir análise textual">
      <ReportTable
        headers={["Produto", "Preço atual", "Semana anterior", "Variação", "Tendência", "Observação"]}
        widths={["20%", "15%", "16%", "12%", "14%", "23%"]}
        rows={items}
        render={(item) => [
          <Text style={styles.strongCell}>{item.product}</Text>,
          item.currentPrice,
          item.previousPrice,
          item.variation,
          <Badge tone={item.tone}>{item.trend}</Badge>,
          item.observation
        ]}
      />
    </Section>
  );
}

export function FreightLogisticsTable({ items, simple = false }: { items: MarketReportData["freightLogistics"]; simple?: boolean }) {
  if (simple) {
    const factors = items.map((item) => ({
      factor: item.origin,
      status: item.variation,
      impact: item.impact
    }));
    return (
      <Section title="Frete e dólar" kicker="Fatores externos da decisão">
        <ReportTable
          headers={["Fator", "Situação", "Impacto"]}
          widths={["24%", "26%", "50%"]}
          rows={factors}
          render={(item) => [<Text style={styles.strongCell}>{item.factor}</Text>, item.status, item.impact]}
        />
      </Section>
    );
  }

  return (
    <Section title="Fretes e logística" kicker="Apenas logística e frete">
      <ReportTable
        headers={["Origem", "Destino/região", "Frete atual", "Semana anterior", "Variação", "Impacto"]}
        widths={["16%", "19%", "14%", "16%", "12%", "23%"]}
        rows={items}
        render={(item) => [item.origin, item.destination, item.currentFreight, item.previousFreight, item.variation, item.impact]}
      />
    </Section>
  );
}

export function ConsultantSalesArguments({ items }: { items: MarketReportData["salesArguments"] }) {
  return (
    <Section title="Argumentos de venda por produto" kicker="Objeção provável e resposta sugerida">
      <ReportTable
        headers={["Produto", "Objeção provável do cliente", "Resposta sugerida"]}
        widths={["20%", "34%", "46%"]}
        rows={items}
        render={(item) => [<Text style={styles.strongCell}>{item.product}</Text>, item.objection, item.suggestedAnswer]}
      />
    </Section>
  );
}

export function InternalAlerts({ items }: { items: MarketReportData["internalAlerts"] }) {
  return (
    <Section title="Alertas internos" kicker="Operacional e comercial">
      <ReportTable
        headers={["Alerta", "Prioridade", "Descrição", "Ação"]}
        widths={["21%", "15%", "36%", "28%"]}
        rows={items}
        render={(item) => [<Text style={styles.strongCell}>{item.type}</Text>, item.priority, item.description, item.action]}
      />
    </Section>
  );
}

export function RecommendationBlock({ recommendation, title, compact = false }: { recommendation: MarketReportData["recommendation"]; title: string; compact?: boolean }) {
  const groups = [
    ["Comprar agora", recommendation.buyNow],
    ["Monitorar", recommendation.monitor],
    ["Aguardar", recommendation.wait]
  ] as const;

  return (
    <Section title={title} kicker="Somente ação prática">
      <View style={styles.recommendationGrid} wrap={false}>
        {groups.map(([groupTitle, items]) => (
          <View key={groupTitle} style={styles.recommendationColumn}>
            <Text style={styles.recommendationTitle}>{groupTitle}</Text>
            {items.slice(0, compact ? 3 : 4).map((item) => <BulletLine key={item}>{item}</BulletLine>)}
          </View>
        ))}
      </View>
      <View style={styles.callout} wrap={false}>
        <Text style={styles.calloutTitle}>Recomendação PADAP da semana</Text>
        <Text style={styles.miniText}>{recommendation.finalText}</Text>
      </View>
    </Section>
  );
}

export function ReportFooter({ data }: { data: MarketReportData }) {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerLeft}>
        <Text><Text style={styles.footerBrand}>PADAP Intelligence</Text> | {data.footerNote}</Text>
        <Text>Gerado em {data.generatedAt}</Text>
      </View>
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Página ${pageNumber}/${totalPages}`} />
    </View>
  );
}

function Section({ title, kicker, children }: { title: string; kicker: string; children: ReactNode }) {
  return (
    <View style={styles.section} minPresenceAhead={120}>
      <View style={styles.sectionHeader} wrap={false}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionKicker}>{kicker}</Text>
      </View>
      {children}
    </View>
  );
}

function ReportTable<T>({ headers, widths, rows, render }: { headers: string[]; widths: string[]; rows: T[]; render: (item: T) => ReactNode[] }) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader} wrap={false}>
        {headers.map((header, index) => (
          <Text key={header} style={index === headers.length - 1 ? [styles.cell, styles.cellLast, { width: widths[index] }] : [styles.cell, { width: widths[index] }]}>{header}</Text>
        ))}
      </View>
      {rows.map((item, rowIndex) => {
        const cells = render(item);
        return (
          <View key={rowIndex} style={rowIndex % 2 ? [styles.row, styles.rowAlt] : styles.row} wrap={false}>
            {cells.map((cell, cellIndex) => (
              <View key={cellIndex} style={cellIndex === cells.length - 1 ? [styles.cell, styles.cellLast, { width: widths[cellIndex] }] : [styles.cell, { width: widths[cellIndex] }]}>
                {typeof cell === "string" ? <Text>{cell}</Text> : cell}
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

function BulletLine({ children }: { children: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function Badge({ tone, children }: { tone: MarketReportBadgeTone; children: string }) {
  const palette = {
    green: { backgroundColor: "#123B2B", color: colors.green },
    amber: { backgroundColor: "#3B2C12", color: colors.amber },
    red: { backgroundColor: "#3B1717", color: colors.red },
    blue: { backgroundColor: "#112E3B", color: colors.blue },
    gray: { backgroundColor: "#202A34", color: colors.gray }
  }[tone];

  return <Text style={[styles.badge, palette]}>{children}</Text>;
}

function PadapMark({ small = false }: { small?: boolean }) {
  return (
    <Svg width={small ? 18 : 30} height={small ? 20 : 34} viewBox="0 0 184 208">
      <Path fillRule="evenodd" d="M15 168V88C15 48.2355 47.2355 16 87 16H169V96C169 135.765 136.765 168 97 168H45V190L15 168ZM45 124V88C45 64.2518 64.2518 45 88 45H140V81C140 104.748 120.748 124 97 124H45Z" fill={colors.green} />
    </Svg>
  );
}
