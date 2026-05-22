import { Copy, ExternalLink, Save } from "lucide-react";
import { useMemo, useState } from "react";
import type { Quotation } from "../../types";
import { whatsappHref } from "../../services/whatsappService";
import { buildConsultantQuotationMessage } from "../../utils/whatsappMessageBuilder";
import { simulatedAction } from "../../utils/uiActions";
import { Button } from "../ui/Button";

export function ConsultantMessageCard({ quotation, onSave }: { quotation: Quotation; onSave: (message: string) => void }) {
  const [message, setMessage] = useState("");
  const generated = useMemo(() => buildConsultantQuotationMessage(quotation), [quotation]);
  const visibleMessage = message || generated;

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#071918]/80 p-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-white">Mensagem para consultor</h2>
        <Button variant="ghost" onClick={() => setMessage(generated)}>Gerar mensagem</Button>
      </div>
      <textarea
        value={visibleMessage}
        onChange={(event) => setMessage(event.target.value)}
        rows={8}
        className="w-full resize-y rounded-lg border border-white/10 bg-black/25 p-3 text-sm leading-6 text-slate-200 outline-none focus:border-padap-green/60"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => navigator.clipboard.writeText(visibleMessage).then(() => simulatedAction("Mensagem copiada."))}><Copy size={16} />Copiar mensagem</Button>
        <a className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.08]" href={whatsappHref(visibleMessage)} target="_blank"><ExternalLink size={16} />Abrir WhatsApp</a>
        <Button variant="ghost" onClick={() => onSave(visibleMessage)}><Save size={16} />Salvar cotação</Button>
      </div>
    </section>
  );
}
