import type { ImportWarning, WeeklyTableImport } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

type EditableImportParameter = keyof Pick<WeeklyTableImport, "expiresAt" | "ptax" | "freight" | "icms" | "marginIcms">;

type ImportValidationProps = {
  imported: WeeklyTableImport;
  previousParameters?: {
    expiresAt: string;
    ptax: number;
    freight: number;
    icms: number;
    marginIcms: number;
  };
  onParameterChange: <K extends EditableImportParameter>(key: K, value: WeeklyTableImport[K]) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ImportValidation({ imported, previousParameters, onParameterChange, onConfirm, onCancel }: ImportValidationProps) {
  const alertCount = imported.importWarnings?.length || imported.errors.length + imported.warnings.length;
  const errorCount = imported.importWarnings?.filter((item) => item.severity === "error").length || imported.errors.length;
  const warningCount = imported.importWarnings?.filter((item) => item.severity === "warning").length || imported.warnings.length;
  const foundDeviations = imported.deviationStats?.found ?? imported.lineDeviations?.filter((item) => item.foundInSpreadsheet).length ?? 0;
  const hasUncheckedParameters = !imported.expiresAt || !imported.ptax || !imported.icms || !imported.marginIcms;

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
            <h3 className="text-base font-bold text-padap-ink">Conferir importacao da Lista Yara</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {imported.fileName || "Arquivo selecionado"} {imported.sourceSheetName ? `| Aba: ${imported.sourceSheetName}` : ""}
          </p>
        </div>
        <Badge tone={errorCount ? "red" : warningCount ? "amber" : "green"}>{errorCount ? "Com erros" : warningCount ? "Com avisos" : "Pronto para salvar"}</Badge>
      </div>

      <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Produtos encontrados" value={imported.stats.found} />
        <EditableStat
          label="Vencimento"
          type="date"
          value={dateInputValue(imported.expiresAt)}
          previousValue={previousParameters?.expiresAt ? new Date(previousParameters.expiresAt).toLocaleDateString("pt-BR") : undefined}
          missing={!imported.expiresAt}
          onChange={(value) => onParameterChange("expiresAt", value ? new Date(`${value}T23:59:59`).toISOString() : undefined)}
        />
        <EditableStat
          label="PTAX"
          type="number"
          value={numberInputValue(imported.ptax)}
          previousValue={formatNumber(previousParameters?.ptax)}
          missing={!imported.ptax}
          onChange={(value) => onParameterChange("ptax", parseNumber(value))}
        />
        <EditableStat
          label="Frete"
          type="number"
          value={numberInputValue(imported.freight)}
          previousValue={formatNumber(previousParameters?.freight)}
          missing={imported.freight === undefined || imported.freight === null || Number.isNaN(imported.freight)}
          onChange={(value) => onParameterChange("freight", parseNumber(value))}
        />
        <EditableStat
          label="ICMS"
          type="number"
          value={numberInputValue(imported.icms)}
          previousValue={formatNumber(previousParameters?.icms)}
          missing={!imported.icms}
          onChange={(value) => onParameterChange("icms", parseNumber(value))}
        />
        <EditableStat
          label="Margem + ICMS"
          type="number"
          value={numberInputValue(imported.marginIcms)}
          previousValue={formatNumber(previousParameters?.marginIcms)}
          missing={!imported.marginIcms}
          onChange={(value) => onParameterChange("marginIcms", parseNumber(value))}
        />
        <Stat label="Desvios encontrados" value={`${foundDeviations}/${imported.lineDeviations?.length || 0}`} />
        <Stat label="Alertas" value={alertCount} />
        <Stat label="Sem preco final" value={imported.stats.withoutFinalPrice} />
        <Stat label="Duplicados" value={imported.stats.duplicated} />
      </div>

      {hasUncheckedParameters && (
        <div className="mt-3 rounded-lg border border-padap-amber/20 bg-padap-amber/[0.06] px-3 py-2 text-sm leading-6 text-amber-100">
          Alguns calculos podem estar divergentes porque existem parametros comerciais nao conferidos.
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <WarningList title="Erros" items={warningsBySeverity(imported, "error")} tone="red" />
        <WarningList title="Avisos" items={warningsBySeverity(imported, "warning")} tone="amber" />
        <WarningList title="Informacoes" items={warningsBySeverity(imported, "info")} tone="cyan" />
      </div>

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onCancel}>Cancelar importacao</Button>
        <Button disabled={!!errorCount} onClick={onConfirm}>Confirmar e salvar lista</Button>
      </div>
    </Card>
  );
}

function formatNumber(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "Nao encontrado";
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 4 });
}

function parseNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function numberInputValue(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "";
  return String(value);
}

function dateInputValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function warningsBySeverity(imported: WeeklyTableImport, severity: ImportWarning["severity"]) {
  if (imported.importWarnings?.length) return imported.importWarnings.filter((item) => item.severity === severity);
  if (severity === "error") return imported.errors.map((message) => ({ type: "error", message, severity }));
  if (severity === "warning") return imported.warnings.map((message) => ({ type: "warning", message, severity }));
  return [];
}

function EditableStat({
  label,
  value,
  previousValue,
  type,
  missing,
  onChange
}: {
  label: string;
  value: string;
  previousValue?: string;
  type: "date" | "number";
  missing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`min-w-0 rounded-lg border p-3 ${missing ? "border-padap-amber/30 bg-padap-amber/[0.04]" : "border-white/10 bg-white/[0.03]"}`}>
      <span className="block truncate text-xs text-slate-500">{label}</span>
      <Input
        type={type}
        step={type === "number" ? "0.0001" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-9 px-2 py-1.5 text-sm"
      />
      <span className={`mt-1 block text-[11px] ${missing ? "text-amber-200" : "text-slate-500"}`}>
        {missing ? "Parametro nao encontrado na planilha. Confira antes de salvar." : "Lido da planilha ou editado na conferencia."}
      </span>
      {previousValue && previousValue !== "Nao encontrado" && <span className="mt-1 block truncate text-[11px] text-slate-500">Ultimo usado: {previousValue}</span>}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="truncate text-xs text-slate-500">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold text-white" title={String(value)}>{value}</p>
    </div>
  );
}

function WarningList({ title, items, tone }: { title: string; items: ImportWarning[]; tone: "red" | "amber" | "cyan" }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <Badge tone={tone}>{title}</Badge>
        <span className="text-xs text-slate-500">{items.length}</span>
      </div>
      <ul className="mt-3 max-h-48 space-y-1 overflow-auto pr-1 text-sm text-slate-300">
        {items.length ? items.slice(0, 20).map((item, index) => <li key={`${item.type}-${index}`}>{item.message}</li>) : <li>Nenhum item.</li>}
        {items.length > 20 && <li className="text-slate-500">+{items.length - 20} alertas adicionais.</li>}
      </ul>
    </div>
  );
}
