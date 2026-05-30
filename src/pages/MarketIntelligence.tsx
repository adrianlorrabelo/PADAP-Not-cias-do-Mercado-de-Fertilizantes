import { useEffect, useMemo, useRef, useState } from "react";
import { AnalystPrecisionHistory } from "../components/market/AnalystPrecisionHistory";
import { ClosingSummary } from "../components/market/ClosingSummary";
import { CommercialArgumentsLibrary } from "../components/market/CommercialArgumentsLibrary";
import { CommercialImpactEngine } from "../components/market/CommercialImpactEngine";
import { CommercialOpportunities } from "../components/market/CommercialOpportunities";
import { CustomerOpportunityRadar } from "../components/market/CustomerOpportunityRadar";
import { ExchangeRatioAdvanced } from "../components/market/ExchangeRatioAdvanced";
import { ImpactedProposalsTable } from "../components/market/ImpactedProposalsTable";
import { InternalMarketAlerts } from "../components/market/InternalMarketAlerts";
import { MarketReportModal } from "../components/market/MarketReportModal";
import { MarketSourcesManagerModal } from "../components/market/MarketSourcesManagerModal";
import { MarketTimeline } from "../components/market/MarketTimeline";
import { MarketVsPadapTable } from "../components/market/MarketVsPadapTable";
import { MeetingMode } from "../components/market/MeetingMode";
import { ProductMarketScore } from "../components/market/ProductMarketScore";
import { RiskOpportunityMatrix } from "../components/market/RiskOpportunityMatrix";
import { ScenarioSimulatorModal } from "../components/market/ScenarioSimulatorModal";
import { SourcesConfidenceCenter } from "../components/market/SourcesConfidenceCenter";
import { WhatsAppReportModal } from "../components/market/WhatsAppReportModal";
import { WhatsAppRecipientsModal } from "../components/market/WhatsAppRecipientsModal";
import { ClimateNewsCard } from "../components/market/ClimateNewsCard";
import { TrustedNewsFeed } from "../components/market/TrustedNewsFeed";
import { JornalPadap } from "../components/market/JornalPadap";
import { MarketPageHeader } from "../components/market/MarketPageHeader";
import { MarketUpdateStrip } from "../components/market/MarketUpdateStrip";
import { MarketUpdateHistoryModal, getHistoryTrigger } from "../components/market/MarketUpdateHistoryModal";
import { AutoUpdateSettingsModal } from "../components/market/AutoUpdateSettingsModal";
import { CurrencyPtaxCard, CommercialIndicatorsPanel, FertilizerFamilyCard, ExchangeDecisionCard } from "../components/market/MarketIndicatorCards";
import { DecisionSummary, CommercialAlertsCard, SourcesHealthCard, ReportBriefingPanel, AdvancedArea, toConfidenceSources } from "../components/market/MarketDecisionCards";
import { MarketThermometer } from "../components/market/MarketThermometer";
import { SectionDivider, marketTabClass } from "../components/market/MarketUI";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { mockAnalystPredictions } from "../data/mockAnalystPredictions";
import { mockCommercialArguments } from "../data/mockCommercialArguments";
import { mockImpactedProposals } from "../data/mockImpactedProposals";
import { mockMarketCommercialIndicators, mockProductsAttention, mockMarketUpdateStatuses, mockMarketVsPadap, mockProductScores, mockRiskOpportunityItems } from "../data/mockMarketIndicators";
import { mockInternalMarketAlerts, mockTrustedMarketNews } from "../data/mockMarketNews";
import { mockClimateEvents } from "../data/mockClimateNews";
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
import type { GeneratedMarketReport, MarketAnalysis, MarketAutoUpdateSettings, MarketSource, MarketUpdateHistory, MarketUpdateResult, WhatsAppRecipient, WhatsAppSendHistory } from "../types";
import { calculateGeneralMarketScore } from "../utils/marketScores";
import { getMainExchangeRatio } from "../utils/exchangeRatio";
import { notify } from "../utils/uiActions";

const fallbackMainIndicators: MarketRealityIndicator[] = [
  { name: "PTAX", value: "5,18", day: 0.95, week: 1.7, trend: "Alta leve", source: "Banco Central", updated: "--:--", history: [5.08, 5.11, 5.13, 5.16, 5.18], confidence: "internal", note: "Fallback interno enquanto a fonte oficial e a leitura do navegador carregam." },
  { name: "Ureia / Nitrogenados", value: "R$ 3.290/t", day: 2.4, week: 5.8, trend: "Alta forte", source: "Tabela PADAP", updated: "--:--", history: [3180, 3210, 3245, 3270, 3290], confidence: "internal", note: "Base mockada para decisão comercial sem integração externa." },
  { name: "MAP / Fosfatados", value: "R$ 5.110/t", day: 1.1, week: 3.6, trend: "Alta moderada", source: "Tabela PADAP", updated: "--:--", history: [5020, 5050, 5070, 5095, 5110], confidence: "internal", note: "Base mockada para acompanhamento de pacotes grandes." },
  { name: "KCl / Potássicos", value: "R$ 3.010/t", day: -1.8, week: -4.2, trend: "Queda tática", source: "Tabela PADAP", updated: "--:--", history: [3090, 3060, 3040, 3025, 3010], confidence: "internal", note: "Base mockada para janela comercial de potássio." },
  { name: "Especialidades / Foliares", value: "R$ 2.140/gal", day: 0.9, week: 2.8, trend: "Alta seletiva", source: "Lista Yara", updated: "--:--", history: [2080, 2105, 2120, 2135, 2140], confidence: "internal", note: "Foliares representados por especialidades e YaraVita nesta versão." }
];

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
    return { items: consolidated, suggestions: getPurchaseSuggestions(consolidated) };
  }, []);
  const latestAutoHistory = updateHistory.find((h) => getHistoryTrigger(h) === "Automática") ?? null;
  const canManageRecipients = user?.role === "Administrador Geral" || user?.role === "Gestor / Gerente" || user?.role === "Compras / Precificação";

  useEffect(() => { loadingRef.current = loading; }, [loading]);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- spinner before async call
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

  const openBriefingWhatsApp = () => { setWhatsAppMode("briefing"); setShowWhatsApp(true); };
  const openReportWhatsApp = () => { setWhatsAppMode("report"); setShowWhatsApp(true); };

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

  const closeSourcesManager = () => { setMarketSources(getMarketSources()); setShowSourcesManager(false); };

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
    } catch { /* clipboard may be restricted in embedded environments */ }
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
      <MarketPageHeader
        loading={loading}
        showMenu={showMenu}
        canManageRecipients={canManageRecipients}
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
        onRecipients={() => {
          if (canManageRecipients) { setShowRecipients(true); } else { notify("Você não tem permissão para gerenciar destinatários."); }
          setShowMenu(false);
        }}
      />

      <MarketUpdateStrip
        statuses={statuses}
        lastUpdate={lastUpdate}
        nextManual={nextManual}
        nextAutomatic={nextAutomatic}
        sources={marketSources}
        result={lastUpdateResult}
        latestHistory={latestHistory}
        autoSettings={autoSettings}
        latestAutoHistory={latestAutoHistory}
        onAutoUpdateConfig={() => setShowAutoUpdateConfig(true)}
      />

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
            <CommercialAlertsCard alerts={mockInternalMarketAlerts} proposals={mockImpactedProposals.slice(0, 4)} opportunities={analysisOpportunities} onAction={notify} onDetails={() => setShowAdvanced(true)} />
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
              <ImpactedProposalsTable proposals={mockImpactedProposals} onAction={notify} />
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <ProductMarketScore scores={mockProductScores} />
              <MarketVsPadapTable items={mockMarketVsPadap} />
            </div>
            <div className="mt-5">
              <ExchangeRatioAdvanced ratios={mockExchangeRatios} />
            </div>
            <div className="mt-5">
              <CommercialOpportunities opportunities={analysisOpportunities} onAction={notify} />
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <RiskOpportunityMatrix items={mockRiskOpportunityItems} />
              <InternalMarketAlerts alerts={mockInternalMarketAlerts} onAction={notify} />
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <MarketTimeline events={mockMarketTimeline} />
              <ClosingSummary summary={mockClosingSummary} onAction={notify} />
            </div>
            <div className="mt-5">
              <CommercialArgumentsLibrary argumentsList={mockCommercialArguments} onAction={notify} />
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

      {/* Modals */}
      <ScenarioSimulatorModal open={showScenario} onClose={() => setShowScenario(false)} />
      <MeetingMode open={showMeeting} onClose={() => setShowMeeting(false)} score={score} products={analysisProducts} proposals={mockImpactedProposals} mainRatio={mainRatio} opportunities={analysisOpportunities} onPdf={() => setShowReport(true)} onCopy={() => copyText(briefing, "Resumo de reunião copiado.")} />
      <MarketReportModal open={showReport} onClose={() => setShowReport(false)} report={generatedReport} onGenerated={(report) => { setGeneratedReport(report); }} />
      <WhatsAppReportModal open={showWhatsApp} onClose={() => setShowWhatsApp(false)} report={whatsAppMode === "report" ? generatedReport : null} mode={whatsAppMode} recipients={recipients} briefing={briefing} history={sendHistory} sentBy={user?.name ?? "PADAP Intelligence"} onHistory={setSendHistory} onAction={notify} onManageRecipients={() => setShowRecipients(true)} />
      <WhatsAppRecipientsModal open={showRecipients} onClose={() => setShowRecipients(false)} recipients={recipients} canManage={canManageRecipients} onChange={setRecipients} onAction={notify} />
      <MarketSourcesManagerModal open={showSourcesManager} onClose={closeSourcesManager} onAction={(message) => { notify(message); setMarketSources(getMarketSources()); }} />

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
