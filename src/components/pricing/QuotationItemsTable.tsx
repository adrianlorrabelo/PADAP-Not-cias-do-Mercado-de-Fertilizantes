import { Copy, PencilLine, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { QuotationItem } from "../../types";
import { formatarMoedaBRL } from "../../utils/currency";
import { createQuotationItem, quotationItemTotals } from "../../utils/pricingCalculations";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

type Props = {
  items: QuotationItem[];
  onChange: (items: QuotationItem[], action: string) => void;
};

const numericFields: Array<keyof QuotationItem> = ["quantity", "baseCost", "desiredMargin", "minimumMargin", "finalPrice"];

function toneForStatus(status: string): "green" | "amber" | "red" | "cyan" {
  if (status === "Pode enviar") return "green";
  if (status.includes("Aten")) return "amber";
  if (status.includes("Requer")) return "cyan";
  return "red";
}

export function QuotationItemsTable({ items, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingItem = items.find((item) => item.id === editingId) || null;

  function updateItem(id: string, key: keyof QuotationItem, value: string) {
    const next = items.map((item) => item.id === id ? { ...item, [key]: numericFields.includes(key) ? Number(value) : value } : item);
    onChange(next, key === "finalPrice" ? "preço alterado" : key === "desiredMargin" || key === "minimumMargin" ? "margem alterada" : "produto editado");
  }

  function addItem() {
    onChange([...items, createQuotationItem()], "produto adicionado");
  }

  function duplicateItem(item: QuotationItem) {
    onChange([...items, createQuotationItem({ ...item, id: undefined, product: `${item.product} cópia` })], "produto duplicado");
  }

  function removeItem(id: string) {
    if (editingId === id) setEditingId(null);
    onChange(items.filter((item) => item.id !== id), "produto removido");
  }

  return (
    <section className="min-w-0 rounded-xl border border-padap-line bg-white shadow-panel">
      <div className="flex flex-col gap-3 border-b border-padap-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
            <h2 className="text-base font-bold text-padap-ink">Itens da cotação</h2>
          </div>
          <p className="mt-1 text-xs font-medium text-padap-muted">Informe custo e venda final. Frete, impostos, comissão e prazo devem estar embutidos na venda.</p>
        </div>
        <Button onClick={addItem} className="shrink-0"><Plus size={16} />Adicionar produto</Button>
      </div>

      <div className="hidden w-full overflow-hidden lg:block">
        <table className="w-full table-fixed text-left text-[11px]">
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[7%]" />
            <col className="w-[8%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[8%]" />
            <col className="w-[11%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead className="border-b border-padap-green/20 bg-padap-green/[0.08] text-xs uppercase tracking-[0.12em] text-padap-emerald">
            <tr>
              {["Produto", "Qtd", "Un.", "Custo", "Venda", "Margem", "Status", "Ações"].map((header) => (
                <th key={header} className="px-2 py-2.5 font-bold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-padap-line">
            {items.map((item) => {
              const totals = quotationItemTotals(item);
              return (
                <tr key={item.id} className="hover:bg-padap-green/[0.035]">
                  <CellInput value={item.product} onChange={(value) => updateItem(item.id, "product", value)} ariaLabel="Produto" />
                  <CellInput type="number" value={item.quantity} onChange={(value) => updateItem(item.id, "quantity", value)} ariaLabel="Quantidade" />
                  <CellInput value={item.unit} onChange={(value) => updateItem(item.id, "unit", value)} ariaLabel="Unidade" />
                  <CellInput type="number" value={item.baseCost} onChange={(value) => updateItem(item.id, "baseCost", value)} ariaLabel="Custo" />
                  <CellInput type="number" value={item.finalPrice} onChange={(value) => updateItem(item.id, "finalPrice", value)} ariaLabel="Venda" />
                  <td className="px-2 py-2 font-bold text-padap-ink">{totals.marginPercent.toFixed(1)}%</td>
                  <td className="px-2 py-2"><Badge tone={toneForStatus(totals.status)}>{totals.status}</Badge></td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                      <IconButton label="Editar detalhes" onClick={() => setEditingId(item.id)}><PencilLine size={13} /></IconButton>
                      <IconButton label="Duplicar" onClick={() => duplicateItem(item)}><Copy size={13} /></IconButton>
                      <IconButton label="Remover" danger onClick={() => removeItem(item.id)}><Trash2 size={13} /></IconButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 lg:hidden">
        {items.map((item) => {
          const totals = quotationItemTotals(item);
          return (
            <div key={item.id} className="rounded-lg border border-padap-line bg-padap-field p-3">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-padap-ink">{item.product || "Produto sem nome"}</p>
                  <p className="mt-1 text-xs font-medium text-padap-muted">{item.quantity} {item.unit} · {formatarMoedaBRL(totals.revenueTotal)}</p>
                </div>
                <Badge tone={toneForStatus(totals.status)}>{totals.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <InlineInput label="Produto" value={item.product} onChange={(value) => updateItem(item.id, "product", value)} />
                <InlineInput label="Qtd" type="number" value={item.quantity} onChange={(value) => updateItem(item.id, "quantity", value)} />
                <InlineInput label="Un." value={item.unit} onChange={(value) => updateItem(item.id, "unit", value)} />
                <InlineInput label="Custo" type="number" value={item.baseCost} onChange={(value) => updateItem(item.id, "baseCost", value)} />
                <InlineInput label="Venda" type="number" value={item.finalPrice} onChange={(value) => updateItem(item.id, "finalPrice", value)} />
                <div className="rounded-md border border-padap-line bg-white px-2 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-padap-muted">Margem</p>
                  <p className="mt-1 text-sm font-bold text-padap-ink">{totals.marginPercent.toFixed(1)}%</p>
                </div>
              </div>
              <div className="mt-3 flex gap-1.5">
                <Button variant="ghost" className="min-h-9 flex-1 px-2 text-xs" onClick={() => setEditingId(item.id)}><PencilLine size={14} />Editar detalhes</Button>
                <IconButton label="Duplicar" onClick={() => duplicateItem(item)}><Copy size={14} /></IconButton>
                <IconButton label="Remover" danger onClick={() => removeItem(item.id)}><Trash2 size={14} /></IconButton>
              </div>
            </div>
          );
        })}
      </div>

      <Modal title="Editar detalhes do item" open={!!editingItem} onClose={() => setEditingId(null)}>
        {editingItem && (
          <div className="grid gap-4">
            <div className="rounded-lg border border-padap-line bg-padap-field p-3">
              <p className="text-sm font-bold text-padap-ink">{editingItem.product || "Produto sem nome"}</p>
              <p className="mt-1 text-xs font-medium text-padap-muted">O preço de venda deve ser informado já com frete, impostos, comissão e prazo embutidos.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <DetailInput label="Produto" value={editingItem.product} onChange={(value) => updateItem(editingItem.id, "product", value)} />
              <DetailInput label="Fornecedor" value={editingItem.supplier} onChange={(value) => updateItem(editingItem.id, "supplier", value)} />
              <DetailInput label="Quantidade" type="number" value={editingItem.quantity} onChange={(value) => updateItem(editingItem.id, "quantity", value)} />
              <DetailInput label="Unidade" value={editingItem.unit} onChange={(value) => updateItem(editingItem.id, "unit", value)} />
              <DetailInput label="Preço de custo" type="number" value={editingItem.baseCost} onChange={(value) => updateItem(editingItem.id, "baseCost", value)} />
              <DetailInput label="Preço de venda" type="number" value={editingItem.finalPrice} onChange={(value) => updateItem(editingItem.id, "finalPrice", value)} />
              <DetailInput label="Margem desejada" type="number" value={editingItem.desiredMargin} onChange={(value) => updateItem(editingItem.id, "desiredMargin", value)} />
              <DetailInput label="Margem mínima" type="number" value={editingItem.minimumMargin} onChange={(value) => updateItem(editingItem.id, "minimumMargin", value)} />
            </div>

            <p className="rounded-lg border border-padap-green/15 bg-padap-green/[0.05] px-3 py-2 text-xs font-medium leading-5 text-padap-ink">
              Frete, impostos, comissão e condições de prazo devem estar embutidos no preço de venda final.
            </p>
            <ItemTotals item={editingItem} />
          </div>
        )}
      </Modal>
    </section>
  );
}

function CellInput({ value, onChange, type = "text", ariaLabel }: { value: string | number; onChange: (value: string) => void; type?: string; ariaLabel: string }) {
  return (
    <td className="px-1.5 py-2">
      <input
        aria-label={ariaLabel}
        type={type}
        value={value}
        step={type === "number" ? "0.01" : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full min-w-0 rounded-md border border-padap-line bg-white px-2 text-[11px] font-medium text-padap-ink outline-none transition placeholder:text-slate-400 focus:border-padap-green"
      />
    </td>
  );
}

function InlineInput({ label, value, onChange, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-padap-muted">{label}</span>
      <input
        type={type}
        value={value}
        step={type === "number" ? "0.01" : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full min-w-0 rounded-md border border-padap-line bg-white px-2 text-xs font-medium text-padap-ink outline-none focus:border-padap-green"
      />
    </label>
  );
}

function DetailInput({ label, value, onChange, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-[0.12em] text-padap-muted">
      {label}
      <input
        type={type}
        value={value}
        step={type === "number" ? "0.01" : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-10 w-full rounded-lg border border-padap-line bg-white px-3 text-sm font-medium normal-case tracking-normal text-padap-ink outline-none focus:border-padap-green"
      />
    </label>
  );
}

function IconButton({ label, children, onClick, danger = false }: { label: string; children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition ${danger ? "border-red-200 text-red-700 hover:bg-red-50" : "border-padap-line text-padap-muted hover:bg-padap-field hover:text-padap-ink"}`}
    >
      {children}
    </button>
  );
}

function ItemTotals({ item }: { item: QuotationItem }) {
  const totals = quotationItemTotals(item);

  return (
    <div className="grid gap-2 rounded-lg border border-padap-line bg-padap-field p-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
      <SummaryValue label="Custo total" value={formatarMoedaBRL(totals.costTotal)} />
      <SummaryValue label="Valor total" value={formatarMoedaBRL(totals.revenueTotal)} />
      <SummaryValue label="Lucro bruto" value={formatarMoedaBRL(totals.profit)} />
      <SummaryValue label="Margem" value={`${totals.marginPercent.toFixed(1)}%`} />
    </div>
  );
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-padap-muted">{label}</p>
      <p className="mt-1 font-bold text-padap-ink">{value}</p>
    </div>
  );
}
