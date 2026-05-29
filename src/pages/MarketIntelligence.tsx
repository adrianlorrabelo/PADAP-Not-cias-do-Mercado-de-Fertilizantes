import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BarChart3, Bot, CalendarClock, ChevronRight, Copy, ExternalLink, Eye, FileText, History, MoreHorizontal, Plus, Presentation, RefreshCw, Send, ShieldCheck, Sparkles, Trash2, TrendingDown, TrendingUp, Users } from "lucide-react";
import { AnalystPrecisionHistory } from "../components/market/AnalystPrecisionHistory";
import { ClosingSummary } from "../components/market/ClosingSummary";
import { CommercialArgumentsLibrary } from "../components/market/CommercialArgumentsLibrary";
import { CommercialImpactEngine } from "../components/market/CommercialImpactEngine";
import { CommercialOpportunities } from "../components/market/CommercialOpportunities";
import { CustomerOpportunityRadar } from "../components/market/CustomerOpportunityRadar";
import { ExchangeRatioAdvanced } from "../components/market/ExchangeRatioAdvanced";
import { ImpactedProposalsTable } from "../components/market/ImpactedProposalsTable";
import { InternalMarketAlerts } from "../components/market/InternalMarketAlerts";
import { MarketAnalystCard as _MarketAnalystCard } from "../components/market/MarketAnalystCard";
import { MarketReportModal } from "../components/market/MarketReportModal";
import { MarketSourcesManagerModal } from "../components/market/MarketSourcesManagerModal";
import { MarketThermometer } from "../components/market/MarketThermometer";
import { MarketTimeline } from "../components/market/MarketTimeline";
import { MarketVsPadapTable } from "../components/market/MarketVsPadapTable";
import { MeetingMode } from "../components/market/MeetingMode";
import { ProductMarketScore } from "../components/market/ProductMarketScore";
import { RiskOpportunityMatrix } from "../components/market/RiskOpportunityMatrix";
import { ScenarioSimulatorModal } from "../components/market/ScenarioSimulatorModal";
import { SourcesConfidenceCenter } from "../components/market/SourcesConfidenceCenter";
import { WhatsAppReportModal } from "../components/market/WhatsAppReportModal";
import { WhatsAppRecipientsModal } from "../components/market/WhatsAppRecipientsModal";
import { Sparkline } from "../components/charts/Sparkline";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { mockAnalystPredictions } from "../data/mockAnalystPredictions";
import { mockCommercialArguments } from "../data/mockCommercialArguments";
import { mockImpactedProposals } from "../data/mockImpactedProposals";
import { mockMarketCommercialIndicators, mockProductsAttention, mockMarketUpdateStatuses, mockMarketVsPadap, mockProductScores, mockRiskOpportunityItems } from "../data/mockMarketIndicators";
import { mockInternalMarketAlerts, mockTrustedMarketNews } from "../data/mockMarketNews";
import { mockClimateEvents } from "../data/mockClimateNews";
import { ClimateNewsCard } from "../components/market/ClimateNewsCard";
import { TrustedNewsFeed } from "../components/market/TrustedNewsFeed";
import { JornalPadap } from "../components/market/JornalPadap";
import { mockClosingSummary, mockCommercialOpportunities, mockCustomerOpportunities, mockExchangeRatios, mockMarketAnalystInsight, mockMarketTimeline } from "../data/mockMarketOpportunities";
import { generateBriefingWhatsApp, getExecutiveMarketStatus, getLatestMarketAnalysis } from "../services/marketAnalysisService";
import { summarizeCommercialImpact } from "../services/commercialImpactService";
import { calculateNextMarketAutoUpdateAt, getMarketAutoUpdateSettings, markMarketAutoUpdateAttempt, saveMarketAutoUpdateSettings, shouldRunMarketAutoUpdate } from "../services/marketAutoUpdateService";
import { clearMarketUpdateHistory, getMarketUpdateHistory } from "../services/marketUpdateHistoryService";
import { applyMarketUpdateResultToStatuses, getNextAutomaticUpdate, recordMarketUpdateFailure, simulateMarketUpdate, updateMarketIntelligence } from "../services/marketUpdateService";
import { loadMarketRealitySnapshot, type MarketRealityIndicator, type MarketRealitySnapshot } from "../services/marketRealityService";
import { getMarketSources } from "../services/marketSourcesService";
import { consolidateStock, getPurchaseSuggestions, loadMinimumRules, loadStockItems } from "../services/stockService";
import { getRecipients, getWhatsAppSendHistory } from "../services/whatsappRecipientsService";
import { usePermissions } from "../hooks/usePermissions";
import type { CommercialOpportunity, ConsolidatedStockItem, ExchangeRatioItem, GeneratedMarketReport, ImpactedProposal, MarketAlert, MarketAnalysis, MarketAutoUpdateSettings, MarketCommercialIndicator, MarketCommercialStatus, MarketConfidenceSource, MarketNews, MarketSource, MarketSourceStatus, MarketUpdateHistory, MarketUpdateResult, MarketUpdateTrigger, ProductAttention, WhatsAppRecipient, WhatsAppSendHistory } from "../types";
import { formatCurrency, formatDateTime, formatPercent, formatTime, priorityTone, statusTone } from "../utils/marketFormatting";
import { calculateGeneralMarketScore } from "../utils/marketScores";
import { getMainExchangeRatio } from "../utils/exchangeRatio";
import { notify } from "../utils/uiActions";

const fallbackMainIndicators: MarketRealityIndicator[] = [
  { name: "PTAX", value: "5,18", day: 0.95, week: 1.7, trend: "Alta leve", source: "Banco Central", updated: "--:--", history: [5.08, 5.11, 5.13, 5.16, 5.18], confidence: "internal", note: "Fallback interno enquanto a fonte oficial e a leitura do navegador carregam." },
  { name: "Ureia / Nitrogenados", value: "R$ 3.290/t", day: 2.4, week: 5.8, trend: "Alta forte", source: "Tabela PADAP", updated: "--:--", history: [3180, 3210, 3245, 3270, 3290], confidence: "internal", note: "Base mockada para decisao comercial sem integracao externa." },
  { name: "MAP / Fosfatados", value: "R$ 5.110/t", day: 1.1, week: 3.6, trend: "Alta moderada", source: "Tabela PADAP", updated: "--:--", history: [5020, 5050, 5070, 5095, 5110], confidence: "internal", note: "Base mockada para acompanhamento de pacotes grandes." },
  { name: "KCl / Potássicos", value: "R$ 3.010/t", day: -1.8, week: -4.2, trend: "Queda tatica", source: "Tabela PADAP", updated: "--:--", history: [3090, 3060, 3040, 3025, 3010], confidence: "internal", note: "Base mockada para janela comercial de potassio." },
  { name: "Especialidades / Foliares", value: "R$ 2.140/gal", day: 0.9, week: 2.8, trend: "Alta seletiva", source: "Lista Yara", updated: "--:--", history: [2080, 2105, 2120, 2135, 2140], confidence: "internal", note: "Foliares representados por especialidades e YaraVita nesta versao." }
];

type SourceHealthType = "automática" | "manual" | "interna" | "licenciada";
type SourceHealthStatus = "atualizado" | "atrasado" | "erro" | "fallback" | "não configurada";

interface SourceHealthRow {
  id: string;
  name: string;
  type: SourceHealthType;
  status: SourceHealthStatus;
  lastUpdate: string;
  nextUpdate: string;
  confidence: number;
  observation: string;
}

function marketTabClass(isActive: boolean) {
  return `inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "border-padap-green/35 bg-padap-green/10 text-padap-emerald shadow-[0_4px_16px_rgba(29,186,44,.12)]"
      : "border-padap-line bg-white text-padap-muted hover:border-padap-green/35 hover:bg-padap-green/10 hover:text-padap-ink"
  }`;
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-padap-green/25" />
      <span className="rounded-full border border-padap-green/30 bg-padap-green/[0.08] px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-padap-emerald">
        {label}
      </span>
      <div className="h-px flex-1 bg-padap-green/25" />
    </div>
  );
}

export default function MarketIntelligence() {
  const [statuses, setStatuses] = useState(mockMarketUpdateStatuses);
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());
  const [loading, setLoading] = useState(false);
  const [marketSnapshot, setMarketSnapshot] = useState<MarketRealitySnapshot | null>(null);
  const [marketSources, setMarketSources] = useState<MarketSource[]>(() => getMarketSources());
  const [updateHistory, setUpdateHistory] = useState<MarketUpdateHistory[]>(() => getMarketUpdateHistory());
  const [selectedHistory, setSelectedHistory] = useState<MarketUpdateHistory | null>(null);
  const [lastUpdateResult, setLastUpdateResult] = useState<MarketUpdateResult | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(() => getLatestMarketAnalysis());
  const [showScenario, setShowScenario] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [whatsAppMode, setWhatsAppMode] = useState<"report" | "briefing">("report");
  const [showRecipients, setShowRecipients] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showSourcesManager, setShowSourcesManager] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<"mercado" | "decisoes" | "jornal">("mercado");
  const [showMenu, setShowMenu] = useState(false);
  const [showAlertConfig, setShowAlertConfig] = useState(false);
  const [showUpdateHistory, setShowUpdateHistory] = useState(false);
  const [showAutoUpdateConfig, setShowAutoUpdateConfig] = useState(false);
  const [autoSettings, setAutoSettings] = useState<MarketAutoUpdateSettings>(() => getMarketAutoUpdateSettings());
  const [generatedReport, setGeneratedReport] = useState<GeneratedMarketReport | null>(null);
  const [recipients, setRecipients] = useState<WhatsAppRecipient[]>(() => getRecipients());
  const [sendHistory, setSendHistory] = useState<WhatsAppSendHistory[]>(() => getWhatsAppSendHistory());
  const loadingRef = useRef(false);
  const autoRunningRef = useRef(false);
  const { user } = usePermissions();

  const fallbackScore = useMemo(() => calculateGeneralMarketScore(mockProductScores), []);
  const fallbackMarketStatus = useMemo(() => getExecutiveMarketStatus(mockProductScores), []);
  const score = marketAnalysis?.thermometer.score ?? fallbackScore;
  const marketStatus = marketAnalysis?.thermometer.trend ?? fallbackMarketStatus;
  const impactSummary = useMemo(() => summarizeCommercialImpact(mockImpactedProposals), []);
  const fallbackBriefing = useMemo(() => generateBriefingWhatsApp(mockMarketAnalystInsight), []);
  const briefing = marketAnalysis?.briefing.whatsappText ?? fallbackBriefing;
  const analysisProducts = marketAnalysis?.productsInAttention ?? mockProductsAttention;
  const analysisOpportunities = marketAnalysis?.opportunities ?? mockCommercialOpportunities;
  const decisionIndicators = marketSnapshot?.indicators.length ? marketSnapshot.indicators : fallbackMainIndicators;
  const nextManual = statuses.find((status) => status.nextManual.includes("T"))?.nextManual ?? new Date().toISOString();
  const nextAutomatic = autoSettings.enabled && autoSettings.nextAutoUpdateAt ? autoSettings.nextAutoUpdateAt : getNextAutomaticUpdate();
  const mainRatio = getMainExchangeRatio(mockExchangeRatios);
  const latestHistory = updateHistory[0] ?? null;
  const _stockSummary = useMemo(() => {
    const consolidated = consolidateStock(loadStockItems(), loadMinimumRules());
    return {
      items: consolidated,
      suggestions: getPurchaseSuggestions(consolidated)
    };
  }, []);
  const latestAutoHistory = updateHistory.find((history) => getHistoryTrigger(history) === "Automática") ?? null;
  const canManageRecipients = user?.role === "Administrador Geral" || user?.role === "Gestor / Gerente" || user?.role === "Compras / Precificação";
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setLoading(true) triggers fetch spinner before async call
    setLoading(true);
    loadMarketRealitySnapshot(controller.signal)
      .then((snapshot) => {
        setMarketSnapshot(snapshot);
        setLastUpdate(snapshot.updatedAt);
        setMarketSources(getMarketSources());
        setUpdateHistory(getMarketUpdateHistory());
        if (snapshot.updateSlot) setStatuses((current) => simulateMarketUpdate(current));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  async function runMarketAutoUpdate() {
    if (loadingRef.current || autoRunningRef.current) return;
    const controller = new AbortController();
    autoRunningRef.current = true;
    loadingRef.current = true;
    setLoading(true);
    try {
      const update = await updateMarketIntelligence(controller.signal, { trigger: "Automática" });
      setMarketSnapshot(update.snapshot);
      setMarketSources(update.sources);
      setLastUpdateResult(update.result);
      setMarketAnalysis(update.analysis);
      setUpdateHistory(getMarketUpdateHistory());
      setLastUpdate(update.result.updatedAt);
      setStatuses((current) => applyMarketUpdateResultToStatuses(current, update.result));
      setAutoSettings((current) => markMarketAutoUpdateAttempt(current, new Date(update.result.updatedAt)));
      notify("Atualização automática concluída.");
    } catch {
      recordMarketUpdateFailure("Automática");
      setUpdateHistory(getMarketUpdateHistory());
      setAutoSettings((current) => markMarketAutoUpdateAttempt(current));
      notify("Última atualização automática apresentou falhas. Dados internos permanecem disponíveis.");
    } finally {
      autoRunningRef.current = false;
      loadingRef.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      const currentSettings = getMarketAutoUpdateSettings();
      if (currentSettings.nextAutoUpdateAt !== autoSettings.nextAutoUpdateAt || currentSettings.updatedAt !== autoSettings.updatedAt) {
        setAutoSettings(currentSettings);
      }

      if (loadingRef.current || autoRunningRef.current) return;
      if (!shouldRunMarketAutoUpdate(currentSettings)) return;

      void runMarketAutoUpdate();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [autoSettings.nextAutoUpdateAt, autoSettings.updatedAt]);

  const openBriefingWhatsApp = () => {
    setWhatsAppMode("briefing");
    setShowWhatsApp(true);
  };
  const openReportWhatsApp = () => {
    setWhatsAppMode("report");
    setShowWhatsApp(true);
  };

  const action = (message: string) => notify(message);

  const refreshMarket = async () => {
    if (loading || autoRunningRef.current) return;
    const controller = new AbortController();
    loadingRef.current = true;
    setLoading(true);
    try {
      const update = await updateMarketIntelligence(controller.signal, { trigger: "Manual" });
      setMarketSnapshot(update.snapshot);
      setMarketSources(update.sources);
      setLastUpdateResult(update.result);
      setMarketAnalysis(update.analysis);
      setUpdateHistory(getMarketUpdateHistory());
      setLastUpdate(update.result.updatedAt);
      setStatuses((current) => applyMarketUpdateResultToStatuses(current, update.result));
      notify(update.result.message);
    } catch {
      notify("Não foi possível atualizar as fontes agora. Usando dados internos disponíveis.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const closeSourcesManager = () => {
    setMarketSources(getMarketSources());
    setShowSourcesManager(false);
  };

  const _copySourceLink = (url?: string) => {
    if (!url) {
      notify("Esta fonte não possui link cadastrado.");
      return;
    }
    copyText(url, "Link da fonte copiado com sucesso.");
  };

  const copyText = (text: string, message: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch {
      // Ambientes embarcados podem bloquear a área de transferência.
    }
    navigator.clipboard?.writeText?.(text)?.catch(() => undefined);
    notify(message);
  };

  const clearHistory = () => {
    if (!window.confirm("Tem certeza que deseja limpar o histórico de leituras?")) return;
    setUpdateHistory(clearMarketUpdateHistory());
    setSelectedHistory(null);
    notify("Histórico de leituras limpo com sucesso.");
  };

  const updateAutoSettings = (settings: MarketAutoUpdateSettings) => {
    setAutoSettings(saveMarketAutoUpdateSettings(settings));
  };

  return (
    <div className="space-y-5 p-0">
      <Header
        loading={loading}
        showMenu={showMenu}
        onRefresh={refreshMarket}
        onReport={() => setShowReport(true)}
        onBriefing={openBriefingWhatsApp}
        onMeeting={() => setShowMeeting(true)}
        onManageSources={() => setShowSourcesManager(true)}
        onMenu={() => setShowMenu((current) => !current)}
        onSources={() => { setShowSources(true); setShowMenu(false); }}
        onScenario={() => { setShowScenario(true); setShowMenu(false); }}
        onAdvanced={() => { setShowAdvanced((current) => !current); setShowMenu(false); }}
        onAlertConfig={() => { setShowAlertConfig(true); setShowMenu(false); }}
        onAutoUpdateConfig={() => { setShowAutoUpdateConfig(true); setShowMenu(false); }}
        onUpdateHistory={() => { setShowUpdateHistory(true); setShowMenu(false); }}
        onRecipients={() => { if (canManageRecipients) { setShowRecipients(true); } else { notify("Você não tem permissão para gerenciar destinatários."); } setShowMenu(false); }}
        canManageRecipients={canManageRecipients}
      />

      <UpdateStrip statuses={statuses} lastUpdate={lastUpdate} nextManual={nextManual} nextAutomatic={nextAutomatic} sources={marketSources} result={lastUpdateResult} latestHistory={latestHistory} autoSettings={autoSettings} latestAutoHistory={latestAutoHistory} onAutoUpdateConfig={() => setShowAutoUpdateConfig(true)} />

      {/* Tab navigation */}
      <div className="rounded-xl border border-padap-line bg-padap-field p-1.5 shadow-panel">
        <div className="flex flex-wrap gap-1.5">
          <button className={marketTabClass(activeTab === "mercado")} onClick={() => setActiveTab("mercado")}>Inteligência de Mercado</button>
          <button className={marketTabClass(activeTab === "decisoes")} onClick={() => setActiveTab("decisoes")}>Decisões Comerciais PADAP</button>
          <button className={marketTabClass(activeTab === "jornal")} onClick={() => setActiveTab("jornal")}>Jornal PADAP</button>
        </div>
      </div>

      {/* Tab: Inteligência de Mercado */}
      {activeTab === "mercado" && (
        <div className="space-y-5">
          <SectionDivider label="Câmbio e PTAX" />

          <CurrencyPtaxCard indicators={decisionIndicators} proposals={mockImpactedProposals} onDetails={() => setShowAdvanced(true)} />

          <SectionDivider label="Leitura do mercado" />

          <CommercialIndicatorsPanel indicators={mockMarketCommercialIndicators} />

          <ClimateNewsCard events={mockClimateEvents} />

          <TrustedNewsFeed news={mockTrustedMarketNews} onCopy={(url) => copyText(url, "Link copiado.")} />

          <div className="grid gap-5 xl:grid-cols-4">
            <FertilizerFamilyCard family="Nitrogenados" productKeys={["ureia", "yarabela", "nitrato", "sulfato"]} indicators={decisionIndicators} products={analysisProducts} marketVsPadap={mockMarketVsPadap} tone="red" />
            <FertilizerFamilyCard family="Fosfatados" productKeys={["map", "fosfat"]} indicators={decisionIndicators} products={analysisProducts} marketVsPadap={mockMarketVsPadap} tone="amber" />
            <FertilizerFamilyCard family="Potássicos" productKeys={["kcl", "potass"]} indicators={decisionIndicators} products={analysisProducts} marketVsPadap={mockMarketVsPadap} tone="green" />
            <FertilizerFamilyCard family="Foliares" productKeys={["foliar", "especial", "yaravita", "yara especialidades"]} indicators={decisionIndicators} products={analysisProducts} marketVsPadap={mockMarketVsPadap} tone="cyan" />
          </div>

          <ExchangeDecisionCard ratios={mockExchangeRatios.slice(0, 4)} />
        </div>
      )}

      {/* Tab: Decisões Comerciais PADAP */}
      {activeTab === "decisoes" && (
        <div className="space-y-5">
          <SectionDivider label="Resumo executivo" />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_380px]">
            <DecisionSummary analysis={marketAnalysis} status={marketStatus} confidence={mockMarketAnalystInsight.confidence} onOpen={() => setShowAnalysis(true)} />
            <MarketThermometer score={score} thermometer={marketAnalysis?.thermometer} />
          </div>

          <SectionDivider label="Decisão comercial" />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <CommercialAlertsCard alerts={mockInternalMarketAlerts} proposals={mockImpactedProposals.slice(0, 4)} opportunities={analysisOpportunities} onAction={action} onDetails={() => setShowAdvanced(true)} />
            <SourcesHealthCard sources={marketSources.filter((source) => source.isActive)} latestHistory={latestHistory} onOpen={() => setShowSources(true)} onManage={() => setShowSourcesManager(true)} />
          </div>

          <SectionDivider label="Ação e transmissão" />

          <ReportBriefingPanel onReport={() => setShowReport(true)} onBriefing={openBriefingWhatsApp} onWhatsApp={openReportWhatsApp} onRecipients={() => setShowRecipients(true)} canManageRecipients={canManageRecipients} />

          <AdvancedArea open={showAdvanced} onToggle={() => setShowAdvanced((current) => !current)}>
            <div className="grid gap-5 xl:grid-cols-2">
              <CommercialImpactEngine summary={impactSummary} />
              <CustomerOpportunityRadar customers={mockCustomerOpportunities} />
            </div>
            <div id="propostas-impactadas" className="mt-5">
              <ImpactedProposalsTable proposals={mockImpactedProposals} onAction={action} />
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <ProductMarketScore scores={mockProductScores} />
              <MarketVsPadapTable items={mockMarketVsPadap} />
            </div>
            <div className="mt-5">
              <ExchangeRatioAdvanced ratios={mockExchangeRatios} />
            </div>
            <div className="mt-5">
              <CommercialOpportunities opportunities={analysisOpportunities} onAction={action} />
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <RiskOpportunityMatrix items={mockRiskOpportunityItems} />
              <InternalMarketAlerts alerts={mockInternalMarketAlerts} onAction={action} />
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <MarketTimeline events={mockMarketTimeline} />
              <ClosingSummary summary={mockClosingSummary} onAction={action} />
            </div>
            <div className="mt-5">
              <CommercialArgumentsLibrary argumentsList={mockCommercialArguments} onAction={action} />
            </div>
            <div className="mt-5">
              <AnalystPrecisionHistory predictions={mockAnalystPredictions} />
            </div>
          </AdvancedArea>
        </div>
      )}

      {/* Tab: Jornal PADAP */}
      {activeTab === "jornal" && (
        <JornalPadap news={mockTrustedMarketNews} climateEvents={mockClimateEvents} />
      )}

      <ScenarioSimulatorModal open={showScenario} onClose={() => setShowScenario(false)} />
      <MeetingMode open={showMeeting} onClose={() => setShowMeeting(false)} score={score} products={analysisProducts} proposals={mockImpactedProposals} mainRatio={mainRatio} opportunities={analysisOpportunities} onPdf={() => setShowReport(true)} onCopy={() => copyText(briefing, "Resumo de reunião copiado.")} />
      <MarketReportModal open={showReport} onClose={() => setShowReport(false)} report={generatedReport} onGenerated={(report) => { setGeneratedReport(report); }} />
      <WhatsAppReportModal open={showWhatsApp} onClose={() => setShowWhatsApp(false)} report={whatsAppMode === "report" ? generatedReport : null} mode={whatsAppMode} recipients={recipients} briefing={briefing} history={sendHistory} sentBy={user?.name ?? "PADAP Intelligence"} onHistory={setSendHistory} onAction={action} onManageRecipients={() => setShowRecipients(true)} />
      <WhatsAppRecipientsModal open={showRecipients} onClose={() => setShowRecipients(false)} recipients={recipients} canManage={canManageRecipients} onChange={setRecipients} onAction={action} />
      <MarketSourcesManagerModal open={showSourcesManager} onClose={closeSourcesManager} onAction={(message) => { action(message); setMarketSources(getMarketSources()); }} />

      <Modal title="Fontes monitoradas" open={showSources} onClose={() => setShowSources(false)}>
        <SourcesConfidenceCenter sources={toConfidenceSources(marketSources)} />
      </Modal>

      <Modal title="Configurar alertas" open={showAlertConfig} onClose={() => setShowAlertConfig(false)}>
        <div className="grid gap-3 md:grid-cols-2">
          {["Risco cambial", "Risco de margem", "Oportunidade em potássicos", "Propostas impactadas", "Relação de troca", "Notícia crítica"].map((item) => (
            <label key={item} className="flex items-center justify-between gap-3 rounded-lg border border-padap-line bg-padap-field p-3 text-sm text-padap-muted">
              <span>{item}</span>
              <input type="checkbox" defaultChecked />
            </label>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-padap-muted">Configuração simulada nesta versão. A persistência real fica preparada para integração futura.</p>
      </Modal>

      <MarketUpdateHistoryModal
        open={showUpdateHistory}
        history={updateHistory}
        selected={selectedHistory}
        onClose={() => setShowUpdateHistory(false)}
        onSelect={setSelectedHistory}
        onCopy={(summary) => copyText(summary, "Resumo da leitura copiado.")}
        onClear={clearHistory}
      />

      <AutoUpdateSettingsModal
        open={showAutoUpdateConfig}
        settings={autoSettings}
        latestAutoHistory={latestAutoHistory}
        onClose={() => setShowAutoUpdateConfig(false)}
        onChange={updateAutoSettings}
      />

      <Modal title="Análise completa do mercado" open={showAnalysis} onClose={() => setShowAnalysis(false)}>
        <div className="space-y-4 text-sm leading-6 text-padap-muted">
          <p><strong className="text-padap-ink">Resumo:</strong> {marketAnalysis?.briefing.summary ?? mockMarketAnalystInsight.summary}</p>
          <p><strong className="text-padap-ink">O que mudou:</strong> {marketAnalysis?.whatChanged ?? "PTAX, ureia e KCl seguem no radar comercial."}</p>
          <p><strong className="text-padap-ink">Impacto PADAP:</strong> {marketAnalysis?.briefing.impactPadap ?? mockMarketAnalystInsight.padapImpact}</p>
          <p><strong className="text-padap-ink">Produtos afetados:</strong> {(marketAnalysis?.briefing.affectedProducts ?? mockMarketAnalystInsight.affectedProducts).join(", ")}</p>
          <p><strong className="text-padap-ink">Termômetro:</strong> {marketAnalysis ? `${marketAnalysis.thermometer.score}/100 - ${marketAnalysis.thermometer.trend}` : "Aguardando atualização automática."}</p>
          <p className="text-padap-emerald"><strong>Ação recomendada:</strong> {marketAnalysis?.briefing.recommendedAction ?? mockMarketAnalystInsight.recommendedAction}</p>
          <p><strong className="text-padap-ink">Fontes:</strong> {(marketAnalysis?.briefing.sourcesUsed ?? mockMarketAnalystInsight.sources).join(", ")}</p>
        </div>
      </Modal>
    </div>
  );
}

function MarketUpdateHistoryModal({ open, history, selected, onClose, onSelect, onCopy, onClear }: { open: boolean; history: MarketUpdateHistory[]; selected: MarketUpdateHistory | null; onClose: () => void; onSelect: (history: MarketUpdateHistory | null) => void; onCopy: (summary: string) => void; onClear: () => void }) {
  const selectedTrigger = selected ? getHistoryTrigger(selected) : "Manual";
  return (
    <Modal title="Histórico de leituras" open={open} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm leading-6 text-padap-muted">Leituras geradas por atualização manual ou automática enquanto a Central está aberta no navegador.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="cyan">{history.length} leituras salvas</Badge>
              {history[0] && <Badge tone={statusTone(history[0].status)}>Última: {history[0].status}</Badge>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected && <Button variant="ghost" onClick={() => onSelect(null)}>Voltar ao histórico</Button>}
            <Button variant="danger" onClick={onClear} disabled={!history.length}><Trash2 size={16} />Limpar histórico</Button>
          </div>
        </div>

        {!history.length && (
          <div className="rounded-lg border border-padap-line bg-padap-field p-5 text-sm leading-6 text-padap-muted">
            Nenhuma leitura registrada ainda. Clique em Atualizar mercado agora para criar o primeiro histórico da Central de Mercado.
          </div>
        )}

        {selected ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-padap-line bg-padap-field p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-padap-ink">Leitura de {formatDateTime(selected.updatedAt)}</h3>
                  <p className="mt-2 text-sm leading-6 text-padap-muted">{selected.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={selectedTrigger === "Automática" ? "cyan" : "neutral"}>{selectedTrigger}</Badge>
                  <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
                <HistoryMetric label="Fontes verificadas" value={selected.sourcesChecked} />
                <HistoryMetric label="Sucesso" value={selected.sourcesSucceeded} />
                <HistoryMetric label="Com erro" value={selected.sourcesFailed} />
                <HistoryMetric label="Internas usadas" value={selected.internalSourcesUsed} />
                <HistoryMetric label="Confiança" value={selected.confidence} />
                <HistoryMetric label="Score análise" value={selected.analysisScore ?? "--"} />
                <HistoryMetric label="Origem" value={selectedTrigger} />
              </div>
              {selected.analysisSummary && <p className="mt-3 text-sm leading-6 text-padap-emerald">Análise: {selected.analysisSummary}</p>}
              <div className="mt-4">
                <Button variant="ghost" onClick={() => onCopy(selected.summary)}><Copy size={14} />Copiar resumo</Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-padap-line">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-padap-green/[0.08] text-xs uppercase tracking-[0.12em] text-padap-emerald">
                  <tr>
                    <th className="px-4 py-3">Fonte</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Mensagem</th>
                    <th className="px-4 py-3">Horário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-padap-line">
                  {selected.sourceResults.map((source) => (
                    <tr key={`${selected.id}-${source.sourceId}`}>
                      <td className="px-4 py-3 font-semibold text-padap-ink">{source.sourceName}</td>
                      <td className="px-4 py-3 text-padap-muted">{source.category}</td>
                      <td className="px-4 py-3"><Badge tone={sourceStatusTone(source.status)}>{source.status}</Badge></td>
                      <td className="px-4 py-3 text-padap-muted">{source.message ?? "Sem mensagem adicional."}</td>
                      <td className="px-4 py-3 text-padap-muted">{formatTime(source.checkedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <article key={item.id} className="rounded-lg border border-padap-line bg-padap-field p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-padap-ink">{formatDateTime(item.updatedAt)}</h3>
                      <Badge tone={getHistoryTrigger(item) === "Automática" ? "cyan" : "neutral"}>{getHistoryTrigger(item)}</Badge>
                      <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                      <Badge tone="neutral">Confiança {item.confidence}</Badge>
                      {item.analysisScore !== undefined && <Badge tone="cyan">Score {item.analysisScore}</Badge>}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-padap-muted">{item.summary}</p>
                    {item.analysisSummary && <p className="mt-1 text-sm leading-6 text-padap-emerald">{item.analysisSummary}</p>}
                    <p className="mt-2 text-xs leading-5 text-padap-muted">
                      {item.sourcesChecked} fontes lidas, {item.sourcesSucceeded} com sucesso e {item.sourcesFailed} com erro.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button variant="ghost" onClick={() => onSelect(item)}><Eye size={14} />Ver detalhes</Button>
                    <Button variant="ghost" onClick={() => onCopy(item.summary)}><Copy size={14} />Copiar resumo</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

function AutoUpdateSettingsModal({ open, settings, latestAutoHistory, onClose, onChange }: { open: boolean; settings: MarketAutoUpdateSettings; latestAutoHistory: MarketUpdateHistory | null; onClose: () => void; onChange: (settings: MarketAutoUpdateSettings) => void }) {
  const save = (updates: Partial<MarketAutoUpdateSettings>) => {
    const next = {
      ...settings,
      ...updates
    };
    onChange({
      ...next,
      nextAutoUpdateAt: calculateNextMarketAutoUpdateAt(next)
    });
  };

  const addTime = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 5, 0, 0);
    const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    save({ times: [...settings.times, time] });
  };

  const updateTime = (index: number, value: string) => {
    save({ times: settings.times.map((time, currentIndex) => currentIndex === index ? value : time) });
  };

  const removeTime = (index: number) => {
    save({ times: settings.times.filter((_, currentIndex) => currentIndex !== index) });
  };

  return (
    <Modal title="Configurar atualização automática" open={open} onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-lg border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-50">
          A atualização automática funciona enquanto o sistema estiver aberto no navegador.
        </div>

        <label className="flex items-center justify-between gap-3 rounded-lg border border-padap-line bg-padap-field p-4 text-sm text-padap-muted">
          <span>
            <span className="block font-semibold text-padap-ink">Ativar atualização automática</span>
            <span className="mt-1 block text-xs leading-5 text-padap-muted">Sem backend nesta etapa; a rotina depende da Central aberta.</span>
          </span>
          <input type="checkbox" checked={settings.enabled} onChange={(event) => save({ enabled: event.target.checked })} />
        </label>

        <div>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold text-padap-ink">Horários de atualização</h3>
            <Button variant="ghost" onClick={addTime}><Plus size={15} />Adicionar horário</Button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {settings.times.map((time, index) => (
              <div key={`${time}-${index}`} className="flex items-center gap-2 rounded-lg border border-padap-line bg-padap-field p-3">
                <Input type="time" value={time} onChange={(event) => updateTime(index, event.target.value)} />
                <Button variant="danger" className="h-10 w-10 shrink-0 px-0" onClick={() => removeTime(index)} aria-label="Remover horário"><Trash2 size={15} /></Button>
              </div>
            ))}
          </div>
          {!settings.times.length && <p className="mt-3 text-sm leading-6 text-padap-muted">Adicione pelo menos um horário para ativar uma janela automática.</p>}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <SummaryPill label="Status" value={settings.enabled ? "Ativo" : "Automático desativado"} tone={settings.enabled ? "green" : "cyan"} />
          <SummaryPill label="Próxima atualização" value={settings.enabled && settings.nextAutoUpdateAt ? formatTime(settings.nextAutoUpdateAt) : "Automático desativado"} tone="cyan" />
          <SummaryPill label="Última automática" value={latestAutoHistory ? formatDateTime(latestAutoHistory.updatedAt) : "Sem registro"} tone={latestAutoHistory?.status === "Com falhas" ? "amber" : "green"} />
        </div>

        {latestAutoHistory?.status === "Com falhas" && (
          <p className="rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-sm leading-6 text-red-100">
            Última atualização automática apresentou falhas. Dados internos permanecem disponíveis.
          </p>
        )}
      </div>
    </Modal>
  );
}

function getHistoryTrigger(history: MarketUpdateHistory): MarketUpdateTrigger {
  return history.trigger ?? "Manual";
}

function HistoryMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-padap-line bg-padap-field px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-[0.12em] text-padap-muted">{label}</p>
      <p className="mt-1 font-semibold text-padap-ink">{value}</p>
    </div>
  );
}

function Header({ loading, showMenu, canManageRecipients, onRefresh, onReport, onBriefing, onMeeting, onManageSources, onMenu, onSources, onScenario, onAdvanced, onAlertConfig, onAutoUpdateConfig, onUpdateHistory, onRecipients }: { loading: boolean; showMenu: boolean; canManageRecipients: boolean; onRefresh: () => void; onReport: () => void; onBriefing: () => void; onMeeting: () => void; onManageSources: () => void; onMenu: () => void; onSources: () => void; onScenario: () => void; onAdvanced: () => void; onAlertConfig: () => void; onAutoUpdateConfig: () => void; onUpdateHistory: () => void; onRecipients: () => void }) {
  return (
    <div className="relative rounded-xl border border-padap-line bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-padap-emerald">
            <ShieldCheck size={18} />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">PADAP Intelligence</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-padap-ink">Central de Inteligência de Mercado</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-padap-muted">Mercado, câmbio, fertilizantes, culturas e impacto comercial em um só lugar.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onRefresh} disabled={loading}><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Atualizar mercado agora</Button>
          <Button variant="ghost" onClick={onReport}><FileText size={16} />Gerar relatório PDF</Button>
          <Button variant="ghost" onClick={onBriefing}><Send size={16} />Gerar briefing WhatsApp</Button>
          <Button variant="ghost" onClick={onManageSources}><ShieldCheck size={16} />Gerenciar fontes</Button>
          <Button variant="ghost" onClick={onAutoUpdateConfig}><CalendarClock size={16} />Automático</Button>
          <Button variant="amber" onClick={onMeeting}><Presentation size={16} />Modo reunião</Button>
          <Button variant="ghost" className="h-10 w-10 px-0" onClick={onMenu} aria-label="Mais opções"><MoreHorizontal size={18} /></Button>
        </div>
      </div>
      {showMenu && (
        <div className="absolute right-5 top-[calc(100%-12px)] z-20 w-64 rounded-xl border border-padap-line bg-white p-2 shadow-lift">
          <MenuButton icon={<CalendarClock size={15} />} label="Ver fontes" onClick={onSources} />
          <MenuButton icon={<Sparkles size={15} />} label="Simular cenário" onClick={onScenario} />
          <MenuButton icon={<ShieldCheck size={15} />} label="Configurar alertas" onClick={onAlertConfig} />
          <MenuButton icon={<CalendarClock size={15} />} label="Atualização automática" onClick={onAutoUpdateConfig} />
          <MenuButton icon={<History size={15} />} label="Histórico de leituras" onClick={onUpdateHistory} />
          {canManageRecipients && <MenuButton icon={<Users size={15} />} label="Gerenciar destinatários" onClick={onRecipients} />}
          <MenuButton icon={<BarChart3 size={15} />} label="Ver recursos avançados" onClick={onAdvanced} />
        </div>
      )}
    </div>
  );
}

function UpdateStrip({ statuses, lastUpdate, nextManual, nextAutomatic, sources, result, latestHistory, autoSettings, latestAutoHistory, onAutoUpdateConfig }: { statuses: typeof mockMarketUpdateStatuses; lastUpdate: string; nextManual: string; nextAutomatic: string; sources: MarketSource[]; result: MarketUpdateResult | null; latestHistory: MarketUpdateHistory | null; autoSettings: MarketAutoUpdateSettings; latestAutoHistory: MarketUpdateHistory | null; onAutoUpdateConfig: () => void }) {
  const activeSources = sources.filter((source) => source.isActive);
  const sourceNames = activeSources.slice(0, 4).map((source) => source.name).join(", ");
  const sourceLabel = sourceNames ? `${sourceNames}${activeSources.length > 4 ? ` +${activeSources.length - 4}` : ""}` : "Nenhuma fonte ativa";
  const status = latestHistory?.status ?? result?.status ?? statuses[0]?.status ?? "pendente";
  const checkedLabel = latestHistory ? `${latestHistory.sourcesChecked} verificadas` : sourceLabel;
  const confidenceLabel = latestHistory?.confidence ?? result?.confidence ?? "Aguardando leitura";
  const autoStatus = autoSettings.enabled ? "Ativo" : "Automático desativado";
  const nextAutoLabel = autoSettings.enabled && autoSettings.nextAutoUpdateAt ? formatTime(nextAutomatic) : "Automático desativado";
  const lastAutoLabel = latestAutoHistory ? formatDateTime(latestAutoHistory.updatedAt) : "Sem atualização automática";
  return (
    <div className="rounded-xl border border-padap-line bg-padap-field px-4 py-3">
      <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-7">
        <StripItem label="Última atualização geral" value={formatDateTime(latestHistory?.updatedAt ?? lastUpdate)} />
        <StripItem label="Próxima janela manual" value={formatTime(nextManual)} />
        <StripItem label="Próxima janela automática" value={nextAutoLabel} />
        <StripItem label="Automático" value={<Badge tone={autoSettings.enabled ? "green" : "neutral"}>{autoStatus}</Badge>} />
        <StripItem label="Última automática" value={lastAutoLabel} />
        <StripItem label="Status da atualização" value={<Badge tone={statusTone(status)}>{status}</Badge>} />
        <StripItem label="Fontes verificadas" value={checkedLabel} />
        <StripItem label="Confiança" value={confidenceLabel} />
      </div>
      <div className="mt-3 flex flex-col gap-2 border-t border-padap-line pt-3 text-xs leading-5 text-padap-muted sm:flex-row sm:items-center sm:justify-between">
        <span>A atualização automática funciona enquanto o sistema estiver aberto no navegador.</span>
        <Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs" onClick={onAutoUpdateConfig}><CalendarClock size={13} />Configurar atualização automática</Button>
      </div>
    </div>
  );
}

function _RealityWarnings({ snapshot }: { snapshot: MarketRealitySnapshot | null }) {
  if (!snapshot?.warnings.length) return null;
  return (
    <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm leading-6 text-amber-50">
      <strong className="text-padap-ink">Atenção sobre os dados:</strong> {snapshot.warnings.join(" ")}
    </div>
  );
}

function DecisionSummary({ analysis, status, confidence, onOpen }: { analysis: MarketAnalysis | null; status: string; confidence: number; onOpen: () => void }) {
  const items = [
    { label: "O que mudou", value: "PTAX e ureia seguem em atenção, enquanto KCl abriu janela tática de negociação." },
    { label: "Impacto PADAP", value: "Propostas antigas e pacotes indexados ao dólar precisam de revisão antes do envio." },
    { label: "O que observar", value: "KCl pode favorecer clientes de café; MAP pede cautela em pacotes grandes." },
    { label: "Horizonte", value: "Próximos 7 dias, com checagem antes de propostas de maior valor." },
    { label: "Confiança", value: `Alta - ${confidence}% com leitura interna e fontes monitoradas.` }
  ];
  const decisionItems = analysis ? [
    { label: "O que mudou", value: analysis.whatChanged },
    { label: "Impacto PADAP", value: analysis.impactPadap },
    { label: "O que observar", value: analysis.whatToWatch },
    { label: "Horizonte", value: analysis.horizon },
    { label: "Confiança", value: analysis.confidence }
  ] : items;
  return (
    <Card>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-padap-cyan">Resumo de decisão</p>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight text-padap-ink">{analysis?.summaryTitle ?? "Mercado volátil, com pressão em nitrogenados e oportunidade em potássicos."}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-padap-muted">Leitura comercial para decidir preço, validade, revisão de propostas e foco de abordagem dos consultores.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {decisionItems.map((item) => (
              <div key={item.label} className="rounded-lg border border-padap-line bg-padap-field px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-padap-muted">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-padap-ink">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid min-w-56 gap-2">
          <SummaryPill label="Sentimento" value={status} tone="amber" />
          <SummaryPill label="Confiança" value={analysis?.confidence ?? `Alta - ${confidence}%`} tone="green" />
          <SummaryPill label="Horizonte" value={analysis?.horizon ?? "Próximos 7 dias"} tone="cyan" />
          <Button variant="ghost" onClick={onOpen}>Ver análise completa</Button>
        </div>
      </div>
    </Card>
  );
}

function CurrencyPtaxCard({ indicators, proposals, onDetails }: { indicators: MarketRealityIndicator[]; proposals: ImpactedProposal[]; onDetails: () => void }) {
  const ptax = findIndicator(indicators, ["ptax"]) ?? fallbackMainIndicators[0];
  const riskyProposals = proposals.filter((proposal) => proposal.impactReason.toLowerCase().includes("ptax") || proposal.impactReason.toLowerCase().includes("câmbio")).slice(0, 3);
  const isPositive = ptax.day >= 0;
  const portfolioImpact = Math.abs(ptax.day / 100 * 0.4 * proposals.reduce((sum, p) => sum + (p.value ?? 0), 0));
  const impactLabel = portfolioImpact > 0 ? `PTAX ${ptax.day >= 0 ? "+" : ""}${ptax.day.toFixed(1)}% → pressão estimada de ${formatCurrency(portfolioImpact)} no portfólio` : "Aguardando dados de portfólio.";
  return (
    <Card>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <SectionTop title="Câmbio/PTAX" action={<Badge tone={isPositive ? "amber" : "green"}>{isPositive ? "Pressão cambial" : "Alívio cambial"}</Badge>} />
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-padap-muted">Referência atual</p>
              <p className="mt-1 text-4xl font-semibold text-padap-ink">{ptax.value}</p>
              <p className="mt-2 text-sm leading-6 text-padap-muted">{ptax.trend} - {ptax.source}</p>
            </div>
            {isPositive ? <TrendingUp size={30} className="text-amber-200" /> : <TrendingDown size={30} className="text-padap-emerald" />}
          </div>
          <div className="mt-4 h-12"><Sparkline data={ptax.history.map((value) => ({ value }))} color={isPositive ? "#f6b73c" : "#1dba2c"} /></div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <IndicatorMini label="Hoje" value={formatPercent(ptax.day)} tone={isPositive ? "amber" : "green"} />
            <IndicatorMini label="Semana" value={formatPercent(ptax.week)} tone={ptax.week >= 0 ? "amber" : "green"} />
          </div>
          <p className={`mt-3 rounded-lg border px-3 py-2 text-xs font-semibold ${isPositive ? "border-amber-200/40 bg-amber-50 text-amber-700" : "border-padap-green/20 bg-padap-green/5 text-padap-emerald"}`}>
            {impactLabel}
          </p>
        </div>
        <div className="rounded-lg border border-padap-line bg-padap-field p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-padap-ink">Decisão comercial</h3>
              <p className="mt-1 text-sm leading-6 text-padap-muted">Usar validade curta e revisar propostas antigas antes de confirmar preço indexado.</p>
            </div>
            <Button variant="ghost" onClick={onDetails}>Ver impactos</Button>
          </div>
          <div className="mt-4 space-y-3">
            {riskyProposals.length ? riskyProposals.map((proposal) => (
              <div key={proposal.id} className="rounded-lg border border-padap-line bg-padap-field p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-padap-ink">{proposal.id} - {proposal.client}</p>
                  <Badge tone={priorityTone(proposal.priority)}>{proposal.priority}</Badge>
                </div>
                <p className="mt-1 text-sm leading-5 text-padap-muted">{proposal.impactReason}</p>
              </div>
            )) : (
              <div className="rounded-lg border border-padap-line bg-padap-field p-3 text-sm leading-6 text-padap-muted">Nenhuma proposta cambial crítica no mock atual.</div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function CommercialIndicatorsPanel({ indicators }: { indicators: MarketCommercialIndicator[] }) {
  const rows = indicators.map((indicator) => ({
    ...indicator,
    commercial: calculateMarketCommercialStatus(indicator)
  }));
  const released = rows.filter((item) => item.commercial.status === "liberado").length;
  const reviewOrApproval = rows.filter((item) => item.commercial.status === "revisar" || item.commercial.status === "aprovação necessária").length;
  const averagePtax = rows.reduce((total, item) => total + item.ptaxCurrent, 0) / Math.max(rows.length, 1);
  const averageDollarVariation = rows.reduce((total, item) => total + item.dollarVariationSinceLastUpdate, 0) / Math.max(rows.length, 1);

  return (
    <Card>
      <SectionTop title="Indicadores comerciais" action={<Badge tone="cyan">Dados simulados</Badge>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric value={averagePtax.toFixed(2).replace(".", ",")} label="PTAX/dólar atual" />
        <MiniMetric value={formatPercent(averageDollarVariation)} label="variação do dólar" />
        <MiniMetric value={released} label="produtos liberados" />
        <MiniMetric value={reviewOrApproval} label="revisão/aprovação" />
      </div>
      <p className="mt-4 rounded-lg border border-padap-line bg-padap-field p-3 text-sm leading-6 text-padap-muted">
        Estrutura temporária com dados simulados para validar a leitura comercial antes de conectar banco, integrações ou tabelas reais.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[1180px] w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-padap-muted">
            <tr>
              <th className="pb-2 pr-4">PTAX/dólar atual</th>
              <th className="pb-2 pr-4">Variação dólar</th>
              <th className="pb-2 pr-4">Produto</th>
              <th className="pb-2 pr-4">Família</th>
              <th className="pb-2 pr-4 text-right">Custo base</th>
              <th className="pb-2 pr-4 text-right">Preço final PADAP</th>
              <th className="pb-2 pr-4 text-right">Margem mínima</th>
              <th className="pb-2 pr-4 text-right">Margem atual</th>
              <th className="pb-2 pr-4">Validade</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-padap-line">
            {rows.map((item) => (
              <tr key={item.id}>
                <td className="py-3 pr-4 font-semibold text-padap-ink">{item.ptaxCurrent.toFixed(2).replace(".", ",")}</td>
                <td className="py-3 pr-4 text-padap-muted">{formatPercent(item.dollarVariationSinceLastUpdate)}</td>
                <td className="py-3 pr-4 font-semibold text-padap-ink">{item.product}</td>
                <td className="py-3 pr-4"><Badge tone={familyTone(item.productFamily)}>{item.productFamily}</Badge></td>
                <td className="py-3 pr-4 text-right text-padap-muted">{formatCurrency(item.baseCost)}</td>
                <td className="py-3 pr-4 text-right font-semibold text-padap-ink">{formatCurrency(item.padapFinalPrice)}</td>
                <td className="py-3 pr-4 text-right text-padap-muted">{formatPercent(item.minimumMargin)}</td>
                <td className="py-3 pr-4 text-right text-padap-muted">{formatPercent(item.currentMargin)}</td>
                <td className="py-3 pr-4 text-padap-muted">{formatDateTime(item.proposalValidity)}</td>
                <td className="py-3 pr-4"><Badge tone={commercialStatusTone(item.commercial.status)}>{item.commercial.status}</Badge></td>
                <td className="py-3 text-padap-muted">{item.commercial.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function FertilizerFamilyCard({ family, productKeys, indicators, products, marketVsPadap, tone }: { family: string; productKeys: string[]; indicators: MarketRealityIndicator[]; products: ProductAttention[]; marketVsPadap: typeof mockMarketVsPadap; tone: "green" | "amber" | "red" | "cyan" }) {
  const indicator = findIndicator(indicators, productKeys);
  const product = products.find((item) => productKeys.some((key) => normalizeSearch(item.product).includes(key))) ?? products.find((item) => productKeys.some((key) => normalizeSearch(item.reason).includes(key)));
  const padap = marketVsPadap.find((item) => productKeys.some((key) => normalizeSearch(`${item.product} ${item.marketTrend}`).includes(key)));
  const score = product?.score ?? (tone === "green" ? 76 : tone === "red" ? 82 : 68);
  const isPositive = (indicator?.day ?? product?.dailyVariation ?? 0) >= 0;
  return (
    <Card>
      <div className="flex min-h-[270px] flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
              <h2 className="text-base font-bold text-padap-ink">{family}</h2>
            </div>
            <p className="mt-1 pl-3 text-sm leading-6 text-padap-muted">{product?.movement ?? indicator?.trend ?? "Monitoramento comercial"}</p>
          </div>
          <Badge tone={tone}>{product?.impact ?? padap?.status ?? "Radar"}</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <MiniMetric value={indicator?.value ?? (padap ? formatCurrency(padap.padapPrice) : "Mock")} label="referência" />
          <MiniMetric value={`${score}/100`} label="score comercial" />
        </div>
        <div className="mt-4 h-10">
          <Sparkline data={(indicator?.history ?? [62, 66, 64, 70, score]).map((value) => ({ value }))} color={tone === "green" ? "#1dba2c" : tone === "red" ? "#f87171" : tone === "cyan" ? "#2d7f82" : "#f6b73c"} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <IndicatorMini label="Hoje" value={formatPercent(indicator?.day ?? product?.dailyVariation ?? 0)} tone={isPositive ? "amber" : "green"} />
          <IndicatorMini label="Semana" value={formatPercent(indicator?.week ?? product?.weeklyVariation ?? 0)} tone={(indicator?.week ?? product?.weeklyVariation ?? 0) >= 0 ? "amber" : "green"} />
        </div>
        <p className="mt-4 text-sm leading-6 text-padap-muted">{product?.reason ?? padap?.marketTrend ?? "Leitura mockada para manter a decisão sem integração externa."}</p>
        <p className="mt-auto pt-3 text-sm leading-6 text-padap-emerald">{product?.recommendedAction ?? padap?.recommendedAction ?? "Monitorar antes de cotar."}</p>
      </div>
    </Card>
  );
}

function ExchangeDecisionCard({ ratios }: { ratios: ExchangeRatioItem[] }) {
  const main = ratios[0];
  return (
    <Card>
      <SectionTop title="Relação de troca" />
      <div className="grid gap-3 sm:grid-cols-2">
        {ratios.map((ratio) => {
          const favorable = ratio.status === "Favorável";
          return (
            <div key={ratio.id} className="rounded-lg border border-padap-line bg-padap-field p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-padap-ink">{ratio.pair}</h3>
                <Badge tone={favorable ? "green" : ratio.status === "Estável" ? "cyan" : "amber"}>{ratio.status}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <p className="text-padap-muted">Antes<br /><span className="font-semibold text-padap-ink">{ratio.previous} {ratio.unit}</span></p>
                <p className="text-padap-muted">Agora<br /><span className="font-semibold text-padap-ink">{ratio.current} {ratio.unit}</span></p>
              </div>
              <p className="mt-3 text-sm leading-6 text-padap-muted">{ratio.interpretation}</p>
            </div>
          );
        })}
      </div>
      {main && <p className="mt-4 rounded-lg border border-padap-line bg-padap-field p-3 text-sm leading-6 text-padap-emerald">Prioridade: usar {main.pair} como argumento comercial principal quando estiver favorável ao produtor.</p>}
    </Card>
  );
}

function _InternalStockCard({ summary, onOpen }: { summary: { items: ConsolidatedStockItem[]; suggestions: ConsolidatedStockItem[] }; onOpen: () => void }) {
  const critical = summary.items.filter((item) => item.status === "Crítico / Negativo" || item.status === "Zerado").length;
  const low = summary.items.filter((item) => item.status === "Baixo estoque").length;
  const visibleItems = summary.suggestions.length ? summary.suggestions.slice(0, 4) : summary.items.slice(0, 4);
  return (
    <Card>
      <SectionTop title="Estoque interno" action={<Button variant="ghost" onClick={onOpen}>Orientação</Button>} />
      <div className="grid grid-cols-3 gap-2">
        <MiniMetric value={summary.items.length} label="itens lidos" />
        <MiniMetric value={critical} label="críticos/zerados" />
        <MiniMetric value={low} label="baixo estoque" />
      </div>
      <div className="mt-4 space-y-3">
        {visibleItems.length ? visibleItems.map((item) => (
          <div key={item.productName} className="rounded-lg border border-padap-line bg-padap-field p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-padap-ink">{item.productName}</p>
                <p className="mt-1 text-xs text-padap-muted">{item.group || "Grupo não informado"} - disponível: {item.totalAvailable}</p>
              </div>
              <Badge tone={stockTone(item.status)}>{item.status}</Badge>
            </div>
            <p className="mt-2 text-sm leading-5 text-padap-muted">{item.reason}{item.purchaseSuggestion ? ` - sugestão de compra: ${item.purchaseSuggestion}` : ""}</p>
          </div>
        )) : (
          <div className="rounded-lg border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-50">
            Nenhum estoque importado no navegador. O card está pronto para ler o estoque local quando houver dados em Compras &gt; Estoque.
          </div>
        )}
      </div>
    </Card>
  );
}

function getAlertPriorityBadge(alert: MarketAlert): { label: string; className: string } {
  if (alert.priority === "Alta" || alert.priority === "Crítica" || alert.type === "Alerta crítico") {
    return { label: "🔴 Urgente", className: "inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 border border-red-200/60" };
  }
  if (alert.priority === "Média") {
    return { label: "🟡 Esta semana", className: "inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60" };
  }
  return { label: "🔵 Monitorar", className: "inline-flex items-center rounded-md bg-padap-field px-2 py-0.5 text-xs font-semibold text-padap-cyan border border-padap-line" };
}

function CommercialAlertsCard({ alerts, proposals, opportunities, onAction, onDetails }: { alerts: MarketAlert[]; proposals: ImpactedProposal[]; opportunities: CommercialOpportunity[]; onAction: (message: string) => void; onDetails: () => void }) {
  return (
    <Card>
      <SectionTop title="Alertas comerciais" action={<Button variant="ghost" onClick={onDetails}>Ver detalhes</Button>} />
      <div className="grid gap-3 lg:grid-cols-2">
        {alerts.slice(0, 4).map((alert) => {
          const priorityBadge = getAlertPriorityBadge(alert);
          return (
          <div key={alert.id} className="rounded-lg border border-padap-line bg-padap-field p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge tone={priorityTone(alert.priority)}>{alert.type}</Badge>
                <span className={priorityBadge.className}>{priorityBadge.label}</span>
              </div>
              <span className="text-xs text-padap-muted">{alert.relatedTo}</span>
            </div>
            <h3 className="mt-3 font-semibold text-padap-ink">{alert.title}</h3>
            <p className="mt-2 text-sm leading-6 text-padap-muted">{alert.message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs" onClick={() => onAction("Alerta comercial copiado.")}><Copy size={13} />Copiar alerta</Button>
              <Button variant="ghost" className="min-h-7 px-2 py-1 text-xs" onClick={() => onAction(`Transmissão preparada: ${alert.message}`)}><Send size={11} />Transmitir</Button>
            </div>
          </div>
          );
        })}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <MiniMetric value={proposals.length} label="propostas em atenção" />
        <MiniMetric value={opportunities.filter((item) => item.priority === "Alta" || item.priority === "Crítica").length} label="oportunidades prioritárias" />
      </div>
    </Card>
  );
}

function SourcesHealthCard({ sources, latestHistory, onOpen, onManage }: { sources: MarketSource[]; latestHistory: MarketUpdateHistory | null; onOpen: () => void; onManage: () => void }) {
  const rows = buildSourceHealthRows(sources, latestHistory);
  const updated = rows.filter((source) => source.status === "atualizado").length;
  const attention = rows.filter((source) => source.status === "atrasado" || source.status === "fallback").length;
  const errors = rows.filter((source) => source.status === "erro").length;
  const notConfigured = rows.filter((source) => source.status === "não configurada").length;
  const averageConfidence = Math.round(rows.reduce((total, source) => total + source.confidence, 0) / Math.max(rows.length, 1));
  return (
    <Card>
      <SectionTop title="Saúde das Fontes" action={<Badge tone={errors ? "red" : attention || notConfigured ? "amber" : "green"}>{errors ? "com erro" : attention ? "monitorar" : "operacional"}</Badge>} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniMetric value={rows.length} label="fontes mapeadas" />
        <MiniMetric value={updated} label="atualizadas" />
        <MiniMetric value={attention + notConfigured} label="atenção/fallback" />
        <MiniMetric value={`${averageConfidence}%`} label="confiança média" />
      </div>
      <div className="mt-4 rounded-lg border border-padap-line bg-padap-field p-4">
        <p className="text-sm font-semibold text-padap-ink">Leitura operacional</p>
        <p className="mt-1 text-sm leading-6 text-padap-muted">
          Dados simulados para preparar a estrutura visual. {latestHistory ? `Última leitura do sistema: ${formatDateTime(latestHistory.updatedAt)} - ${latestHistory.summary}` : "Aguardando primeira leitura registrada nesta sessão."}
        </p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-padap-muted">
            <tr>
              <th className="pb-2">Fonte</th>
              <th className="pb-2">Tipo</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Última atualização</th>
              <th className="pb-2">Próxima prevista</th>
              <th className="pb-2 text-right">Confiança</th>
              <th className="pb-2">Observação operacional</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-padap-line">
            {rows.map((source) => (
              <tr key={source.id}>
                <td className="py-3 pr-4 font-semibold text-padap-ink">{source.name}</td>
                <td className="py-3 pr-4"><Badge tone={sourceTypeTone(source.type)}>{source.type}</Badge></td>
                <td className="py-3 pr-4"><Badge tone={sourceHealthStatusTone(source.status)}>{source.status}</Badge></td>
                <td className="py-3 pr-4 text-padap-muted">{formatDateTime(source.lastUpdate)}</td>
                <td className="py-3 pr-4 text-padap-muted">{formatDateTime(source.nextUpdate)}</td>
                <td className="py-3 pr-4 text-right font-semibold text-padap-ink">{source.confidence}%</td>
                <td className="py-3 text-padap-muted">{source.observation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="ghost" onClick={onOpen}><Eye size={14} />Ver fontes</Button>
        <Button variant="ghost" onClick={onManage}><ShieldCheck size={14} />Gerenciar</Button>
      </div>
    </Card>
  );
}

function buildSourceHealthRows(sources: MarketSource[], latestHistory: MarketUpdateHistory | null): SourceHealthRow[] {
  const now = latestHistory ? new Date(latestHistory.updatedAt) : new Date();
  const byName = new Map(sources.map((source) => [normalizeSearch(source.name), source]));
  const configured = (name: string) => byName.get(normalizeSearch(name));

  return [
    makeSourceHealthRow({
      id: "banco-central-ptax",
      name: "Banco Central/PTAX",
      type: "automática",
      status: "atualizado",
      confidence: 95,
      lastUpdate: configured("Banco Central")?.lastCheckedAt ?? addTime(now, -35, "minute"),
      nextUpdate: addTime(now, 25, "minute"),
      observation: "Normal. Referência para câmbio e propostas indexadas ao dólar."
    }),
    makeSourceHealthRow({
      id: "comexstat-mdic",
      name: "ComexStat/MDIC",
      type: "automática",
      status: "atualizado",
      confidence: 90,
      lastUpdate: addTime(now, -2, "hour"),
      nextUpdate: addTime(now, 22, "hour"),
      observation: "Normal. Estrutura pronta para importações e leitura de fluxo futuro."
    }),
    makeSourceHealthRow({
      id: "anda",
      name: "ANDA",
      type: "manual",
      status: "fallback",
      confidence: 75,
      lastUpdate: configured("ANDA")?.lastCheckedAt ?? addTime(now, -1, "day"),
      nextUpdate: addTime(now, 1, "day"),
      observation: "Depende de leitura manual; usar como apoio setorial até automação futura."
    }),
    makeSourceHealthRow({
      id: "tabela-padap",
      name: "Tabela PADAP",
      type: "interna",
      status: "atualizado",
      confidence: 100,
      lastUpdate: configured("Lista Yara / Tabela PADAP")?.lastCheckedAt ?? addTime(now, -3, "hour"),
      nextUpdate: addTime(now, 21, "hour"),
      observation: "Fonte interna ativa para preços, listas e parâmetros comerciais."
    }),
    makeSourceHealthRow({
      id: "world-bank",
      name: "World Bank",
      type: "licenciada",
      status: "atrasado",
      confidence: 80,
      lastUpdate: addTime(now, -32, "day"),
      nextUpdate: addTime(now, 5, "day"),
      observation: "Atualização mensal mais lenta; usar para tendência macro, não decisão diária."
    })
  ];
}

function makeSourceHealthRow(row: SourceHealthRow): SourceHealthRow {
  return row;
}

function addTime(date: Date, amount: number, unit: "minute" | "hour" | "day") {
  const multipliers = { minute: 60000, hour: 3600000, day: 86400000 };
  return new Date(date.getTime() + amount * multipliers[unit]).toISOString();
}

function sourceHealthStatusTone(status: SourceHealthStatus): "green" | "amber" | "red" | "neutral" {
  if (status === "atualizado") return "green";
  if (status === "atrasado" || status === "fallback") return "amber";
  if (status === "erro") return "red";
  return "neutral";
}

function sourceTypeTone(type: SourceHealthType): "green" | "amber" | "red" | "cyan" | "neutral" {
  if (type === "interna") return "green";
  if (type === "automática") return "cyan";
  if (type === "manual") return "amber";
  if (type === "licenciada") return "neutral";
  return "neutral";
}

function _MainIndicators({ indicators }: { indicators: MarketRealityIndicator[] }) {
  return (
    <Card>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
            <h2 className="text-base font-bold text-padap-ink">Indicadores principais</h2>
          </div>
          <p className="mt-1 pl-3 text-sm leading-6 text-padap-muted">Valor, tendência e impacto comercial com origem do dado explícita.</p>
        </div>
        <Badge tone="cyan">fontes identificadas</Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {indicators.map((item) => {
          const isPositive = item.day >= 0;
          const badgeTone = item.confidence === "verified" ? "green" : item.confidence === "internal" ? "cyan" : "amber";
          const sourceLabel = item.confidence === "verified" ? item.source : item.confidence === "internal" ? getInternalSourceLabel(item.source) : "Sem fonte ativa";
          return (
            <div key={item.name} className="rounded-lg border border-padap-line bg-padap-field p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-padap-ink">{normalizeIndicatorName(item.name)}</p>
                  <p className="mt-2 text-xl font-semibold text-padap-ink">{item.value}</p>
                </div>
                {isPositive ? <TrendingUp size={17} className="text-amber-200" /> : <TrendingDown size={17} className="text-padap-emerald" />}
              </div>
              <div className="mt-3 h-8"><Sparkline data={item.history.map((value) => ({ value }))} color={isPositive ? "#f6b73c" : "#1dba2c"} /></div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <IndicatorMini label="Hoje" value={formatPercent(item.day)} tone={isPositive ? "amber" : "green"} />
                <IndicatorMini label="Semana" value={formatPercent(item.week)} tone={item.week >= 0 ? "amber" : "green"} />
              </div>
              <p className="mt-3 text-xs leading-5 text-padap-muted">Tendência: <span className="text-padap-ink">{item.trend}</span></p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={badgeTone}>{item.confidence === "verified" ? "verificado" : item.confidence === "internal" ? "fonte interna" : "sem fonte"}</Badge>
                <span className="text-xs text-padap-muted">{sourceLabel} - {item.updated}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-padap-emerald">Impacto PADAP: {getIndicatorImpact(item)}</p>
              <p className="mt-1 text-xs leading-5 text-padap-muted">{item.note}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function normalizeIndicatorName(name: string) {
  if (name.includes("MAP")) return "MAP / Fosfatados";
  if (name.includes("KCl")) return "KCl / Potássicos";
  if (name.includes("YaraBela")) return "Ureia / Nitrogenados";
  return name;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function findIndicator(indicators: MarketRealityIndicator[], keys: string[]) {
  return indicators.find((indicator) => {
    const text = normalizeSearch(`${indicator.name} ${indicator.note} ${indicator.trend}`);
    return keys.some((key) => text.includes(normalizeSearch(key)));
  });
}

function calculateMarketCommercialStatus(indicator: MarketCommercialIndicator): { status: MarketCommercialStatus; reason: string } {
  if (indicator.currentMargin < indicator.minimumMargin) {
    return {
      status: "aprovação necessária",
      reason: `Margem atual de ${formatPercent(indicator.currentMargin)} abaixo da mínima de ${formatPercent(indicator.minimumMargin)}.`
    };
  }

  if (new Date(indicator.proposalValidity).getTime() < Date.now()) {
    return {
      status: "revisar",
      reason: "Validade da proposta vencida; recalcular antes de liberar."
    };
  }

  if (Math.abs(indicator.dollarVariationSinceLastUpdate) > 1.5) {
    return {
      status: "revisar",
      reason: `Dólar variou ${formatPercent(indicator.dollarVariationSinceLastUpdate)} desde a última atualização.`
    };
  }

  return {
    status: "liberado",
    reason: "Margem, validade e câmbio dentro das regras comerciais simuladas."
  };
}

function commercialStatusTone(status: MarketCommercialStatus): "green" | "amber" | "red" | "cyan" | "neutral" {
  if (status === "liberado") return "green";
  if (status === "aprovação necessária") return "red";
  if (status === "revisar" || status === "vencido") return "amber";
  return "neutral";
}

function familyTone(family: MarketCommercialIndicator["productFamily"]): "green" | "amber" | "red" | "cyan" | "neutral" {
  if (family === "nitrogenado") return "red";
  if (family === "fosfatado" || family === "NPK") return "amber";
  if (family === "potássico") return "green";
  if (family === "foliar") return "cyan";
  return "neutral";
}

function stockTone(status: ConsolidatedStockItem["status"]): "green" | "amber" | "red" | "neutral" {
  if (status === "Disponível") return "green";
  if (status === "Baixo estoque" || status === "Sem regra mínima") return "amber";
  if (status === "Zerado" || status === "Crítico / Negativo") return "red";
  return "neutral";
}

function getInternalSourceLabel(source: string) {
  return source.includes("Tabela") ? "Tabela PADAP" : "Fonte interna";
}

function getIndicatorImpact(item: MarketRealityIndicator) {
  const name = item.name.toLowerCase();
  if (name.includes("ptax")) return "atenção em propostas antigas indexadas ao dólar.";
  if (name.includes("yarabela") || name.includes("nitrogen")) return "revisar nitrogenados e evitar validade longa.";
  if (name.includes("map") || name.includes("fosfat")) return "cautela em pacotes grandes com fosfatados.";
  if (name.includes("kcl") || name.includes("pot")) return "oportunidade para clientes com demanda de potássio.";
  if (name.includes("especial")) return "defender valor técnico e margem em especialidades.";
  return "usar como referência antes de enviar condição comercial.";
}

function IndicatorMini({ label, value, tone }: { label: string; value: string; tone: "green" | "amber" }) {
  return (
    <div className="rounded-md border border-padap-line bg-padap-field px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-[0.12em] text-padap-muted">{label}</p>
      <p className={tone === "amber" ? "font-semibold text-amber-100" : "font-semibold text-padap-emerald"}>{value}</p>
    </div>
  );
}

function _CompactProducts({ products, onAll }: { products: ProductAttention[]; onAll: () => void }) {
  return (
    <Card>
      <SectionTop title="Produtos em atenção" action={<Button variant="ghost" onClick={onAll}>Ver todos</Button>} />
      <p className="mb-3 text-sm leading-6 text-padap-muted">Produtos que exigem ação comercial ou revisão de preço.</p>
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-padap-muted">
            <tr><th className="pb-2">Produto</th><th className="pb-2">Movimento</th><th className="pb-2">Impacto</th><th className="pb-2">Ação recomendada</th><th className="pb-2">Fonte</th><th className="pb-2 text-right">Score</th></tr>
          </thead>
          <tbody className="divide-y divide-padap-line">
            {products.map((item) => (
              <tr key={item.product}>
                <td className="py-2.5 font-semibold text-padap-ink">{item.product}</td>
                <td className="py-2.5 text-padap-muted">{item.movement}</td>
                <td className="py-2.5"><Badge tone={item.impact === "Oportunidade" ? "green" : item.impact === "Alto" ? "amber" : item.impact === "Médio" ? "cyan" : "green"}>{item.impact}</Badge></td>
                <td className="py-2.5 text-padap-muted">{item.recommendedAction}</td>
                <td className="py-2.5 text-xs text-padap-muted">{item.source ?? "Fonte interna"}</td>
                <td className="py-2.5 text-right font-semibold text-padap-emerald">{item.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function _CompactProposals({ proposals, total, value, urgent, onDetails }: { proposals: ImpactedProposal[]; total: number; value: number; urgent: number; onDetails: () => void }) {
  return (
    <div id="propostas-impactadas">
      <Card>
        <SectionTop title="Propostas impactadas" action={<Button variant="ghost" onClick={onDetails}>Ver detalhes</Button>} />
        <p className="mb-3 text-sm leading-6 text-padap-muted">Propostas abertas que podem sofrer impacto de câmbio, fertilizante, validade ou margem.</p>
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <MiniMetric value={total} label="propostas impactadas" />
          <MiniMetric value={formatCurrency(value)} label="em negociação" />
          <MiniMetric value={urgent} label="revisões imediatas" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[620px] w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-padap-muted">
              <tr><th className="pb-2">Proposta</th><th className="pb-2">Cliente</th><th className="pb-2">Produto</th><th className="pb-2">Motivo</th><th className="pb-2">Ação</th></tr>
            </thead>
            <tbody className="divide-y divide-padap-line">
              {proposals.map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 font-semibold text-padap-ink">{item.id}</td>
                  <td className="py-2.5 text-padap-muted">{item.client}</td>
                  <td className="py-2.5 text-padap-muted">{item.product}</td>
                  <td className="py-2.5 text-padap-muted">{item.impactReason}</td>
                  <td className="py-2.5"><Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs">{item.recommendedAction || (item.product === "KCl" ? "Melhorar oferta" : "Revisar")}</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function _CompactExchangeRatios({ ratios }: { ratios: ExchangeRatioItem[] }) {
  return (
    <Card>
      <SectionTop title="Relação de troca" />
      <div className="grid gap-3 sm:grid-cols-2">
        {ratios.map((ratio) => {
          const favorable = ratio.status === "Favorável";
          return (
            <div key={ratio.id} className="rounded-lg border border-padap-line bg-padap-field p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-padap-ink">{ratio.pair}</h3>
                <Badge tone={favorable ? "green" : "amber"}>{favorable ? "Melhorou" : ratio.status}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <p className="text-padap-muted">Antes<br /><span className="font-semibold text-padap-ink">{ratio.previous} {ratio.unit}</span></p>
                <p className="text-padap-muted">Agora<br /><span className="font-semibold text-padap-ink">{ratio.current} {ratio.unit}</span></p>
              </div>
              <p className="mt-3 text-sm leading-6 text-padap-muted">{ratio.interpretation}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function _CompactOpportunities({ opportunities, onAction }: { opportunities: CommercialOpportunity[]; onAction: (message: string) => void }) {
  return (
    <div id="oportunidades-comerciais">
      <Card>
        <SectionTop title="Oportunidades comerciais" />
        <div className="space-y-3">
          {opportunities.slice(0, 3).map((item) => (
            <div key={item.id} className="rounded-lg border border-padap-line bg-padap-field p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-padap-ink">{item.title ?? item.opportunity}</h3>
                  <p className="mt-1 text-sm leading-6 text-padap-muted">Motivo: {item.reason ?? item.justification}</p>
                  <p className="text-sm leading-6 text-padap-muted">Clientes sugeridos: {item.suggestedClients ?? "Clientes a definir"}</p>
                  <p className="text-sm leading-6 text-padap-emerald">Ação recomendada: {item.recommendedAction}</p>
                </div>
                <Badge tone={priorityTone(item.priority)}>{item.priority}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs" onClick={() => onAction("Orientação copiada.")}><Copy size={13} />Copiar orientação</Button>
                <Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs" onClick={() => onAction("Clientes filtrados.")}><Users size={13} />Ver clientes</Button>
                <Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs" onClick={() => onAction("Fluxo de proposta iniciado.")}><FileText size={13} />Criar proposta</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function _CompactSourcesRadar({ sources, onCopy }: { sources: MarketSource[]; onCopy: (url?: string) => void }) {
  return (
    <Card>
      <SectionTop title="Radar de fontes confiáveis" />
      <div className="space-y-3">
        {sources.length === 0 && (
          <div className="rounded-lg border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-50">
            Nenhuma fonte ativa cadastrada. Cadastre fontes para atualizar a Central de Mercado.
          </div>
        )}
        {sources.slice(0, 6).map((source) => (
          <article key={source.id} className="rounded-lg border border-padap-line bg-padap-field p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="cyan">{source.category}</Badge>
              <Badge tone={source.confidence === "Alta" ? "green" : source.confidence === "Média" ? "amber" : "neutral"}>{source.confidence}</Badge>
              <Badge tone={sourceStatusTone(source.lastStatus)}>{source.lastStatus ?? "Pendente"}</Badge>
              <span className="text-xs text-padap-muted">{source.lastCheckedAt ? formatDateTime(source.lastCheckedAt) : "Aguardando atualização"}</span>
            </div>
            <h3 className="mt-3 font-semibold text-padap-ink">{source.name}</h3>
            <p className="mt-2 text-sm leading-6 text-padap-muted">{source.observation || "Fonte cadastrada para consulta e validação leve na Central de Mercado."}</p>
            <p className="mt-2 text-sm text-padap-emerald">Impacto PADAP: {sourceImpact(source)}</p>
            {source.lastStatus === "Indisponível" && <p className="mt-2 text-xs leading-5 text-amber-100">Fonte indisponível para leitura automática. Link mantido para consulta manual.</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-2 rounded-lg border border-padap-line bg-padap-field px-3 py-1.5 text-xs font-semibold text-padap-ink transition hover:border-padap-green/25"><ExternalLink size={13} />Ver fonte</a>}
              {source.url && <Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs" onClick={() => onCopy(source.url)}><Copy size={13} />Copiar link</Button>}
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

function sourceStatusTone(status?: MarketSourceStatus): "green" | "amber" | "red" | "cyan" | "neutral" {
  if (status === "Atualizada" || status === "Manual" || status === "Ativa") return "green";
  if (status === "Indisponível" || status === "Pendente") return "amber";
  if (status === "Erro") return "red";
  return "neutral";
}

function sourceImpact(source: MarketSource) {
  if (source.category === "Câmbio") return "referência para PTAX, propostas indexadas e validade comercial.";
  if (source.category === "Fertilizantes") return "apoio para leitura de nitrogenados, fosfatados, potássicos e especialidades.";
  if (source.category === "Interna") return "base segura para preços PADAP, Lista Yara e parâmetros comerciais.";
  if (source.category === "Café" || source.category === "Grãos") return "apoio para relação de troca e oportunidade por cultura.";
  return "apoio contextual para briefing e leitura comercial.";
}

function toConfidenceSources(sources: MarketSource[]): MarketConfidenceSource[] {
  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    tier: source.confidence === "Alta" ? "Nível 1" : source.confidence === "Média" ? "Nível 2" : "Nível 3",
    type: source.sourceType,
    category: source.category,
    confidence: source.confidence === "Alta" ? 95 : source.confidence === "Média" ? 80 : 60,
    lastUpdate: source.lastCheckedAt || source.updatedAt,
    link: source.url || "#",
    status: source.lastStatus === "Erro" || source.lastStatus === "Indisponível" ? "atenção" : source.lastStatus === "Pendente" ? "monitorando" : "ativa",
    note: source.observation || sourceImpact(source)
  }));
}

function _CompactNews({ news, onCopy }: { news: MarketNews[]; onCopy: (url: string) => void }) {
  return (
    <Card>
      <SectionTop title="Radar de fontes confiáveis" />
      <div className="space-y-3">
        {news.map((item) => (
          <article key={item.id} className="rounded-lg border border-padap-line bg-padap-field p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="cyan">{item.category ?? item.tag}</Badge>
              <Badge tone="green">Confiança alta</Badge>
              <span className="text-xs text-padap-muted">{item.source} - {formatDateTime(item.date)}</span>
            </div>
            <h3 className="mt-3 font-semibold text-padap-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-padap-muted">{item.summary}</p>
            <p className="mt-2 text-sm text-padap-emerald">Impacto PADAP: {item.impact}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-2 rounded-lg border border-padap-line bg-padap-field px-3 py-1.5 text-xs font-semibold text-padap-ink transition hover:border-padap-green/25"><ExternalLink size={13} />Ver notícia</a>
              <Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs" onClick={() => item.url && onCopy(item.url)}><Copy size={13} />Copiar link</Button>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

function _CompactAnalyst({ analysis, onAnalysis, onBriefing, onCopy }: { analysis: MarketAnalysis | null; onAnalysis: () => void; onBriefing: () => void; onCopy: () => void }) {
  const insight = mockMarketAnalystInsight;
  const confidenceLabel = analysis?.confidence ?? `Alta - ${insight.confidence}%`;
  const confidenceWidth = analysis?.confidence.includes("85") ? 85 : analysis?.confidence.includes("65") ? 65 : analysis?.confidence.includes("45") ? 45 : insight.confidence;
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
          <Bot className="text-padap-cyan" size={18} />
          <h2 className="text-base font-bold text-padap-ink">Analista de Mercado / Briefing final</h2>
        </div>
        <Badge tone="green">{confidenceLabel}</Badge>
      </div>
      <div className="space-y-3 text-sm leading-6 text-padap-muted">
        <ShortBlock label="Resumo" value={analysis?.briefing.summary ?? "Mercado segue volátil, com atenção em câmbio e nitrogenados."} />
        <ShortBlock label="Impacto PADAP" value={analysis?.briefing.impactPadap ?? "Propostas antigas precisam de revisão antes do envio."} />
        <ShortBlock label="Produtos afetados" value={(analysis?.briefing.affectedProducts ?? insight.affectedProducts).slice(0, 4).join(", ")} />
        <ShortBlock label="Ação recomendada" value={analysis?.briefing.recommendedAction ?? "Recalcular propostas abertas e usar validade curta."} />
        <ShortBlock label="Fontes usadas" value={(analysis?.briefing.sourcesUsed ?? insight.sources).slice(0, 4).join(", ")} />
      </div>
      <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-padap-green to-padap-cyan" style={{ width: `${confidenceWidth}%` }} /></div>
      <div className="mt-4 flex flex-wrap gap-2"><Button onClick={onAnalysis}>Ver análise completa</Button><Button variant="ghost" onClick={onCopy}><Copy size={14} />Copiar briefing</Button><Button variant="ghost" onClick={onBriefing}>Gerar briefing</Button></div>
    </Card>
  );
}

function ReportBriefingPanel({ onReport, onBriefing, onWhatsApp, onRecipients, canManageRecipients }: { onReport: () => void; onBriefing: () => void; onWhatsApp: () => void; onRecipients: () => void; canManageRecipients: boolean }) {
  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
            <h2 className="text-base font-bold text-padap-ink">Relatório PDF e Briefing WhatsApp</h2>
          </div>
          <p className="mt-1 pl-3 text-sm leading-6 text-padap-muted">Gere materiais curtos para orientar consultores sem sobrecarregar a leitura.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onReport}><FileText size={16} />Gerar relatório PDF</Button>
          <Button variant="ghost" onClick={onBriefing}><Send size={16} />Gerar briefing WhatsApp</Button>
          <Button variant="ghost" onClick={onWhatsApp}><ExternalLink size={16} />Enviar relatório WhatsApp</Button>
          {canManageRecipients && <Button variant="ghost" onClick={onRecipients}><Users size={16} />Gerenciar destinatários</Button>}
        </div>
      </div>
    </Card>
  );
}

function AdvancedArea({ open, onToggle, children }: { open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
            <h2 className="text-base font-bold text-padap-ink">Recursos avançados</h2>
          </div>
          <p className="mt-1 pl-3 text-sm leading-6 text-padap-muted">Simulador, mapa de risco, fontes, histórico e análises completas ficam em segundo nível.</p>
        </div>
        <Button variant="ghost" onClick={onToggle}>{open ? "Ocultar recursos" : "Ver detalhes"}</Button>
      </div>
      {open && <div className="mt-5">{children}</div>}
    </Card>
  );
}

function StripItem({ label, value }: { label: string; value: ReactNode }) {
  return <div><p className="text-[11px] uppercase leading-4 tracking-[0.12em] text-padap-muted">{label}</p><div className="mt-1 text-sm font-medium leading-5 text-padap-ink">{value}</div></div>;
}

function SummaryPill({ label, value, tone }: { label: string; value: string; tone: "green" | "amber" | "cyan" }) {
  return <div className="rounded-lg border border-padap-line bg-padap-field p-3"><p className="text-xs text-padap-muted">{label}</p><div className="mt-1"><Badge tone={tone}>{value}</Badge></div></div>;
}

function SectionTop({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 -mx-5 -mt-5 flex items-center justify-between gap-3 border-b border-padap-green/20 bg-padap-green/[0.07] px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
        <h2 className="text-base font-bold text-padap-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function MiniMetric({ value, label }: { value: ReactNode; label: string }) {
  return <div className="rounded-lg border border-padap-line bg-padap-field p-3"><p className="text-lg font-semibold text-padap-ink">{value}</p><p className="text-xs leading-5 text-padap-muted">{label}</p></div>;
}

function MenuButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-padap-ink transition hover:bg-padap-field hover:text-padap-ink">{icon}{label}<ChevronRight size={14} className="ml-auto text-padap-muted" /></button>;
}

function ShortBlock({ label, value }: { label: string; value: string }) {
  return <p><span className="font-semibold text-padap-ink">{label}:</span> {value}</p>;
}
