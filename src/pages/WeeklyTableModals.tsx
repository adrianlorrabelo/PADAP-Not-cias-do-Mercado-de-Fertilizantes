import { RefreshCw, Trash2, Upload } from "lucide-react";
import type { Product, WeeklyTable } from "../types";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { formatarMoedaBRL } from "../utils/currency";
import { formatSignedCurrency } from "./weeklyTableUtils";
import { DetailInput, ReadOnlyDetail } from "./WeeklyTablePrimitives";

interface RemoveListModalProps {
  open: boolean;
  clearParameters: boolean;
  clearDeviations: boolean;
  onClearParametersChange: (value: boolean) => void;
  onClearDeviationsChange: (value: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function RemoveListModal({ open, clearParameters, clearDeviations, onClearParametersChange, onClearDeviationsChange, onClose, onConfirm }: RemoveListModalProps) {
  return (
    <Modal title="Remover lista atual?" open={open} onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm leading-6 text-slate-300">
          Essa ação removerá os produtos carregados em "Produtos da Semana". Os parâmetros comerciais e os desvios da lista serão mantidos, a menos que você escolha limpar também.
        </p>
        <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <label className="flex items-start gap-3 text-sm text-slate-200">
            <input type="checkbox" checked={clearParameters} onChange={(event) => onClearParametersChange(event.target.checked)} className="mt-1 h-4 w-4 rounded border-white/20 bg-black/30 accent-padap-green" />
            <span>Também limpar parâmetros comerciais</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-slate-200">
            <input type="checkbox" checked={clearDeviations} onChange={(event) => onClearDeviationsChange(event.target.checked)} className="mt-1 h-4 w-4 rounded border-white/20 bg-black/30 accent-padap-green" />
            <span>Também limpar desvios da lista</span>
          </label>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm}><Trash2 size={16} />Remover lista</Button>
        </div>
      </div>
    </Modal>
  );
}

export function ReplaceListModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal title="Substituir lista atual?" open={open} onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm leading-6 text-slate-300">
          A lista atual será substituída por uma nova planilha após a validação da importação. Parâmetros comerciais e desvios serão mantidos.
        </p>
        <div className="rounded-lg border border-padap-green/15 bg-padap-green/[0.05] px-3 py-2 text-xs leading-5 text-slate-300">
          Se a nova importação falhar ou for cancelada, a lista atual continuará na tela.
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm}><Upload size={16} />Substituir lista</Button>
        </div>
      </div>
    </Modal>
  );
}

export function RemoveDeviationModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal title="Remover linha de desvio?" open={open} onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm leading-6 text-slate-300">Remover esta linha de desvio?</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm}><Trash2 size={16} />Remover</Button>
        </div>
      </div>
    </Modal>
  );
}

export function ApplyCalculatedPriceModal({ product, onClose, onConfirm }: { product: Product | null; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal title="Aplicar preço calculado?" open={!!product} onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm leading-6 text-slate-300">
          O preço final atual será substituído pelo preço calculado usando o desvio de precificação. Deseja continuar?
        </p>
        {product && (
          <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-4 sm:grid-cols-3">
            <ReadOnlyDetail label="Preço atual" value={formatarMoedaBRL(product.finalPrice)} />
            <ReadOnlyDetail label="Preço calculado" value={formatarMoedaBRL(product.calculatedFinalPrice || 0)} />
            <ReadOnlyDetail label="Desvio usado" value={formatarMoedaBRL(product.desvioPrecificacao || 0)} />
          </div>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm}><RefreshCw size={16} />Aplicar preço calculado</Button>
        </div>
      </div>
    </Modal>
  );
}

interface EditProductModalProps {
  product: Product | null;
  table: WeeklyTable;
  calculationWarnings: string[];
  onUpdate: (id: string, patch: Partial<Product>) => void;
  onRequestApplyCalculated: (product: Product) => void;
  onClose: () => void;
}

export function EditProductModal({ product, table: _table, calculationWarnings, onUpdate, onRequestApplyCalculated, onClose }: EditProductModalProps) {
  if (!product) return null;

  const numberVal = (value: string) => Number(value.replace(",", ".")) || 0;

  return (
    <Modal title="Editar detalhes do produto" open={!!product} onClose={onClose}>
      <div className="grid gap-4">
        <div className="flex flex-col gap-3 rounded-lg border border-white/[0.08] bg-white/[0.025] p-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white" title={product.description}>{product.description || "Produto sem descricao"}</p>
            <p className="mt-1 text-xs text-slate-400">O desvio de precificacao recalcula apenas o preco calculado. O preco final atual so muda ao aplicar.</p>
          </div>
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${product.available ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {product.available ? "Disponivel" : "Indisponivel"}
          </span>
        </div>

        <div className="grid gap-4">
          <section className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Dados do produto</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <DetailInput label="Codigo" value={product.code} onChange={(value) => onUpdate(product.id, { code: value })} />
              <DetailInput label="Grupo" value={product.group} onChange={(value) => onUpdate(product.id, { group: value })} />
              <DetailInput label="Descricao" value={product.description} onChange={(value) => onUpdate(product.id, { description: value })} />
              <DetailInput label="Referencia" value={product.reference} onChange={(value) => onUpdate(product.id, { reference: value })} />
              <DetailInput label="Caracteristica" value={product.characteristic} onChange={(value) => onUpdate(product.id, { characteristic: value })} />
              <DetailInput label="Embalagem" value={product.packaging} onChange={(value) => onUpdate(product.id, { packaging: value })} />
            </div>
          </section>

          <section className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Valores da lista</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailInput label="Produtor" type="number" value={product.producerPrice} onChange={(value) => onUpdate(product.id, { producerPrice: numberVal(value) })} />
              <DetailInput label="Revenda" type="number" value={product.resellerPrice} onChange={(value) => onUpdate(product.id, { resellerPrice: numberVal(value) })} />
              <DetailInput label="Desconto" type="number" value={product.discount || 0} onChange={(value) => onUpdate(product.id, { discount: numberVal(value) })} />
              <DetailInput label="Desvio de precificacao" type="number" value={product.desvioPrecificacao || 0} onChange={(value) => onUpdate(product.id, { desvioPrecificacao: numberVal(value) })} />
              <ReadOnlyDetail label="Preco final atual/importado" value={formatarMoedaBRL(product.finalPrice)} />
            </div>
          </section>

          <section className="rounded-lg border border-padap-green/15 bg-padap-green/[0.035] p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Precificacao com desvio</h3>
                <p className="mt-1 text-xs text-slate-500">Campo individual do produto. Nao usa nem altera os desvios semanais.</p>
              </div>
              <Button
                className="min-h-9 shrink-0 px-3 py-1.5 text-xs"
                disabled={!product.calculatedFinalPrice || product.calculatedFinalPrice <= 0}
                onClick={() => onRequestApplyCalculated(product)}
              >
                <RefreshCw size={14} />Aplicar preço calculado
              </Button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <ReadOnlyDetail label="Preco final calculado" value={product.calculatedFinalPrice ? formatarMoedaBRL(product.calculatedFinalPrice) : "Incompleto"} />
              <ReadOnlyDetail label="Diferenca" value={formatSignedCurrency(product.finalPriceDifference)} />
              <ReadOnlyDetail label="Desvio usado" value={formatarMoedaBRL(product.desvioPrecificacao || 0)} />
            </div>
          </section>

          <section className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Observacoes e status</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Status
                <button
                  type="button"
                  onClick={() => onUpdate(product.id, { available: !product.available })}
                  className="mt-1.5 flex h-10 w-full items-center rounded-lg border border-white/10 bg-black/20 px-3 text-left"
                >
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${product.available ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {product.available ? "Disponivel" : "Indisponivel"}
                  </span>
                </button>
              </label>
            </div>
            {calculationWarnings.length ? (
              <div className="mt-3 rounded-lg border border-padap-amber/20 bg-padap-amber/[0.06] px-3 py-2 text-xs leading-5 text-amber-100">
                {calculationWarnings.join(" ")}
              </div>
            ) : null}
          </section>
        </div>

        {product.importWarnings?.length ? (
          <div className="rounded-lg border border-padap-amber/20 bg-padap-amber/[0.06] px-3 py-2 text-xs leading-5 text-amber-100">
            {product.importWarnings.slice(0, 3).map((item) => item.message).join(" ")}
          </div>
        ) : null}

        <div className="rounded-lg border border-padap-green/15 bg-padap-green/[0.05] px-3 py-2 text-xs leading-5 text-slate-300">
          Campos de produtor, revenda, desconto e caracteristica permanecem salvos no produto, mas ficam fora da tabela principal para manter a lista compacta.
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}><RefreshCw size={16} />Concluir</Button>
        </div>
      </div>
    </Modal>
  );
}
