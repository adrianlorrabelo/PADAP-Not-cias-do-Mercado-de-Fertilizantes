import { AlertTriangle } from "lucide-react";

export function QuotationPendingFields({ pending }: { pending: string[] }) {
  const hasPending = pending.length > 0;

  return (
    <div className={`rounded-lg border p-4 ${hasPending ? "border-padap-amber/30 bg-padap-amber/10" : "border-padap-green/25 bg-padap-green/10"}`}>
      <div className="flex gap-3">
        <AlertTriangle className={hasPending ? "text-padap-amber" : "text-padap-mint"} size={19} />
        <div>
          <h3 className="text-sm font-semibold text-white">{hasPending ? "Cotação incompleta. Revise as informações antes de enviar ao consultor." : "Cotação sem pendências relevantes."}</h3>
          {hasPending ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {pending.map((item) => (
                <span key={item} className="rounded-full border border-padap-amber/25 bg-black/20 px-2.5 py-1 text-xs font-semibold text-amber-100">{item}</span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-slate-300">As informações obrigatórias estão suficientes para seguir. O usuário ainda pode editar tudo.</p>
          )}
        </div>
      </div>
    </div>
  );
}
