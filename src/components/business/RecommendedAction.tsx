import { ArrowRight, AlertTriangle } from "lucide-react";
import { simulatedAction } from "../../utils/uiActions";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function RecommendedAction({ problem, why, action, priority, button = "Executar ação" }: { problem: string; why: string; action: string; priority: string; button?: string }) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-padap-amber/30 bg-padap-amber/10 text-padap-amber shadow-[0_0_26px_rgba(246,183,60,.08)]"><AlertTriangle size={18} /></div>
          <div>
            <p className="text-sm font-semibold text-white">{problem}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">{why}</p>
          </div>
        </div>
        <Badge tone={priority.includes("Crítico") ? "red" : priority.includes("Alta") ? "amber" : "cyan"}>{priority}</Badge>
      </div>
      <div className="rounded-lg border border-white/[0.08] bg-black/20 p-3 text-sm leading-6 text-slate-200">{action}</div>
      <Button className="self-start" onClick={() => simulatedAction(button)}>{button}<ArrowRight size={16} /></Button>
    </Card>
  );
}
