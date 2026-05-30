import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Sparkline } from "../charts/Sparkline";
import { IndicatorMini, MiniMetric, SectionTop, normalizeSearch } from "./MarketUI";
import type { MarketCommercialIndicator, MarketCommercialStatus, ExchangeRatioItem, ProductAttention } from "../../types";
import type { MarketRealityIndicator } from "../../services/marketRealityService";
import { formatCurrency, formatPercent, formatDateTime, priorityTone } from "../../utils/marketFormatting";
import type { mockMarketVsPadap } from "../../data/mockMarketIndicators";
import type { ImpactedProposal } from "../../types";

export function findIndicator(indicators: MarketRealityIndicator[], keys: string[]) {
  return indicators.find((indicator) => {
    const text = normalizeSearch(`${indicator.name} ${indicator.note} ${indicator.trend}`);
    return keys.some((key) => text.includes(normalizeSearch(key)));
  });
}

function calculateMarketCommercialStatus(indicator: MarketCommercialIndicator): { status: MarketCommercialStatus; reason: string } {
  if (indicator.currentMargin < indicator.minimumMargin) {
    return {
      status: "aprovação necessária",
      reason: `Margem atual de ${formatPercent(indicator.currentMargin)} abaixo da mínima de ${formatPercent(indicator.minimumMargin)}.`
    };
  }
  if (new Date(indicator.proposalValidity).getTime() < Date.now()) {
    return { status: "revisar", reason: "Validade da proposta vencida; recalcular antes de liberar." };
  }
  if (Math.abs(indicator.dollarVariationSinceLastUpdate) > 1.5) {
    return {
      status: "revisar",
      reason: `Dólar variou ${formatPercent(indicator.dollarVariationSinceLastUpdate)} desde a última atualização.`
    };
  }
  return { status: "liberado", reason: "Margem, validade e câmbio dentro das regras comerciais simuladas." };
}

function commercialStatusTone(status: MarketCommercialStatus): "green" | "amber" | "red" | "cyan" | "neutral" {
  if (status === "liberado") return "green";
  if (status === "aprovação necessária") return "red";
  if (status === "revisar" || status === "vencido") return "amber";
  return "neutral";
}

function familyTone(family: MarketCommercialIndicator["productFamily"]): "green" | "amber" | "red" | "cyan" | "neutral" {
  if (family === "nitrogenado") return "red";
  if (family === "fosfatado" || family === "NPK") return "amber";
  if (family === "potássico") return "green";
  if (family === "foliar") return "cyan";
  return "neutral";
}

// ─── CurrencyPtaxCard ───────────────────────────────────────────────────────

interface CurrencyPtaxCardProps {
  indicators: MarketRealityIndicator[];
  proposals: ImpactedProposal[];
  onDetails: () => void;
}

const fallbackPtax: MarketRealityIndicator = {
  name: "PTAX", value: "5,18", day: 0.95, week: 1.7, trend: "Alta leve",
  source: "Banco Central", updated: "--:--", history: [5.08, 5.11, 5.13, 5.16, 5.18],
  confidence: "internal", note: "Fallback interno enquanto a fonte oficial carrega."
};

export function CurrencyPtaxCard({ indicators, proposals, onDetails }: CurrencyPtaxCardProps) {
  const ptax = findIndicator(indicators, ["ptax"]) ?? fallbackPtax;
  const riskyProposals = proposals
    .filter((p) => p.impactReason.toLowerCase().includes("ptax") || p.impactReason.toLowerCase().includes("câmbio"))
    .slice(0, 3);
  const isPositive = ptax.day >= 0;
  const portfolioImpact = Math.abs(ptax.day / 100 * 0.4 * proposals.reduce((sum, p) => sum + (p.value ?? 0), 0));
  const impactLabel = portfolioImpact > 0
    ? `PTAX ${ptax.day >= 0 ? "+" : ""}${ptax.day.toFixed(1)}% → pressão estimada de ${formatCurrency(portfolioImpact)} no portfólio`
    : "Aguardando dados de portfólio.";

  return (
    <Card>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <SectionTop title="Câmbio/PTAX" action={<Badge tone={isPositive ? "amber" : "green"}>{isPositive ? "Pressão cambial" : "Alívio cambial"}</Badge>} />
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-padap-muted">Referência atual</p>
              <p className="mt-1 text-4xl font-semibold text-padap-ink">{ptax.value}</p>
              <p className="mt-2 text-sm leading-6 text-padap-muted">{ptax.trend} - {ptax.source}</p>
            </div>
            {isPositive ? <TrendingUp size={30} className="text-amber-200" /> : <TrendingDown size={30} className="text-padap-emerald" />}
          </div>
          <div className="mt-4 h-12">
            <Sparkline data={ptax.history.map((value) => ({ value }))} color={isPositive ? "#f6b73c" : "#1dba2c"} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <IndicatorMini label="Hoje" value={formatPercent(ptax.day)} tone={isPositive ? "amber" : "green"} />
            <IndicatorMini label="Semana" value={formatPercent(ptax.week)} tone={ptax.week >= 0 ? "amber" : "green"} />
          </div>
          <p className={`mt-3 rounded-lg border px-3 py-2 text-xs font-semibold ${isPositive ? "border-amber-200/40 bg-amber-50 text-amber-700" : "border-padap-green/20 bg-padap-green/5 text-padap-emerald"}`}>
            {impactLabel}
          </p>
        </div>
        <div className="rounded-lg border border-padap-line bg-padap-field p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-padap-ink">Decisão comercial</h3>
              <p className="mt-1 rounded-lg border-l-4 border-padap-green bg-padap-green/[0.06] px-3 py-2 text-sm leading-6 text-padap-muted">Usar validade curta e revisar propostas antigas antes de confirmar preço indexado.</p>
            </div>
            <Button variant="ghost" onClick={onDetails}>Ver impactos</Button>
          </div>
          <div className="mt-4 space-y-3">
            {riskyProposals.length ? riskyProposals.map((proposal) => (
              <div key={proposal.id} className="rounded-lg border border-padap-line bg-padap-field p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-padap-ink">{proposal.id} - {proposal.client}</p>
                  <Badge tone={priorityTone(proposal.priority)}>{proposal.priority}</Badge>
                </div>
                <p className="mt-1 text-sm leading-5 text-padap-muted">{proposal.impactReason}</p>
              </div>
            )) : (
              <div className="rounded-lg border border-padap-line bg-padap-field p-3 text-sm leading-6 text-padap-muted">
                Nenhum impacto cambial crítico identificado no momento.
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── CommercialIndicatorsPanel ──────────────────────────────────────────────

export function CommercialIndicatorsPanel({ indicators }: { indicators: MarketCommercialIndicator[] }) {
  const rows = indicators.map((indicator) => ({ ...indicator, commercial: calculateMarketCommercialStatus(indicator) }));
  const released = rows.filter((item) => item.commercial.status === "liberado").length;
  const reviewOrApproval = rows.filter((item) => item.commercial.status === "revisar" || item.commercial.status === "aprovação necessária").length;
  const averagePtax = rows.reduce((total, item) => total + item.ptaxCurrent, 0) / Math.max(rows.length, 1);
  const averageDollarVariation = rows.reduce((total, item) => total + item.dollarVariationSinceLastUpdate, 0) / Math.max(rows.length, 1);

  return (
    <Card>
      <SectionTop title="Indicadores comerciais" action={<Badge tone="cyan">Dados simulados</Badge>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric value={averagePtax.toFixed(2).replace(".", ",")} label="PTAX/dólar atual" />
        <MiniMetric value={formatPercent(averageDollarVariation)} label="variação do dólar" />
        <MiniMetric value={released} label="produtos liberados" />
        <MiniMetric value={reviewOrApproval} label="revisão/aprovação" />
      </div>
      <p className="mt-4 rounded-lg border border-padap-line bg-padap-field p-3 text-xs leading-6 text-padap-muted">
        Estrutura temporária com dados simulados para validar a leitura comercial antes de conectar banco, integrações ou tabelas reais.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[1180px] w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-padap-muted">
            <tr className="bg-padap-field">
              <th className="py-3 pr-4 pl-3">PTAX/dólar atual</th>
              <th className="py-3 pr-4">Variação dólar</th>
              <th className="py-3 pr-4">Produto</th>
              <th className="py-3 pr-4">Família</th>
              <th className="py-3 pr-4 text-right">Custo base</th>
              <th className="py-3 pr-4 text-right">Preço final PADAP</th>
              <th className="py-3 pr-4 text-right">Margem mínima</th>
              <th className="py-3 pr-4 text-right">Margem atual</th>
              <th className="py-3 pr-4">Validade</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-3">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-padap-line">
            {rows.map((item) => (
              <tr key={item.id} className="transition hover:bg-padap-green/[0.04] even:bg-padap-field/40">
                <td className="py-3.5 pr-4 pl-3 font-semibold text-padap-ink">{item.ptaxCurrent.toFixed(2).replace(".", ",")}</td>
                <td className="py-3.5 pr-4 text-padap-muted">{formatPercent(item.dollarVariationSinceLastUpdate)}</td>
                <td className="py-3.5 pr-4 font-semibold text-padap-ink">{item.product}</td>
                <td className="py-3.5 pr-4"><Badge tone={familyTone(item.productFamily)}>{item.productFamily}</Badge></td>
                <td className="py-3.5 pr-4 text-right text-padap-muted">{formatCurrency(item.baseCost)}</td>
                <td className="py-3.5 pr-4 text-right font-semibold text-padap-ink">{formatCurrency(item.padapFinalPrice)}</td>
                <td className="py-3.5 pr-4 text-right text-padap-muted">{formatPercent(item.minimumMargin)}</td>
                <td className="py-3.5 pr-4 text-right text-padap-muted">{formatPercent(item.currentMargin)}</td>
                <td className="py-3.5 pr-4 text-padap-muted">{formatDateTime(item.proposalValidity)}</td>
                <td className="py-3.5 pr-4"><Badge tone={commercialStatusTone(item.commercial.status)}>{item.commercial.status}</Badge></td>
                <td className="max-w-[220px] py-3.5 pr-3">
                  <span className="block truncate text-padap-muted" title={item.commercial.reason}>{item.commercial.reason}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── FertilizerFamilyCard ───────────────────────────────────────────────────

interface FertilizerFamilyCardProps {
  family: string;
  productKeys: string[];
  indicators: MarketRealityIndicator[];
  products: ProductAttention[];
  marketVsPadap: typeof mockMarketVsPadap;
  tone: "green" | "amber" | "red" | "cyan";
}

export function FertilizerFamilyCard({ family, productKeys, indicators, products, marketVsPadap, tone }: FertilizerFamilyCardProps) {
  const indicator = findIndicator(indicators, productKeys);
  const product = products.find((item) => productKeys.some((key) => normalizeSearch(item.product).includes(key)))
    ?? products.find((item) => productKeys.some((key) => normalizeSearch(item.reason).includes(key)));
  const padap = marketVsPadap.find((item) => productKeys.some((key) => normalizeSearch(`${item.product} ${item.marketTrend}`).includes(key)));
  const score = product?.score ?? (tone === "green" ? 76 : tone === "red" ? 82 : 68);
  const isPositive = (indicator?.day ?? product?.dailyVariation ?? 0) >= 0;

  return (
    <Card>
      <div className="flex min-h-[270px] flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
              <h2 className="text-base font-bold text-padap-ink">{family}</h2>
            </div>
            <p className="mt-1 pl-3 text-sm leading-6 text-padap-muted">{product?.movement ?? indicator?.trend ?? "Monitoramento comercial"}</p>
          </div>
          <Badge tone={tone}>{product?.impact ?? padap?.status ?? "Radar"}</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <MiniMetric value={indicator?.value ?? (padap ? formatCurrency(padap.padapPrice) : "Mock")} label="referência" />
          <MiniMetric value={<span className="rounded-full bg-padap-green/10 px-2 py-0.5 text-xs font-bold text-padap-emerald">{score}/100</span>} label="score comercial" />
        </div>
        <div className="mt-4 h-10">
          <Sparkline
            data={(indicator?.history ?? [62, 66, 64, 70, score]).map((value) => ({ value }))}
            color={tone === "green" ? "#1dba2c" : tone === "red" ? "#f87171" : tone === "cyan" ? "#2d7f82" : "#f6b73c"}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <IndicatorMini label="Hoje" value={formatPercent(indicator?.day ?? product?.dailyVariation ?? 0)} tone={isPositive ? "amber" : "green"} />
          <IndicatorMini label="Semana" value={formatPercent(indicator?.week ?? product?.weeklyVariation ?? 0)} tone={(indicator?.week ?? product?.weeklyVariation ?? 0) >= 0 ? "amber" : "green"} />
        </div>
        <p className="mt-4 text-sm leading-6 text-padap-muted">{product?.reason ?? padap?.marketTrend ?? "Leitura mockada para manter a decisão sem integração externa."}</p>
        <p className="mt-auto border-t border-padap-line pt-3 text-sm font-semibold leading-6 text-padap-emerald">{product?.recommendedAction ?? padap?.recommendedAction ?? "Monitorar antes de cotar."}</p>
      </div>
    </Card>
  );
}

// ─── ExchangeDecisionCard ───────────────────────────────────────────────────

export function ExchangeDecisionCard({ ratios }: { ratios: ExchangeRatioItem[] }) {
  const main = ratios[0];
  return (
    <Card>
      <SectionTop title="Relação de troca" />
      <div className="grid gap-3 sm:grid-cols-2">
        {ratios.map((ratio) => {
          const favorable = ratio.status === "Favorável";
          return (
            <div key={ratio.id} className="rounded-lg border border-padap-line bg-padap-field p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-padap-ink">{ratio.pair}</h3>
                <Badge tone={favorable ? "green" : ratio.status === "Estável" ? "cyan" : "amber"}>{ratio.status}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <p className="text-padap-muted">Antes<br /><span className="font-semibold text-padap-ink">{ratio.previous} {ratio.unit}</span></p>
                <p className="text-padap-muted">Agora<br /><span className="font-semibold text-padap-ink">{ratio.current} {ratio.unit}</span></p>
              </div>
              <p className="mt-3 text-sm leading-6 text-padap-muted">{ratio.interpretation}</p>
            </div>
          );
        })}
      </div>
      {main && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border-l-4 border-padap-green bg-padap-green/[0.06] py-3 pl-4 pr-3">
          <TrendingUp size={14} className="mt-0.5 shrink-0 text-padap-emerald" />
          <p className="text-sm leading-6 text-padap-emerald">
            Prioridade: usar {main.pair} como argumento comercial principal quando estiver favorável ao produtor.
          </p>
        </div>
      )}
    </Card>
  );
}
