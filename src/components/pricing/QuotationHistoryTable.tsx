import type { QuotationHistoryEntry } from "../../types";
import { formatarMoedaBRL } from "../../utils/currency";
import { Badge } from "../ui/Badge";

export function QuotationHistoryTable({ entries }: { entries: QuotationHistoryEntry[] }) {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#071918]/80 p-4">
      <h2 className="mb-3 text-base font-semibold text-white">Histórico recente</h2>
      <div className="overflow-x-auto">
        <table className="min-w-[760px] text-left text-sm">
          <thead className="border-b border-white/[0.08] text-xs uppercase tracking-[0.1em] text-slate-500">
            <tr>{["Data", "Cliente", "Consultor", "Itens", "Valor", "Margem", "Status", "Ação"].map((header) => <th key={header} className="px-3 py-2">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {entries.slice(0, 8).map((entry) => (
              <tr key={entry.id}>
                <td className="px-3 py-2 text-slate-400">{new Date(entry.date).toLocaleString("pt-BR")}</td>
                <td className="px-3 py-2 text-slate-200">{entry.client || "-"}</td>
                <td className="px-3 py-2 text-slate-200">{entry.consultant || "-"}</td>
                <td className="px-3 py-2 text-slate-200">{entry.itemCount}</td>
                <td className="px-3 py-2 text-slate-200">{formatarMoedaBRL(entry.totalValue)}</td>
                <td className="px-3 py-2 text-slate-200">{entry.averageMargin.toFixed(1)}%</td>
                <td className="px-3 py-2"><Badge tone={entry.status === "Pode negociar" ? "green" : entry.status === "Bloqueada" ? "red" : "amber"}>{entry.status}</Badge></td>
                <td className="px-3 py-2 text-slate-300">{entry.action}</td>
              </tr>
            ))}
            {!entries.length && (
              <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={8}>Nenhum histórico salvo ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
