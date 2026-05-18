import { useMemo, useState, type ReactNode } from "react";
import { BarChart3, Bot, CalendarClock, ChevronRight, Copy, ExternalLink, FileText, MoreHorizontal, Presentation, RefreshCw, Send, ShieldCheck, Sparkles, Target, TrendingDown, TrendingUp, Users } from "lucide-react";
import { AnalystPrecisionHistory } from "../components/market/AnalystPrecisionHistory";
import { ClosingSummary } from "../components/market/ClosingSummary";
import { CommercialArgumentsLibrary } from "../components/market/CommercialArgumentsLibrary";
import { CommercialImpactEngine } from "../components/market/CommercialImpactEngine";
import { CommercialOpportunities } from "../components/market/CommercialOpportunities";
import { CustomerOpportunityRadar } from "../components/market/CustomerOpportunityRadar";
import { ExchangeRatioAdvanced } from "../components/market/ExchangeRatioAdvanced";
import { ImpactedProposalsTable } from "../components/market/ImpactedProposalsTable";
import { InternalMarketAlerts } from "../components/market/InternalMarketAlerts";
import { MarketAnalystCard } from "../components/market/MarketAnalystCard";
import { MarketReportModal } from "../components/market/MarketReportModal";
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
import { Modal } from "../components/ui/Modal";
import { mockAnalystPredictions } from "../data/mockAnalystPredictions";
import { mockCommercialArguments } from "../data/mockCommercialArguments";
import { mockImpactedProposals } from "../data/mockImpactedProposals";
import { mockProductsAttention, mockMarketUpdateStatuses, mockMarketVsPadap, mockProductScores, mockRiskOpportunityItems } from "../data/mockMarketIndicators";
import { mockTrustedMarketNews, mockInternalMarketAlerts } from "../data/mockMarketNews";
import { mockClosingSummary, mockCommercialOpportunities, mockCustomerOpportunities, mockExchangeRatios, mockMarketAnalystInsight, mockMarketTimeline } from "../data/mockMarketOpportunities";
import { mockMarketSources } from "../data/mockMarketSources";
import { generateBriefingWhatsApp, getExecutiveMarketStatus } from "../services/marketAnalysisService";
import { summarizeCommercialImpact } from "../services/commercialImpactService";
import { canRunManualMarketUpdate, getNextAutomaticUpdate, simulateMarketUpdate } from "../services/marketUpdateService";
import { getRecipients, getWhatsAppSendHistory } from "../services/whatsappRecipientsService";
import { usePermissions } from "../hooks/usePermissions";
import type { ExchangeRatioItem, GeneratedMarketReport, ImpactedProposal, MarketNews, ProductAttention, WhatsAppRecipient, WhatsAppSendHistory } from "../types";
import { formatCurrency, formatDateTime, formatPercent, formatTime, priorityTone, statusTone } from "../utils/marketFormatting";
import { calculateGeneralMarketScore } from "../utils/marketScores";
import { getMainExchangeRatio } from "../utils/exchangeRatio";
import { notify } from "../utils/uiActions";

const mainIndicators = [
  { name: "PTAX", value: "R$ 5,27", day: 0.73, week: 1.8, trend: "Alta", source: "Banco Central", updated: "08:42", history: [5.16, 5.18, 5.2, 5.24, 5.27] },
  { name: "Ureia", value: "US$ 338/t", day: 2.3, week: 5.8, trend: "Atenção", source: "GlobalFert", updated: "08:35", history: [319, 324, 329, 333, 338] },
  { name: "MAP", value: "US$ 612/t", day: 1.1, week: 3.6, trend: "Alta moderada", source: "Argus", updated: "08:30", history: [590, 596, 601, 606, 612] },
  { name: "KCl", value: "US$ 289/t", day: -1.8, week: -4.2, trend: "Oportunidade", source: "GlobalFert", updated: "08:32", history: [304, 300, 296, 292, 289] },
  { name: "Café", value: "R$ 1.430/sc", day: 3.1, week: 4.4, trend: "Favorável", source: "CEPEA", updated: "08:40", history: [1368, 1379, 1390, 1408, 1430] },
  { name: "Milho/Soja", value: "Monitorar", day: -0.2, week: 1.1, trend: "Estável", source: "CEPEA", updated: "08:40", history: [100, 99, 101, 100, 101] }
];

export default function MarketIntelligence() {
  const [statuses, setStatuses] = useState(mockMarketUpdateStatuses);
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());
  const [loading, setLoading] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [whatsAppMode, setWhatsAppMode] = useState<"report" | "briefing">("report");
  const [showRecipients, setShowRecipients] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAlertConfig, setShowAlertConfig] = useState(false);
  const [showUpdateHistory, setShowUpdateHistory] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedMarketReport | null>(null);
  const [recipients, setRecipients] = useState<WhatsAppRecipient[]>(() => getRecipients());
  const [sendHistory, setSendHistory] = useState<WhatsAppSendHistory[]>(() => getWhatsAppSendHistory());
  const { user } = usePermissions();

  const score = useMemo(() => calculateGeneralMarketScore(mockProductScores), []);
  const marketStatus = useMemo(() => getExecutiveMarketStatus(mockProductScores), []);
  const impactSummary = useMemo(() => summarizeCommercialImpact(mockImpactedProposals), []);
  const briefing = useMemo(() => generateBriefingWhatsApp(mockMarketAnalystInsight), []);
  const nextManual = statuses.find((status) => status.nextManual.includes("T"))?.nextManual ?? new Date().toISOString();
  const nextAutomatic = getNextAutomaticUpdate(statuses);
  const mainRatio = getMainExchangeRatio(mockExchangeRatios);
  const canManageRecipients = user?.role === "Administrador Geral" || user?.role === "Gestor / Gerente" || user?.role === "Compras / Precificação";
  const openBriefingWhatsApp = () => {
    setWhatsAppMode("briefing");
    setShowWhatsApp(true);
  };
  const openReportWhatsApp = () => {
    setWhatsAppMode("report");
    setShowWhatsApp(true);
  };

  const action = (message: string) => notify(message);

  const refreshMarket = () => {
    const manual = canRunManualMarketUpdate(statuses);
    if (!manual.allowed) {
      notify(`A atualização manual estará disponível às ${formatTime(manual.nextManual)}.`);
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setStatuses(simulateMarketUpdate(statuses));
      setLastUpdate(new Date().toISOString());
      setLoading(false);
      notify("Mercado atualizado com sucesso. Scores, relação de troca, propostas e oportunidades recalculados.");
    }, 900);
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

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="space-y-5">
      <Header
        loading={loading}
        showMenu={showMenu}
        onRefresh={refreshMarket}
        onReport={() => setShowReport(true)}
        onBriefing={openBriefingWhatsApp}
        onMeeting={() => setShowMeeting(true)}
        onMenu={() => setShowMenu((current) => !current)}
        onSources={() => { setShowSources(true); setShowMenu(false); }}
        onScenario={() => { setShowScenario(true); setShowMenu(false); }}
        onAdvanced={() => { setShowAdvanced((current) => !current); setShowMenu(false); }}
        onAlertConfig={() => { setShowAlertConfig(true); setShowMenu(false); }}
        onUpdateHistory={() => { setShowUpdateHistory(true); setShowMenu(false); }}
        onRecipients={() => { canManageRecipients ? setShowRecipients(true) : notify("Você não tem permissão para gerenciar destinatários."); setShowMenu(false); }}
        canManageRecipients={canManageRecipients}
      />

      <UpdateStrip statuses={statuses} lastUpdate={lastUpdate} nextManual={nextManual} nextAutomatic={nextAutomatic} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <ExecutiveSummary status={marketStatus} confidence={mockMarketAnalystInsight.confidence} onOpen={() => setShowAnalysis(true)} />
        <MarketThermometer score={score} />
      </div>

      <NowActions
        onProposals={() => scrollTo("propostas-impactadas")}
        onCustomers={() => scrollTo("oportunidades-comerciais")}
        onBriefing={openBriefingWhatsApp}
      />

      <MainIndicators />

      <div className="grid gap-5 xl:grid-cols-2">
        <CompactProducts products={mockProductsAttention.slice(0, 6)} onAll={() => setShowAdvanced(true)} />
        <CompactProposals proposals={mockImpactedProposals.slice(0, 5)} total={impactSummary.affectedProposals} value={impactSummary.impactedValue} urgent={impactSummary.urgentActions} onDetails={() => setShowAdvanced(true)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <CompactExchangeRatios ratios={mockExchangeRatios.slice(0, 4)} />
        <CompactOpportunities onAction={action} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <CompactNews news={mockTrustedMarketNews.slice(0, 5)} onCopy={(url) => copyText(url, "Link copiado com sucesso.")} />
        <CompactAnalyst onAnalysis={() => setShowAnalysis(true)} onBriefing={openBriefingWhatsApp} />
      </div>

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
          <CommercialOpportunities opportunities={mockCommercialOpportunities} onAction={action} />
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

      <ScenarioSimulatorModal open={showScenario} onClose={() => setShowScenario(false)} />
      <MeetingMode open={showMeeting} onClose={() => setShowMeeting(false)} score={score} products={mockProductsAttention} proposals={mockImpactedProposals} mainRatio={mainRatio} onPdf={() => setShowReport(true)} onCopy={() => copyText(briefing, "Resumo de reunião copiado.")} />
      <MarketReportModal open={showReport} onClose={() => setShowReport(false)} report={generatedReport} onGenerated={(report) => { setGeneratedReport(report); }} />
      <WhatsAppReportModal open={showWhatsApp} onClose={() => setShowWhatsApp(false)} report={whatsAppMode === "report" ? generatedReport : null} mode={whatsAppMode} recipients={recipients} briefing={briefing} history={sendHistory} sentBy={user?.name ?? "PADAP Intelligence"} onHistory={setSendHistory} onAction={action} onManageRecipients={() => setShowRecipients(true)} />
      <WhatsAppRecipientsModal open={showRecipients} onClose={() => setShowRecipients(false)} recipients={recipients} canManage={canManageRecipients} onChange={setRecipients} onAction={action} />

      <Modal title="Fontes monitoradas" open={showSources} onClose={() => setShowSources(false)}>
        <SourcesConfidenceCenter sources={mockMarketSources} />
      </Modal>

      <Modal title="Configurar alertas" open={showAlertConfig} onClose={() => setShowAlertConfig(false)}>
        <div className="grid gap-3 md:grid-cols-2">
          {["Risco cambial", "Risco de margem", "Oportunidade em potássicos", "Propostas impactadas", "Relação de troca", "Notícia crítica"].map((item) => (
            <label key={item} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">
              <span>{item}</span>
              <input type="checkbox" defaultChecked />
            </label>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-400">Configuração simulada nesta versão. A persistência real fica preparada para integração futura.</p>
      </Modal>

      <Modal title="Histórico de atualizações" open={showUpdateHistory} onClose={() => setShowUpdateHistory(false)}>
        <div className="space-y-3">
          {statuses.map((status) => (
            <div key={status.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-white">{status.label}</h3>
                <Badge tone={statusTone(status.status)}>{status.status}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">Última atualização: {formatDateTime(status.lastUpdate)}</p>
              <p className="text-sm leading-6 text-slate-400">Próxima atualização manual: {formatTime(status.nextManual)}</p>
              <p className="text-sm leading-6 text-slate-400">Próxima atualização automática: {formatTime(status.nextAutomatic)}</p>
            </div>
          ))}
        </div>
      </Modal>

      <Modal title="Análise completa do mercado" open={showAnalysis} onClose={() => setShowAnalysis(false)}>
        <div className="space-y-4 text-sm leading-6 text-slate-300">
          <p><strong className="text-white">Resumo:</strong> {mockMarketAnalystInsight.summary}</p>
          <p><strong className="text-white">Impacto PADAP:</strong> {mockMarketAnalystInsight.padapImpact}</p>
          <p><strong className="text-white">Produtos afetados:</strong> {mockMarketAnalystInsight.affectedProducts.join(", ")}</p>
          <p><strong className="text-white">Propostas:</strong> {mockMarketAnalystInsight.affectedProposals}</p>
          <p><strong className="text-white">Clientes:</strong> {mockMarketAnalystInsight.affectedCustomers}</p>
          <p className="text-padap-mint"><strong>Ação recomendada:</strong> {mockMarketAnalystInsight.recommendedAction}</p>
          <p><strong className="text-white">Fontes:</strong> {mockMarketAnalystInsight.sources.join(", ")}</p>
        </div>
      </Modal>
    </div>
  );
}

function Header({ loading, showMenu, canManageRecipients, onRefresh, onReport, onBriefing, onMeeting, onMenu, onSources, onScenario, onAdvanced, onAlertConfig, onUpdateHistory, onRecipients }: { loading: boolean; showMenu: boolean; canManageRecipients: boolean; onRefresh: () => void; onReport: () => void; onBriefing: () => void; onMeeting: () => void; onMenu: () => void; onSources: () => void; onScenario: () => void; onAdvanced: () => void; onAlertConfig: () => void; onUpdateHistory: () => void; onRecipients: () => void }) {
  return (
    <div className="relative rounded-xl border border-white/[0.08] bg-[linear-gradient(135deg,rgba(7,26,24,.92),rgba(3,11,13,.86))] p-5 shadow-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-padap-mint">
            <ShieldCheck size={18} />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">PADAP Intelligence</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">Central de Inteligência de Mercado</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Mercado, câmbio, fertilizantes, culturas e ações comerciais em um só lugar.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onRefresh} disabled={loading}><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Atualizar mercado agora</Button>
          <Button variant="ghost" onClick={onReport}><FileText size={16} />Gerar relatório PDF</Button>
          <Button variant="ghost" onClick={onBriefing}><Send size={16} />Gerar briefing WhatsApp</Button>
          <Button variant="amber" onClick={onMeeting}><Presentation size={16} />Modo reunião</Button>
          <Button variant="ghost" className="h-10 w-10 px-0" onClick={onMenu} aria-label="Mais opções"><MoreHorizontal size={18} /></Button>
        </div>
      </div>
      {showMenu && (
        <div className="absolute right-5 top-[calc(100%-12px)] z-20 w-64 rounded-xl border border-white/10 bg-[#071514] p-2 shadow-panel">
          <MenuButton icon={<CalendarClock size={15} />} label="Ver fontes" onClick={onSources} />
          <MenuButton icon={<Sparkles size={15} />} label="Simular cenário" onClick={onScenario} />
          <MenuButton icon={<ShieldCheck size={15} />} label="Configurar alertas" onClick={onAlertConfig} />
          <MenuButton icon={<RefreshCw size={15} />} label="Histórico de atualizações" onClick={onUpdateHistory} />
          {canManageRecipients && <MenuButton icon={<Users size={15} />} label="Gerenciar destinatários" onClick={onRecipients} />}
          <MenuButton icon={<BarChart3 size={15} />} label="Ver recursos avançados" onClick={onAdvanced} />
        </div>
      )}
    </div>
  );
}

function UpdateStrip({ statuses, lastUpdate, nextManual, nextAutomatic }: { statuses: typeof mockMarketUpdateStatuses; lastUpdate: string; nextManual: string; nextAutomatic: string }) {
  const sources = "Banco Central, CEPEA, Comex Stat, GlobalFert, Conab";
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3">
      <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-5">
        <StripItem label="Última atualização geral" value={formatDateTime(lastUpdate)} />
        <StripItem label="Próxima atualização manual disponível" value={formatTime(nextManual)} />
        <StripItem label="Próxima atualização automática" value={formatTime(nextAutomatic)} />
        <StripItem label="Status da atualização" value={<Badge tone={statusTone(statuses[0]?.status ?? "atualizado")}>atualizado</Badge>} />
        <StripItem label="Fontes monitoradas" value={sources} />
      </div>
    </div>
  );
}

function ExecutiveSummary({ status, confidence, onOpen }: { status: string; confidence: number; onOpen: () => void }) {
  const bullets = [
    "PTAX em alta pode pressionar propostas antigas.",
    "Ureia segue em atenção e pede revisão de nitrogenados.",
    "KCl apresenta oportunidade comercial para clientes com demanda de potássio.",
    "Café exige cuidado na relação de troca antes de prometer condição."
  ];
  return (
    <Card className="min-h-[330px]">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-padap-cyan">Resumo executivo</p>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight text-white">Mercado volátil, com pressão em nitrogenados e oportunidade em potássicos.</h2>
          <ul className="mt-5 grid gap-2 text-sm leading-6 text-slate-300 md:grid-cols-2">
            {bullets.map((bullet) => <li key={bullet} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">{bullet}</li>)}
          </ul>
        </div>
        <div className="grid min-w-56 gap-2">
          <SummaryPill label="Sentimento" value={status} tone="amber" />
          <SummaryPill label="Confiança" value={`Alta - ${confidence}%`} tone="green" />
          <SummaryPill label="Horizonte" value="Próximos 7 dias" tone="cyan" />
          <Button variant="ghost" onClick={onOpen}>Ver análise completa</Button>
        </div>
      </div>
    </Card>
  );
}

function NowActions({ onProposals, onCustomers, onBriefing }: { onProposals: () => void; onCustomers: () => void; onBriefing: () => void }) {
  const actions = [
    { priority: "Alta", title: "Recalcular propostas de nitrogenados", reason: "PTAX e ureia seguem em atenção.", button: "Ver propostas", onClick: onProposals, icon: <RefreshCw size={16} /> },
    { priority: "Alta", title: "Trabalhar oportunidade em KCl", reason: "Queda no mercado de potássicos.", button: "Ver clientes", onClick: onCustomers, icon: <Target size={16} /> },
    { priority: "Média", title: "Enviar briefing aos consultores", reason: "Mercado volátil exige orientação comercial.", button: "Gerar briefing", onClick: onBriefing, icon: <Send size={16} /> },
    { priority: "Média", title: "Confirmar validade da Tabela da Semana", reason: "Condição pode mudar com PTAX.", button: "Ver tabela", onClick: () => { window.location.href = "/tabela"; }, icon: <FileText size={16} /> }
  ];
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">O que fazer agora</h2>
          <p className="mt-1 text-sm text-slate-400">As próximas ações comerciais, em ordem de prioridade.</p>
        </div>
        <Badge tone="amber">4 ações</Badge>
      </div>
      <div className="grid gap-3 xl:grid-cols-4">
        {actions.map((item) => (
          <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-padap-cyan">{item.icon}</span>
              <Badge tone={priorityTone(item.priority)}>{item.priority}</Badge>
            </div>
            <h3 className="mt-3 text-sm font-semibold leading-5 text-white">{item.title}</h3>
            <p className="mt-2 min-h-10 text-xs leading-5 text-slate-400">{item.reason}</p>
            <Button variant="ghost" className="mt-3 min-h-8 px-3 py-1.5 text-xs" onClick={item.onClick}>{item.button}</Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MainIndicators() {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Indicadores principais</h2>
        <Badge tone="cyan">mercado</Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {mainIndicators.map((item) => {
          const isPositive = item.day >= 0;
          return (
            <div key={item.name} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                </div>
                {isPositive ? <TrendingUp size={17} className="text-amber-200" /> : <TrendingDown size={17} className="text-padap-mint" />}
              </div>
              <div className="mt-3 h-8"><Sparkline data={item.history.map((value) => ({ value }))} color={isPositive ? "#f6b73c" : "#39d353"} /></div>
              <p className={`mt-2 text-sm font-semibold ${isPositive ? "text-amber-100" : "text-padap-mint"}`}>{formatPercent(item.day)} hoje</p>
              <p className="text-xs leading-5 text-slate-500">{formatPercent(item.week)} na semana</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">Tendência: {item.trend}</p>
              <p className="text-xs leading-5 text-slate-500">{item.source} - {item.updated}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function CompactProducts({ products, onAll }: { products: ProductAttention[]; onAll: () => void }) {
  return (
    <Card>
      <SectionTop title="Produtos em atenção" action={<Button variant="ghost" onClick={onAll}>Ver todos</Button>} />
      <div className="overflow-x-auto">
        <table className="min-w-[680px] w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr><th className="pb-3">Produto</th><th className="pb-3">Movimento</th><th className="pb-3">Impacto</th><th className="pb-3">Ação recomendada</th><th className="pb-3 text-right">Score</th></tr>
          </thead>
          <tbody className="divide-y divide-white/[0.07]">
            {products.map((item) => (
              <tr key={item.product}>
                <td className="py-3 font-semibold text-white">{item.product}</td>
                <td className="py-3 text-slate-300">{item.movement}</td>
                <td className="py-3"><Badge tone={item.impact === "Alto" ? "amber" : item.impact === "Médio" ? "cyan" : "green"}>{item.product === "KCl" ? "Oportunidade" : item.impact}</Badge></td>
                <td className="py-3 text-slate-300">{item.recommendedAction}</td>
                <td className="py-3 text-right font-semibold text-padap-mint">{item.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CompactProposals({ proposals, total, value, urgent, onDetails }: { proposals: ImpactedProposal[]; total: number; value: number; urgent: number; onDetails: () => void }) {
  return (
    <div id="propostas-impactadas">
      <Card>
        <SectionTop title="Propostas impactadas" action={<Button variant="ghost" onClick={onDetails}>Ver detalhes</Button>} />
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <MiniMetric value={total} label="propostas impactadas" />
          <MiniMetric value={formatCurrency(value)} label="em negociação" />
          <MiniMetric value={urgent} label="revisões imediatas" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[620px] w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr><th className="pb-3">Proposta</th><th className="pb-3">Cliente</th><th className="pb-3">Produto</th><th className="pb-3">Motivo</th><th className="pb-3">Ação</th></tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {proposals.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-semibold text-white">{item.id}</td>
                  <td className="py-3 text-slate-300">{item.client}</td>
                  <td className="py-3 text-slate-300">{item.product}</td>
                  <td className="py-3 text-slate-400">{item.impactReason}</td>
                  <td className="py-3"><Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs">{item.product === "KCl" ? "Melhorar oferta" : "Recalcular"}</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function CompactExchangeRatios({ ratios }: { ratios: ExchangeRatioItem[] }) {
  return (
    <Card>
      <SectionTop title="Relação de troca" />
      <div className="grid gap-3 sm:grid-cols-2">
        {ratios.map((ratio) => {
          const favorable = ratio.status === "Favorável";
          return (
            <div key={ratio.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white">{ratio.pair}</h3>
                <Badge tone={favorable ? "green" : "amber"}>{favorable ? "Melhorou" : ratio.status}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <p className="text-slate-500">Antes<br /><span className="font-semibold text-slate-200">{ratio.previous} {ratio.unit}</span></p>
                <p className="text-slate-500">Agora<br /><span className="font-semibold text-white">{ratio.current} {ratio.unit}</span></p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{ratio.interpretation}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function CompactOpportunities({ onAction }: { onAction: (message: string) => void }) {
  return (
    <div id="oportunidades-comerciais">
      <Card>
        <SectionTop title="Oportunidades comerciais" />
        <div className="space-y-3">
          {mockCommercialOpportunities.slice(0, 3).map((item) => (
            <div key={item.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-white">{item.opportunity}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Motivo: {item.justification}</p>
                  <p className="text-sm leading-6 text-slate-300">Clientes sugeridos: {item.suggestedClients}</p>
                  <p className="text-sm leading-6 text-padap-mint">Ação recomendada: {item.recommendedAction}</p>
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

function CompactNews({ news, onCopy }: { news: MarketNews[]; onCopy: (url: string) => void }) {
  return (
    <Card>
      <SectionTop title="Notícias confiáveis" />
      <div className="space-y-3">
        {news.map((item) => (
          <article key={item.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="cyan">{item.category ?? item.tag}</Badge>
              <Badge tone="green">Confiança alta</Badge>
              <span className="text-xs text-slate-500">{item.source} - {formatDateTime(item.date)}</span>
            </div>
            <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.summary}</p>
            <p className="mt-2 text-sm text-padap-mint">Impacto PADAP: {item.impact}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:border-padap-green/25"><ExternalLink size={13} />Ver notícia</a>
              <Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs" onClick={() => item.url && onCopy(item.url)}><Copy size={13} />Copiar link</Button>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

function CompactAnalyst({ onAnalysis, onBriefing }: { onAnalysis: () => void; onBriefing: () => void }) {
  const insight = mockMarketAnalystInsight;
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2"><Bot className="text-padap-cyan" size={20} /><h2 className="text-lg font-semibold text-white">Analista de Mercado</h2></div>
        <Badge tone="green">Alta - {insight.confidence}%</Badge>
      </div>
      <div className="space-y-3 text-sm leading-6 text-slate-300">
        <ShortBlock label="Resumo" value="Mercado segue volátil, com atenção em câmbio e nitrogenados." />
        <ShortBlock label="Impacto PADAP" value="Propostas antigas precisam de revisão antes do envio." />
        <ShortBlock label="Produtos afetados" value={insight.affectedProducts.slice(0, 3).join(", ")} />
        <ShortBlock label="Ação recomendada" value="Recalcular propostas abertas e usar validade curta." />
        <ShortBlock label="Fontes usadas" value={insight.sources.slice(0, 4).join(", ")} />
      </div>
      <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-padap-green to-padap-cyan" style={{ width: `${insight.confidence}%` }} /></div>
      <div className="mt-4 flex flex-wrap gap-2"><Button onClick={onAnalysis}>Ver análise completa</Button><Button variant="ghost" onClick={onBriefing}>Gerar briefing</Button></div>
    </Card>
  );
}

function ReportBriefingPanel({ onReport, onBriefing, onWhatsApp, onRecipients, canManageRecipients }: { onReport: () => void; onBriefing: () => void; onWhatsApp: () => void; onRecipients: () => void; canManageRecipients: boolean }) {
  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Relatório PDF e Briefing WhatsApp</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">Gere materiais curtos para orientar consultores sem sobrecarregar a leitura.</p>
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
          <h2 className="text-lg font-semibold text-white">Recursos avançados</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">Simulador, mapa de risco, fontes, histórico e análises completas ficam em segundo nível.</p>
        </div>
        <Button variant="ghost" onClick={onToggle}>{open ? "Ocultar recursos" : "Ver detalhes"}</Button>
      </div>
      {open && <div className="mt-5">{children}</div>}
    </Card>
  );
}

function StripItem({ label, value }: { label: string; value: ReactNode }) {
  return <div><p className="text-[11px] uppercase leading-4 tracking-[0.12em] text-slate-500">{label}</p><div className="mt-1 text-sm font-medium leading-5 text-slate-100">{value}</div></div>;
}

function SummaryPill({ label, value, tone }: { label: string; value: string; tone: "green" | "amber" | "cyan" }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3"><p className="text-xs text-slate-500">{label}</p><div className="mt-1"><Badge tone={tone}>{value}</Badge></div></div>;
}

function SectionTop({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">{title}</h2>{action}</div>;
}

function MiniMetric({ value, label }: { value: ReactNode; label: string }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><p className="text-lg font-semibold text-white">{value}</p><p className="text-xs leading-5 text-slate-500">{label}</p></div>;
}

function MenuButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/[0.06] hover:text-white">{icon}{label}<ChevronRight size={14} className="ml-auto text-slate-500" /></button>;
}

function ShortBlock({ label, value }: { label: string; value: string }) {
  return <p><span className="font-semibold text-white">{label}:</span> {value}</p>;
}
