import { PencilLine, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { QuotationHistoryEntry } from "../../types";
import { formatarMoedaBRL } from "../../utils/currency";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

type Props = {
  entries: QuotationHistoryEntry[];
  onEdit?: (entry: QuotationHistoryEntry) => void;
};

export function QuotationHistoryTable({ entries, onEdit }: Props) {
  const [filters, setFilters] = useState({ client: "", consultant: "", product: "", status: "" });

  const statusOptions = useMemo(() => Array.from(new Set(entries.map((entry) => entry.status))).filter(Boolean), [entries]);
  const filteredEntries = useMemo(() => {
    const normalize = (value: string) => value.toLowerCase().trim();
    const client = normalize(filters.client);
    const consultant = normalize(filters.consultant);
    const product = normalize(filters.product);

    return entries.filter((entry) => {
      const products = (entry.products || entry.quotation?.items.map((item) => item.product) || []).join(" ");
      const matchesClient = !client || normalize(entry.client).includes(client);
      const matchesConsultant = !consultant || normalize(entry.consultant).includes(consultant);
      const matchesProduct = !product || normalize(products).includes(product);
      const matchesStatus = !filters.status || entry.status === filters.status;
      return matchesClient && matchesConsultant && matchesProduct && matchesStatus;
    });
  }, [entries, filters]);

  const selectedClient = filters.client.trim();
  const clientEntries = useMemo(() => {
    if (!selectedClient) return [];
    return filteredEntries.filter((entry) => entry.client.toLowerCase().includes(selectedClient.toLowerCase()));
  }, [filteredEntries, selectedClient]);
  const clientTotal = clientEntries.reduce((sum, entry) => sum + entry.totalValue, 0);
  const clientAverageMargin = clientEntries.length ? clientEntries.reduce((sum, entry) => sum + entry.averageMargin, 0) / clientEntries.length : 0;

  return (
    <section className="rounded-xl border border-padap-line bg-white p-4 shadow-panel">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-padap-ink">Historico de cotacoes</h2>
          <p className="mt-1 text-xs font-medium text-padap-muted">Filtre por cliente, consultor ou produto e abra qualquer cotacao salva para editar.</p>
        </div>
        <Badge tone="cyan">{filteredEntries.length} registros</Badge>
      </div>

      <div className="mb-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_180px]">
        <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.12em] text-padap-muted">
          <span>Cliente</span>
          <Input value={filters.client} onChange={(event) => setFilters((current) => ({ ...current, client: event.target.value }))} placeholder="Buscar cliente" />
        </label>
        <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.12em] text-padap-muted">
          <span>Consultor</span>
          <Input value={filters.consultant} onChange={(event) => setFilters((current) => ({ ...current, consultant: event.target.value }))} placeholder="Buscar consultor" />
        </label>
        <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.12em] text-padap-muted">
          <span>Produto</span>
          <Input value={filters.product} onChange={(event) => setFilters((current) => ({ ...current, product: event.target.value }))} placeholder="Buscar produto" />
        </label>
        <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.12em] text-padap-muted">
          <span>Status</span>
          <Select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            <option value="">Todos</option>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
        </label>
      </div>

      {selectedClient && (
        <div className="mb-4 grid gap-2 rounded-lg border border-padap-line bg-padap-field p-3 text-sm sm:grid-cols-3">
          <SummaryValue label="Cotacoes do cliente" value={String(clientEntries.length)} />
          <SummaryValue label="Valor cotado" value={formatarMoedaBRL(clientTotal)} />
          <SummaryValue label="Margem media" value={`${clientAverageMargin.toFixed(1)}%`} />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-[980px] text-left text-sm">
          <thead className="border-b border-padap-line bg-padap-field text-xs uppercase tracking-[0.1em] text-padap-muted">
            <tr>{["Data", "Cliente", "Consultor", "Produtos", "Itens", "Valor", "Margem", "Status", "Acao"].map((header) => <th key={header} className="px-3 py-2">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-padap-line">
            {filteredEntries.map((entry) => {
              const products = entry.products || entry.quotation?.items.map((item) => item.product) || [];
              return (
                <tr key={entry.id}>
                  <td className="px-3 py-2 font-medium text-padap-muted">{new Date(entry.date).toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-2 font-semibold text-padap-ink">{entry.client || "-"}</td>
                  <td className="px-3 py-2 font-medium text-padap-ink">{entry.consultant || "-"}</td>
                  <td className="max-w-64 truncate px-3 py-2 font-medium text-padap-muted" title={products.join(", ")}>{products.join(", ") || "-"}</td>
                  <td className="px-3 py-2 font-medium text-padap-ink">{entry.itemCount}</td>
                  <td className="px-3 py-2 font-semibold text-padap-ink">{formatarMoedaBRL(entry.totalValue)}</td>
                  <td className="px-3 py-2 font-semibold text-padap-ink">{entry.averageMargin.toFixed(1)}%</td>
                  <td className="px-3 py-2"><Badge tone={entry.status === "Pode negociar" ? "green" : entry.status === "Bloqueada" ? "red" : "amber"}>{entry.status}</Badge></td>
                  <td className="px-3 py-2">
                    <Button variant="ghost" className="min-h-8 px-2.5 py-1 text-xs" disabled={!entry.quotation} onClick={() => onEdit?.(entry)}>
                      <PencilLine size={13} />Editar
                    </Button>
                  </td>
                </tr>
              );
            })}
            {!filteredEntries.length && (
              <tr><td className="px-3 py-6 text-center font-medium text-padap-muted" colSpan={9}><Search className="mx-auto mb-2" size={16} />Nenhuma cotacao encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
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
