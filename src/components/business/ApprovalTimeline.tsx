import type { Approval } from "../../types";
import { formatDateTime } from "../../utils/date";
import { Card } from "../ui/Card";

export function ApprovalTimeline({ approval }: { approval: Approval }) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-block h-3.5 w-1 rounded-full bg-padap-green" />
        <h3 className="text-sm font-bold text-padap-ink">Timeline de Aprovação</h3>
      </div>
      <div className="space-y-3">
        {approval.history.map((item, index) => (
          <div key={index} className="border-l border-padap-green/40 pl-4">
            <p className="text-sm font-semibold text-white">{item.text}</p>
            <p className="text-xs text-slate-500">{item.user} - {formatDateTime(item.date)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
