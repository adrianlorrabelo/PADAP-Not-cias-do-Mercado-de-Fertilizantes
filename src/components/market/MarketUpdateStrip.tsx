import { CalendarClock, CheckCircle2, Clock, Database, RefreshCw, Settings, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { StripItem } from "./MarketUI";
import type { MarketAutoUpdateSettings, MarketSource, MarketUpdateHistory, MarketUpdateResult } from "../../types";
import { formatDateTime, formatTime, statusTone } from "../../utils/marketFormatting";
import { mockMarketUpdateStatuses } from "../../data/mockMarketIndicators";

interface MarketUpdateStripProps {
  statuses: typeof mockMarketUpdateStatuses;
  lastUpdate: string;
  nextManual: string;
  nextAutomatic: string;
  sources: MarketSource[];
  result: MarketUpdateResult | null;
  latestHistory: MarketUpdateHistory | null;
  autoSettings: MarketAutoUpdateSettings;
  latestAutoHistory: MarketUpdateHistory | null;
  onAutoUpdateConfig: () => void;
}

export function MarketUpdateStrip({
  statuses, lastUpdate, nextManual, nextAutomatic, sources, result,
  latestHistory, autoSettings, latestAutoHistory, onAutoUpdateConfig
}: MarketUpdateStripProps) {
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
      <div className="grid gap-3 text-sm md:grid-cols-4 xl:grid-cols-8">
        <StripItem icon={<Clock size={12} />} label="Última atualização" value={formatDateTime(latestHistory?.updatedAt ?? lastUpdate)} />
        <StripItem icon={<CalendarClock size={12} />} label="Próxima manual" value={formatTime(nextManual)} />
        <StripItem icon={<Zap size={12} />} label="Próxima automática" value={nextAutoLabel} />
        <StripItem icon={<Settings size={12} />} label="Automático" value={<Badge tone={autoSettings.enabled ? "green" : "neutral"}>{autoStatus}</Badge>} />
        <StripItem icon={<RefreshCw size={12} />} label="Última automática" value={lastAutoLabel} />
        <StripItem icon={<CheckCircle2 size={12} />} label="Status" value={<Badge tone={statusTone(status)}>{status}</Badge>} />
        <StripItem icon={<Database size={12} />} label="Fontes verificadas" value={checkedLabel} />
        <StripItem icon={<ShieldCheck size={12} />} label="Confiança" value={confidenceLabel} />
      </div>
      <div className="mt-3 flex flex-col gap-2 border-t border-padap-line pt-3 text-xs leading-5 text-padap-muted sm:flex-row sm:items-center sm:justify-between">
        <span>A atualização automática funciona enquanto o sistema estiver aberto no navegador.</span>
        <Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs" onClick={onAutoUpdateConfig}>
          <CalendarClock size={13} />
          Configurar atualização automática
        </Button>
      </div>
    </div>
  );
}
