import { Copy, ExternalLink, FileText, Save } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { copyToClipboard, whatsappHref } from "../../services/whatsappService";
import { simulatedAction } from "../../utils/uiActions";

export function WhatsAppPreview({ message }: { message: string }) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-block h-3.5 w-1 rounded-full bg-padap-green" />
        <h3 className="text-sm font-bold text-padap-ink">Mensagem para WhatsApp</h3>
      </div>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-white/[0.08] bg-black/30 p-4 text-sm leading-6 text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,.03)]">{message}</pre>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => copyToClipboard(message).then(() => simulatedAction("Mensagem copiada."))}><Copy size={16} />Copiar mensagem</Button>
        <a className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.08]" href={whatsappHref(message)} target="_blank"><ExternalLink size={16} />Abrir no WhatsApp</a>
        <Button variant="ghost" onClick={() => simulatedAction("PDF comercial gerado.")}><FileText size={16} />Gerar PDF</Button>
        <Button variant="ghost" onClick={() => simulatedAction("Proposta salva.")}><Save size={16} />Salvar proposta</Button>
      </div>
    </Card>
  );
}
