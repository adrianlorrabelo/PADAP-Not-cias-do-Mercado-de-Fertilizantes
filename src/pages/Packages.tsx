import { Copy, Eraser, ExternalLink, Plus, RotateCcw, Save, Trash2, CopyPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { copyToClipboard, whatsappHref } from "../services/whatsappService";
import { formatarMoedaBRL, formatarPercentual } from "../utils/currency";
import { simulatedAction } from "../utils/uiActions";

type FreightMode = "CIF" | "FOB";

interface ManualPackageItem {
  id: string;
  product: string;
  quantity: number;
  unit: string;
  unitCost: number;
  unitSale: number;
}

interface ManualPackage {
  name: string;
  client: string;
  consultant: string;
  crop: string;
  paymentCondition: string;
  freightMode: FreightMode;
  targetMargin: number;
  internalNotes: string;
  items: ManualPackageItem[];
}

interface ItemTotals {
  costTotal: number;
  saleTotal: number;
  grossProfit: number;
  marginPercent: number;
}

const STORAGE_KEY = "padap-manual-package";

const emptyItem = (): ManualPackageItem => ({
  id: crypto.randomUUID(),
  product: "",
  quantity: 0,
  unit: "un",
  unitCost: 0,
  unitSale: 0
});

const initialPackage: ManualPackage = {
  name: "",
  client: "",
  consultant: "",
  crop: "",
  paymentCondition: "",
  freightMode: "CIF",
  targetMargin: 0,
  internalNotes: "",
  items: [emptyItem()]
};

function loadInitialPackage(): ManualPackage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialPackage;
    const parsed = JSON.parse(saved) as ManualPackage;
    return { ...initialPackage, ...parsed, items: parsed.items?.length ? parsed.items : [emptyItem()] };
  } catch {
    return initialPackage;
  }
}

function itemTotals(item: ManualPackageItem): ItemTotals {
  const costTotal = item.quantity * item.unitCost;
  const saleTotal = item.quantity * item.unitSale;
  const grossProfit = saleTotal - costTotal;
  const marginPercent = saleTotal > 0 ? (grossProfit / saleTotal) * 100 : 0;
  return { costTotal, saleTotal, grossProfit, marginPercent };
}

function packageTotals(items: ManualPackageItem[]) {
  const costTotal = items.reduce((sum, item) => sum + itemTotals(item).costTotal, 0);
  const saleTotal = items.reduce((sum, item) => sum + itemTotals(item).saleTotal, 0);
  const grossProfit = saleTotal - costTotal;
  const marginPercent = saleTotal > 0 ? (grossProfit / saleTotal) * 100 : 0;
  return { costTotal, saleTotal, grossProfit, marginPercent };
}

function saleNeededForTarget(costTotal: number, targetMargin: number) {
  return targetMargin < 100 ? costTotal / (1 - targetMargin / 100) : 0;
}

function packageStatus(marginPercent: number, targetMargin: number) {
  if (marginPercent >= targetMargin) return "Dentro da meta";
  if (marginPercent >= targetMargin - 2) return "Próximo da meta";
  if (marginPercent > 0 && marginPercent < targetMargin - 2) return "Abaixo da meta";
  return "Crítico";
}

function itemStatus(marginPercent: number, targetMargin: number) {
  if (marginPercent < 0) return "Margem negativa";
  if (marginPercent < targetMargin) return "Atenção";
  return "OK";
}

function statusTone(status: string): "green" | "amber" | "red" | "neutral" {
  if (status === "Dentro da meta" || status === "OK") return "green";
  if (status === "Crítico" || status === "Margem negativa") return "red";
  if (status === "Próximo da meta" || status === "Atenção") return "amber";
  return "neutral";
}

function buildConsultantMessage(pkg: ManualPackage, saleTotal: number) {
  const items = pkg.items.filter((item) => item.product.trim() || item.quantity || item.unitSale);
  const lines = items.map((item, index) => {
    const totals = itemTotals(item);
    return `${index + 1}. ${item.product || "Produto não informado"}
Quantidade: ${formatNumber(item.quantity)} ${item.unit || "un"}
Preço: ${formatarMoedaBRL(item.unitSale)}/${item.unit || "un"}
Total: ${formatarMoedaBRL(totals.saleTotal)}`;
  });

  return `Olá, ${pkg.consultant || "Consultor"}.

Segue pacote para negociação:

Cliente: ${pkg.client || "Cliente não informado"}

Itens:
${lines.length ? lines.join("\n\n") : "Nenhum item informado"}

Valor total do pacote: ${formatarMoedaBRL(saleTotal)}
Condição de pagamento: ${pkg.paymentCondition || "A definir"}
Frete: ${pkg.freightMode}

Observação:
Valores sujeitos à confirmação de disponibilidade e validade da condição.`;
}

function formatNumber(value: number) {
  return (value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

export default function Packages() {
  const [pkg, setPkg] = useState<ManualPackage>(() => loadInitialPackage());
  const [message, setMessage] = useState("");

  const totals = useMemo(() => packageTotals(pkg.items), [pkg.items]);
  const targetMargin = Number.isFinite(pkg.targetMargin) ? pkg.targetMargin : 0;
  const differenceToTarget = totals.marginPercent - targetMargin;
  const neededSale = saleNeededForTarget(totals.costTotal, targetMargin);
  const missingToTarget = Math.max(0, neededSale - totals.saleTotal);
  const status = packageStatus(totals.marginPercent, targetMargin);
  const hasItemBelowTarget = pkg.items.some((item) => itemStatus(itemTotals(item).marginPercent, targetMargin) !== "OK");
  const visibleItems = pkg.items.filter((item) => item.product.trim() || item.quantity || item.unitCost || item.unitSale);

  const updatePackage = <K extends keyof ManualPackage>(field: K, value: ManualPackage[K]) => {
    setPkg((current) => ({ ...current, [field]: value }));
  };

  const updateItem = <K extends keyof ManualPackageItem>(id: string, field: K, value: ManualPackageItem[K]) => {
    setPkg((current) => ({
      ...current,
      items: current.items.map((item) => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = () => {
    setPkg((current) => ({ ...current, items: [...current.items, emptyItem()] }));
  };

  const duplicateItem = (id: string) => {
    setPkg((current) => {
      const source = current.items.find((item) => item.id === id);
      if (!source) return current;
      return { ...current, items: [...current.items, { ...source, id: crypto.randomUUID(), product: `${source.product} - cópia` }] };
    });
  };

  const removeItem = (id: string) => {
    setPkg((current) => {
      const items = current.items.filter((item) => item.id !== id);
      return { ...current, items: items.length ? items : [emptyItem()] };
    });
  };

  const clearItem = (id: string) => {
    setPkg((current) => ({ ...current, items: current.items.map((item) => item.id === id ? { ...emptyItem(), id } : item) }));
  };

  const savePackage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pkg));
    simulatedAction("Pacote salvo.");
  };

  const duplicatePackage = () => {
    setPkg((current) => ({
      ...current,
      name: current.name ? `${current.name} - cópia` : "Cópia do pacote",
      items: current.items.map((item) => ({ ...item, id: crypto.randomUUID() }))
    }));
    setMessage("");
    simulatedAction("Pacote duplicado para edição.");
  };

  const clearPackage = () => {
    if (!window.confirm("Limpar todos os campos do pacote?")) return;
    setPkg({ ...initialPackage, items: [emptyItem()] });
    setMessage("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const generateMessage = () => {
    const nextMessage = buildConsultantMessage(pkg, totals.saleTotal);
    setMessage(nextMessage);
    simulatedAction("Mensagem gerada.");
  };

  const copyMessage = () => {
    const text = message || buildConsultantMessage(pkg, totals.saleTotal);
    copyToClipboard(text).then(() => simulatedAction("Mensagem copiada."));
  };

  return (
    <div>
      <div className="page-title">
        <h1>Montador de Pacote Comercial</h1>
        <p>Monte pacotes manuais com vários produtos, margem por item e decisão pela margem total definida pelo usuário.</p>
      </div>

      <div className="mb-5 flex flex-wrap justify-end gap-2">
        <Button onClick={savePackage}><Save size={16} />Salvar pacote</Button>
        <Button variant="ghost" onClick={duplicatePackage}><CopyPlus size={16} />Duplicar pacote</Button>
        <Button variant="danger" onClick={clearPackage}><Trash2 size={16} />Limpar pacote</Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Card>
            <SectionHeader title="Dados do pacote" subtitle="Tudo manual e editável." />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Nome do pacote"><Input value={pkg.name} onChange={(event) => updatePackage("name", event.target.value)} placeholder="Ex.: Nutrição café maio" /></Field>
              <Field label="Cliente"><Input value={pkg.client} onChange={(event) => updatePackage("client", event.target.value)} placeholder="Cliente" /></Field>
              <Field label="Consultor"><Input value={pkg.consultant} onChange={(event) => updatePackage("consultant", event.target.value)} placeholder="Consultor" /></Field>
              <Field label="Cultura"><Input value={pkg.crop} onChange={(event) => updatePackage("crop", event.target.value)} placeholder="Opcional" /></Field>
              <Field label="Condição de pagamento"><Input value={pkg.paymentCondition} onChange={(event) => updatePackage("paymentCondition", event.target.value)} placeholder="Ex.: 30/60 dias" /></Field>
              <Field label="Frete">
                <Select value={pkg.freightMode} onChange={(event) => updatePackage("freightMode", event.target.value as FreightMode)}>
                  <option value="CIF">CIF</option>
                  <option value="FOB">FOB</option>
                </Select>
              </Field>
              <Field label="Meta de margem do pacote (%)">
                <Input type="number" step="0.01" value={pkg.targetMargin} onChange={(event) => updatePackage("targetMargin", Number(event.target.value))} />
              </Field>
              <Field label="Observações internas">
                <Input value={pkg.internalNotes} onChange={(event) => updatePackage("internalNotes", event.target.value)} placeholder="Uso interno" />
              </Field>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <SectionHeader title="Itens do pacote" subtitle="Produto, quantidade, unidade, custo e venda são editáveis." compact />
              <Button onClick={addItem}><Plus size={16} />Adicionar produto</Button>
            </div>

            <div className="space-y-3">
              <div className="hidden grid-cols-[minmax(150px,1.3fr)_74px_70px_92px_92px_90px_98px_104px] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>Produto</span>
                <span>Qtd</span>
                <span>Un.</span>
                <span>Custo</span>
                <span>Venda</span>
                <span>Margem</span>
                <span>Total</span>
                <span>Ações</span>
              </div>

              {pkg.items.map((item, index) => {
                const itemCalc = itemTotals(item);
                const statusItem = itemStatus(itemCalc.marginPercent, targetMargin);
                return (
                  <div key={item.id} className="rounded-lg border border-white/[0.08] bg-black/15 p-3">
                    <div className="grid gap-2 lg:grid-cols-[minmax(150px,1.3fr)_74px_70px_92px_92px_90px_98px_104px] lg:items-start">
                      <LabeledCell label="Produto">
                        <Input className="h-9 px-3 py-2" value={item.product} onChange={(event) => updateItem(item.id, "product", event.target.value)} placeholder={`Produto ${index + 1}`} />
                      </LabeledCell>
                      <LabeledCell label="Qtd">
                        <Input className="h-9 px-3 py-2" type="number" step="0.001" value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", Number(event.target.value))} />
                      </LabeledCell>
                      <LabeledCell label="Un.">
                        <Input className="h-9 px-3 py-2" value={item.unit} onChange={(event) => updateItem(item.id, "unit", event.target.value)} />
                      </LabeledCell>
                      <LabeledCell label="Custo unit.">
                        <Input className="h-9 px-3 py-2" type="number" step="0.01" value={item.unitCost} onChange={(event) => updateItem(item.id, "unitCost", Number(event.target.value))} />
                      </LabeledCell>
                      <LabeledCell label="Venda unit.">
                        <Input className="h-9 px-3 py-2" type="number" step="0.01" value={item.unitSale} onChange={(event) => updateItem(item.id, "unitSale", Number(event.target.value))} />
                      </LabeledCell>
                      <LabeledCell label="Margem">
                        <div className="min-h-9 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm font-semibold text-white">{formatarPercentual(itemCalc.marginPercent)}</div>
                      </LabeledCell>
                      <LabeledCell label="Total venda">
                        <div className="min-h-9 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm font-semibold text-white">{formatarMoedaBRL(itemCalc.saleTotal)}</div>
                      </LabeledCell>
                      <div className="flex min-h-9 items-center gap-1">
                        <IconButton label="Duplicar" onClick={() => duplicateItem(item.id)}><CopyPlus size={15} /></IconButton>
                        <IconButton label="Limpar linha" onClick={() => clearItem(item.id)}><Eraser size={15} /></IconButton>
                        <IconButton label="Remover" danger onClick={() => removeItem(item.id)}><Trash2 size={15} /></IconButton>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                      <p>Custo total: <strong className="text-slate-200">{formatarMoedaBRL(itemCalc.costTotal)}</strong></p>
                      <p>Lucro bruto: <strong className={itemCalc.grossProfit < 0 ? "text-red-200" : "text-slate-200"}>{formatarMoedaBRL(itemCalc.grossProfit)}</strong></p>
                      <p>Status: <Badge tone={statusTone(statusItem)}>{statusItem}</Badge></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Mensagem para consultor" subtitle="Somente informações comerciais finais." />
            <pre className="min-h-64 whitespace-pre-wrap rounded-lg border border-white/[0.08] bg-black/30 p-4 text-sm leading-6 text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,.03)]">{message || buildConsultantMessage(pkg, totals.saleTotal)}</pre>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={generateMessage}><RotateCcw size={16} />Gerar mensagem</Button>
              <Button variant="ghost" onClick={copyMessage}><Copy size={16} />Copiar mensagem</Button>
              <a className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]" href={whatsappHref(message || buildConsultantMessage(pkg, totals.saleTotal))} target="_blank">
                <ExternalLink size={16} />Abrir WhatsApp
              </a>
            </div>
          </Card>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
          <Card>
            <SectionHeader title="Resumo do pacote" subtitle={pkg.name || "Pacote em edição"} />
            <div className="grid gap-3">
              <SummaryLine label="Quantidade de itens" value={String(visibleItems.length)} />
              <SummaryLine label="Custo total do pacote" value={formatarMoedaBRL(totals.costTotal)} />
              <SummaryLine label="Venda total do pacote" value={formatarMoedaBRL(totals.saleTotal)} />
              <SummaryLine label="Lucro bruto total" value={formatarMoedaBRL(totals.grossProfit)} tone={totals.grossProfit < 0 ? "red" : "white"} />
              <SummaryLine label="Margem total do pacote" value={formatarPercentual(totals.marginPercent)} tone={totals.marginPercent < 0 ? "red" : "green"} />
              <SummaryLine label="Meta de margem" value={formatarPercentual(targetMargin)} />
              <SummaryLine label="Diferença para meta" value={`${differenceToTarget >= 0 ? "+" : ""}${formatarPercentual(differenceToTarget)}`} tone={differenceToTarget >= 0 ? "green" : "amber"} />
              <SummaryLine label="Falta para bater meta" value={formatarMoedaBRL(missingToTarget)} tone={missingToTarget > 0 ? "amber" : "green"} />
              <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                <span className="text-sm text-slate-400">Status geral</span>
                <Badge tone={statusTone(status)}>{status}</Badge>
              </div>
            </div>
            {hasItemBelowTarget && status === "Dentro da meta" && (
              <p className="mt-4 rounded-lg border border-padap-amber/20 bg-padap-amber/10 p-3 text-xs leading-5 text-amber-100">Há produto abaixo da meta, mas o pacote total está dentro da margem definida.</p>
            )}
          </Card>

          <Card>
            <SectionHeader title="Para bater a meta" subtitle="Ajuste informativo, sem aplicação automática." />
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Falta para bater meta</p>
              <p className={`mt-1 text-2xl font-semibold ${missingToTarget > 0 ? "text-amber-100" : "text-padap-mint"}`}>{formatarMoedaBRL(missingToTarget)}</p>
              <p className="mt-3 text-sm text-slate-300">Diferença para meta: <strong>{`${differenceToTarget >= 0 ? "+" : ""}${formatarPercentual(differenceToTarget)}`}</strong></p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {missingToTarget > 0
                  ? `Falta ${formatarMoedaBRL(missingToTarget)} para atingir a meta definida.`
                  : "Pacote dentro da meta definida."}
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, compact = false }: { title: string; subtitle: string; compact?: boolean }) {
  return (
    <div className={compact ? "" : "mb-4"}>
      <div className="flex items-center gap-2">
        <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
        <h2 className="text-base font-bold text-padap-ink">{title}</h2>
      </div>
      <p className="mt-1 pl-3 text-xs leading-5 text-padap-muted">{subtitle}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-400"><span className="mb-1.5 block">{label}</span>{children}</label>;
}

function LabeledCell({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 lg:hidden">{label}</span>{children}</label>;
}

function IconButton({ label, children, onClick, danger = false }: { label: string; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${danger ? "border-red-400/20 bg-red-500/10 text-red-100 hover:bg-red-500/20" : "border-white/10 bg-white/[0.045] text-slate-100 hover:border-padap-green/25 hover:bg-padap-green/[0.08]"}`}
    >
      {children}
    </button>
  );
}

function SummaryLine({ label, value, tone = "white" }: { label: string; value: string; tone?: "white" | "green" | "amber" | "red" }) {
  const colors = {
    white: "text-white",
    green: "text-padap-mint",
    amber: "text-amber-100",
    red: "text-red-200"
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2.5">
      <span className="text-sm text-slate-400">{label}</span>
      <strong className={`text-right text-sm ${colors[tone]}`}>{value}</strong>
    </div>
  );
}
