import { Document, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";

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
  petroleum: "#083D3F",
  darkGreen: "#063E32",
  text: "#1F2933",
  muted: "#64748B",
  line: "#DDE7E2",
  softGreen: "#EAF7EF",
  softAmber: "#FFF5DF",
  softRed: "#FDEBEC",
  softBlue: "#EAF3F6",
  softGray: "#F5F7F8",
  amber: "#B7791F",
  red: "#B42318",
  blue: "#0F5F72"
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    color: colors.text,
    fontFamily: "Helvetica",
    fontSize: 8.8,
    lineHeight: 1.38,
    paddingBottom: 54
  },
  firstPage: {
    paddingTop: 0
  },
  content: {
    paddingHorizontal: 34,
    paddingTop: 22
  },
  hero: {
    backgroundColor: colors.petroleum,
    paddingHorizontal: 34,
    paddingTop: 28,
    paddingBottom: 26
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24
  },
  brand: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 700
  },
  heroTag: {
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#D8F5E2",
    fontSize: 7.6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: 700,
    lineHeight: 1.08,
    marginBottom: 7,
    maxWidth: 360
  },
  heroSubtitle: {
    color: "#D8F5E2",
    fontSize: 10.5,
    maxWidth: 330
  },
  heroRule: {
    backgroundColor: colors.brightGreen,
    height: 4,
    marginTop: 21,
    width: 112
  },
  section: {
    marginBottom: 14
  },
  sectionTitle: {
    color: colors.darkGreen,
    fontSize: 12.4,
    fontWeight: 700,
    marginBottom: 8
  },
  sectionNumber: {
    color: colors.green,
    fontSize: 8,
    fontWeight: 700,
    marginBottom: 2,
    textTransform: "uppercase"
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    marginTop: -10,
    padding: 12
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  infoItem: {
    marginBottom: 8,
    width: "33.333%"
  },
  label: {
    color: colors.muted,
    fontSize: 7.2,
    marginBottom: 2,
    textTransform: "uppercase"
  },
  value: {
    color: colors.text,
    fontSize: 8.8,
    fontWeight: 700
  },
  paragraph: {
    color: colors.text,
    fontSize: 9.6,
    marginBottom: 7
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 4
  },
  bulletDot: {
    color: colors.green,
    fontSize: 10,
    marginRight: 6,
    marginTop: -1
  },
  bulletText: {
    color: colors.text,
    flex: 1,
    fontSize: 8.8
  },
  table: {
    borderColor: colors.line,
    borderRadius: 7,
    borderWidth: 1,
    overflow: "hidden"
  },
  tableHeader: {
    backgroundColor: colors.darkGreen,
    color: "#FFFFFF",
    flexDirection: "row",
    fontSize: 7.4,
    fontWeight: 700,
    textTransform: "uppercase"
  },
  tableRow: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    minHeight: 31
  },
  tableRowAlt: {
    backgroundColor: "#F8FBF9"
  },
  cell: {
    borderRightColor: colors.line,
    borderRightWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 6
  },
  cellLast: {
    borderRightWidth: 0
  },
  strongCell: {
    color: colors.darkGreen,
    fontWeight: 700
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.line,
    borderRadius: 7,
    borderWidth: 1,
    padding: 9,
    width: "31.8%"
  },
  cardTitle: {
    color: colors.darkGreen,
    fontSize: 10.2,
    fontWeight: 700,
    marginBottom: 6
  },
  miniLabel: {
    color: colors.muted,
    fontSize: 7.2,
    marginTop: 5,
    textTransform: "uppercase"
  },
  miniText: {
    color: colors.text,
    fontSize: 8.1
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    fontSize: 7,
    fontWeight: 700,
    marginBottom: 3,
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  opportunityItem: {
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    paddingBottom: 8,
    paddingTop: 1
  },
  opportunityTitle: {
    color: colors.darkGreen,
    fontSize: 9.5,
    fontWeight: 700,
    marginBottom: 3
  },
  calloutAmber: {
    backgroundColor: colors.softAmber,
    borderColor: "#F3D28A",
    borderRadius: 8,
    borderWidth: 1,
    padding: 11
  },
  calloutGreen: {
    backgroundColor: colors.softGreen,
    borderColor: "#B7E5C8",
    borderRadius: 8,
    borderWidth: 1,
    padding: 11
  },
  calloutTitle: {
    color: colors.darkGreen,
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 6
  },
  sourceRow: {
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingVertical: 6
  },
  footer: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: 1,
    bottom: 0,
    color: colors.muted,
    flexDirection: "row",
    fontSize: 7,
    justifyContent: "space-between",
    left: 34,
    paddingTop: 8,
    position: "absolute",
    right: 34
  },
  footerBrand: {
    color: colors.petroleum,
    fontWeight: 700
  }
});

export function MarketReportDocument({ data }: { data: MarketReportData }) {
  return (
    <Document title={data.title} author="PADAP Intelligence" subject="Relatório estratégico de mercado">
      <Page size="A4" style={[styles.page, styles.firstPage]} wrap>
        <Header data={data} />
        <View style={styles.content}>
          <InfoCard data={data} />
          <Section number="01" title="Resumo executivo">
            <Text style={styles.paragraph}>{data.summary}</Text>
            {data.bullets.slice(0, 4).map((bullet) => <Bullet key={bullet}>{bullet}</Bullet>)}
          </Section>
          <MovementsTable items={data.movements} />
          <FertilizerCards items={data.fertilizers} />
          <CropsTable items={data.crops} />
          <ExchangeTable items={data.exchangeRatios} />
          <Opportunities items={data.opportunities} />
          <Callout tone="amber" number="07" title="Alertas para consultores" items={data.alerts} />
          <Callout tone="green" number="08" title="Recomendação comercial do dia" items={data.recommendation} />
          <Sources items={data.sources} />
        </View>
        <Footer generatedAt={data.generatedAt} />
      </Page>
    </Document>
  );
}

function Header({ data }: { data: MarketReportData }) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <View style={styles.brand}>
          <PadapMark />
          <Text style={styles.brandText}>PADAP Intelligence</Text>
        </View>
        <Text style={styles.heroTag}>Compras & Precificação</Text>
      </View>
      <Text style={styles.heroTitle}>{data.title}</Text>
      <Text style={styles.heroSubtitle}>{data.subtitle}</Text>
      <View style={styles.heroRule} />
    </View>
  );
}

function PadapMark() {
  return (
    <Svg width={28} height={32} viewBox="0 0 184 208">
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

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionNumber}>{number}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function MovementsTable({ items }: { items: MarketReportData["movements"] }) {
  return (
    <Section number="02" title="Principais movimentos do mercado">
      <View style={styles.table}>
        <View style={styles.tableHeader} fixed={false}>
          <Text style={[styles.cell, { width: "17%" }]}>Indicador</Text>
          <Text style={[styles.cell, { width: "17%" }]}>Movimento</Text>
          <Text style={[styles.cell, { width: "31%" }]}>Impacto</Text>
          <Text style={[styles.cell, styles.cellLast, { width: "35%" }]}>Atenção comercial</Text>
        </View>
        {items.map((item, index) => (
          <View key={item.indicator} style={index % 2 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow} wrap={false}>
            <Text style={[styles.cell, styles.strongCell, { width: "17%" }]}>{item.indicator}</Text>
            <View style={[styles.cell, { width: "17%" }]}><Badge tone={item.movementTone}>{item.movement}</Badge></View>
            <Text style={[styles.cell, { width: "31%" }]}>{item.impact}</Text>
            <Text style={[styles.cell, styles.cellLast, { width: "35%" }]}>{item.commercialAttention}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function FertilizerCards({ items }: { items: MarketReportData["fertilizers"] }) {
  return (
    <Section number="03" title="Fertilizantes em destaque">
      <View style={styles.cardsGrid}>
        {items.map((item) => (
          <View key={item.name} style={styles.card} wrap={false}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Badge tone={item.tone}>{item.trend}</Badge>
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
    <Section number="04" title="Culturas em destaque">
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, { width: "18%" }]}>Cultura</Text>
          <Text style={[styles.cell, { width: "20%" }]}>Tendência</Text>
          <Text style={[styles.cell, { width: "18%" }]}>Impacto</Text>
          <Text style={[styles.cell, styles.cellLast, { width: "44%" }]}>Observação comercial</Text>
        </View>
        {items.map((item, index) => (
          <View key={item.name} style={index % 2 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow} wrap={false}>
            <Text style={[styles.cell, styles.strongCell, { width: "18%" }]}>{item.name}</Text>
            <View style={[styles.cell, { width: "20%" }]}><Badge tone={item.tone}>{item.trend}</Badge></View>
            <Text style={[styles.cell, { width: "18%" }]}>{item.impact}</Text>
            <Text style={[styles.cell, styles.cellLast, { width: "44%" }]}>{item.observation}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function ExchangeTable({ items }: { items: MarketReportData["exchangeRatios"] }) {
  return (
    <Section number="05" title="Relação de troca">
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, { width: "18%" }]}>Comparativo</Text>
          <Text style={[styles.cell, { width: "13%" }]}>Anterior</Text>
          <Text style={[styles.cell, { width: "13%" }]}>Atual</Text>
          <Text style={[styles.cell, { width: "12%" }]}>Variação</Text>
          <Text style={[styles.cell, { width: "16%" }]}>Situação</Text>
          <Text style={[styles.cell, styles.cellLast, { width: "28%" }]}>Interpretação comercial</Text>
        </View>
        {items.map((item, index) => (
          <View key={item.pair} style={index % 2 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow} wrap={false}>
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
    <Section number="06" title="Oportunidades comerciais">
      {items.map((item) => (
        <View key={item.opportunity} style={styles.opportunityItem} wrap={false}>
          <Text style={styles.opportunityTitle}>• {item.opportunity}</Text>
          <Text><Text style={styles.strongCell}>Motivo: </Text>{item.reason}</Text>
          <Text><Text style={styles.strongCell}>Ação recomendada: </Text>{item.recommendedAction}</Text>
        </View>
      ))}
    </Section>
  );
}

function Callout({ tone, number, title, items }: { tone: "amber" | "green"; number: string; title: string; items: string[] }) {
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionNumber}>{number}</Text>
      <View style={tone === "green" ? styles.calloutGreen : styles.calloutAmber}>
        <Text style={styles.calloutTitle}>{title}</Text>
        {items.map((item) => <Bullet key={item}>{item}</Bullet>)}
      </View>
    </View>
  );
}

function Sources({ items }: { items: MarketReportData["sources"] }) {
  return (
    <Section number="09" title="Fontes e atualização">
      {items.map((item) => (
        <View key={`${item.name}-${item.category}`} style={styles.sourceRow} wrap={false}>
          <Text style={[styles.cell, styles.strongCell, { borderRightWidth: 0, width: "28%" }]}>{item.name}</Text>
          <Text style={[styles.cell, { borderRightWidth: 0, width: "22%" }]}>{item.category}</Text>
          <Text style={[styles.cell, { borderRightWidth: 0, width: "18%" }]}>Confiança: {item.confidence}</Text>
          <Text style={[styles.cell, { borderRightWidth: 0, width: "20%" }]}>{item.lastUpdate}</Text>
          <Text style={[styles.cell, styles.cellLast, { width: "12%" }]}>{item.link ?? ""}</Text>
        </View>
      ))}
    </Section>
  );
}

function Badge({ tone, children }: { tone: MarketReportBadgeTone; children: string }) {
  const palette = {
    green: { backgroundColor: colors.softGreen, color: colors.green },
    amber: { backgroundColor: colors.softAmber, color: colors.amber },
    red: { backgroundColor: colors.softRed, color: colors.red },
    blue: { backgroundColor: colors.softBlue, color: colors.blue },
    gray: { backgroundColor: colors.softGray, color: colors.muted }
  }[tone];

  return <Text style={[styles.badge, palette]}>{children}</Text>;
}

function Footer({ generatedAt }: { generatedAt: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text><Text style={styles.footerBrand}>PADAP Intelligence</Text> — Inteligência que gera valor. Relacionamento que entrega resultados.</Text>
      <Text>Gerado em {generatedAt} | Página <Text render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} /></Text>
    </View>
  );
}
