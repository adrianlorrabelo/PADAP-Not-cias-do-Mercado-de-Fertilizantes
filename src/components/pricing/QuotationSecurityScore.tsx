import { CheckCircle2, ShieldCheck, TriangleAlert } from "lucide-react";
import type { QuotationSecurityScore as Score } from "../../types";
import { Badge } from "../ui/Badge";

export function QuotationSecurityScore({ score }: { score: Score }) {
  const tone = score.classification === "Alta" ? "green" : score.classification === "Boa" ? "cyan" : score.classification === "Média" ? "amber" : "red";

  return (
    <div className="rounded-lg border border-padap-line bg-white p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-padap-ink">Nota de segurança da cotação</h3>
          <p className="mt-1 text-xs font-medium leading-5 text-padap-muted">Informativa. Não altera semáforo, envio ou status automaticamente.</p>
        </div>
        <Badge tone={tone}>{score.classification}</Badge>
      </div>
      <div className="flex items-end gap-3">
        <ShieldCheck className="mb-1 text-padap-emerald" size={28} />
        <strong className="text-4xl font-bold text-padap-ink">{score.percentage}%</strong>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-padap-line">
        <div className="h-full rounded-full bg-gradient-to-r from-padap-green to-padap-cyan" style={{ width: `${score.percentage}%` }} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <List title="Pontos positivos" icon="positive" items={score.positives.slice(0, 5)} />
        <List title="Pendências" icon="pending" items={score.pending.slice(0, 5)} />
      </div>
    </div>
  );
}

function List({ title, icon, items }: { title: string; icon: "positive" | "pending"; items: string[] }) {
  const Icon = icon === "positive" ? CheckCircle2 : TriangleAlert;
  const color = icon === "positive" ? "text-padap-emerald" : "text-padap-amber";

  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-padap-muted">{title}</p>
      <ul className="space-y-1.5 text-sm font-medium text-padap-ink">
        {(items.length ? items : ["Nenhum item relevante"]).map((item) => (
          <li key={item} className="flex gap-2">
            <Icon className={`mt-0.5 shrink-0 ${color}`} size={15} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
