import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { SummaryPill } from "./MarketUI";
import { calculateNextMarketAutoUpdateAt } from "../../services/marketAutoUpdateService";
import type { MarketAutoUpdateSettings, MarketUpdateHistory } from "../../types";
import { formatDateTime, formatTime } from "../../utils/marketFormatting";

interface AutoUpdateSettingsModalProps {
  open: boolean;
  settings: MarketAutoUpdateSettings;
  latestAutoHistory: MarketUpdateHistory | null;
  onClose: () => void;
  onChange: (settings: MarketAutoUpdateSettings) => void;
}

export function AutoUpdateSettingsModal({ open, settings, latestAutoHistory, onClose, onChange }: AutoUpdateSettingsModalProps) {
  const save = (updates: Partial<MarketAutoUpdateSettings>) => {
    const next = { ...settings, ...updates };
    onChange({ ...next, nextAutoUpdateAt: calculateNextMarketAutoUpdateAt(next) });
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
                <Button variant="danger" className="h-10 w-10 shrink-0 px-0" onClick={() => removeTime(index)} aria-label="Remover horário">
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
          </div>
          {!settings.times.length && (
            <p className="mt-3 text-sm leading-6 text-padap-muted">Adicione pelo menos um horário para ativar uma janela automática.</p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <SummaryPill label="Status" value={settings.enabled ? "Ativo" : "Automático desativado"} tone={settings.enabled ? "green" : "cyan"} />
          <SummaryPill
            label="Próxima atualização"
            value={settings.enabled && settings.nextAutoUpdateAt ? formatTime(settings.nextAutoUpdateAt) : "Automático desativado"}
            tone="cyan"
          />
          <SummaryPill
            label="Última automática"
            value={latestAutoHistory ? formatDateTime(latestAutoHistory.updatedAt) : "Sem registro"}
            tone={latestAutoHistory?.status === "Com falhas" ? "amber" : "green"}
          />
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
