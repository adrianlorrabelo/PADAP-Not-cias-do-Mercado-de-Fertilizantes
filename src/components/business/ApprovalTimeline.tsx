import type { Approval } from "../../types";
import { formatDateTime } from "../../utils/date";
import { Card } from "../ui/Card";

export function ApprovalTimeline({ approval }: { approval: Approval }) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">Timeline de Aprovação</h3>
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
