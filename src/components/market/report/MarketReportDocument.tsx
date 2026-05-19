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
  white: "#FFFFFF",
  paper: "#FAFCFB",
  soft: "#F3F7F5",
  softGreen: "#EAF7EF",
  green: "#00A845",
  greenDark: "#006E3A",
  greenDeep: "#073B2F",
  text: "#172126",
  muted: "#687A72",
  faint: "#8EA09A",
  line: "#D9E5DF",
  lineDark: "#C6D6CE",
  amber: "#B7791F",
  amberBg: "#FFF7E6",
  red: "#B42318",
  redBg: "#FEF0EF",
  blue: "#087990",
  blueBg: "#E8F6F8",
  gray: "#5F6F68",
  grayBg: "#EEF2F1"
};

const reportSpacing = {
  pagePaddingTop: 6,
  pagePaddingBottom: 38,
  pagePaddingHorizontal: 38,
  sectionGap: 7,
  blockGap: 4,
  tableGap: 0,
  cardPadding: 8,
  cardGap: 6,
  headerHeight: 30,
  footerHeight: 28
};

const pagePaddingX = reportSpacing.pagePaddingHorizontal;
const notice = "Informações referenciais sujeitas a alteração conforme mercado, câmbio, frete e disponibilidade.";

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    color: colors.text,
    fontFamily: "Helvetica",
    fontSize: 8.4,
    lineHeight: 1.36,
    paddingBottom: reportSpacing.pagePaddingBottom
  },
  cover: {
    backgroundColor: colors.white,
    color: colors.text,
    fontFamily: "Helvetica",
    fontSize: 8.6,
    paddingBottom: reportSpacing.pagePaddingBottom
  },
  coverBand: {
    backgroundColor: colors.soft,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    minHeight: 238,
    paddingHorizontal: pagePaddingX,
    paddingTop: 24,
    paddingBottom: 18,
    position: "relative"
  },
  coverTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22
  },
  brand: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9
  },
  brandText: {
    color: colors.greenDeep,
    fontSize: 13.2,
    fontWeight: 700
  },
  coverPill: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.greenDark,
    fontSize: 7,
    fontWeight: 700,
    paddingHorizontal: 10,
    paddingVertical: 4,
    textTransform: "uppercase"
  },
  coverTitleBlock: {
    maxWidth: 415
  },
  coverEyebrow: {
    color: colors.green,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.5,
    marginBottom: 7,
    textTransform: "uppercase"
  },
  coverTitle: {
    color: colors.greenDeep,
    fontSize: 29,
    fontWeight: 700,
    lineHeight: 1.05
  },
  coverSubtitle: {
    color: colors.muted,
    fontSize: 10.6,
    lineHeight: 1.34,
    marginTop: 7,
    maxWidth: 330
  },
  coverRule: {
    backgroundColor: colors.green,
    borderRadius: 8,
    height: 3,
    marginTop: 12,
    width: 118
  },
  coverGraphic: {
    bottom: 10,
    position: "absolute",
    right: 30
  },
  coverMetaWrap: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: pagePaddingX,
    marginTop: 9
  },
  coverMetaCard: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    width: "31.9%"
  },
  intro: {
    backgroundColor: colors.soft,
    borderColor: colors.line,
    borderRadius: 9,
    borderWidth: 1,
    marginHorizontal: pagePaddingX,
    marginTop: 14,
    marginBottom: reportSpacing.sectionGap,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 13
  },
  introTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  introMain: {
    flexDirection: "row",
    gap: 12
  },
  introTitleBlock: {
    flex: 1.1
  },
  introMeta: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  introEyebrow: {
    color: colors.green,
    fontSize: 7,
    fontWeight: 700,
    marginBottom: 5,
    textTransform: "uppercase"
  },
  introTitle: {
    color: colors.greenDeep,
    fontSize: 21,
    fontWeight: 700,
    lineHeight: 1.05
  },
  introSubtitle: {
    color: colors.muted,
    fontSize: 8.3,
    lineHeight: 1.28,
    marginTop: 5
  },
  introMetaCard: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 5,
    width: "48.2%"
  },
  label: {
    color: colors.faint,
    fontSize: 6.6,
    fontWeight: 700,
    marginBottom: 2,
    textTransform: "uppercase"
  },
  value: {
    color: colors.greenDeep,
    fontSize: 8.5,
    fontWeight: 700
  },
  pageContent: {
    paddingHorizontal: pagePaddingX,
    paddingTop: reportSpacing.pagePaddingTop
  },
  header: {
    alignItems: "center",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: pagePaddingX,
    minHeight: reportSpacing.headerHeight,
    paddingBottom: 5,
    paddingTop: 8
  },
  headerLeft: {
    width: "47%"
  },
  headerCenter: {
    alignItems: "center",
    width: "24%"
  },
  headerRight: {
    alignItems: "flex-end",
    width: "29%"
  },
  headerTitle: {
    color: colors.greenDeep,
    fontSize: 9.5,
    fontWeight: 700
  },
  headerMeta: {
    color: colors.muted,
    fontSize: 7,
    marginTop: 2
  },
  headerPage: {
    color: colors.greenDark,
    fontSize: 7.4,
    fontWeight: 700
  },
  section: {
    marginBottom: reportSpacing.sectionGap
  },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: reportSpacing.blockGap,
    paddingBottom: 2
  },
  sectionTitleWrap: {
    borderLeftColor: colors.green,
    borderLeftWidth: 4,
    paddingLeft: 9
  },
  sectionTitle: {
    color: colors.greenDeep,
    fontSize: 12,
    fontWeight: 700
  },
  sectionKicker: {
    color: colors.muted,
    fontSize: 7.2,
    paddingBottom: 1
  },
  panel: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 7
  },
  paragraph: {
    color: colors.text,
    fontSize: 9.1,
    lineHeight: 1.36,
    marginBottom: 4
  },
  highlightBox: {
    backgroundColor: colors.softGreen,
    borderColor: "#BFE7CD",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: reportSpacing.blockGap,
    overflow: "hidden"
  },
  highlightHeader: {
    backgroundColor: "#DDF4E7",
    borderBottomColor: "#BFE7CD",
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  highlightTitle: {
    color: colors.greenDark,
    fontSize: 8.8,
    fontWeight: 700
  },
  highlightText: {
    color: colors.text,
    fontSize: 8.2,
    lineHeight: 1.3,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2
  },
  bulletDot: {
    color: colors.green,
    fontSize: 9,
    fontWeight: 700,
    marginRight: 6,
    marginTop: -1
  },
  bulletText: {
    color: colors.text,
    flex: 1,
    fontSize: 8,
    lineHeight: 1.28
  },
  trendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: reportSpacing.cardGap
  },
  trendCard: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 62,
    padding: reportSpacing.cardPadding,
    width: "31.8%"
  },
  trendCardWide: {
    width: "48.9%"
  },
  cardTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: reportSpacing.blockGap
  },
  cardTitle: {
    color: colors.muted,
    fontSize: 6.8,
    fontWeight: 700,
    textTransform: "uppercase",
    width: "55%"
  },
  cardValue: {
    color: colors.greenDeep,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: 2
  },
  miniText: {
    color: colors.muted,
    fontSize: 7.1,
    lineHeight: 1.24
  },
  table: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden"
  },
  tableHeader: {
    backgroundColor: colors.greenDeep,
    color: colors.white,
    flexDirection: "row",
    fontSize: 6.8,
    fontWeight: 700,
    textTransform: "uppercase"
  },
  row: {
    backgroundColor: colors.white,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    minHeight: 26
  },
  rowAlt: {
    backgroundColor: colors.paper
  },
  cell: {
    borderRightColor: colors.line,
    borderRightWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 4
  },
  cellText: {
    color: colors.text,
    fontSize: 7.4,
    lineHeight: 1.24
  },
  cellLast: {
    borderRightWidth: 0
  },
  strongCell: {
    color: colors.greenDeep,
    fontWeight: 700
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    fontSize: 6.8,
    fontWeight: 700,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  recommendationGrid: {
    flexDirection: "row",
    gap: 7,
    marginBottom: reportSpacing.cardGap
  },
  recommendationColumn: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: reportSpacing.cardPadding - 1,
    width: "31.9%"
  },
  recommendationTitle: {
    color: colors.greenDeep,
    fontSize: 8.8,
    fontWeight: 700,
    marginBottom: 4
  },
  footer: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: 1,
    bottom: 10,
    color: colors.muted,
    flexDirection: "row",
    fontSize: 6.8,
    justifyContent: "space-between",
    left: pagePaddingX,
    minHeight: reportSpacing.footerHeight,
    paddingTop: 4,
    position: "absolute",
    right: pagePaddingX
  },
  footerLeft: {
    width: "74%"
  },
  footerBrand: {
    color: colors.greenDark,
    fontWeight: 700
  },
  footerNotice: {
    color: colors.muted,
    fontSize: 6.6,
    marginTop: 2
  },
  pageNumber: {
    color: colors.greenDeep,
    fontSize: 7.2,
    fontWeight: 700
  }
});

export function MarketReportDocument({ data }: { data: MarketReportData }) {
  return data.audience === "client" ? <ClientReport data={data} /> : <ConsultantReport data={data} />;
}

function ClientReport({ data }: { data: MarketReportData }) {
  return (
    <Document title={data.title} author="PADAP Intelligence" subject="Relatório de mercado para produtor">
      <ReportPage data={data} label="Resumo executivo" introLabel="Relatório Cliente">
        <ExecutiveSummary data={data} mode="client" />
        <TrendCards items={data.trendCards} />
      </ReportPage>
      <ReportPage data={data} label="Produtos, culturas e recomendação">
        <ProductTrendTable items={data.productTrends} />
        <CultureImpactTable items={data.cultureImpacts} />
        <FreightLogisticsTable items={data.freightLogistics.slice(0, 4)} simple />
        <RecommendationBlock recommendation={data.recommendation} title="Recomendação PADAP da semana" />
      </ReportPage>
    </Document>
  );
}

function ConsultantReport({ data }: { data: MarketReportData }) {
  return (
    <Document title={data.title} author="PADAP Intelligence" subject="Relatório técnico e comercial de mercado">
      <ReportPage data={data} label="Resumo comercial" introLabel="Relatório Consultor">
        <ExecutiveSummary data={data} mode="consultant" />
        <TrendCards items={data.trendCards} />
      </ReportPage>
      <ReportPage data={data} label="Famílias e preços">
        <ProductFamilyAnalysis items={data.productFamilies} />
        <PriceReferenceTable items={data.priceReferences} />
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

export function ReportCover({ data, label }: { data: MarketReportData; label: string }) {
  const coverTone = data.audience === "client" ? "Clareza para decisão comercial" : "Inteligência para atuação consultiva";
  const coverSubtitle = data.audience === "client"
    ? "Leitura objetiva para decisões comerciais da semana."
    : "Visão comercial e operacional para orientar o time.";

  return (
    <>
      <View style={styles.coverBand} wrap={false}>
        <View style={styles.coverTop}>
          <View style={styles.brand}>
            <PadapMark />
            <Text style={styles.brandText}>PADAP Intelligence</Text>
          </View>
          <Text style={styles.coverPill}>{label}</Text>
        </View>
        <View style={styles.coverTitleBlock}>
          <Text style={styles.coverEyebrow}>Central de Mercado</Text>
          <Text style={styles.coverTitle}>Relatório de Mercado</Text>
          <Text style={styles.coverSubtitle}>{coverSubtitle}</Text>
          <View style={styles.coverRule} />
        </View>
        <View style={styles.coverGraphic}>
          <CoverGraphic />
        </View>
      </View>
      <View style={styles.coverMetaWrap} wrap={false}>
        <MetaCard label="Tipo" value={label} />
        <MetaCard label="Período" value={data.period} />
        <MetaCard label="Data do boletim" value={data.reportDate} />
      </View>
      <View style={[styles.coverMetaWrap, { marginTop: 10 }]} wrap={false}>
        <MetaCard label="Foco do relatório" value={coverTone} />
        <MetaCard label="Gerado por" value={data.generatedBy} />
        <MetaCard label="Identidade" value="Central de Mercado PADAP" />
      </View>
    </>
  );
}

function ReportPage({ data, label, children, introLabel }: { data: MarketReportData; label: string; children: ReactNode; introLabel?: string }) {
  return (
    <Page size="A4" style={styles.page} wrap>
      {introLabel ? <CompactReportIntro data={data} label={introLabel} /> : <ReportHeader data={data} label={label} />}
      <View style={styles.pageContent}>{children}</View>
      <ReportFooter data={data} />
    </Page>
  );
}

export function CompactReportIntro({ data, label }: { data: MarketReportData; label: string }) {
  const coverSubtitle = data.audience === "client"
    ? "Leitura objetiva para decisões comerciais da semana."
    : "Visão comercial e operacional para orientar o time.";
  const coverTone = data.audience === "client" ? "Clareza para decisão" : "Inteligência comercial";

  return (
    <View style={styles.intro} wrap={false}>
      <View style={styles.introTop}>
        <View style={styles.brand}>
          <PadapMark small />
          <Text style={styles.brandText}>PADAP Intelligence</Text>
        </View>
        <Text style={styles.coverPill}>{label}</Text>
      </View>
      <View style={styles.introMain}>
        <View style={styles.introTitleBlock}>
          <Text style={styles.introEyebrow}>Central de Mercado</Text>
          <Text style={styles.introTitle}>Relatório de Mercado</Text>
          <Text style={styles.introSubtitle}>{coverSubtitle}</Text>
        </View>
        <View style={styles.introMeta}>
          <IntroMeta label="Tipo" value={label} />
          <IntroMeta label="Período" value={data.period} />
          <IntroMeta label="Data" value={data.reportDate} />
          <IntroMeta label="Foco" value={coverTone} />
        </View>
      </View>
    </View>
  );
}

function IntroMeta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.introMetaCard}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function ReportHeader({ data, label }: { data: MarketReportData; label: string }) {
  const typeLabel = data.audience === "client" ? "Relatório Cliente" : "Relatório Consultor";

  return (
    <View style={styles.header} fixed>
      <View style={styles.headerLeft}>
        <View style={styles.brand}>
          <PadapMark small />
          <Text style={styles.brandText}>PADAP Intelligence</Text>
        </View>
      </View>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{label}</Text>
        <Text style={styles.headerMeta}>{typeLabel}</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerPage} render={({ pageNumber, totalPages }) => `Página ${pageNumber}/${totalPages}`} />
        <Text style={styles.headerMeta}>{data.period} | {data.reportDate}</Text>
      </View>
    </View>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.coverMetaCard}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function ExecutiveSummary({ data, mode }: { data: MarketReportData; mode: ReportAudience }) {
  const actionText = mode === "client" ? data.summary.producerReading : data.summary.consultantAction;
  const title = mode === "client" ? "Leitura da PADAP para o produtor" : "Ação do consultor";

  return (
    <SectionTitle title={data.summary.title} kicker="Movimento geral da semana">
      <View style={styles.panel} wrap={false}>
        <Text style={styles.paragraph}>{data.summary.text}</Text>
        {data.summary.bullets.slice(0, 4).map((item) => <BulletLine key={item}>{item}</BulletLine>)}
      </View>
      <HighlightBox title={title}>{actionText}</HighlightBox>
    </SectionTitle>
  );
}

export function TrendCards({ items }: { items: TrendCardData[] }) {
  return (
    <SectionTitle title="Cards de tendência" kicker="Indicadores acompanhados">
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
    </SectionTitle>
  );
}

export function ProductTrendTable({ items }: { items: MarketReportData["productTrends"] }) {
  return (
    <SectionTitle title="Principais produtos acompanhados" kicker="Detalhe por produto">
      <ReportTable
        headers={["Produto", "Tendência", "Motivo principal", "Atenção comercial"]}
        widths={["18%", "16%", "34%", "32%"]}
        rows={items}
        render={(item) => [
          <Text style={[styles.cellText, styles.strongCell]}>{item.product}</Text>,
          <Badge tone={item.tone}>{item.trend}</Badge>,
          item.reason,
          item.commercialAttention
        ]}
      />
    </SectionTitle>
  );
}

export function CultureImpactTable({ items }: { items: MarketReportData["cultureImpacts"] }) {
  return (
    <SectionTitle title="Impacto por cultura" kicker="Leitura agronômica e comercial">
      <ReportTable
        headers={["Cultura", "Nutrientes sensíveis", "Leitura da semana", "Ação sugerida"]}
        widths={["16%", "25%", "31%", "28%"]}
        rows={items}
        render={(item) => [<Text style={[styles.cellText, styles.strongCell]}>{item.culture}</Text>, item.nutrients, item.weeklyReading, item.suggestedAction]}
      />
    </SectionTitle>
  );
}

function ProductFamilyAnalysis({ items }: { items: MarketReportData["productFamilies"] }) {
  return (
    <SectionTitle title="Análise por família de produto" kicker="Tendência, risco e ação comercial">
      <ReportTable
        headers={["Família", "Tendência", "Motivo", "Risco", "Praças afetadas", "Ação comercial"]}
        widths={["15%", "13%", "22%", "16%", "16%", "18%"]}
        rows={items}
        render={(item) => [
          <Text style={[styles.cellText, styles.strongCell]}>{item.family}</Text>,
          <Badge tone={item.tone}>{item.trend}</Badge>,
          item.reason,
          item.risk,
          item.affectedRegions,
          item.commercialAction
        ]}
      />
    </SectionTitle>
  );
}

export function PriceReferenceTable({ items }: { items: MarketReportData["priceReferences"] }) {
  return (
    <SectionTitle title="Tabela de preços referenciais" kicker="Dados sem repetir análise textual">
      <ReportTable
        headers={["Produto", "Preço atual", "Semana anterior", "Variação", "Tendência", "Observação"]}
        widths={["20%", "15%", "16%", "12%", "14%", "23%"]}
        rows={items}
        render={(item) => [
          <Text style={[styles.cellText, styles.strongCell]}>{item.product}</Text>,
          item.currentPrice,
          item.previousPrice,
          item.variation,
          <Badge tone={item.tone}>{item.trend}</Badge>,
          item.observation
        ]}
      />
    </SectionTitle>
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
      <SectionTitle title="Frete e dólar" kicker="Fatores externos da decisão">
        <ReportTable
          headers={["Fator", "Situação", "Impacto"]}
          widths={["24%", "26%", "50%"]}
          rows={factors}
          render={(item) => [<Text style={[styles.cellText, styles.strongCell]}>{item.factor}</Text>, item.status, item.impact]}
        />
      </SectionTitle>
    );
  }

  return (
    <SectionTitle title="Fretes e logística" kicker="Apenas logística e frete">
      <ReportTable
        headers={["Origem", "Destino/região", "Frete atual", "Semana anterior", "Variação", "Impacto"]}
        widths={["16%", "19%", "14%", "16%", "12%", "23%"]}
        rows={items}
        render={(item) => [item.origin, item.destination, item.currentFreight, item.previousFreight, item.variation, item.impact]}
      />
    </SectionTitle>
  );
}

export function ConsultantSalesArguments({ items }: { items: MarketReportData["salesArguments"] }) {
  return (
    <SectionTitle title="Argumentos de venda por produto" kicker="Objeção provável e resposta sugerida">
      <ReportTable
        headers={["Produto", "Objeção provável do cliente", "Resposta sugerida"]}
        widths={["20%", "34%", "46%"]}
        rows={items}
        render={(item) => [<Text style={[styles.cellText, styles.strongCell]}>{item.product}</Text>, item.objection, item.suggestedAnswer]}
      />
    </SectionTitle>
  );
}

export function InternalAlerts({ items }: { items: MarketReportData["internalAlerts"] }) {
  return (
    <SectionTitle title="Alertas internos" kicker="Operacional e comercial">
      <ReportTable
        headers={["Alerta", "Prioridade", "Descrição", "Ação"]}
        widths={["21%", "15%", "36%", "28%"]}
        rows={items}
        render={(item) => [<Text style={[styles.cellText, styles.strongCell]}>{item.type}</Text>, item.priority, item.description, item.action]}
      />
    </SectionTitle>
  );
}

export function RecommendationBlock({ recommendation, title, compact = false }: { recommendation: MarketReportData["recommendation"]; title: string; compact?: boolean }) {
  const groups = [
    ["Comprar agora", recommendation.buyNow],
    ["Monitorar", recommendation.monitor],
    ["Aguardar", recommendation.wait]
  ] as const;

  return (
    <SectionTitle title={title} kicker="Somente ação prática">
      <View style={styles.recommendationGrid} wrap={false}>
        {groups.map(([groupTitle, items]) => (
          <View key={groupTitle} style={styles.recommendationColumn}>
            <Text style={styles.recommendationTitle}>{groupTitle}</Text>
            {items.slice(0, compact ? 3 : 4).map((item) => <BulletLine key={item}>{item}</BulletLine>)}
          </View>
        ))}
      </View>
      <HighlightBox title="Orientação prática">{recommendation.finalText}</HighlightBox>
    </SectionTitle>
  );
}

export function ReportFooter({ data }: { data: MarketReportData }) {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerLeft}>
        <Text><Text style={styles.footerBrand}>PADAP Intelligence</Text> | Central de Mercado</Text>
        <Text style={styles.footerNotice}>{notice}</Text>
      </View>
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Página ${pageNumber}/${totalPages}`} />
    </View>
  );
}

export function SectionTitle({ title, kicker, children }: { title: string; kicker: string; children: ReactNode }) {
  return (
    <View style={styles.section} minPresenceAhead={42}>
      <View style={styles.sectionHeader} wrap={false}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={styles.sectionKicker}>{kicker}</Text>
      </View>
      {children}
    </View>
  );
}

export function HighlightBox({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.highlightBox} wrap={false}>
      <View style={styles.highlightHeader}>
        <Text style={styles.highlightTitle}>{title}</Text>
      </View>
      <Text style={styles.highlightText}>{children}</Text>
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
                {typeof cell === "string" ? <Text style={styles.cellText}>{cell}</Text> : cell}
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
    green: { backgroundColor: "#E4F6EB", color: colors.greenDark },
    amber: { backgroundColor: colors.amberBg, color: colors.amber },
    red: { backgroundColor: colors.redBg, color: colors.red },
    blue: { backgroundColor: colors.blueBg, color: colors.blue },
    gray: { backgroundColor: colors.grayBg, color: colors.gray }
  }[tone];

  return <Text style={[styles.badge, palette]}>{children}</Text>;
}

function PadapMark({ small = false }: { small?: boolean }) {
  return (
    <Svg width={small ? 18 : 32} height={small ? 20 : 36} viewBox="0 0 184 208">
      <Path fillRule="evenodd" d="M15 168V88C15 48.2355 47.2355 16 87 16H169V96C169 135.765 136.765 168 97 168H45V190L15 168ZM45 124V88C45 64.2518 64.2518 45 88 45H140V81C140 104.748 120.748 124 97 124H45Z" fill={colors.green} />
    </Svg>
  );
}

function CoverGraphic() {
  return (
    <Svg width={178} height={142} viewBox="0 0 178 142">
      <Path d="M14 102 C38 62, 52 92, 76 58 S121 41, 156 20" stroke={colors.green} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M22 118 H158" stroke={colors.lineDark} strokeWidth={1.5} />
      <Path d="M42 118 V83" stroke={colors.lineDark} strokeWidth={1.5} />
      <Path d="M78 118 V63" stroke={colors.lineDark} strokeWidth={1.5} />
      <Path d="M114 118 V49" stroke={colors.lineDark} strokeWidth={1.5} />
      <Path d="M150 118 V25" stroke={colors.lineDark} strokeWidth={1.5} />
      <Path d="M31 110 C46 91, 59 87, 75 93 C63 112, 45 117, 31 110Z" fill="#DDF4E7" />
      <Path d="M104 86 C122 67, 139 64, 155 73 C139 94, 119 100, 104 86Z" fill="#CBEED9" />
    </Svg>
  );
}
