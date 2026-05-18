import { AlertTriangle, CheckCircle2, Copy, MessageCircle, Radar } from "lucide-react";
import type { MarketAlert } from "../../types";
import { priorityTone } from "../../utils/marketFormatting";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { SectionHeader } from "./MarketPrimitives";

export function InternalMarketAlerts({ alerts, onAction }: { alerts: MarketAlert[]; onAction: (message: string) => void }) {
  return (
    <Card>
      <SectionHeader title="Alertas Internos de Mercado" subtitle="Alertas curtos para uso interno da PADAP." />
      <div className="grid gap-3 md:grid-cols-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center gap-2"><AlertTriangle className="text-padap-amber" size={17} /><Badge tone={priorityTone(alert.priority)}>{alert.type}</Badge></div>
            <h3 className="mt-3 font-semibold text-white">{alert.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{alert.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => onAction("Alerta copiado.")}><Copy size={14} />Copiar</Button>
              <Button variant="ghost" onClick={() => onAction("WhatsApp preparado.")}><MessageCircle size={14} />Enviar</Button>
              <Button variant="ghost" onClick={() => onAction("Impacto aberto.")}><Radar size={14} />Impacto</Button>
              <Button variant="ghost" onClick={() => onAction("Alerta marcado como resolvido.")}><CheckCircle2 size={14} />Resolver</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
