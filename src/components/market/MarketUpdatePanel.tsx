import { BarChart3, Brain, CalendarClock, FileText, MessageCircle, Presentation, RefreshCw, Send, ShieldCheck, Sparkles } from "lucide-react";
import type { MarketUpdateStatus } from "../../types";
import { formatDateTime, formatTime, statusTone } from "../../utils/marketFormatting";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type Props = {
  statuses: MarketUpdateStatus[];
  lastUpdate: string;
  nextManual: string;
  nextAutomatic: string;
  loading: boolean;
  onRefresh: () => void;
  onChanges: () => void;
  onProposals: () => void;
  onReport: () => void;
  onBriefing: () => void;
  onWhatsApp: () => void;
  onScenario: () => void;
  onMeeting: () => void;
  onSources: () => void;
};

export function MarketUpdatePanel({ statuses, lastUpdate, nextManual, nextAutomatic, loading, onRefresh, onChanges, onProposals, onReport, onBriefing, onWhatsApp, onScenario, onMeeting, onSources }: Props) {
  const sources = "Banco Central, CEPEA, Comex Stat, GlobalFert, Conab, World Bank, FAO/AMIS";

  return (
    <Card className="mb-6 border-padap-green/20 bg-white">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-padap-emerald">
            <ShieldCheck size={18} />
            <span className="text-sm font-semibold">Central de atualização do mercado</span>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-padap-muted md:grid-cols-2 xl:grid-cols-5">
            <Info label="Última atualização geral" value={formatDateTime(lastUpdate)} />
            <Info label="Próxima atualização manual disponível" value={formatTime(nextManual)} />
            <Info label="Próxima atualização automática" value={formatTime(nextAutomatic)} />
            <Info label="Status da atualização" value="Atualizado" badge="green" />
            <Info label="Fontes monitoradas" value={sources} wide />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:w-[560px]">
          <Button onClick={onRefresh} disabled={loading}><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Atualizar mercado agora</Button>
          <Button variant="ghost" onClick={onChanges}><Sparkles size={16} />O que mudou desde ontem?</Button>
          <Button variant="ghost" onClick={onProposals}><BarChart3 size={16} />Ver propostas impactadas</Button>
          <Button variant="ghost" onClick={onReport}><FileText size={16} />Gerar relatório para consultores</Button>
          <Button variant="ghost" onClick={onBriefing}><Brain size={16} />Gerar briefing WhatsApp</Button>
          <Button variant="ghost" onClick={onWhatsApp}><Send size={16} />Enviar relatório WhatsApp</Button>
          <Button variant="amber" onClick={onScenario}><CalendarClock size={16} />Simular cenário</Button>
          <Button variant="ghost" onClick={onMeeting}><Presentation size={16} />Modo reunião</Button>
          <Button variant="ghost" className="sm:col-span-2" onClick={onSources}><MessageCircle size={16} />Ver fontes</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-7">
        {statuses.map((status) => (
          <div key={status.id} className="min-h-[126px] rounded-lg border border-padap-line bg-padap-field p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold leading-5 text-padap-ink">{status.label}</p>
              <Badge tone={statusTone(status.status)}>{status.status}</Badge>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-padap-muted">Última atualização: {formatTime(status.lastUpdate)}</p>
            <p className="text-[11px] leading-5 text-padap-muted">Próxima manual: {formatTime(status.nextManual)}</p>
            <p className="text-[11px] leading-5 text-padap-muted">Próxima automática: {formatTime(status.nextAutomatic)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Info({ label, value, badge, wide }: { label: string; value: string; badge?: "green"; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2 xl:col-span-1" : ""}>
      <p className="text-[11px] uppercase leading-4 tracking-[0.12em] text-padap-muted">{label}</p>
      {badge ? <Badge tone={badge}>{value}</Badge> : <p className="mt-1 text-sm font-medium leading-5 text-padap-ink">{value}</p>}
    </div>
  );
}
