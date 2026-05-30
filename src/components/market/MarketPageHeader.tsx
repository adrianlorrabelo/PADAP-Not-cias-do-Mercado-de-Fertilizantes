import { BarChart3, CalendarClock, FileText, History, MoreHorizontal, Presentation, RefreshCw, Send, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "../ui/Button";
import { MenuButton } from "./MarketUI";

interface MarketPageHeaderProps {
  loading: boolean;
  showMenu: boolean;
  canManageRecipients: boolean;
  onRefresh: () => void;
  onReport: () => void;
  onBriefing: () => void;
  onMeeting: () => void;
  onManageSources: () => void;
  onMenu: () => void;
  onSources: () => void;
  onScenario: () => void;
  onAdvanced: () => void;
  onAlertConfig: () => void;
  onAutoUpdateConfig: () => void;
  onUpdateHistory: () => void;
  onRecipients: () => void;
}

export function MarketPageHeader({
  loading, showMenu, canManageRecipients,
  onRefresh, onReport, onBriefing, onMeeting, onManageSources, onMenu,
  onSources, onScenario, onAdvanced, onAlertConfig, onAutoUpdateConfig, onUpdateHistory, onRecipients
}: MarketPageHeaderProps) {
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
          <Button onClick={onRefresh} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Atualizar mercado agora
          </Button>
          <Button variant="ghost" onClick={onReport}><FileText size={16} />Gerar relatório PDF</Button>
          <Button variant="ghost" onClick={onBriefing}><Send size={16} />Gerar briefing WhatsApp</Button>
          <Button variant="ghost" onClick={onManageSources}><ShieldCheck size={16} />Gerenciar fontes</Button>
          <Button variant="ghost" onClick={onAutoUpdateConfig}><CalendarClock size={16} />Automático</Button>
          <Button variant="amber" onClick={onMeeting}><Presentation size={16} />Modo reunião</Button>
          <Button variant="ghost" className="h-10 w-10 px-0" onClick={onMenu} aria-label="Mais opções">
            <MoreHorizontal size={18} />
          </Button>
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
