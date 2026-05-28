import { Copy, Pencil, Plus, Power, PowerOff, Save, SearchCheck, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { MarketSource, MarketSourceCategory, MarketSourceConfidence, MarketSourceType } from "../../types";
import { getMarketSources, marketSourceCategories, marketSourceConfidences, marketSourceTypes, saveMarketSources } from "../../services/marketSourcesService";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";

type SourceForm = Omit<MarketSource, "id" | "createdAt" | "updatedAt" | "lastCheckedAt" | "lastStatus"> & { id?: string; lastCheckedAt?: string; lastStatus?: MarketSource["lastStatus"] };

const emptyForm: SourceForm = {
  name: "",
  category: "Fertilizantes",
  sourceType: "Link monitorado",
  confidence: "Alta",
  url: "",
  isActive: true,
  useInBriefing: true,
  observation: "",
  lastStatus: "Pendente"
};

export function MarketSourcesManagerModal({ open, onClose, onAction }: { open: boolean; onClose: () => void; onAction: (message: string) => void }) {
  const [sources, setSources] = useState<MarketSource[]>([]);
  const [form, setForm] = useState<SourceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setSources(getMarketSources());
      resetForm();
    }
  }, [open]);

  const totals = useMemo(() => ({
    active: sources.filter((source) => source.isActive).length,
    briefing: sources.filter((source) => source.useInBriefing).length,
    high: sources.filter((source) => source.confidence === "Alta").length
  }), [sources]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const upsertSource = () => {
    if (!form.name.trim()) {
      setError("Informe o nome da fonte.");
      return;
    }

    const timestamp = new Date().toISOString();
    const nextSource: MarketSource = {
      id: editingId ?? makeId(),
      name: form.name.trim(),
      category: form.category,
      sourceType: form.sourceType,
      confidence: form.confidence,
      url: form.url?.trim() || undefined,
      isActive: form.isActive,
      useInBriefing: form.useInBriefing,
      observation: form.observation?.trim() || undefined,
      lastCheckedAt: form.lastCheckedAt,
      lastStatus: getStatusForSource(form),
      createdAt: sources.find((source) => source.id === editingId)?.createdAt ?? timestamp,
      updatedAt: timestamp
    };

    setSources((current) => editingId ? current.map((source) => source.id === editingId ? nextSource : source) : [nextSource, ...current]);
    resetForm();
    onAction(editingId ? "Fonte atualizada. Clique em Salvar alterações para persistir." : "Fonte adicionada. Clique em Salvar alterações para persistir.");
  };

  const editSource = (source: MarketSource) => {
    setForm({
      id: source.id,
      name: source.name,
      category: source.category,
      sourceType: source.sourceType,
      confidence: source.confidence,
      url: source.url ?? "",
      isActive: source.isActive,
      useInBriefing: source.useInBriefing,
      observation: source.observation ?? "",
      lastCheckedAt: source.lastCheckedAt,
      lastStatus: source.lastStatus
    });
    setEditingId(source.id);
    setError("");
  };

  const duplicateSource = (source: MarketSource) => {
    const timestamp = new Date().toISOString();
    const copySource: MarketSource = {
      ...source,
      id: makeId(),
      name: `${source.name} (cópia)`,
      lastStatus: getStatusForSource(source),
      createdAt: timestamp,
      updatedAt: timestamp
    };
    setSources((current) => [copySource, ...current]);
    onAction("Fonte duplicada. Clique em Salvar alterações para persistir.");
  };

  const removeSource = (source: MarketSource) => {
    if (!window.confirm(`Excluir a fonte "${source.name}"?`)) return;
    setSources((current) => current.filter((item) => item.id !== source.id));
    if (editingId === source.id) resetForm();
    onAction("Fonte removida. Clique em Salvar alterações para persistir.");
  };

  const toggleActive = (source: MarketSource) => {
    setSources((current) => current.map((item) => item.id === source.id ? { ...item, isActive: !item.isActive, lastStatus: !item.isActive ? getStatusForSource({ ...item, isActive: true }) : "Inativa", updatedAt: new Date().toISOString() } : item));
  };

  const toggleBriefing = (source: MarketSource) => {
    setSources((current) => current.map((item) => item.id === source.id ? { ...item, useInBriefing: !item.useInBriefing, updatedAt: new Date().toISOString() } : item));
  };

  const saveAll = () => {
    saveMarketSources(sources);
    onAction("Fontes de mercado salvas com sucesso.");
  };

  const testSource = (source: MarketSource) => {
    if (!source.isActive) {
      onAction("Teste estrutural: a fonte está inativa.");
      return;
    }
    if (requiresUrl(source.sourceType) && !source.url) {
      onAction("Teste estrutural: informe uma URL para API ou link monitorado.");
      return;
    }
    onAction("Teste estrutural concluído. A leitura automática será implementada na próxima etapa.");
  };

  return (
    <Modal title="Gerenciar fontes de mercado" open={open} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="max-w-3xl text-sm leading-6 text-slate-400">Cadastre e organize as fontes usadas pela Central de Inteligência de Mercado.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="green">{totals.active} ativas</Badge>
              <Badge tone="cyan">{totals.briefing} no briefing</Badge>
              <Badge tone="neutral">{sources.length} cadastradas</Badge>
              <Badge tone="green">{totals.high} alta confiança</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={resetForm}><Plus size={16} />Adicionar fonte</Button>
            <Button onClick={saveAll}><Save size={16} />Salvar alterações</Button>
            <Button variant="ghost" onClick={onClose}><X size={16} />Fechar</Button>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">{editingId ? "Editar fonte" : "Adicionar fonte"}</h3>
            {editingId && <Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs" onClick={resetForm}>Cancelar edição</Button>}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Nome da fonte">
              <Input value={form.name} placeholder="Ex.: Banco Central" onChange={(event) => setFormValue("name", event.target.value)} />
            </Field>
            <Field label="Categoria">
              <Select value={form.category} onChange={(event) => setFormValue("category", event.target.value as MarketSourceCategory)}>
                {marketSourceCategories.map((category) => <option key={category}>{category}</option>)}
              </Select>
            </Field>
            <Field label="Tipo de leitura">
              <Select value={form.sourceType} onChange={(event) => setFormValue("sourceType", event.target.value as MarketSourceType)}>
                {marketSourceTypes.map((type) => <option key={type}>{type}</option>)}
              </Select>
            </Field>
            <Field label="Nível de confiança">
              <Select value={form.confidence} onChange={(event) => setFormValue("confidence", event.target.value as MarketSourceConfidence)}>
                {marketSourceConfidences.map((confidence) => <option key={confidence}>{confidence}</option>)}
              </Select>
            </Field>
            <Field label="Link/URL opcional">
              <Input value={form.url ?? ""} placeholder={requiresUrl(form.sourceType) ? "Recomendado para este tipo" : "Opcional"} onChange={(event) => setFormValue("url", event.target.value)} />
            </Field>
            <ToggleField label="Usar no briefing" checked={form.useInBriefing} onChange={(checked) => setFormValue("useInBriefing", checked)} />
            <ToggleField label="Fonte ativa" checked={form.isActive} onChange={(checked) => setFormValue("isActive", checked)} />
            <div className="flex items-end">
              <Button className="w-full" onClick={upsertSource}>{editingId ? "Salvar fonte" : "Adicionar fonte"}</Button>
            </div>
          </div>
          <Field label="Observação" className="mt-3">
            <textarea value={form.observation ?? ""} rows={3} onChange={(event) => setFormValue("observation", event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#061314]/80 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-padap-green/70 focus:bg-[#071b18] focus:shadow-[0_0_0_3px_rgba(29,186,44,.10)]" />
          </Field>
          {error && <p className="mt-3 text-sm font-semibold text-red-200">{error}</p>}
          {requiresUrl(form.sourceType) && !form.url && <p className="mt-3 text-xs leading-5 text-amber-100">URL recomendada para API ou Link monitorado. A fonte pode ser salva agora e completada depois.</p>}
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Fonte</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Confiança</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Usar no briefing</th>
                <th className="px-4 py-3">Ativa</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {sources.map((source) => (
                <tr key={source.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{source.name}</p>
                    <p className="mt-1 max-w-xs truncate text-xs text-slate-500">{source.url || source.observation || "Sem URL cadastrada"}</p>
                  </td>
                  <td className="px-4 py-3"><CategoryChip category={source.category} /></td>
                  <td className="px-4 py-3 text-slate-300">{source.sourceType}</td>
                  <td className="px-4 py-3"><ConfidenceChip confidence={source.confidence} /></td>
                  <td className="px-4 py-3"><StatusChip status={source.lastStatus ?? getStatusForSource(source)} /></td>
                  <td className="px-4 py-3"><SwitchButton active={source.useInBriefing} onClick={() => toggleBriefing(source)} /></td>
                  <td className="px-4 py-3"><SwitchButton active={source.isActive} onClick={() => toggleActive(source)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <IconButton label="Editar" onClick={() => editSource(source)}><Pencil size={14} /></IconButton>
                      <IconButton label="Duplicar" onClick={() => duplicateSource(source)}><Copy size={14} /></IconButton>
                      <IconButton label={source.isActive ? "Desativar" : "Ativar"} onClick={() => toggleActive(source)}>{source.isActive ? <PowerOff size={14} /> : <Power size={14} />}</IconButton>
                      <IconButton label="Testar fonte" onClick={() => testSource(source)}><SearchCheck size={14} /></IconButton>
                      <IconButton label="Excluir" danger onClick={() => removeSource(source)}><Trash2 size={14} /></IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );

  function setFormValue<K extends keyof SourceForm>(key: K, value: SourceForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "name") setError("");
  }
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 ${className}`}><span className="mb-2 block">{label}</span>{children}</label>;
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-[66px] items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#061314]/70 px-3.5 py-2.5 text-sm font-semibold text-slate-200">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-padap-green" />
    </label>
  );
}

function IconButton({ label, children, danger = false, onClick }: { label: string; children: ReactNode; danger?: boolean; onClick: () => void }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${danger ? "border-red-400/25 bg-red-500/10 text-red-100 hover:bg-red-500/20" : "border-white/10 bg-white/[0.045] text-slate-100 hover:border-padap-green/25 hover:bg-padap-green/[0.08]"}`}>
      {children}
    </button>
  );
}

function SwitchButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`h-6 w-11 rounded-full border p-0.5 transition ${active ? "border-padap-green/30 bg-padap-green/20" : "border-white/10 bg-white/[0.05]"}`} aria-label={active ? "Ativo" : "Inativo"}>
      <span className={`block h-4 w-4 rounded-full transition ${active ? "translate-x-5 bg-padap-mint" : "translate-x-0 bg-slate-500"}`} />
    </button>
  );
}

function CategoryChip({ category }: { category: MarketSourceCategory }) {
  const tone = category === "Interna" ? "cyan" : category === "Fertilizantes" || category === "Câmbio" ? "green" : "neutral";
  return <Badge tone={tone}>{category}</Badge>;
}

function ConfidenceChip({ confidence }: { confidence: MarketSourceConfidence }) {
  const tone = confidence === "Alta" ? "green" : confidence === "Média" ? "amber" : "neutral";
  return <Badge tone={tone}>{confidence}</Badge>;
}

function StatusChip({ status }: { status: NonNullable<MarketSource["lastStatus"]> }) {
  const tone = status === "Ativa" || status === "Atualizada" || status === "Manual" ? "green" : status === "Erro" ? "red" : status === "Pendente" || status === "Indisponível" ? "amber" : "neutral";
  return <Badge tone={tone}>{status}</Badge>;
}

function requiresUrl(type: MarketSourceType) {
  return type === "API" || type === "Link monitorado";
}

function getStatusForSource(source: Pick<MarketSource, "isActive" | "sourceType" | "url">) {
  if (!source.isActive) return "Inativa";
  if (source.sourceType === "Entrada manual" || source.sourceType === "Fonte interna") return "Manual";
  if (requiresUrl(source.sourceType) && !source.url) return "Pendente";
  return "Ativa";
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `source-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
