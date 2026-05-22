import type { QuotationTrafficLight as TrafficLight, QuotationStatus } from "../../types";
import { Select } from "../ui/Select";
import { Input } from "../ui/Input";

const statuses: QuotationStatus[] = ["Pode negociar", "Em análise", "Requer aprovação", "Bloqueada", "Vencida/Inativa"];

export function QuotationTrafficLight({ value, onChange, recommendation }: { value: TrafficLight; onChange: (value: TrafficLight) => void; recommendation: string }) {
  const color = value.status === "Pode negociar" ? "bg-padap-green" : value.status === "Em análise" ? "bg-padap-amber" : value.status === "Requer aprovação" ? "bg-orange-400" : value.status === "Bloqueada" ? "bg-red-500" : "bg-slate-500";

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#071918]/80 p-4">
      <div className="mb-4 flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${color}`} />
        <h2 className="text-base font-semibold text-white">Semáforo da cotação</h2>
      </div>
      <div className="grid gap-3">
        <Select value={value.status} onChange={(event) => onChange({ ...value, status: event.target.value as QuotationStatus, updatedAt: new Date().toISOString() })}>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </Select>
        <Input value={value.reason} onChange={(event) => onChange({ ...value, reason: event.target.value, updatedAt: new Date().toISOString() })} placeholder="Motivo" />
        <Input value={value.nextAction} onChange={(event) => onChange({ ...value, nextAction: event.target.value, updatedAt: new Date().toISOString() })} placeholder="Próxima ação" />
        <div className="grid grid-cols-2 gap-3">
          <Input value={value.owner} onChange={(event) => onChange({ ...value, owner: event.target.value, updatedAt: new Date().toISOString() })} placeholder="Responsável" />
          <Input value={value.expectedReturn} onChange={(event) => onChange({ ...value, expectedReturn: event.target.value, updatedAt: new Date().toISOString() })} placeholder="Previsão" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-400">Recomendação: {recommendation}</p>
    </section>
  );
}
