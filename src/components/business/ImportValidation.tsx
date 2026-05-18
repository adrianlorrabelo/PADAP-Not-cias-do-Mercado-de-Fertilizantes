import type { WeeklyTableImport } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function ImportValidation({ imported, onConfirm, onCancel }: { imported: WeeklyTableImport; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Conferência obrigatória da importação</h3>
          <p className="text-sm text-slate-400">Fornecedor: {imported.supplier} | PTAX: {imported.ptax ?? "não encontrado"}</p>
        </div>
        <Badge tone={imported.errors.length ? "red" : "green"}>{imported.errors.length ? "Com inconsistências" : "Pronto para salvar"}</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Produtos encontrados" value={imported.stats.found} />
        <Stat label="Produtos válidos" value={imported.stats.valid} />
        <Stat label="Sem preço final" value={imported.stats.withoutFinalPrice} />
        <Stat label="Duplicados" value={imported.stats.duplicated} />
        <Stat label="Preço zerado" value={imported.stats.zeroPrice} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <List title="Erros" items={imported.errors} tone="red" />
        <List title="Avisos" items={imported.warnings} tone="amber" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button disabled={!!imported.errors.length} onClick={onConfirm}>Confirmar Importação</Button>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button variant="amber">Ver Erros</Button>
        <Button variant="ghost">Corrigir Manualmente</Button>
        <Button variant="ghost">Marcar como Indisponível</Button>
        <Button variant="ghost">Ignorar Item</Button>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold text-white">{value}</p></div>;
}

function List({ title, items, tone }: { title: string; items: string[]; tone: "red" | "amber" }) {
  return <div className="rounded-lg border border-white/10 bg-black/20 p-3"><Badge tone={tone}>{title}</Badge><ul className="mt-3 space-y-1 text-sm text-slate-300">{items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>Nenhum item.</li>}</ul></div>;
}
