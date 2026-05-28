import type { MarketTimelineEvent } from "../../types";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { SectionHeader } from "./MarketPrimitives";

export function MarketTimeline({ events }: { events: MarketTimelineEvent[] }) {
  return (
    <Card>
      <SectionHeader title="Linha do Tempo do Mercado" subtitle="Eventos do dia, impactos e acoes relacionadas." />
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="grid gap-3 rounded-lg border border-padap-line bg-padap-field p-3 md:grid-cols-[80px_140px_1fr_1fr]">
            <strong className="text-padap-emerald">{event.time}</strong>
            <Badge tone="cyan">{event.type}</Badge>
            <p className="text-sm text-padap-ink">{event.description}<span className="block text-xs text-padap-muted">{event.impact}</span></p>
            <p className="text-sm text-padap-cyan">{event.relatedAction}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
