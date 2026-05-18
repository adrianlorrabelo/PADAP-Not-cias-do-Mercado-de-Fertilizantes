import { useState } from "react";
import { Upload } from "lucide-react";
import { BarChartCard } from "../components/charts/BarChartCard";
import { DonutChartCard } from "../components/charts/DonutChartCard";
import { LineChartCard } from "../components/charts/LineChartCard";
import { ImportValidation } from "../components/business/ImportValidation";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Table } from "../components/ui/Table";
import { mockWeeklyTable } from "../data/mockProducts";
import { parseWeeklyTableFile } from "../services/excelImportService";
import type { WeeklyTable, WeeklyTableImport } from "../types";
import { formatarMoedaBRL } from "../utils/currency";
import { formatDateTime } from "../utils/date";
import { useAuth } from "../hooks/useAuth";

export default function WeeklyTable() {
  const { user } = useAuth();
  const [table, setTable] = useState<WeeklyTable>(() => {
    try {
      return JSON.parse(localStorage.getItem("padap.weeklyTable.active") || "null") || mockWeeklyTable;
    } catch {
      return mockWeeklyTable;
    }
  });
  const [imported, setImported] = useState<WeeklyTableImport | null>(null);
  async function onFile(file?: File) {
    if (!file) return;
    setImported(await parseWeeklyTableFile(file));
  }
  function confirmImport() {
    if (!imported) return;
    const next: WeeklyTable = { id: `wt-${Date.now()}`, supplier: imported.supplier, expiresAt: imported.expiresAt || new Date(Date.now() + 86400000).toISOString(), ptax: imported.ptax || table.ptax, freight: imported.freight || 0, icms: imported.icms || 0, marginIcms: imported.marginIcms || 0, products: imported.products, importedAt: new Date().toISOString(), importedBy: user?.name || "Sistema", active: true };
    setTable(next);
    localStorage.setItem("padap.weeklyTable.active", JSON.stringify(next));
    setImported(null);
  }
  return (
    <div>
      <div className="page-title"><h1>Tabela da Semana — Yara</h1><p>Importação, conferência e ativação da tabela semanal usando sempre a coluna Preço Final como base de venda.</p></div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><Badge tone="green">Tabela ativa</Badge><p className="mt-2 text-sm text-slate-400">Fornecedor: {table.supplier} | PTAX {table.ptax} | Importada por {table.importedBy} em {formatDateTime(table.importedAt)}</p></div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-padap-green px-4 py-2 text-sm font-semibold text-slate-950 shadow-glow"><Upload size={16} />Importar Planilha<input className="hidden" type="file" accept=".xlsx,.csv" onChange={(event) => onFile(event.target.files?.[0])} /></label>
        </div>
      </Card>
      {imported && <div className="mt-6"><ImportValidation imported={imported} onConfirm={confirmImport} onCancel={() => setImported(null)} /></div>}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <LineChartCard title="Evolução do PTAX" data={[5.06, 5.09, 5.12, table.ptax, table.ptax + 0.02].map((value, i) => ({ label: `D-${4 - i}`, value }))} />
        <BarChartCard title="Top produtos mais caros" data={[...table.products].sort((a, b) => b.finalPrice - a.finalPrice).slice(0, 5).map((p) => ({ label: p.description.split(" ")[0], value: p.finalPrice }))} />
        <DonutChartCard title="Disponíveis x indisponíveis" data={[{ label: "Disponíveis", value: table.products.filter((p) => p.available).length, color: "#39d353" }, { label: "Indisponíveis", value: table.products.filter((p) => !p.available).length, color: "#ef4444" }]} />
      </div>
      <div className="mt-6">
        <Table headers={["Código", "Grupo", "Descrição", "Embalagem", "Fornecedor", "Preço Final", "Status", "Ação"]} rows={table.products.map((p) => [p.code, p.group, p.description, p.packaging, p.supplier, formatarMoedaBRL(p.finalPrice), <Badge tone={p.available ? "green" : "red"}>{p.available ? "Disponível" : "Indisponível"}</Badge>, <Button variant="ghost">Gerar cotação</Button>])} />
      </div>
    </div>
  );
}
