import { Copy, Plus, Trash2 } from "lucide-react";
import type { QuotationItem } from "../../types";
import { formatarMoedaBRL } from "../../utils/currency";
import { createQuotationItem, quotationItemTotals } from "../../utils/pricingCalculations";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

type Props = {
  items: QuotationItem[];
  onChange: (items: QuotationItem[], action: string) => void;
};

const numericFields: Array<keyof QuotationItem> = ["quantity", "baseCost", "freight", "taxes", "commission", "interest", "desiredMargin", "minimumMargin", "finalPrice"];

export function QuotationItemsTable({ items, onChange }: Props) {
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
    onChange(items.filter((item) => item.id !== id), "produto removido");
  }

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#061314]/55">
      <div className="flex flex-col gap-3 border-b border-white/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Itens da cotação</h2>
          <p className="mt-1 text-xs text-slate-400">Tabela compacta para 10 ou mais produtos.</p>
        </div>
        <Button onClick={addItem}><Plus size={16} />Adicionar produto</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1480px] text-left text-xs">
          <thead className="border-b border-white/[0.08] bg-white/[0.04] uppercase tracking-[0.1em] text-slate-500">
            <tr>
              {["Produto", "Fornecedor", "Qtd.", "Un.", "Custo", "Frete", "Impostos", "Comissão", "Juros", "Margem", "Mín.", "Preço final", "Valor total", "Margem %", "Status", "Ações"].map((header) => (
                <th key={header} className="whitespace-nowrap px-3 py-3 font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {items.map((item) => {
              const totals = quotationItemTotals(item);
              const tone = totals.status === "Pode enviar" ? "green" : totals.status === "Atenção" ? "amber" : totals.status === "Requer aprovação" ? "cyan" : "red";
              return (
                <tr key={item.id} className="hover:bg-padap-green/[0.035]">
                  <CellInput value={item.product} onChange={(value) => updateItem(item.id, "product", value)} className="min-w-56" />
                  <CellInput value={item.supplier} onChange={(value) => updateItem(item.id, "supplier", value)} className="min-w-40" />
                  <CellInput type="number" value={item.quantity} onChange={(value) => updateItem(item.id, "quantity", value)} />
                  <CellInput value={item.unit} onChange={(value) => updateItem(item.id, "unit", value)} />
                  <CellInput type="number" value={item.baseCost} onChange={(value) => updateItem(item.id, "baseCost", value)} />
                  <CellInput type="number" value={item.freight} onChange={(value) => updateItem(item.id, "freight", value)} />
                  <CellInput type="number" value={item.taxes} onChange={(value) => updateItem(item.id, "taxes", value)} />
                  <CellInput type="number" value={item.commission} onChange={(value) => updateItem(item.id, "commission", value)} />
                  <CellInput type="number" value={item.interest} onChange={(value) => updateItem(item.id, "interest", value)} />
                  <CellInput type="number" value={item.desiredMargin} onChange={(value) => updateItem(item.id, "desiredMargin", value)} />
                  <CellInput type="number" value={item.minimumMargin} onChange={(value) => updateItem(item.id, "minimumMargin", value)} />
                  <CellInput type="number" value={item.finalPrice} onChange={(value) => updateItem(item.id, "finalPrice", value)} />
                  <td className="px-3 py-2 text-slate-200">{formatarMoedaBRL(totals.revenueTotal)}</td>
                  <td className="px-3 py-2 text-slate-200">{totals.marginPercent.toFixed(1)}%</td>
                  <td className="px-3 py-2"><Badge tone={tone}>{totals.status}</Badge></td>
                  <td className="sticky right-0 bg-[#061314] px-3 py-2">
                    <div className="flex gap-1">
                      <button className="rounded-md border border-white/10 p-2 text-slate-300 hover:bg-white/[0.06]" onClick={() => duplicateItem(item)} title="Duplicar"><Copy size={14} /></button>
                      <button className="rounded-md border border-red-400/20 p-2 text-red-200 hover:bg-red-500/10" onClick={() => removeItem(item.id)} title="Remover"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CellInput({ value, onChange, type = "text", className = "" }: { value: string | number; onChange: (value: string) => void; type?: string; className?: string }) {
  return (
    <td className="px-2 py-2">
      <input
        type={type}
        value={value}
        step={type === "number" ? "0.01" : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-md border border-white/10 bg-black/20 px-2 py-2 text-xs text-white outline-none focus:border-padap-green/60 ${className}`}
      />
    </td>
  );
}
