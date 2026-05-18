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
    backgroundColor: colors.offWhite,
    color: colors.text,
    fontFamily: "Helvetica",
    fontSize: 8.8,
    lineHeight: 1.38,
    paddingBottom: 52
  },
  pageContent: {
    paddingHorizontal: pagePaddingX,
    paddingTop: 24
  },
  firstContent: {
    paddingHorizontal: pagePaddingX,
    paddingTop: 16
  },
  hero: {
    backgroundColor: colors.petroleum,
    paddingHorizontal: pagePaddingX,
    paddingTop: 30,
    paddingBottom: 28
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
    gap: 10
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 16.2,
    fontWeight: 700
  },
  compactBrandText: {
    color: colors.petroleum,
    fontSize: 10.5,
    fontWeight: 700
  },
  padapLogo: {
    height: 38,
    width: 124
  },
  padapLogoCompact: {
    height: 25,
    width: 82
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
    fontSize: 29,
    fontWeight: 700,
    lineHeight: 1.05
  },
  heroTitleLineTwo: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: 700,
    lineHeight: 1.05,
    marginTop: 1
  },
  heroSubtitle: {
    color: "#DDF6E5",
    fontSize: 11,
    marginTop: 10,
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
    borderRadius: 11,
    borderWidth: 1,
    marginBottom: 17,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  infoItem: {
    marginBottom: 10,
    paddingRight: 10,
    width: "25%"
  },
  infoSourceItem: {
    borderTopColor: colors.softLine,
    borderTopWidth: 1,
    marginTop: 1,
    paddingTop: 9,
    width: "100%"
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
    fontSize: 13.5,
    fontWeight: 700
  },
  sectionKicker: {
    color: colors.muted,
    fontSize: 7.4,
    paddingTop: 5
  },
  paragraph: {
    color: colors.text,
    fontSize: 9.8,
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
    backgroundColor: "#FFFFFF",
    borderColor: colors.softLine,
    borderRadius: 9,
    borderWidth: 1,
    overflow: "hidden"
  },
  tableHeader: {
    backgroundColor: colors.darkGreen,
    color: "#FFFFFF",
    flexDirection: "row",
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase"
  },
  tableRow: {
    borderTopColor: colors.softLine,
    borderTopWidth: 1,
    flexDirection: "row",
    minHeight: 36
  },
  tableRowAlt: {
    backgroundColor: colors.offWhite
  },
  cell: {
    borderRightColor: colors.softLine,
    borderRightWidth: 1,
    paddingHorizontal: 8,
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
    backgroundColor: "#FFFFFF",
    borderColor: colors.softLine,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 128,
    padding: 13,
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
    fontSize: 12.2,
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
    fontSize: 8.5,
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
  cropCard: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.softLine,
    borderRadius: 9,
    borderWidth: 1,
    minHeight: 88,
    padding: 10,
    width: "31.8%"
  },
  cropCardTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7
  },
  cropTitle: {
    color: colors.darkGreen,
    fontSize: 10.4,
    fontWeight: 700
  },
  cropImpact: {
    color: colors.muted,
    fontSize: 7.2,
    fontWeight: 700,
    marginBottom: 4,
    textTransform: "uppercase"
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
        <FullPadapLogo />
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

function FullPadapLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Svg style={compact ? styles.padapLogoCompact : styles.padapLogo} viewBox="0 0 675 208">
      <Path d="M15 168V88C15 48.2355 47.2355 16 87 16H169V96C169 135.765 136.765 168 97 168H45V190L15 168Z" fill={colors.brightGreen} />
      <Path d="M45 124V88C45 64.2518 64.2518 45 88 45H140V81C140 104.748 120.748 124 97 124H45Z" fill="#050505" />
      <Path d="M224 58H284C296.703 58 306.333 61.1036 312.889 67.3108C319.63 73.3341 323 82.2361 323 94.0169C323 105.798 319.63 114.792 312.889 121C306.333 127.023 296.703 130.034 284 130.034H243.176V147H224V58ZM243.176 114.357H282.658C289.214 114.357 294.034 112.711 297.116 109.42C300.383 106.128 302.016 101.56 302.016 95.7143C302.016 89.8686 300.383 85.3928 297.116 82.2857C294.034 79.1786 289.214 77.625 282.658 77.625H243.176V114.357Z" fill="#FFFFFF" />
      <Path d="M384.155 58H400.845L449 147H428.551L418.732 128.661H366.268L356.449 147H336L384.155 58ZM410.551 113.214L392.5 79.6667L374.449 113.214H410.551Z" fill="#FFFFFF" />
      <Path d="M462 58H505.455C521.049 58 533.747 62.1964 543.548 70.5893C553.516 78.9821 558.5 89.8214 558.5 103.107C558.5 116.393 553.516 127.232 543.548 135.625C533.747 143.875 521.049 148 505.455 148H462V58ZM504.292 131.607C514.259 131.607 522.235 129.018 528.219 123.839C534.203 118.661 537.195 111.75 537.195 103.107C537.195 94.4643 534.203 87.5536 528.219 82.375C522.235 77.1964 514.259 74.6071 504.292 74.6071H481.109V131.607H504.292Z" fill="#FFFFFF" />
      <Path d="M604.155 58H620.845L669 147H648.551L638.732 128.661H586.268L576.449 147H556L604.155 58ZM630.551 113.214L612.5 79.6667L594.449 113.214H630.551Z" fill="#FFFFFF" />
      <Path d="M493 169H504.824C508.275 169 510.891 169.854 512.672 171.561C514.503 173.218 515.418 175.665 515.418 178.903C515.418 182.141 514.503 184.613 512.672 186.32C510.891 187.977 508.275 188.806 504.824 188.806H498.199V197H493V169ZM498.199 184.258H504.459C506.24 184.258 507.549 183.805 508.386 182.899C509.273 181.994 509.716 180.737 509.716 179.129C509.716 177.521 509.273 176.289 508.386 175.434C507.549 174.58 506.24 174.153 504.459 174.153H498.199V184.258Z" fill="#FFFFFF" />
      <Path d="M520.146 176.109H525.01V179.468C526.052 176.947 528.015 175.687 530.899 175.687C531.494 175.687 532.026 175.737 532.497 175.837V180.864C531.754 180.714 531.085 180.638 530.49 180.638C528.833 180.638 527.519 181.129 526.548 182.112C525.577 183.094 525.091 184.492 525.091 186.305V197H520.146V176.109Z" fill="#FFFFFF" />
      <Path d="M545.118 197.452C542.928 197.452 540.985 197.013 539.289 196.136C537.594 195.258 536.272 194.005 535.324 192.377C534.376 190.749 533.902 188.822 533.902 186.595C533.902 184.367 534.376 182.44 535.324 180.812C536.272 179.184 537.594 177.931 539.289 177.054C540.985 176.176 542.928 175.737 545.118 175.737C547.308 175.737 549.251 176.176 550.947 177.054C552.642 177.931 553.964 179.184 554.912 180.812C555.86 182.44 556.334 184.367 556.334 186.595C556.334 188.822 555.86 190.749 554.912 192.377C553.964 194.005 552.642 195.258 550.947 196.136C549.251 197.013 547.308 197.452 545.118 197.452ZM545.118 193.027C546.996 193.027 548.451 192.466 549.484 191.345C550.517 190.224 551.034 188.64 551.034 186.595C551.034 184.549 550.517 182.966 549.484 181.845C548.451 180.724 546.996 180.163 545.118 180.163C543.24 180.163 541.785 180.724 540.752 181.845C539.719 182.966 539.203 184.549 539.203 186.595C539.203 188.64 539.719 190.224 540.752 191.345C541.785 192.466 543.24 193.027 545.118 193.027Z" fill="#FFFFFF" />
      <Path d="M569.616 197.452C567.841 197.452 566.257 197.013 564.866 196.136C563.474 195.258 562.383 194.005 561.592 192.377C560.801 190.749 560.405 188.835 560.405 186.633C560.405 184.405 560.801 182.466 561.592 180.812C562.383 179.159 563.474 177.893 564.866 177.016C566.257 176.138 567.841 175.699 569.616 175.699C572.031 175.699 573.967 176.714 575.423 178.746V169H580.369V197H575.678V194.018C574.223 196.307 572.202 197.452 569.616 197.452ZM570.56 193.102C572.083 193.102 573.272 192.54 574.129 191.419C574.986 190.298 575.415 188.696 575.415 186.614C575.415 184.506 574.986 182.879 574.129 181.731C573.272 180.584 572.083 180.01 570.56 180.01C569.037 180.01 567.835 180.584 566.952 181.731C566.095 182.879 565.667 184.506 565.667 186.614C565.667 188.696 566.095 190.298 566.952 191.419C567.835 192.54 569.037 193.102 570.56 193.102Z" fill="#FFFFFF" />
      <Path d="M594.633 197.452C591.923 197.452 589.856 196.786 588.433 195.454C587.01 194.122 586.299 192.188 586.299 189.651V176.109H591.245V189.235C591.245 191.797 592.478 193.078 594.945 193.078C596.342 193.078 597.453 192.605 598.278 191.66C599.103 190.715 599.516 189.424 599.516 187.787V176.109H604.462V197H599.771V194.018C598.418 196.307 596.705 197.452 594.633 197.452Z" fill="#FFFFFF" />
      <Path d="M620.188 197.452C617.946 197.452 615.959 197.013 614.225 196.136C612.491 195.258 611.145 194.005 610.184 192.377C609.224 190.749 608.744 188.835 608.744 186.633C608.744 184.405 609.224 182.466 610.184 180.812C611.145 179.159 612.491 177.893 614.225 177.016C615.959 176.138 617.946 175.699 620.188 175.699C621.592 175.699 622.95 175.9 624.263 176.302C625.576 176.704 626.641 177.243 627.459 177.919L626.013 181.731C624.094 180.584 622.263 180.01 620.518 180.01C618.472 180.01 616.869 180.584 615.71 181.731C614.575 182.879 614.008 184.506 614.008 186.614C614.008 188.696 614.575 190.298 615.71 191.419C616.869 192.54 618.472 193.102 620.518 193.102C622.263 193.102 624.094 192.528 626.013 191.381L627.459 195.193C626.641 195.869 625.576 196.408 624.263 196.81C622.95 197.238 621.592 197.452 620.188 197.452Z" fill="#FFFFFF" />
      <Path d="M631.711 176.109H636.657V197H631.711V176.109ZM631.456 167.463H636.912V172.49H631.456V167.463Z" fill="#FFFFFF" />
      <Path d="M652.39 197.452C650.2 197.452 648.257 197.013 646.561 196.136C644.866 195.258 643.544 194.005 642.596 192.377C641.648 190.749 641.174 188.822 641.174 186.595C641.174 184.367 641.648 182.44 642.596 180.812C643.544 179.184 644.866 177.931 646.561 177.054C648.257 176.176 650.2 175.737 652.39 175.737C654.58 175.737 656.523 176.176 658.219 177.054C659.914 177.931 661.236 179.184 662.184 180.812C663.132 182.44 663.606 184.367 663.606 186.595C663.606 188.822 663.132 190.749 662.184 192.377C661.236 194.005 659.914 195.258 658.219 196.136C656.523 197.013 654.58 197.452 652.39 197.452ZM652.39 193.027C654.268 193.027 655.723 192.466 656.756 191.345C657.789 190.224 658.306 188.64 658.306 186.595C658.306 184.549 657.789 182.966 656.756 181.845C655.723 180.724 654.268 180.163 652.39 180.163C650.512 180.163 649.057 180.724 648.024 181.845C646.991 182.966 646.475 184.549 646.475 186.595C646.475 188.64 646.991 190.224 648.024 191.345C649.057 192.466 650.512 193.027 652.39 193.027Z" fill="#FFFFFF" />
    </Svg>
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
    ["Fontes principais", data.mainSources]
  ];
  return (
    <View style={styles.infoCard} wrap={false}>
      <View style={styles.infoGrid}>
        {items.map(([label, value], index) => (
          <View key={label} style={index === 4 ? [styles.infoItem, styles.infoSourceItem] : styles.infoItem}>
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
    <Section number="04" title="Culturas em destaque" kicker="Leitura rápida por cultura" minPresenceAhead={260}>
      <View style={styles.cardGrid}>
        {items.map((item) => (
          <View key={item.name} style={styles.cropCard} wrap={false}>
            <View style={styles.cropCardTop}>
              <Text style={styles.cropTitle}>{item.name}</Text>
              <Badge tone={item.tone}>{item.trend}</Badge>
            </View>
            <Text style={styles.cropImpact}>Impacto {item.impact}</Text>
            <Text style={styles.miniText}>{item.observation}</Text>
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
