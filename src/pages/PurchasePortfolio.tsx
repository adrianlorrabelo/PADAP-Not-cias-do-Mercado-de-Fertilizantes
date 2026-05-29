import { useState, useEffect, useMemo } from "react";
import { Download, Plus, Pencil, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";
import { formatarMoedaBRL } from "../utils/currency";
import {
  getPurchasePortfolio,
  createPurchasePortfolioItem,
  updatePurchasePortfolioItem,
  deletePurchasePortfolioItem,
  type PurchasePortfolioItem,
} from "../lib/db/purchasePortfolio";

type Semaforo = "verde" | "amarelo" | "vermelho";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function calcSemaforoVencimento(vencimento: string): Semaforo {
  const hoje = new Date();
  const v = new Date(vencimento + "T00:00:00");
  const diff = Math.ceil((v.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diff > 30) return "verde";
  if (diff >= 0) return "amarelo";
  return "vermelho";
}

function SemaforoDot({ cor }: { cor: Semaforo }) {
  const cls =
    cor === "verde"
      ? "bg-green-500"
      : cor === "amarelo"
        ? "bg-yellow-400"
        : "bg-red-500";
  return <span className={`inline-block h-3 w-3 rounded-full ${cls}`} />;
}

type FormData = {
  pedidoCompra: string;
  fornecedor: string;
  emissao: string;
  vencimento: string;
  pedidoFornecedor: string;
  produto: string;
  qtdTon: string;
  valorTon: string;
  semaforoAprovacaoOverride: "" | Semaforo;
  observacoes: string;
};

const FORM_EMPTY: FormData = {
  pedidoCompra: "",
  fornecedor: "",
  emissao: "",
  vencimento: "",
  pedidoFornecedor: "",
  produto: "",
  qtdTon: "",
  valorTon: "",
  semaforoAprovacaoOverride: "",
  observacoes: "",
};

const fieldClass =
  "w-full rounded-lg border border-padap-line bg-padap-field px-3 py-2 text-sm text-padap-ink placeholder:text-padap-muted focus:border-padap-green focus:outline-none focus:ring-1 focus:ring-padap-green";

export default function PurchasePortfolio() {
  const { user } = useAuth();
  const [items, setItems] = useState<PurchasePortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(FORM_EMPTY);
  const [saving, setSaving] = useState(false);

  async function fetchItems() {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getPurchasePortfolio();
      setItems(data);
    } catch (err) {
      console.error(err);
      setFetchError("Erro ao carregar a carteira de compras.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = useMemo(() => {
    if (!filter.trim()) return items;
    const q = filter.toLowerCase();
    return items.filter(
      (item) =>
        item.fornecedor.toLowerCase().includes(q) ||
        item.produto.toLowerCase().includes(q)
    );
  }, [items, filter]);

  const totalItens = filtered.length;
  const totalTon = filtered.reduce((s, i) => s + i.qtdTon, 0);
  const totalValor = filtered.reduce((s, i) => s + i.qtdTon * i.valorTon, 0);
  const vencendo30 = filtered.filter((i) => {
    const sv = calcSemaforoVencimento(i.vencimento);
    return sv === "amarelo" || sv === "vermelho";
  }).length;

  function openNew() {
    setEditingId(null);
    setForm(FORM_EMPTY);
    setModalOpen(true);
  }

  function openEdit(item: PurchasePortfolioItem) {
    setEditingId(item.id);
    setForm({
      pedidoCompra: item.pedidoCompra,
      fornecedor: item.fornecedor,
      emissao: item.emissao,
      vencimento: item.vencimento,
      pedidoFornecedor: item.pedidoFornecedor,
      produto: item.produto,
      qtdTon: String(item.qtdTon),
      valorTon: String(item.valorTon),
      semaforoAprovacaoOverride: item.semaforoAprovacaoOverride ?? "",
      observacoes: item.observacoes,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(FORM_EMPTY);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        pedidoCompra: form.pedidoCompra,
        fornecedor: form.fornecedor,
        emissao: form.emissao,
        vencimento: form.vencimento,
        pedidoFornecedor: form.pedidoFornecedor,
        produto: form.produto,
        qtdTon: parseFloat(form.qtdTon) || 0,
        valorTon: parseFloat(form.valorTon) || 0,
        semaforoAprovacaoOverride: (form.semaforoAprovacaoOverride || null) as Semaforo | null,
        observacoes: form.observacoes,
      };
      if (editingId) {
        await updatePurchasePortfolioItem(editingId, payload);
      } else {
        await createPurchasePortfolioItem(payload, user?.id ?? "");
      }
      await fetchItems();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar item. Verifique os dados e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deseja excluir este item da carteira? Esta ação não pode ser desfeita.")) return;
    try {
      await deletePurchasePortfolioItem(id);
      await fetchItems();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir item.");
    }
  }

  function exportExcel() {
    const today = new Date().toISOString().slice(0, 10);
    const rows = filtered.map((item) => ({
      "Sem. Aprovação": item.semaforoAprovacaoOverride ?? "verde",
      "Pedido Compra": item.pedidoCompra,
      "Fornecedor": item.fornecedor,
      "Emissão": formatDate(item.emissao),
      "Vencimento": formatDate(item.vencimento),
      "Sem. Vencimento": calcSemaforoVencimento(item.vencimento),
      "Pedido Fornecedor": item.pedidoFornecedor,
      "Produto": item.produto,
      "QTD Ton": item.qtdTon,
      "Valor Ton": item.valorTon,
      "Valor Total": item.qtdTon * item.valorTon,
    }));
    rows.push({
      "Sem. Aprovação": "verde" as Semaforo,
      "Pedido Compra": "TOTAL",
      "Fornecedor": "",
      "Emissão": "",
      "Vencimento": "",
      "Sem. Vencimento": "verde" as Semaforo,
      "Pedido Fornecedor": "",
      "Produto": "",
      "QTD Ton": filtered.reduce((s, i) => s + i.qtdTon, 0),
      "Valor Ton": 0,
      "Valor Total": filtered.reduce((s, i) => s + i.qtdTon * i.valorTon, 0),
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Carteira");
    XLSX.writeFile(wb, `Carteira_Compras_PADAP_${today}.xlsx`);
  }

  const totalQtd = filtered.reduce((s, i) => s + i.qtdTon, 0);
  const totalValorTotal = filtered.reduce((s, i) => s + i.qtdTon * i.valorTon, 0);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-padap-ink">Controle de Carteira</h1>
        <p className="mt-1 text-sm text-padap-muted">Pedidos de compra, vencimentos e semáforos</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-3xl font-bold text-padap-ink">{totalItens}</span>
          <span className="text-xs font-medium text-padap-muted">Itens na carteira</span>
        </Card>
        <Card className="flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-2xl font-bold text-padap-ink">
            {totalTon.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-medium text-padap-muted">QTD Total (Ton)</span>
        </Card>
        <Card className="flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-xl font-bold text-padap-ink">{formatarMoedaBRL(totalValor)}</span>
          <span className="text-xs font-medium text-padap-muted">Valor Total</span>
        </Card>
        <Card className="flex flex-col items-center justify-center gap-1 text-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-padap-ink">{vencendo30}</span>
            {vencendo30 > 0 && <Badge tone="amber">Atenção</Badge>}
          </div>
          <span className="text-xs font-medium text-padap-muted">Vencendo em 30 dias</span>
        </Card>
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Filtrar por fornecedor ou produto..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`flex-1 min-w-[220px] ${fieldClass}`}
        />
        <Button variant="ghost" onClick={exportExcel} className="shrink-0">
          <Download size={15} />
          Exportar Excel
        </Button>
        <Button variant="primary" onClick={openNew} className="shrink-0">
          <Plus size={15} />
          Novo item
        </Button>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-sm text-padap-muted">Carregando...</div>
          ) : fetchError ? (
            <div className="p-10 text-center text-sm text-red-600">{fetchError}</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-padap-muted">
              {filter ? "Nenhum item encontrado para o filtro informado." : "Nenhum item na carteira. Clique em \"Novo item\" para começar."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-padap-line bg-padap-field text-left">
                  <th className="whitespace-nowrap px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-padap-muted">Sem. Apr.</th>
                  <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-padap-muted">Pedido Compra</th>
                  <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-padap-muted">Fornecedor</th>
                  <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-padap-muted">Emissão</th>
                  <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-padap-muted">Vencimento</th>
                  <th className="whitespace-nowrap px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-padap-muted">Sem. Venc.</th>
                  <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-padap-muted">Pedido Forn.</th>
                  <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-padap-muted">Produto</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-padap-muted">QTD Ton</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-padap-muted">Valor Ton</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-padap-muted">Valor Total</th>
                  <th className="whitespace-nowrap px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-padap-muted">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-padap-line">
                {filtered.map((item) => {
                  const semaforoApr: Semaforo = item.semaforoAprovacaoOverride ?? "verde";
                  const semaforoVenc = calcSemaforoVencimento(item.vencimento);
                  const valorTotal = item.qtdTon * item.valorTon;
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-padap-field/60">
                      <td className="px-4 py-3 text-center">
                        <SemaforoDot cor={semaforoApr} />
                      </td>
                      <td className="px-4 py-3 font-medium text-padap-ink">{item.pedidoCompra || "—"}</td>
                      <td className="px-4 py-3 text-padap-ink">{item.fornecedor || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-padap-muted">{formatDate(item.emissao)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-padap-muted">{formatDate(item.vencimento)}</td>
                      <td className="px-4 py-3 text-center">
                        <SemaforoDot cor={semaforoVenc} />
                      </td>
                      <td className="px-4 py-3 text-padap-ink">{item.pedidoFornecedor || "—"}</td>
                      <td className="px-4 py-3 text-padap-ink">{item.produto || "—"}</td>
                      <td className="px-4 py-3 text-right font-mono text-padap-ink">
                        {item.qtdTon.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-padap-ink">{formatarMoedaBRL(item.valorTon)}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-padap-ink">{formatarMoedaBRL(valorTotal)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="rounded p-1.5 text-padap-muted transition-colors hover:bg-padap-mint hover:text-padap-green"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded p-1.5 text-padap-muted transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-padap-green/20 bg-padap-field">
                  <td colSpan={8} className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-padap-muted">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-padap-ink">
                    {totalQtd.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right font-mono font-bold text-padap-ink">
                    {formatarMoedaBRL(totalValorTotal)}
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </Card>

      {/* Modal de criação/edição */}
      <Modal
        title={editingId ? "Editar item da carteira" : "Novo item da carteira"}
        open={modalOpen}
        onClose={closeModal}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-padap-muted">Pedido Compra</label>
            <input
              type="text"
              value={form.pedidoCompra}
              onChange={(e) => setForm({ ...form, pedidoCompra: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-padap-muted">Fornecedor</label>
            <input
              type="text"
              value={form.fornecedor}
              onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-padap-muted">Emissão</label>
            <input
              type="date"
              value={form.emissao}
              onChange={(e) => setForm({ ...form, emissao: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-padap-muted">Vencimento</label>
            <input
              type="date"
              value={form.vencimento}
              onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-padap-muted">Pedido Fornecedor</label>
            <input
              type="text"
              value={form.pedidoFornecedor}
              onChange={(e) => setForm({ ...form, pedidoFornecedor: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-padap-muted">Produto</label>
            <input
              type="text"
              value={form.produto}
              onChange={(e) => setForm({ ...form, produto: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-padap-muted">QTD Ton</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={form.qtdTon}
              onChange={(e) => setForm({ ...form, qtdTon: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-padap-muted">Valor Ton (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.valorTon}
              onChange={(e) => setForm({ ...form, valorTon: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-padap-muted">Semáforo Aprovação (opcional)</label>
            <select
              value={form.semaforoAprovacaoOverride}
              onChange={(e) =>
                setForm({ ...form, semaforoAprovacaoOverride: e.target.value as FormData["semaforoAprovacaoOverride"] })
              }
              className={fieldClass}
            >
              <option value="">Automático (verde)</option>
              <option value="verde">Verde</option>
              <option value="amarelo">Amarelo</option>
              <option value="vermelho">Vermelho</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-padap-muted">Observações (opcional)</label>
            <textarea
              rows={3}
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              className={`${fieldClass} resize-none`}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={closeModal} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
