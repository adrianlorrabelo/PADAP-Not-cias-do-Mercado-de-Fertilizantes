import { Document, Font, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { BookOpen, ChevronUp, CloudRain, Download, ExternalLink, Flame, Snowflake, Sun, Thermometer, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import type { ClimateEvent, ClimateSeverity, ClimateEventType } from "../../data/mockClimateNews";
import type { MarketNews, MarketNewsCategory } from "../../types";
import { formatDateTime } from "../../utils/marketFormatting";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function severityTone(s: ClimateSeverity): "red" | "amber" | "cyan" | "neutral" {
  if (s === "Crítico") return "red";
  if (s === "Atenção") return "amber";
  if (s === "Moderado") return "cyan";
  return "neutral";
}

function EventIcon({ type, size = 14 }: { type: ClimateEventType; size?: number }) {
  if (type === "Geada" || type === "Frio intenso") return <Snowflake size={size} className="shrink-0 text-blue-400" />;
  if (type === "Seca" || type === "Veranico") return <Sun size={size} className="shrink-0 text-amber-500" />;
  if (type === "Chuva excessiva") return <CloudRain size={size} className="shrink-0 text-blue-500" />;
  if (type === "Onda de calor") return <Flame size={size} className="shrink-0 text-red-500" />;
  if (type === "Granizo") return <Zap size={size} className="shrink-0 text-amber-600" />;
  return <Thermometer size={size} className="shrink-0 text-padap-emerald" />;
}

function climateBorderLeft(s: ClimateSeverity) {
  if (s === "Crítico") return "border-l-red-400";
  if (s === "Atenção") return "border-l-amber-400";
  if (s === "Moderado") return "border-l-padap-emerald/50";
  return "border-l-padap-line";
}

// ─── PDF Styles ───────────────────────────────────────────────────────────────

Font.registerHyphenationCallback((w) => [w]);

const S = StyleSheet.create({
  page:            { backgroundColor: "#fff", padding: 36, fontFamily: "Helvetica" },
  masthead:        { borderBottomWidth: 2, borderBottomColor: "#111827", paddingBottom: 8, marginBottom: 12 },
  mastheadLabel:   { fontSize: 7, letterSpacing: 2, color: "#6b7280", marginBottom: 4 },
  mastheadTitle:   { fontSize: 28, fontFamily: "Helvetica-Bold", color: "#111827" },
  mastheadMeta:    { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  mastheadMetaTxt: { fontSize: 7, color: "#6b7280" },
  divider:         { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 8 },
  sectionLabel:    { fontSize: 8, fontFamily: "Helvetica-Bold", letterSpacing: 1.5, color: "#6b7280", marginBottom: 6 },
  featuredBox:     { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#d1fae5", padding: 12, marginBottom: 12, borderRadius: 6 },
  featuredCat:     { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#059669", letterSpacing: 1, marginBottom: 4 },
  featuredTitle:   { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 6, lineHeight: 1.3 },
  featuredSummary: { fontSize: 9, color: "#374151", lineHeight: 1.5, marginBottom: 6 },
  featuredImpact:  { fontSize: 8, color: "#059669", fontFamily: "Helvetica-Bold" },
  featuredMeta:    { fontSize: 7, color: "#9ca3af", marginTop: 4 },
  grid:            { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  articleBox:      { width: "48%", borderWidth: 1, borderColor: "#e5e7eb", padding: 10, borderRadius: 4, backgroundColor: "#f9fafb" },
  articleCat:      { fontSize: 6, fontFamily: "Helvetica-Bold", color: "#059669", letterSpacing: 1, marginBottom: 3 },
  articleTitle:    { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 4, lineHeight: 1.3 },
  articleSummary:  { fontSize: 8, color: "#4b5563", lineHeight: 1.4, marginBottom: 4 },
  articleImpact:   { fontSize: 7, color: "#059669", marginBottom: 3 },
  articleMeta:     { fontSize: 7, color: "#9ca3af" },
  // Climate styles
  climateHeader:   { backgroundColor: "#1e3a5f", padding: 10, borderRadius: 6, marginBottom: 10 },
  climateHeaderTxt:{ fontSize: 12, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  climateHeaderSub:{ fontSize: 8, color: "#93c5fd", marginTop: 2 },
  climateBox:      { borderLeftWidth: 3, borderLeftColor: "#f59e0b", borderWidth: 1, borderColor: "#e5e7eb", padding: 10, borderRadius: 4, backgroundColor: "#fffbeb", marginBottom: 6 },
  climateBoxCrit:  { borderLeftWidth: 3, borderLeftColor: "#ef4444", borderWidth: 1, borderColor: "#fee2e2", padding: 10, borderRadius: 4, backgroundColor: "#fef2f2", marginBottom: 6 },
  climateBoxMod:   { borderLeftWidth: 3, borderLeftColor: "#059669", borderWidth: 1, borderColor: "#d1fae5", padding: 10, borderRadius: 4, backgroundColor: "#f0fdf4", marginBottom: 6 },
  climateBoxInfo:  { borderLeftWidth: 3, borderLeftColor: "#9ca3af", borderWidth: 1, borderColor: "#e5e7eb", padding: 10, borderRadius: 4, backgroundColor: "#f9fafb", marginBottom: 6 },
  climateSeverity: { fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 1, marginBottom: 3 },
  climateTitle:    { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 4, lineHeight: 1.3 },
  climateDesc:     { fontSize: 8, color: "#4b5563", lineHeight: 1.4, marginBottom: 4 },
  climateImpact:   { fontSize: 7, color: "#059669", fontFamily: "Helvetica-Bold", marginBottom: 2 },
  climateAlert:    { fontSize: 7, color: "#b45309", fontFamily: "Helvetica-Bold", marginBottom: 2 },
  climateMeta:     { fontSize: 7, color: "#9ca3af" },
  footer:          { position: "absolute", bottom: 24, left: 36, right: 36, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 6, flexDirection: "row", justifyContent: "space-between" },
  footerTxt:       { fontSize: 7, color: "#9ca3af" },
});

// ─── PDF Document ─────────────────────────────────────────────────────────────

function climateBoxStyle(s: ClimateSeverity) {
  if (s === "Crítico") return S.climateBoxCrit;
  if (s === "Moderado") return S.climateBoxMod;
  if (s === "Informativo") return S.climateBoxInfo;
  return S.climateBox;
}

function climateSeverityColor(s: ClimateSeverity) {
  if (s === "Crítico") return "#b91c1c";
  if (s === "Atenção") return "#b45309";
  if (s === "Moderado") return "#059669";
  return "#6b7280";
}

function JornalPdfDocument({ news, climateEvents, date, edition }: { news: MarketNews[]; climateEvents: ClimateEvent[]; date: string; edition: number }) {
  const featured = news[0];
  const rest = news.slice(1);
  const critical = climateEvents.filter((e) => e.severity === "Crítico");
  const others = climateEvents.filter((e) => e.severity !== "Crítico");

  return createElement(Document, { title: `Jornal PADAP - Edição ${edition}` },
    // PAGE 1 — Notícias de mercado
    createElement(Page, { size: "A4", style: S.page },
      createElement(View, { style: S.masthead },
        createElement(Text, { style: S.mastheadLabel }, "INTELIGÊNCIA DE MERCADO · FERTILIZANTES · PADAP AGRONEGOCIOS"),
        createElement(Text, { style: S.mastheadTitle }, "JORNAL PADAP"),
        createElement(View, { style: S.mastheadMeta },
          createElement(Text, { style: S.mastheadMetaTxt }, `Edição ${edition}`),
          createElement(Text, { style: S.mastheadMetaTxt }, date),
          createElement(Text, { style: S.mastheadMetaTxt }, `${news.length} matérias · ${climateEvents.length} alertas climáticos`)
        )
      ),
      featured && createElement(View, { style: S.featuredBox },
        createElement(Text, { style: S.featuredCat }, (featured.category ?? featured.tag ?? "Mercado").toUpperCase()),
        createElement(Text, { style: S.featuredTitle }, featured.title),
        createElement(Text, { style: S.featuredSummary }, featured.summary),
        featured.impact && createElement(Text, { style: S.featuredImpact }, `Impacto PADAP: ${featured.impact}`),
        createElement(Text, { style: S.featuredMeta }, `${featured.source ?? "Fonte"} · ${formatDateTime(featured.date)} · ${featured.confidence ?? 80}% confiança`)
      ),
      createElement(View, { style: S.divider }),
      createElement(Text, { style: S.sectionLabel }, "DEMAIS NOTÍCIAS DO MERCADO"),
      createElement(View, { style: S.grid },
        ...rest.map((item) =>
          createElement(View, { key: item.id, style: S.articleBox },
            createElement(Text, { style: S.articleCat }, (item.category ?? item.tag ?? "Mercado").toUpperCase()),
            createElement(Text, { style: S.articleTitle }, item.title),
            createElement(Text, { style: S.articleSummary }, item.summary),
            item.impact && createElement(Text, { style: S.articleImpact }, `Impacto PADAP: ${item.impact}`),
            createElement(Text, { style: S.articleMeta }, `${item.source ?? "Fonte"} · ${formatDateTime(item.date)}`)
          )
        )
      ),
      createElement(View, { style: S.footer },
        createElement(Text, { style: S.footerTxt }, "PADAP Intelligence · Jornal PADAP"),
        createElement(Text, { style: S.footerTxt }, `Gerado em ${date} · Página 1`),
        createElement(Text, { style: S.footerTxt }, "Uso interno · Confidencial")
      )
    ),

    // PAGE 2 — Caderno Climático
    createElement(Page, { size: "A4", style: S.page },
      createElement(View, { style: S.masthead },
        createElement(Text, { style: S.mastheadLabel }, "JORNAL PADAP · EDIÇÃO " + edition),
        createElement(Text, { style: S.mastheadTitle }, "Caderno Climático"),
        createElement(View, { style: S.mastheadMeta },
          createElement(Text, { style: S.mastheadMetaTxt }, `${critical.length} evento(s) crítico(s)`),
          createElement(Text, { style: S.mastheadMetaTxt }, date),
          createElement(Text, { style: S.mastheadMetaTxt }, `${climateEvents.length} alertas monitorados`)
        )
      ),
      createElement(Text, { style: S.sectionLabel }, "EVENTOS CRÍTICOS"),
      ...critical.map((e) =>
        createElement(View, { key: e.id, style: climateBoxStyle(e.severity) },
          createElement(Text, { style: { ...S.climateSeverity, color: climateSeverityColor(e.severity) } }, `${e.severity.toUpperCase()} · ${e.type.toUpperCase()} · ${e.region} · ${e.state}`),
          createElement(Text, { style: S.climateTitle }, e.title),
          createElement(Text, { style: S.climateDesc }, e.description),
          createElement(Text, { style: S.climateImpact }, `Impacto em fertilizantes: ${e.fertilizerImpact}`),
          createElement(Text, { style: S.climateAlert }, `Alerta comercial: ${e.commercialAlert}`),
          createElement(Text, { style: S.climateMeta }, `${e.source} · ${e.period} · Culturas: ${e.affectedCrops.join(", ")}`)
        )
      ),
      createElement(View, { style: S.divider }),
      createElement(Text, { style: S.sectionLabel }, "OUTROS ALERTAS E MONITORAMENTOS"),
      createElement(View, { style: S.grid },
        ...others.map((e) =>
          createElement(View, { key: e.id, style: { ...S.articleBox, borderLeftWidth: 3, borderLeftColor: climateSeverityColor(e.severity) } },
            createElement(Text, { style: { ...S.articleCat, color: climateSeverityColor(e.severity) } }, `${e.severity} · ${e.type}`),
            createElement(Text, { style: S.articleTitle }, e.title),
            createElement(Text, { style: S.articleSummary }, e.description),
            createElement(Text, { style: S.articleImpact }, e.fertilizerImpact),
            createElement(Text, { style: S.climateMeta }, `${e.source} · ${e.region} · ${e.period}`)
          )
        )
      ),
      createElement(View, { style: S.footer },
        createElement(Text, { style: S.footerTxt }, "PADAP Intelligence · Caderno Climático"),
        createElement(Text, { style: S.footerTxt }, `Gerado em ${date} · Página 2`),
        createElement(Text, { style: S.footerTxt }, "Uso interno · Confidencial")
      )
    )
  );
}

async function downloadJornalPdf(news: MarketNews[], climateEvents: ClimateEvent[], edition: number) {
  const date = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const doc = createElement(JornalPdfDocument, { news, climateEvents, date, edition }) as Parameters<typeof pdf>[0];
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Jornal_PADAP_Edicao_${edition}.pdf`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Category filters ─────────────────────────────────────────────────────────

const CATEGORY_LABELS: { key: "Todos" | MarketNewsCategory; label: string }[] = [
  { key: "Todos", label: "Todas" },
  { key: "Fertilizantes", label: "Fertilizantes" },
  { key: "Câmbio", label: "Câmbio" },
  { key: "Mercado", label: "Mercado" },
  { key: "Geopolítica", label: "Geopolítica" },
  { key: "Importações", label: "Importações" },
  { key: "Oferta e demanda", label: "Oferta/demanda" },
  { key: "Culturas", label: "Culturas" },
];

function categoryBadgeTone(cat: string): "green" | "amber" | "red" | "cyan" | "neutral" {
  if (cat === "Câmbio") return "amber";
  if (cat === "Fertilizantes") return "green";
  if (cat === "Geopolítica" || cat === "Matérias-primas") return "red";
  if (cat === "Importações" || cat === "Oferta e demanda") return "cyan";
  return "neutral";
}

function confidenceLabel(score = 80) {
  if (score >= 90) return { tone: "green" as const };
  if (score >= 75) return { tone: "cyan" as const };
  return { tone: "neutral" as const };
}

// ─── Section divider ──────────────────────────────────────────────────────────

function JornalDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-full border border-padap-green/30 bg-padap-green/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-padap-emerald">{label}</span>
      <div className="h-px flex-1 bg-padap-line" />
    </div>
  );
}

// ─── Inline article reader ────────────────────────────────────────────────────

function ArticleReader({ item, onClose }: { item: MarketNews; onClose: () => void }) {
  const paragraphs = (item.fullContent ?? item.summary).split("\n").filter(Boolean);
  return (
    <div className="rounded-xl border border-padap-green/25 bg-white shadow-lift">
      {/* Reading header */}
      <div className="flex items-start justify-between gap-4 border-b border-padap-line px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={categoryBadgeTone(item.category ?? item.tag ?? "Mercado")}>{item.category ?? item.tag}</Badge>
          {item.confidence !== undefined && (
            <Badge tone={confidenceLabel(item.confidence).tone}>{item.confidence}% confiança</Badge>
          )}
        </div>
        <button type="button" onClick={onClose} className="shrink-0 rounded-lg border border-padap-line bg-padap-field px-3 py-1.5 text-xs font-semibold text-padap-muted hover:text-padap-ink transition">
          <ChevronUp size={13} className="inline mr-1" />Fechar
        </button>
      </div>

      {/* Article body */}
      <div className="px-6 py-6 xl:px-10 xl:py-8">
        <h2 className="text-2xl font-black leading-tight text-padap-ink">{item.title}</h2>

        <div className="mt-4 space-y-5 text-[15px] leading-8 text-padap-ink">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {item.impact && (
          <div className="mt-6 rounded-xl border border-padap-emerald/25 bg-padap-emerald/[0.06] px-5 py-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-padap-emerald">Impacto PADAP</p>
            <p className="text-sm leading-6 text-padap-ink">{item.impact}</p>
          </div>
        )}
      </div>

      {/* Source footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-padap-line bg-padap-field px-6 py-4 text-xs text-padap-muted rounded-b-xl">
        <div>
          <span className="font-semibold text-padap-ink">{item.source}</span>
          {item.author ? <span> · Por {item.author}</span> : null}
          <span> · {formatDateTime(item.date)}</span>
        </div>
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-padap-line bg-white px-3 py-1.5 text-xs font-semibold text-padap-ink transition hover:border-padap-green/30 hover:text-padap-emerald">
            <ExternalLink size={12} />Ver na fonte original
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function JornalPadap({ news, climateEvents }: { news: MarketNews[]; climateEvents: ClimateEvent[] }) {
  const [activeCategory, setActiveCategory] = useState<"Todos" | MarketNewsCategory>("Todos");
  const [downloading, setDownloading] = useState(false);
  const [expandedClimate, setExpandedClimate] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);

  const toggleReading = (id: string) => setReadingId((prev) => (prev === id ? null : id));

  const [edition] = useState(() => Math.floor((Date.now() - new Date("2025-01-01").getTime()) / 86400000) + 1);

  const formattedDate = useMemo(() =>
    new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }), []);

  const filteredNews = useMemo(() => {
    if (activeCategory === "Todos") return news;
    return news.filter((item) => (item.category ?? item.tag) === activeCategory);
  }, [activeCategory, news]);

  const featured = filteredNews[0] ?? null;
  const secondary = filteredNews.slice(1, 3);
  const remaining = filteredNews.slice(3);

  const criticalClimate = useMemo(() => climateEvents.filter((e) => e.severity === "Crítico"), [climateEvents]);
  const otherClimate = useMemo(() => climateEvents.filter((e) => e.severity !== "Crítico"), [climateEvents]);

  const handleDownload = async () => {
    setDownloading(true);
    try { await downloadJornalPdf(filteredNews, climateEvents, edition); }
    catch (e) { if (import.meta.env.DEV) console.error(e); }
    finally { setDownloading(false); }
  };

  return (
    <div className="space-y-5">

      {/* ── Masthead ── */}
      <div className="overflow-hidden rounded-xl border border-padap-line bg-white shadow-panel">
        <div className="bg-padap-ink px-6 py-1.5 text-center text-[10px] tracking-[0.28em] text-padap-field/70 uppercase">
          Inteligência de Mercado · Fertilizantes · PADAP Agronegocios
        </div>
        <div className="px-6 py-5 text-center">
          <h1 className="text-4xl font-black tracking-tight text-padap-ink sm:text-5xl">Jornal PADAP</h1>
          <p className="mt-1 text-sm text-padap-muted">Mercado de fertilizantes, câmbio, insumos e clima agrícola</p>
          <div className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-between gap-3 border-t border-padap-line pt-3 text-xs text-padap-muted">
            <span>Edição nº {edition}</span>
            <span className="capitalize">{formattedDate}</span>
            <span>{news.length} matérias de mercado</span>
            {criticalClimate.length > 0 && (
              <span className="font-bold text-red-600">{criticalClimate.length} alerta{criticalClimate.length > 1 ? "s" : ""} climático{criticalClimate.length > 1 ? "s" : ""} crítico{criticalClimate.length > 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_LABELS.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveCategory(key)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${activeCategory === key ? "border-padap-green/40 bg-padap-green/10 text-padap-emerald" : "border-padap-line bg-white text-padap-muted hover:border-padap-green/30 hover:text-padap-ink"}`}>
              {label}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={handleDownload} disabled={downloading}>
          <Download size={14} />
          {downloading ? "Gerando PDF..." : "Baixar PDF do jornal"}
        </Button>
      </div>

      {/* ── Featured + secondary ── */}
      {featured && (
        <>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
            {/* Featured card */}
            <div className="overflow-hidden rounded-xl border-2 border-padap-green/20 bg-white shadow-panel transition hover:border-padap-green/40">
              <div className="border-b border-padap-green/15 bg-padap-green/[0.04] px-5 py-2 text-[10px] font-bold tracking-[0.2em] uppercase text-padap-emerald">Manchete</div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={categoryBadgeTone(featured.category ?? featured.tag ?? "Mercado")}>{featured.category ?? featured.tag}</Badge>
                  {featured.confidence !== undefined && <Badge tone={confidenceLabel(featured.confidence).tone}>{featured.confidence}% confiança</Badge>}
                </div>
                <h2 className="mt-4 text-2xl font-black leading-tight text-padap-ink">{featured.title}</h2>
                <p className="mt-3 text-sm leading-7 text-padap-muted">{featured.summary}</p>
                {featured.impact && (
                  <p className="mt-4 rounded-lg border border-padap-emerald/20 bg-padap-emerald/[0.06] px-4 py-2.5 text-sm font-semibold text-padap-emerald">Impacto PADAP: {featured.impact}</p>
                )}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-padap-muted">{featured.source} · {formatDateTime(featured.date)}</span>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => toggleReading(featured.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-padap-green/35 bg-padap-green/10 px-3 py-1.5 text-xs font-semibold text-padap-emerald transition hover:bg-padap-green/20">
                      {readingId === featured.id ? <ChevronUp size={13} /> : <BookOpen size={13} />}
                      {readingId === featured.id ? "Fechar leitura" : "Ler completo"}
                    </button>
                    {featured.url && (
                      <a href={featured.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-padap-line bg-white px-3 py-1.5 text-xs font-semibold text-padap-muted transition hover:text-padap-ink">
                        <ExternalLink size={12} />Fonte
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary column */}
            {secondary.length > 0 && (
              <div className="flex flex-col gap-5">
                {secondary.map((item) => (
                  <div key={item.id} className="flex flex-col overflow-hidden rounded-xl border border-padap-line bg-white shadow-panel transition hover:border-padap-green/35">
                    <div className="flex flex-1 flex-col p-5">
                      <Badge tone={categoryBadgeTone(item.category ?? item.tag ?? "Mercado")}>{item.category ?? item.tag}</Badge>
                      <h3 className="mt-3 font-bold leading-snug text-padap-ink">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-padap-muted line-clamp-3">{item.summary}</p>
                      {item.impact && <p className="mt-3 text-xs font-semibold text-padap-emerald">↳ {item.impact}</p>}
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                        <span className="text-xs text-padap-muted">{item.source} · {formatDateTime(item.date)}</span>
                        <button type="button" onClick={() => toggleReading(item.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-padap-green/30 bg-padap-green/[0.07] px-2.5 py-1 text-xs font-semibold text-padap-emerald transition hover:bg-padap-green/15">
                          {readingId === item.id ? <ChevronUp size={12} /> : <BookOpen size={12} />}
                          {readingId === item.id ? "Fechar" : "Ler"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inline reader — featured or secondary */}
          {readingId && [featured, ...secondary].find(i => i.id === readingId) && (
            <ArticleReader item={[featured, ...secondary].find(i => i.id === readingId)!} onClose={() => setReadingId(null)} />
          )}
        </>
      )}

      {remaining.length > 0 && (
        <>
          <JornalDivider label="Mais notícias" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {remaining.map((item) => (
              <div key={item.id} className="flex flex-col overflow-hidden rounded-xl border border-padap-line bg-white transition hover:border-padap-green/35 hover:shadow-md">
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={categoryBadgeTone(item.category ?? item.tag ?? "Mercado")}>{item.category ?? item.tag}</Badge>
                    {item.sourceStatus === "ativa" && <span className="rounded-full border border-padap-green/25 bg-padap-green/[0.07] px-2 py-0.5 text-[10px] font-bold text-padap-emerald">ativa</span>}
                  </div>
                  <h4 className="mt-3 text-sm font-bold leading-snug text-padap-ink">{item.title}</h4>
                  <p className="mt-2 text-xs leading-5 text-padap-muted line-clamp-3">{item.summary}</p>
                  {item.impact && <p className="mt-2 text-xs font-semibold text-padap-emerald line-clamp-2">↳ {item.impact}</p>}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="text-[10px] text-padap-muted">{item.source} · {formatDateTime(item.date)}</span>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => toggleReading(item.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-padap-green/30 bg-padap-green/[0.07] px-2 py-1 text-[11px] font-semibold text-padap-emerald transition hover:bg-padap-green/15">
                        {readingId === item.id ? <ChevronUp size={11} /> : <BookOpen size={11} />}
                        {readingId === item.id ? "Fechar" : "Ler"}
                      </button>
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={11} className="text-padap-muted hover:text-padap-emerald" /></a>}
                    </div>
                  </div>
                </div>

                {/* Inline reader for grid cards */}
                {readingId === item.id && (
                  <div className="border-t border-padap-line">
                    <ArticleReader item={item} onClose={() => setReadingId(null)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══ Caderno Climático ══════════════════════════════════════════════════ */}
      {climateEvents.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl border border-padap-line bg-white shadow-panel">
            {/* Cabeçalho do caderno */}
            <div className="flex items-center justify-between gap-4 border-b border-padap-line bg-[#0f2744] px-6 py-4">
              <div>
                <p className="text-[10px] tracking-[0.22em] uppercase text-blue-300/70">Jornal PADAP</p>
                <h2 className="mt-0.5 text-xl font-black tracking-tight text-white">Caderno Climático</h2>
                <p className="mt-1 text-xs text-blue-200/70">Alertas meteorológicos com impacto direto na demanda de fertilizantes</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {criticalClimate.length > 0 && <Badge tone="red">{criticalClimate.length} crítico{criticalClimate.length > 1 ? "s" : ""}</Badge>}
                <Badge tone="neutral">{climateEvents.length} alertas</Badge>
              </div>
            </div>

            <div className="p-5 space-y-5">

              {/* Alertas críticos — destaque */}
              {criticalClimate.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">Alertas críticos</p>
                  {criticalClimate.map((e) => (
                    <div key={e.id}>
                      <button type="button" onClick={() => setExpandedClimate(expandedClimate === e.id ? null : e.id)}
                        className={`w-full rounded-xl border-l-4 border border-red-200 bg-red-50 p-4 text-left transition hover:border-red-300 hover:shadow-sm ${expandedClimate === e.id ? "ring-2 ring-red-300/40" : ""}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <EventIcon type={e.type} size={15} />
                          <Badge tone="red">{e.severity}</Badge>
                          <span className="rounded-full border border-red-200 bg-white px-2.5 py-0.5 text-[10px] font-bold text-red-600">{e.type}</span>
                          <span className="ml-auto text-[10px] text-padap-muted">{e.region} · {e.state}</span>
                        </div>
                        <h3 className="mt-2.5 font-bold leading-snug text-padap-ink">{e.title}</h3>
                        <p className="mt-1.5 text-xs leading-5 text-padap-muted line-clamp-2">{e.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {e.affectedCrops.map((c) => <span key={c} className="rounded border border-red-200 bg-white px-2 py-0.5 text-[10px] text-red-700">{c}</span>)}
                        </div>
                        <div className="mt-2 text-[10px] text-padap-muted">{e.source} · <span className="font-semibold">{e.period}</span></div>
                      </button>

                      {expandedClimate === e.id && (
                        <div className="mt-2 rounded-xl border border-padap-line bg-padap-field p-4 space-y-3">
                          <p className="text-sm leading-6 text-padap-muted">{e.description}</p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border border-padap-emerald/20 bg-padap-emerald/[0.05] p-3">
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-padap-emerald">Impacto em fertilizantes</p>
                              <p className="text-xs leading-5 text-padap-ink">{e.fertilizerImpact}</p>
                            </div>
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-amber-700">Alerta comercial PADAP</p>
                              <p className="text-xs leading-5 text-amber-900">{e.commercialAlert}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Outros alertas — grid */}
              {otherClimate.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-padap-emerald">Monitoramentos ativos</p>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {otherClimate.map((e) => (
                      <button key={e.id} type="button" onClick={() => setExpandedClimate(expandedClimate === e.id ? null : e.id)}
                        className={`w-full rounded-xl border-l-4 ${climateBorderLeft(e.severity)} border border-padap-line bg-white p-4 text-left transition hover:border-padap-green/30 hover:shadow-sm ${expandedClimate === e.id ? "ring-2 ring-padap-green/20" : ""}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <EventIcon type={e.type} size={13} />
                          <Badge tone={severityTone(e.severity)}>{e.severity}</Badge>
                          <span className="ml-auto text-[10px] text-padap-muted">{e.state}</span>
                        </div>
                        <h4 className="mt-2 text-sm font-bold leading-snug text-padap-ink">{e.title}</h4>
                        <p className="mt-1.5 text-xs leading-5 text-padap-muted line-clamp-2">{e.description}</p>
                        <p className="mt-2 text-xs font-semibold text-padap-emerald line-clamp-1">↳ {e.fertilizerImpact}</p>
                        <div className="mt-2 text-[10px] text-padap-muted">{e.source} · {e.period}</div>

                        {expandedClimate === e.id && (
                          <div className="mt-3 space-y-2 border-t border-padap-line pt-3">
                            <div className="rounded-lg border border-padap-emerald/20 bg-padap-emerald/[0.05] p-2.5">
                              <p className="mb-0.5 text-[9px] font-bold uppercase text-padap-emerald">Impacto fertilizantes</p>
                              <p className="text-[11px] leading-4 text-padap-ink">{e.fertilizerImpact}</p>
                            </div>
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
                              <p className="mb-0.5 text-[9px] font-bold uppercase text-amber-700">Alerta comercial</p>
                              <p className="text-[11px] leading-4 text-amber-900">{e.commercialAlert}</p>
                            </div>
                            <p className="text-[10px] text-padap-muted">Culturas: {e.affectedCrops.join(", ")}</p>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </>
      )}

      {/* ── Confidence footer ── */}
      {news.length > 0 && (
        <div className="rounded-xl border border-padap-line bg-padap-field p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-padap-emerald"><span className="inline-block h-3 w-1 rounded-full bg-padap-green" />Índice de confiança das fontes</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {news.filter((item) => item.confidence !== undefined)
              .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
              .slice(0, 8)
              .map((item) => (
                <div key={item.id} className="flex items-center gap-2 rounded-lg border border-padap-line bg-white px-3 py-2 text-xs">
                  <Badge tone={confidenceLabel(item.confidence).tone}>{item.confidence}%</Badge>
                  <span className="font-semibold text-padap-ink">{item.source}</span>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
}
