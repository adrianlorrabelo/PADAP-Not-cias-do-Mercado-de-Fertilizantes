import { Copy, Download, ExternalLink, Link2, Send, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { GeneratedMarketReport, WhatsAppRecipient, WhatsAppSendHistory } from "../../types";
import { createGeneratedMarketReport, downloadMarketReportPdf, getDefaultMarketReportConfig } from "../../services/marketReportService";
import { registerWhatsAppSendHistory } from "../../services/whatsappRecipientsService";
import { copyWhatsAppMessage, createWhatsAppUrl, openWhatsAppWeb, prepareWhatsAppMessage, validatePhoneNumberBR } from "../../services/whatsappReportService";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";

export function WhatsAppReportModal({ open, onClose, report, recipients, mode = "report", briefing, history, sentBy, onHistory, onAction, onManageRecipients }: { open: boolean; onClose: () => void; report: GeneratedMarketReport | null; recipients: WhatsAppRecipient[]; mode?: "report" | "briefing"; briefing: string; history: WhatsAppSendHistory[]; sentBy: string; onHistory: (history: WhatsAppSendHistory[]) => void; onAction: (message: string) => void; onManageRecipients: () => void }) {
  const eligibleRecipients = useMemo(() => recipients.filter((recipient) => recipient.status === "ativo" && (mode === "report" ? recipient.receivesMarketReport : recipient.receivesBriefing)), [mode, recipients]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Todos");
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open) setSelectedIds(eligibleRecipients.map((recipient) => recipient.id));
  }, [eligibleRecipients, open]);

  const selectedRecipients = useMemo(() => eligibleRecipients.filter((recipient) => selectedIds.includes(recipient.id)), [eligibleRecipients, selectedIds]);
  const groups = useMemo(() => ["Todos", ...Array.from(new Set(eligibleRecipients.map((recipient) => recipient.group).filter(Boolean) as string[]))], [eligibleRecipients]);
  const visibleRecipients = useMemo(() => {
    const term = query.trim().toLowerCase();
    return eligibleRecipients.filter((recipient) => {
      const matchesGroup = group === "Todos" || recipient.group === group;
      const matchesQuery = !term || [recipient.name, recipient.role, recipient.group, recipient.formattedPhone].some((value) => value?.toLowerCase().includes(term));
      return matchesGroup && matchesQuery;
    });
  }, [eligibleRecipients, group, query]);

  useEffect(() => {
    if (!open) return;
    setMessage(prepareWhatsAppMessage(report, briefing, selectedRecipients.map((recipient) => ({
      id: recipient.id,
      name: recipient.name,
      phone: recipient.phone,
      region: recipient.group ?? "PADAP",
      status: recipient.status === "ativo" ? "Ativo" : "Inativo"
    }))));
  }, [briefing, open, report, selectedRecipients]);

  const firstSelected = selectedRecipients[0];
  const firstLink = firstSelected && validatePhoneNumberBR(firstSelected.phone) ? createWhatsAppUrl(firstSelected.phone, message) : "";

  const toggle = (id: string, checked: boolean) => setSelectedIds((current) => checked ? [...new Set([...current, id])] : current.filter((item) => item !== id));
  const selectAll = () => setSelectedIds(visibleRecipients.map((recipient) => recipient.id));
  const clearSelection = () => setSelectedIds([]);

  const copyMessage = async () => {
    const result = await copyWhatsAppMessage(message);
    onAction(result.ok ? "Mensagem copiada com sucesso." : result.message);
  };

  const copyLink = async (recipient = firstSelected) => {
    if (!recipient) {
      onAction("Selecione pelo menos um destinatário.");
      return;
    }
    if (!validatePhoneNumberBR(recipient.phone)) {
      onAction("O número de WhatsApp do destinatário está inválido.");
      return;
    }
    const url = createWhatsAppUrl(recipient.phone, message);
    const result = await copyWhatsAppMessage(url);
    onAction(result.ok ? "Link copiado com sucesso." : "Não foi possível copiar o link.");
  };

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const activeReport = report ?? createGeneratedMarketReport(getDefaultMarketReportConfig());
      await downloadMarketReportPdf(activeReport);
      onAction("PDF baixado com sucesso.");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Erro ao baixar PDF pelo WhatsApp", error);
      onAction("Não foi possível baixar o PDF. Gere o relatório novamente.");
    } finally {
      setDownloading(false);
    }
  };

  const openRecipient = (recipient: WhatsAppRecipient) => {
    if (!validatePhoneNumberBR(recipient.phone)) {
      onAction("O número de WhatsApp do destinatário está inválido.");
      return;
    }
    const result = openWhatsAppWeb(recipient.phone, message);
    if (!result.ok) {
      onAction(result.message);
      return;
    }
    registerSend("aguardando_confirmacao", recipient);
    onAction("WhatsApp Web aberto. Anexe o PDF manualmente antes de enviar.");
  };

  const openFirstRecipient = () => {
    if (!firstSelected) {
      onAction("Selecione pelo menos um destinatário.");
      return;
    }
    openRecipient(firstSelected);
  };

  const registerSend = (status: "aguardando_confirmacao" | "enviado_manual", recipient?: WhatsAppRecipient) => {
    const targets = recipient ? [recipient] : selectedRecipients;
    if (!targets.length) {
      onAction("Selecione pelo menos um destinatário.");
      return;
    }
    let nextHistory = history;
    targets.forEach((target) => {
      const result = registerWhatsAppSendHistory({
        type: mode === "report" ? "Relatório PDF" : "Briefing WhatsApp",
        reportName: report?.title ?? "Briefing WhatsApp",
        period: report?.period ?? "Hoje",
        recipient: target.name,
        whatsapp: target.formattedPhone,
        sentBy,
        status,
        message,
        reportFileName: report?.fileName,
        observation: "Método: WhatsApp Web manual."
      });
      nextHistory = result.history;
    });
    onHistory(nextHistory);
    if (status === "enviado_manual") onAction("Envio registrado com sucesso.");
  };

  return (
    <Modal title={mode === "report" ? "Enviar relatório WhatsApp" : "Enviar briefing WhatsApp"} open={open} onClose={onClose}>
      <div className="rounded-lg border border-padap-amber/30 bg-padap-amber/[0.08] p-3 text-sm leading-6 text-amber-100">
        Na versão atual, o WhatsApp Web abre com a mensagem pronta. Anexe o PDF manualmente antes de enviar.
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={onManageRecipients}><UserPlus size={14} />Cadastrar destinatário</Button>
            <Button variant="ghost" onClick={selectAll}>Selecionar todos</Button>
            <Button variant="ghost" onClick={clearSelection}>Limpar seleção</Button>
          </div>
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            <input className="min-h-10 rounded-lg border border-padap-line bg-white px-3 text-sm text-padap-ink outline-none focus:border-padap-green/70" placeholder="Buscar destinatário" value={query} onChange={(event) => setQuery(event.target.value)} />
            <Select value={group} onChange={(event) => setGroup(event.target.value)}>{groups.map((item) => <option key={item}>{item}</option>)}</Select>
          </div>
          <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
            {eligibleRecipients.length === 0 && <p className="rounded-lg border border-padap-line bg-padap-field p-3 text-sm text-padap-muted">Nenhum destinatário cadastrado. Cadastre um número de WhatsApp para enviar relatórios.</p>}
            {eligibleRecipients.length > 0 && visibleRecipients.length === 0 && <p className="rounded-lg border border-padap-line bg-padap-field p-3 text-sm text-padap-muted">Nenhum destinatário encontrado neste filtro.</p>}
            {visibleRecipients.map((recipient) => (
              <label key={recipient.id} className="flex items-start justify-between gap-3 rounded-lg border border-padap-line bg-padap-field p-3 text-sm text-padap-muted">
                <span>
                  <input className="mr-2" type="checkbox" checked={selectedIds.includes(recipient.id)} onChange={(event) => toggle(recipient.id, event.target.checked)} />
                  <span className="font-semibold text-padap-ink">{recipient.name}</span>
                  <span className="block pl-6 text-xs leading-5 text-padap-muted">{recipient.role ?? "Sem função"} - {recipient.formattedPhone} - {recipient.group ?? "Sem grupo"}</span>
                </span>
                {selectedIds.includes(recipient.id) && <Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs" onClick={(event) => { event.preventDefault(); openRecipient(recipient); }}>Abrir WhatsApp</Button>}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-3.5 w-1 rounded-full bg-padap-green" />
            <h3 className="font-bold text-padap-ink">Mensagem</h3>
          </div>
          <textarea className="min-h-64 w-full rounded-lg border border-padap-line bg-white p-3 text-sm leading-6 text-padap-ink outline-none focus:border-padap-green/70" value={message} onChange={(event) => setMessage(event.target.value)} />
          <p className="mt-2 text-sm leading-6 text-padap-muted">PDF anexado: {report?.fileName ?? "Nenhum relatório gerado ainda"} | Período: {report?.period ?? "Hoje"}</p>
          <div className="mt-3 rounded-lg border border-padap-line bg-padap-field p-3 text-xs leading-5 text-padap-muted">
            <p className="font-semibold text-padap-ink">Link gerado para teste</p>
            <p className="mt-1 break-all">{firstLink || "Selecione um destinatário válido para gerar o link."}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={openFirstRecipient}><ExternalLink size={14} />Abrir WhatsApp Web</Button>
            <Button variant="ghost" onClick={copyMessage}><Copy size={14} />Copiar mensagem</Button>
            <Button variant="ghost" onClick={() => copyLink()}><Link2 size={14} />Copiar link</Button>
            {mode === "report" && <Button variant="ghost" onClick={downloadPdf} disabled={downloading}><Download size={14} />{downloading ? "Baixando..." : "Baixar PDF"}</Button>}
            <Button variant="amber" onClick={() => registerSend("enviado_manual")}><Send size={14} />Marcar como enviado manualmente</Button>
          </div>
        </div>
      </div>

      <div className="mt-6 mb-2 flex items-center gap-2">
        <span className="inline-block h-3.5 w-1 rounded-full bg-padap-green" />
        <h3 className="font-bold text-padap-ink">Histórico de envios WhatsApp</h3>
      </div>
      <div className="mt-2 overflow-x-auto rounded-xl border border-padap-line bg-white">
        <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="bg-padap-green/[0.08] text-xs uppercase tracking-[0.12em] text-padap-emerald">
            <tr><th className="px-4 py-3">Data/hora</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Destinatário</th><th className="px-4 py-3">WhatsApp</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Enviado por</th><th className="px-4 py-3">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-padap-line">
            {history.length === 0 && <tr><td className="px-4 py-3 text-padap-muted" colSpan={7}>Nenhum envio registrado nesta sessão.</td></tr>}
            {history.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-padap-muted">{new Date(item.date).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3 text-padap-muted">{item.type}</td>
                <td className="px-4 py-3 font-semibold text-padap-ink">{item.recipient}</td>
                <td className="px-4 py-3 text-padap-muted">{item.whatsapp}</td>
                <td className="px-4 py-3 text-padap-muted">{item.status}</td>
                <td className="px-4 py-3 text-padap-muted">{item.sentBy}</td>
                <td className="px-4 py-3"><Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs" onClick={() => copyWhatsAppMessage(item.message).then((result) => onAction(result.ok ? "Mensagem copiada com sucesso." : result.message))}>Copiar mensagem</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
