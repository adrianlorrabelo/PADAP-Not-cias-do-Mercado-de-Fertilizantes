import { supabase } from "../supabaseClient";
import type { Approval, CommercialPackage, Proposal } from "../../types";

// ── Proposals ─────────────────────────────────────────────────

export async function fetchProposals(): Promise<Proposal[]> {
  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToProposal);
}

export async function upsertProposal(proposal: Proposal): Promise<void> {
  const { error } = await supabase
    .from("proposals")
    .upsert(proposalToRow(proposal), { onConflict: "id" });
  if (error) throw error;
}

export async function deleteProposal(id: string): Promise<void> {
  const { error } = await supabase.from("proposals").delete().eq("id", id);
  if (error) throw error;
}

// ── Packages ──────────────────────────────────────────────────

export async function fetchPackages(): Promise<CommercialPackage[]> {
  const { data, error } = await supabase
    .from("commercial_packages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToPackage);
}

export async function upsertPackage(pkg: CommercialPackage): Promise<void> {
  const { error } = await supabase
    .from("commercial_packages")
    .upsert(packageToRow(pkg), { onConflict: "id" });
  if (error) throw error;
}

export async function deletePackage(id: string): Promise<void> {
  const { error } = await supabase.from("commercial_packages").delete().eq("id", id);
  if (error) throw error;
}

// ── Approvals ─────────────────────────────────────────────────

export async function fetchApprovals(): Promise<Approval[]> {
  const { data, error } = await supabase
    .from("approvals")
    .select("*")
    .order("requested_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToApproval);
}

export async function upsertApproval(approval: Approval): Promise<void> {
  const { error } = await supabase
    .from("approvals")
    .upsert(approvalToRow(approval), { onConflict: "id" });
  if (error) throw error;
}

// ── Mappers ───────────────────────────────────────────────────

function proposalToRow(p: Proposal) {
  return {
    id: p.id,
    client_id: p.clientId,
    consultant_id: p.consultantId,
    product_id: p.productId,
    quantity: p.quantity,
    unit: p.unit,
    supplier: p.supplier,
    product_cost: p.productCost,
    sale_price: p.salePrice,
    freight: p.freight,
    taxes: p.taxes,
    commission: p.commission,
    other_expenses: p.otherExpenses,
    term: p.term,
    freight_mode: p.freightMode,
    validity: p.validity,
    notes: p.notes,
    crop: p.crop,
    status: p.status,
    ptax_used: p.ptaxUsed,
    ptax_date: p.ptaxDate,
    created_by: p.createdBy,
    created_at: p.createdAt,
    updated_at: new Date().toISOString(),
    metadata: {
      assistantProductName: p.assistantProductName,
      assistantClientName: p.assistantClientName,
      assistantConsultantName: p.assistantConsultantName,
      assistantDeliveryCity: p.assistantDeliveryCity,
      assistantPriceOrigin: p.assistantPriceOrigin,
      assistantProductType: p.assistantProductType,
      assistantPricingStrategy: p.assistantPricingStrategy,
      assistantSuggestedSupplier: p.assistantSuggestedSupplier,
      assistantSuggestedMinimumMargin: p.assistantSuggestedMinimumMargin,
      assistantAvailability: p.assistantAvailability,
    },
  };
}

function rowToProposal(r: Record<string, unknown>): Proposal {
  const meta = (r.metadata as Partial<Proposal>) ?? {};
  return {
    id: r.id as string,
    clientId: r.client_id as string,
    consultantId: r.consultant_id as string,
    productId: r.product_id as string,
    quantity: Number(r.quantity),
    unit: r.unit as string,
    supplier: r.supplier as string,
    productCost: Number(r.product_cost),
    salePrice: Number(r.sale_price),
    freight: Number(r.freight),
    taxes: Number(r.taxes),
    commission: Number(r.commission),
    otherExpenses: Number(r.other_expenses),
    term: r.term as string,
    freightMode: r.freight_mode as Proposal["freightMode"],
    validity: r.validity as string,
    notes: r.notes as string,
    crop: r.crop as string,
    status: r.status as string,
    ptaxUsed: Number(r.ptax_used),
    ptaxDate: r.ptax_date as string,
    createdBy: r.created_by as string,
    createdAt: r.created_at as string,
    assistantProductName: meta.assistantProductName,
    assistantClientName: meta.assistantClientName,
    assistantConsultantName: meta.assistantConsultantName,
    assistantDeliveryCity: meta.assistantDeliveryCity,
    assistantPriceOrigin: meta.assistantPriceOrigin,
    assistantProductType: meta.assistantProductType,
    assistantPricingStrategy: meta.assistantPricingStrategy,
    assistantSuggestedSupplier: meta.assistantSuggestedSupplier,
    assistantSuggestedMinimumMargin: meta.assistantSuggestedMinimumMargin,
    assistantAvailability: meta.assistantAvailability,
  };
}

function packageToRow(p: CommercialPackage) {
  return {
    id: p.id,
    client_id: p.clientId,
    consultant_id: p.consultantId,
    crop: p.crop,
    term: p.term,
    validity: p.validity,
    notes: p.notes,
    status: p.status,
    client_profile: p.clientProfile,
    items: p.items,
    created_by: p.createdBy,
    created_at: p.createdAt,
    updated_at: new Date().toISOString(),
  };
}

function rowToPackage(r: Record<string, unknown>): CommercialPackage {
  return {
    id: r.id as string,
    clientId: r.client_id as string,
    consultantId: r.consultant_id as string,
    crop: r.crop as string,
    term: r.term as string,
    validity: r.validity as string,
    notes: r.notes as string,
    status: r.status as CommercialPackage["status"],
    clientProfile: r.client_profile as CommercialPackage["clientProfile"],
    items: (r.items as CommercialPackage["items"]) ?? [],
    createdBy: r.created_by as string,
    createdAt: r.created_at as string,
  };
}

function approvalToRow(a: Approval) {
  return {
    id: a.id,
    target_type: a.targetType,
    target_id: a.targetId,
    client_id: a.clientId,
    consultant_id: a.consultantId,
    total_value: a.totalValue,
    expected_margin: a.expectedMargin,
    term: a.term,
    reason: a.reason,
    approver: a.approver,
    requested_by: a.requestedBy,
    requested_at: a.requestedAt,
    decision: a.decision,
    observation: a.observation,
    history: a.history,
    updated_at: new Date().toISOString(),
  };
}

function rowToApproval(r: Record<string, unknown>): Approval {
  return {
    id: r.id as string,
    targetType: r.target_type as Approval["targetType"],
    targetId: r.target_id as string,
    clientId: r.client_id as string,
    consultantId: r.consultant_id as string,
    totalValue: Number(r.total_value),
    expectedMargin: Number(r.expected_margin),
    term: r.term as string,
    reason: r.reason as string,
    approver: r.approver as string,
    requestedBy: r.requested_by as string,
    requestedAt: r.requested_at as string,
    decision: r.decision as Approval["decision"],
    observation: r.observation as string,
    history: (r.history as Approval["history"]) ?? [],
  };
}
