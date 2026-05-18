import { Document, Font, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";

Font.registerHyphenationCallback((word) => [word]);

export type MarketReportBadgeTone = "green" | "amber" | "red" | "blue" | "gray";

export type MarketReportData = {
  title: string;
  subtitle: string;
  reportDate: string;
  reportTime: string;
  generatedAt: string;
  period: string;
  generatedBy: string;
  lastUpdate: string;
  mainSources: string;
  summary: string;
  bullets: string[];
  movements: {
    indicator: string;
    movement: string;
    movementTone: MarketReportBadgeTone;
    impact: string;
    commercialAttention: string;
  }[];
  fertilizers: {
    name: string;
    trend: string;
    tone: MarketReportBadgeTone;
    impact: string;
    recommendedAction: string;
  }[];
  crops: {
    name: string;
    trend: string;
    tone: MarketReportBadgeTone;
    impact: string;
    observation: string;
  }[];
  exchangeRatios: {
    pair: string;
    previous: string;
    current: string;
    variation: string;
    status: string;
    tone: MarketReportBadgeTone;
    interpretation: string;
  }[];
  opportunities: {
    opportunity: string;
    reason: string;
    recommendedAction: string;
  }[];
  alerts: string[];
  recommendation: string[];
  sources: {
    name: string;
    category: string;
    confidence: string;
    lastUpdate: string;
    link?: string;
  }[];
};

const colors = {
  green: "#00843D",
  brightGreen: "#00C800",
  petroleum: "#073B3D",
  darkGreen: "#05382E",
  ink: "#172126",
  text: "#263238",
  muted: "#667985",
  softLine: "#DCE8E2",
  line: "#C8D8D0",
  offWhite: "#F7FAF8",
  greenTint: "#E8F6EE",
  amberTint: "#FFF6E3",
  redTint: "#FDEDEE",
  blueTint: "#E8F3F5",
  grayTint: "#F1F5F4",
  amber: "#A86500",
  red: "#B42318",
  blue: "#0D6374"
};

const pagePaddingX = 38;

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    color: colors.text,
    fontFamily: "Helvetica",
    fontSize: 8.6,
    lineHeight: 1.35,
    paddingBottom: 52
  },
  pageContent: {
    paddingHorizontal: pagePaddingX,
    paddingTop: 26
  },
  firstContent: {
    paddingHorizontal: pagePaddingX,
    paddingTop: 16
  },
  hero: {
    backgroundColor: colors.petroleum,
    paddingHorizontal: pagePaddingX,
    paddingTop: 26,
    paddingBottom: 24
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22
  },
  brand: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: 700
  },
  compactBrandText: {
    color: colors.petroleum,
    fontSize: 10.5,
    fontWeight: 700
  },
  heroTag: {
    borderColor: "rgba(255,255,255,0.32)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#DDF6E5",
    fontSize: 7.5,
    fontWeight: 700,
    paddingHorizontal: 10,
    paddingVertical: 4,
    textTransform: "uppercase"
  },
  heroTitleBlock: {
    maxWidth: 475
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.05
  },
  heroTitleLineTwo: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.05,
    marginTop: 1
  },
  heroSubtitle: {
    color: "#DDF6E5",
    fontSize: 10.8,
    marginTop: 9,
    maxWidth: 330
  },
  heroRuleWrap: {
    flexDirection: "row",
    gap: 4,
    marginTop: 18
  },
  heroRule: {
    backgroundColor: colors.brightGreen,
    borderRadius: 8,
    height: 4,
    width: 112
  },
  heroRuleMuted: {
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 8,
    height: 4,
    width: 28
  },
  compactHeader: {
    alignItems: "center",
    borderBottomColor: colors.softLine,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: pagePaddingX,
    paddingBottom: 12,
    paddingTop: 22
  },
  compactTitle: {
    color: colors.petroleum,
    fontSize: 9.5,
    fontWeight: 700,
    textTransform: "uppercase"
  },
  compactMeta: {
    color: colors.muted,
    fontSize: 7.5
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.softLine,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  infoItem: {
    marginBottom: 10,
    paddingRight: 10,
    width: "33.333%"
  },
  label: {
    color: colors.muted,
    fontSize: 6.8,
    fontWeight: 700,
    letterSpacing: 0.4,
    marginBottom: 3,
    textTransform: "uppercase"
  },
  value: {
    color: colors.ink,
    fontSize: 8.6,
    fontWeight: 700
  },
  section: {
    marginBottom: 16
  },
  sectionTight: {
    marginBottom: 12
  },
  sectionHeading: {
    borderBottomColor: colors.softLine,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 7
  },
  sectionNumber: {
    color: colors.green,
    fontSize: 7.2,
    fontWeight: 700,
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: "uppercase"
  },
  sectionTitle: {
    color: colors.darkGreen,
    fontSize: 13.2,
    fontWeight: 700
  },
  sectionKicker: {
    color: colors.muted,
    fontSize: 7.4,
    paddingTop: 5
  },
  paragraph: {
    color: colors.text,
    fontSize: 9.6,
    lineHeight: 1.45,
    marginBottom: 8
  },
  bulletGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 2
  },
  bulletPill: {
    backgroundColor: colors.offWhite,
    borderColor: colors.softLine,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 9,
    paddingVertical: 6,
    width: "49%"
  },
  bulletDot: {
    color: colors.green,
    fontSize: 10,
    fontWeight: 700,
    marginRight: 6,
    marginTop: -1
  },
  bulletText: {
    color: colors.text,
    flex: 1,
    fontSize: 8.4
  },
  table: {
    borderColor: colors.softLine,
    borderRadius: 9,
    borderWidth: 1,
    overflow: "hidden"
  },
  tableHeader: {
    backgroundColor: colors.darkGreen,
    color: "#FFFFFF",
    flexDirection: "row",
    fontSize: 7.2,
    fontWeight: 700,
    textTransform: "uppercase"
  },
  tableRow: {
    borderTopColor: colors.softLine,
    borderTopWidth: 1,
    flexDirection: "row",
    minHeight: 35
  },
  tableRowAlt: {
    backgroundColor: colors.offWhite
  },
  cell: {
    borderRightColor: colors.softLine,
    borderRightWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 7
  },
  cellLast: {
    borderRightWidth: 0
  },
  strongCell: {
    color: colors.darkGreen,
    fontWeight: 700
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  fertilizerCard: {
    backgroundColor: "#FBFDFB",
    borderColor: colors.softLine,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 122,
    padding: 12,
    width: "48.9%"
  },
  fertilizerTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 9
  },
  cardTitle: {
    color: colors.darkGreen,
    fontSize: 12,
    fontWeight: 700
  },
  cardRule: {
    backgroundColor: colors.green,
    borderRadius: 8,
    height: 3,
    marginBottom: 9,
    width: 36
  },
  miniLabel: {
    color: colors.muted,
    fontSize: 6.8,
    fontWeight: 700,
    letterSpacing: 0.35,
    marginBottom: 2,
    marginTop: 5,
    textTransform: "uppercase"
  },
  miniText: {
    color: colors.text,
    fontSize: 8.4,
    lineHeight: 1.35
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    fontSize: 6.8,
    fontWeight: 700,
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  opportunityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  opportunityItem: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.softLine,
    borderRadius: 9,
    borderWidth: 1,
    padding: 10,
    width: "49%"
  },
  opportunityTitle: {
    color: colors.darkGreen,
    fontSize: 9.4,
    fontWeight: 700,
    marginBottom: 5
  },
  calloutRow: {
    flexDirection: "row",
    gap: 10
  },
  callout: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 11,
    width: "49%"
  },
  calloutAmber: {
    backgroundColor: colors.amberTint,
    borderColor: "#E8C66E"
  },
  calloutGreen: {
    backgroundColor: colors.greenTint,
    borderColor: "#B5DEC4"
  },
  calloutTitle: {
    color: colors.darkGreen,
    fontSize: 10.4,
    fontWeight: 700,
    marginBottom: 7
  },
  bulletLine: {
    flexDirection: "row",
    marginBottom: 4
  },
  bulletLineText: {
    color: colors.text,
    flex: 1,
    fontSize: 8.1,
    lineHeight: 1.35
  },
  sourcePanel: {
    backgroundColor: colors.offWhite,
    borderColor: colors.softLine,
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  sourceRow: {
    borderBottomColor: colors.softLine,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingVertical: 5
  },
  sourceText: {
    fontSize: 7.6,
    color: colors.text
  },
  footer: {
    alignItems: "center",
    borderTopColor: colors.softLine,
    borderTopWidth: 1,
    bottom: 18,
    color: colors.muted,
    flexDirection: "row",
    fontSize: 7,
    justifyContent: "space-between",
    left: pagePaddingX,
    paddingTop: 8,
    position: "absolute",
    right: pagePaddingX
  },
  footerLeft: {
    flexDirection: "column",
    gap: 2,
    width: "68%"
  },
  footerBrand: {
    color: colors.petroleum,
    fontWeight: 700
  },
  footerMeta: {
    color: colors.muted,
    fontSize: 6.7
  },
  pageNumber: {
    color: colors.petroleum,
    fontSize: 7.4,
    fontWeight: 700
  }
});

export function MarketReportDocument({ data }: { data: MarketReportData }) {
  return (
    <Document title={data.title} author="PADAP Intelligence" subject="Relatório estratégico de mercado">
      <Page size="A4" style={styles.page} wrap>
        <Hero data={data} />
        <View style={styles.firstContent}>
          <InfoCard data={data} />
          <Section number="01" title="Resumo executivo" kicker="Leitura comercial do dia" minPresenceAhead={132}>
            <Text style={styles.paragraph}>{data.summary}</Text>
            <View style={styles.bulletGrid}>
              {data.bullets.slice(0, 4).map((bullet) => <BulletPill key={bullet}>{bullet}</BulletPill>)}
            </View>
          </Section>
          <MovementsTable items={data.movements} />
        </View>
        <Footer generatedAt={data.generatedAt} />
      </Page>

      <ReportPage data={data} pageLabel="Fertilizantes">
        <FertilizerCards items={data.fertilizers} />
      </ReportPage>

      <ReportPage data={data} pageLabel="Culturas e troca">
        <CropsTable items={data.crops} />
        <ExchangeTable items={data.exchangeRatios} />
      </ReportPage>

      <ReportPage data={data} pageLabel="Ações e fontes">
        <Opportunities items={data.opportunities} />
        <View style={styles.calloutRow} wrap={false}>
          <Callout tone="amber" title="Alertas para consultores" items={data.alerts} />
          <Callout tone="green" title="Recomendação comercial do dia" items={data.recommendation} />
        </View>
        <Sources items={data.sources} />
      </ReportPage>
    </Document>
  );
}

function ReportPage({ data, pageLabel, children }: { data: MarketReportData; pageLabel: string; children: ReactNode }) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <CompactHeader data={data} pageLabel={pageLabel} />
      <View style={styles.pageContent}>{children}</View>
      <Footer generatedAt={data.generatedAt} />
    </Page>
  );
}

function Hero({ data }: { data: MarketReportData }) {
  return (
    <View style={styles.hero} wrap={false}>
      <View style={styles.heroTop}>
        <View style={styles.brand}>
          <PadapMark />
          <Text style={styles.brandText}>PADAP Intelligence</Text>
        </View>
        <Text style={styles.heroTag}>Compras & Precificação</Text>
      </View>
      <View style={styles.heroTitleBlock}>
        <Text style={styles.heroTitle}>Relatório Estratégico</Text>
        <Text style={styles.heroTitleLineTwo}>de Mercado</Text>
      </View>
      <Text style={styles.heroSubtitle}>{data.subtitle}</Text>
      <View style={styles.heroRuleWrap}>
        <View style={styles.heroRule} />
        <View style={styles.heroRuleMuted} />
      </View>
    </View>
  );
}

function CompactHeader({ data, pageLabel }: { data: MarketReportData; pageLabel: string }) {
  return (
    <View style={styles.compactHeader} fixed>
      <View style={styles.brand}>
        <PadapMark small />
        <Text style={styles.compactBrandText}>PADAP Intelligence</Text>
      </View>
      <Text style={styles.compactMeta}>{pageLabel} | {data.reportDate}</Text>
    </View>
  );
}

function PadapMark({ small = false }: { small?: boolean }) {
  return (
    <Svg width={small ? 20 : 32} height={small ? 23 : 36} viewBox="0 0 184 208">
      <Path d="M15 168V88C15 48.2355 47.2355 16 87 16H169V96C169 135.765 136.765 168 97 168H45V190L15 168Z" fill={colors.brightGreen} />
      <Path d="M45 124V88C45 64.2518 64.2518 45 88 45H140V81C140 104.748 120.748 124 97 124H45Z" fill="#050505" />
    </Svg>
  );
}

function InfoCard({ data }: { data: MarketReportData }) {
  const items = [
    ["Data do relatório", data.reportDate],
    ["Período analisado", data.period],
    ["Gerado por", data.generatedBy],
    ["Última atualização", data.lastUpdate],
    ["Fontes principais", data.mainSources],
    ["Hora de geração", data.reportTime]
  ];
  return (
    <View style={styles.infoCard} wrap={false}>
      <View style={styles.infoGrid}>
        {items.map(([label, value]) => (
          <View key={label} style={styles.infoItem}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Section({ number, title, kicker, children, tight = false, minPresenceAhead = 110 }: { number: string; title: string; kicker?: string; children: ReactNode; tight?: boolean; minPresenceAhead?: number }) {
  return (
    <View style={tight ? styles.sectionTight : styles.section} minPresenceAhead={minPresenceAhead}>
      <View style={styles.sectionHeading} wrap={false}>
        <View>
          <Text style={styles.sectionNumber}>{number}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {kicker ? <Text style={styles.sectionKicker}>{kicker}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function BulletPill({ children }: { children: string }) {
  return (
    <View style={styles.bulletPill} wrap={false}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function BulletLine({ children }: { children: string }) {
  return (
    <View style={styles.bulletLine}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletLineText}>{children}</Text>
    </View>
  );
}

function MovementsTable({ items }: { items: MarketReportData["movements"] }) {
  return (
    <Section number="02" title="Principais movimentos do mercado" kicker="Impacto e atenção comercial" minPresenceAhead={185}>
      <View style={styles.table} wrap={false}>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, { width: "16%" }]}>Indicador</Text>
          <Text style={[styles.cell, { width: "17%" }]}>Movimento</Text>
          <Text style={[styles.cell, { width: "31%" }]}>Impacto</Text>
          <Text style={[styles.cell, styles.cellLast, { width: "36%" }]}>Atenção comercial</Text>
        </View>
        {items.map((item, index) => (
          <View key={item.indicator} style={index % 2 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
            <Text style={[styles.cell, styles.strongCell, { width: "16%" }]}>{item.indicator}</Text>
            <View style={[styles.cell, { width: "17%" }]}><Badge tone={item.movementTone}>{item.movement}</Badge></View>
            <Text style={[styles.cell, { width: "31%" }]}>{item.impact}</Text>
            <Text style={[styles.cell, styles.cellLast, { width: "36%" }]}>{item.commercialAttention}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function FertilizerCards({ items }: { items: MarketReportData["fertilizers"] }) {
  return (
    <Section number="03" title="Fertilizantes em destaque" kicker="Tendência, impacto e ação recomendada" minPresenceAhead={420}>
      <View style={styles.cardGrid}>
        {items.map((item) => (
          <View key={item.name} style={styles.fertilizerCard} wrap={false}>
            <View style={styles.fertilizerTop}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Badge tone={item.tone}>{item.trend}</Badge>
            </View>
            <View style={styles.cardRule} />
            <Text style={styles.miniLabel}>Impacto</Text>
            <Text style={styles.miniText}>{item.impact}</Text>
            <Text style={styles.miniLabel}>Ação recomendada</Text>
            <Text style={styles.miniText}>{item.recommendedAction}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function CropsTable({ items }: { items: MarketReportData["crops"] }) {
  return (
    <Section number="04" title="Culturas em destaque" kicker="Leitura rápida por cultura" minPresenceAhead={245}>
      <View style={styles.table} wrap={false}>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, { width: "17%" }]}>Cultura</Text>
          <Text style={[styles.cell, { width: "18%" }]}>Tendência</Text>
          <Text style={[styles.cell, { width: "16%" }]}>Impacto</Text>
          <Text style={[styles.cell, styles.cellLast, { width: "49%" }]}>Observação comercial</Text>
        </View>
        {items.map((item, index) => (
          <View key={item.name} style={index % 2 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
            <Text style={[styles.cell, styles.strongCell, { width: "17%" }]}>{item.name}</Text>
            <View style={[styles.cell, { width: "18%" }]}><Badge tone={item.tone}>{item.trend}</Badge></View>
            <Text style={[styles.cell, { width: "16%" }]}>{item.impact}</Text>
            <Text style={[styles.cell, styles.cellLast, { width: "49%" }]}>{item.observation}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function ExchangeTable({ items }: { items: MarketReportData["exchangeRatios"] }) {
  return (
    <Section number="05" title="Relação de troca" kicker="Comparativos para argumentação" minPresenceAhead={245}>
      <View style={styles.table} wrap={false}>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, { width: "18%" }]}>Comparativo</Text>
          <Text style={[styles.cell, { width: "13%" }]}>Anterior</Text>
          <Text style={[styles.cell, { width: "13%" }]}>Atual</Text>
          <Text style={[styles.cell, { width: "12%" }]}>Variação</Text>
          <Text style={[styles.cell, { width: "16%" }]}>Situação</Text>
          <Text style={[styles.cell, styles.cellLast, { width: "28%" }]}>Interpretação comercial</Text>
        </View>
        {items.map((item, index) => (
          <View key={item.pair} style={index % 2 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
            <Text style={[styles.cell, styles.strongCell, { width: "18%" }]}>{item.pair}</Text>
            <Text style={[styles.cell, { width: "13%" }]}>{item.previous}</Text>
            <Text style={[styles.cell, { width: "13%" }]}>{item.current}</Text>
            <Text style={[styles.cell, { width: "12%" }]}>{item.variation}</Text>
            <View style={[styles.cell, { width: "16%" }]}><Badge tone={item.tone}>{item.status}</Badge></View>
            <Text style={[styles.cell, styles.cellLast, { width: "28%" }]}>{item.interpretation}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function Opportunities({ items }: { items: MarketReportData["opportunities"] }) {
  return (
    <Section number="06" title="Oportunidades comerciais" kicker="Ações objetivas para o time" minPresenceAhead={240}>
      <View style={styles.opportunityGrid}>
        {items.map((item) => (
          <View key={item.opportunity} style={styles.opportunityItem} wrap={false}>
            <Text style={styles.opportunityTitle}>{item.opportunity}</Text>
            <Text style={styles.miniText}><Text style={styles.strongCell}>Motivo: </Text>{item.reason}</Text>
            <Text style={styles.miniText}><Text style={styles.strongCell}>Ação recomendada: </Text>{item.recommendedAction}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function Callout({ tone, title, items }: { tone: "amber" | "green"; title: string; items: string[] }) {
  return (
    <View style={[styles.callout, tone === "green" ? styles.calloutGreen : styles.calloutAmber]} wrap={false}>
      <Text style={styles.calloutTitle}>{title}</Text>
      {items.slice(0, 6).map((item) => <BulletLine key={item}>{item}</BulletLine>)}
    </View>
  );
}

function Sources({ items }: { items: MarketReportData["sources"] }) {
  return (
    <Section number="09" title="Fontes e atualização" kicker="Bases usadas no relatório" tight minPresenceAhead={170}>
      <View style={styles.sourcePanel} wrap={false}>
        {items.slice(0, 7).map((item) => (
          <View key={`${item.name}-${item.category}`} style={styles.sourceRow}>
            <Text style={[styles.sourceText, styles.strongCell, { width: "28%" }]}>{item.name}</Text>
            <Text style={[styles.sourceText, { width: "22%" }]}>{item.category}</Text>
            <Text style={[styles.sourceText, { width: "18%" }]}>Confiança: {item.confidence}</Text>
            <Text style={[styles.sourceText, { width: "20%" }]}>{item.lastUpdate}</Text>
            <Text style={[styles.sourceText, { width: "12%" }]}>{item.link ?? ""}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function Badge({ tone, children }: { tone: MarketReportBadgeTone; children: string }) {
  const palette = {
    green: { backgroundColor: colors.greenTint, color: colors.green },
    amber: { backgroundColor: colors.amberTint, color: colors.amber },
    red: { backgroundColor: colors.redTint, color: colors.red },
    blue: { backgroundColor: colors.blueTint, color: colors.blue },
    gray: { backgroundColor: colors.grayTint, color: colors.muted }
  }[tone];

  return <Text style={[styles.badge, palette]}>{children}</Text>;
}

function Footer({ generatedAt }: { generatedAt: string }) {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerLeft}>
        <Text><Text style={styles.footerBrand}>PADAP Intelligence</Text> — Inteligência que gera valor. Relacionamento que entrega resultados.</Text>
        <Text style={styles.footerMeta}>Gerado em {generatedAt}</Text>
      </View>
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Página ${pageNumber}/${totalPages}`} />
    </View>
  );
}
