import { supabase } from "../supabaseClient";

export interface PurchasePortfolioItem {
  id: string;
  pedidoCompra: string;
  fornecedor: string;
  emissao: string;
  vencimento: string;
  pedidoFornecedor: string;
  produto: string;
  qtdTon: number;
  valorTon: number;
  semaforoAprovacaoOverride?: "verde" | "amarelo" | "vermelho" | null;
  observacoes: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

type DbRow = {
  id: string;
  pedido_compra: string;
  fornecedor: string;
  emissao: string;
  vencimento: string;
  pedido_fornecedor: string;
  produto: string;
  qtd_ton: number;
  valor_ton: number;
  semaforo_aprovacao_override: "verde" | "amarelo" | "vermelho" | null;
  observacoes: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

function fromDb(row: DbRow): PurchasePortfolioItem {
  return {
    id: row.id,
    pedidoCompra: row.pedido_compra,
    fornecedor: row.fornecedor,
    emissao: row.emissao,
    vencimento: row.vencimento,
    pedidoFornecedor: row.pedido_fornecedor,
    produto: row.produto,
    qtdTon: Number(row.qtd_ton),
    valorTon: Number(row.valor_ton),
    semaforoAprovacaoOverride: row.semaforo_aprovacao_override,
    observacoes: row.observacoes,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPurchasePortfolio(): Promise<PurchasePortfolioItem[]> {
  const { data, error } = await supabase
    .from("purchase_portfolio")
    .select("*")
    .order("emissao", { ascending: false });

  if (error) throw error;
  return (data as DbRow[]).map(fromDb);
}

export async function createPurchasePortfolioItem(
  item: Omit<PurchasePortfolioItem, "id" | "createdAt" | "updatedAt" | "createdBy">,
  userId: string
): Promise<PurchasePortfolioItem> {
  const { data, error } = await supabase
    .from("purchase_portfolio")
    .insert({
      pedido_compra: item.pedidoCompra,
      fornecedor: item.fornecedor,
      emissao: item.emissao,
      vencimento: item.vencimento,
      pedido_fornecedor: item.pedidoFornecedor,
      produto: item.produto,
      qtd_ton: item.qtdTon,
      valor_ton: item.valorTon,
      semaforo_aprovacao_override: item.semaforoAprovacaoOverride ?? null,
      observacoes: item.observacoes,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return fromDb(data as DbRow);
}

export async function updatePurchasePortfolioItem(
  id: string,
  patch: Partial<Omit<PurchasePortfolioItem, "id" | "createdAt" | "updatedAt" | "createdBy">>
): Promise<PurchasePortfolioItem> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.pedidoCompra !== undefined) dbPatch.pedido_compra = patch.pedidoCompra;
  if (patch.fornecedor !== undefined) dbPatch.fornecedor = patch.fornecedor;
  if (patch.emissao !== undefined) dbPatch.emissao = patch.emissao;
  if (patch.vencimento !== undefined) dbPatch.vencimento = patch.vencimento;
  if (patch.pedidoFornecedor !== undefined) dbPatch.pedido_fornecedor = patch.pedidoFornecedor;
  if (patch.produto !== undefined) dbPatch.produto = patch.produto;
  if (patch.qtdTon !== undefined) dbPatch.qtd_ton = patch.qtdTon;
  if (patch.valorTon !== undefined) dbPatch.valor_ton = patch.valorTon;
  if (patch.semaforoAprovacaoOverride !== undefined) dbPatch.semaforo_aprovacao_override = patch.semaforoAprovacaoOverride ?? null;
  if (patch.observacoes !== undefined) dbPatch.observacoes = patch.observacoes;

  const { data, error } = await supabase
    .from("purchase_portfolio")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return fromDb(data as DbRow);
}

export async function deletePurchasePortfolioItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("purchase_portfolio")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
