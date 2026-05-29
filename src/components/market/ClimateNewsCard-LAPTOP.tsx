import { CloudRain, Flame, Snowflake, Sun, Thermometer, Wind, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import type { ClimateSeverity, ClimateEvent, ClimateEventType } from "../../data/mockClimateNews";
import { climateRegionSummary } from "../../data/mockClimateNews";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { SectionHeader } from "./MarketPrimitives";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function severityTone(s: ClimateSeverity): "red" | "amber" | "cyan" | "neutral" {
  if (s === "Crítico") return "red";
  if (s === "Atenção") return "amber";
  if (s === "Moderado") return "cyan";
  return "neutral";
}

function severityBorder(s: ClimateSeverity) {
  if (s === "Crítico") return "border-l-red-400 bg-red-50";
  if (s === "Atenção") return "border-l-amber-400 bg-amber-50/60";
  if (s === "Moderado") return "border-l-padap-emerald/50 bg-padap-emerald/[0.04]";
  return "border-l-padap-line bg-padap-field";
}

function regionDot(s: ClimateSeverity) {
  if (s === "Crítico") return "bg-red-500";
  if (s === "Atenção") return "bg-amber-400";
  if (s === "Moderado") return "bg-padap-emerald";
  return "bg-padap-muted/40";
}

function EventIcon({ type, size = 16 }: { type: ClimateEventType; size?: number }) {
  const cls = `shrink-0`;
  if (type === "Geada" || type === "Frio intenso") return <Snowflake size={size} className={`${cls} text-blue-400`} />;
  if (type === "Seca" || type === "Veranico") return <Sun size={size} className={`${cls} text-amber-500`} />;
  if (type === "Chuva excessiva") return <CloudRain size={size} className={`${cls} text-blue-500`} />;
  if (type === "Onda de calor") return <Flame size={size} className={`${cls} text-red-500`} />;
  if (type === "Granizo") return <Zap size={size} className={`${cls} text-amber-600`} />;
  if (type === "Normal") return <Thermometer size={size} className={`${cls} text-padap-emerald`} />;
  return <Wind size={size} className={`${cls} text-padap-muted`} />;
}

const ALL_FILTER = "Todos";
const SEVERITY_ORDER: ClimateSeverity[] = ["Crítico", "Atenção", "Moderado", "Informativo"];

// ─── Component ────────────────────────────────────────────────────────────────

export function ClimateNewsCard({ events }: { events: ClimateEvent[] }) {
  const [selected, setSelected] = useState<ClimateEvent | null>(null);
  const [filter, setFilter] = useState<ClimateSeverity | typeof ALL_FILTER>(ALL_FILTER);
  const [regionFilter, setRegionFilter] = useState<string>(ALL_FILTER);

  const regions = useMemo(() => [ALL_FILTER, ...Array.from(new Set(events.map((e) => e.state)))], [events]);

  const sorted = useMemo(
    () => [...events].sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)),
    [events]
  );

  const filtered = useMemo(() => sorted.filter((e) => {
    const matchSeverity = filter === ALL_FILTER || e.severity === filter;
    const matchRegion = regionFilter === ALL_FILTER || e.state === regionFilter;
    return matchSeverity && matchRegion;
  }), [sorted, filter, regionFilter]);

  const criticalCount = events.filter((e) => e.severity === "Crítico").length;
  const attentionCount = events.filter((e) => e.severity === "Atenção").length;

  return (
    <Card>
      <SectionHeader
        title="Notícias Climáticas"
        subtitle="Eventos meteorológicos com impacto direto na demanda de fertilizantes e logística de campo."
        action={
          <div className="flex flex-wrap gap-2">
            {criticalCount > 0 && <Badge tone="red">{criticalCount} crítico{criticalCount > 1 ? "s" : ""}</Badge>}
            {attentionCount > 0 && <Badge tone="amber">{attentionCount} em atenção</Badge>}
          </div>
        }
      />

      {/* Region summary bar */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex min-w-max gap-2 pb-1">
          {climateRegionSummary.map((r) => (
            <div key={r.region} className="flex items-center gap-2 rounded-lg border border-padap-line bg-padap-field px-3 py-2 text-xs">
              <span className={`h-2 w-2 shrink-0 rounded-full ${regionDot(r.severity)}`} />
              <span className="font-semibold text-padap-ink">{r.region}</span>
              <Badge tone={severityTone(r.severity)}>{r.severity}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {([ALL_FILTER, ...SEVERITY_ORDER] as (ClimateSeverity | typeof ALL_FILTER)[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              filter === s
                ? "border-padap-green/40 bg-padap-green/10 text-padap-emerald"
                : "border-padap-line bg-white text-padap-muted hover:border-padap-green/25 hover:text-padap-ink"
            }`}
          >
            {s}
          </button>
        ))}
        <div className="ml-auto flex flex-wrap gap-2">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                regionFilter === r
                  ? "border-padap-green/40 bg-padap-green/10 text-padap-emerald"
                  : "border-padap-line bg-white text-padap-muted hover:border-padap-green/25"
              }`}
            >
              {r === ALL_FILTER ? "Todos os estados" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      <div className="grid gap-3 xl:grid-cols-2">
        {filtered.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => setSelected(selected?.id === event.id ? null : event)}
            className={`w-full rounded-lg border-l-4 border border-padap-line p-4 text-left transition hover:border-padap-green/30 hover:shadow-sm ${severityBorder(event.severity)} ${selected?.id === event.id ? "ring-2 ring-padap-green/25" : ""}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <EventIcon type={event.type} />
              <Badge tone={severityTone(event.severity)}>{event.severity}</Badge>
              <span className="rounded-full border border-padap-line bg-white px-2.5 py-0.5 text-[10px] font-bold text-padap-muted">
                {event.type}
              </span>
              <span className="ml-auto text-[10px] text-padap-muted">{event.state} · {event.region}</span>
            </div>
            <h3 className="mt-2.5 font-semibold leading-snug text-padap-ink">{event.title}</h3>
            <p className="mt-1.5 text-xs leading-5 text-padap-muted line-clamp-2">{event.description}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {event.affectedCrops.map((crop) => (
                <span key={crop} className="rounded border border-padap-line bg-white px-2 py-0.5 text-[10px] text-padap-muted">{crop}</span>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-padap-muted">
              <span>{event.source}</span>
              <span className="font-semibold text-padap-muted">{event.period}</span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-lg border border-padap-line bg-padap-field p-4 text-sm text-padap-muted">
          Nenhum evento climático encontrado com os filtros selecionados.
        </p>
      )}

      {/* Expanded detail panel */}
      {selected && (
        <div className="mt-4 rounded-xl border border-padap-line bg-padap-field p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <EventIcon type={selected.type} size={18} />
            <h3 className="font-bold text-padap-ink">{selected.title}</h3>
            <Badge tone={severityTone(selected.severity)}>{selected.severity}</Badge>
          </div>
          <p className="text-sm leading-6 text-padap-muted">{selected.description}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-padap-emerald/20 bg-padap-emerald/[0.05] p-4">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-padap-emerald">Impacto em fertilizantes</p>
              <p className="text-sm leading-6 text-padap-ink">{selected.fertilizerImpact}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-700">Alerta comercial PADAP</p>
              <p className="text-sm leading-6 text-amber-900">{selected.commercialAlert}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-padap-line pt-3 text-xs text-padap-muted">
            <span><strong className="text-padap-ink">Região:</strong> {selected.region} · {selected.state}</span>
            <span><strong className="text-padap-ink">Período:</strong> {selected.period}</span>
            <span><strong className="text-padap-ink">Fonte:</strong> {selected.source}</span>
            <span><strong className="text-padap-ink">Culturas:</strong> {selected.affectedCrops.join(", ")}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
