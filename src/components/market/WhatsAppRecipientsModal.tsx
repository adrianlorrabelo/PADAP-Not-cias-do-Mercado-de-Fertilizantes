import { Edit2, MessageCircle, Plus, Power, Save, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type { WhatsAppRecipient } from "../../types";
import { activateRecipient, createRecipient, deactivateRecipient, deleteRecipient, formatPhoneNumberBR, saveRecipients, updateRecipient, type RecipientInput } from "../../services/whatsappRecipientsService";
import { openWhatsAppWeb } from "../../services/whatsappReportService";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";

const emptyForm: RecipientInput = {
  name: "",
  role: "",
  phone: "",
  group: "Consultores PADAP",
  status: "ativo",
  receivesMarketReport: true,
  receivesBriefing: true,
  notes: ""
};

export function WhatsAppRecipientsModal({ open, onClose, recipients, canManage, onChange, onAction }: { open: boolean; onClose: () => void; recipients: WhatsAppRecipient[]; canManage: boolean; onChange: (recipients: WhatsAppRecipient[]) => void; onAction: (message: string) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RecipientInput>(emptyForm);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return recipients;
    return recipients.filter((recipient) => [recipient.name, recipient.role, recipient.group, recipient.formattedPhone].some((value) => value?.toLowerCase().includes(term)));
  }, [query, recipients]);

  const startNew = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (recipient: WhatsAppRecipient) => {
    setEditingId(recipient.id);
    setForm({
      name: recipient.name,
      role: recipient.role ?? "",
      phone: recipient.formattedPhone,
      group: recipient.group ?? "",
      status: recipient.status,
      receivesMarketReport: recipient.receivesMarketReport,
      receivesBriefing: recipient.receivesBriefing,
      notes: recipient.notes ?? ""
    });
  };

  const persist = (next: WhatsAppRecipient[], message: string) => {
    saveRecipients(next);
    onChange(next);
    onAction(message);
  };

  const submit = () => {
    if (!canManage) {
      onAction("Você não tem permissão para gerenciar destinatários.");
      return;
    }
    const result = editingId ? updateRecipient(editingId, form, recipients) : createRecipient(form, recipients);
    if (!result.ok) {
      onAction(result.message);
      return;
    }
    persist(result.recipients, editingId ? "Destinatário atualizado com sucesso." : "Destinatário cadastrado com sucesso.");
    startNew();
  };

  const changeStatus = (recipient: WhatsAppRecipient) => {
    if (!canManage) return onAction("Você não tem permissão para gerenciar destinatários.");
    const next = recipient.status === "ativo" ? deactivateRecipient(recipient.id, recipients) : activateRecipient(recipient.id, recipients);
    persist(next, recipient.status === "ativo" ? "Destinatário desativado." : "Destinatário ativado.");
  };

  const remove = (recipient: WhatsAppRecipient) => {
    if (!canManage) return onAction("Você não tem permissão para gerenciar destinatários.");
    persist(deleteRecipient(recipient.id, recipients), "Destinatário excluído.");
    if (editingId === recipient.id) startNew();
  };

  const testWhatsApp = (recipient: WhatsAppRecipient) => {
    const result = openWhatsAppWeb(recipient.phone, "Teste de abertura do WhatsApp PADAP Intelligence.");
    onAction(result.ok ? "WhatsApp Web aberto para teste." : result.message);
  };

  return (
    <Modal title="Gerenciar destinatários WhatsApp" open={open} onClose={onClose}>
      {!canManage && <div className="mb-4 rounded-lg border border-padap-amber/30 bg-padap-amber/[0.08] p-3 text-sm text-amber-100">Você não tem permissão para gerenciar destinatários.</div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Input placeholder="Buscar por nome, grupo ou WhatsApp" value={query} onChange={(event) => setQuery(event.target.value)} />
            {canManage && <Button variant="ghost" onClick={startNew}><Plus size={15} />Novo destinatário</Button>}
          </div>

          <div className="overflow-x-auto rounded-xl border border-padap-line bg-white">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-padap-green/[0.08] text-xs uppercase tracking-[0.12em] text-padap-emerald">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Cargo/Função</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3">Grupo/Setor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Recebe relatório</th>
                  <th className="px-4 py-3">Recebe briefing</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-padap-line">
                {filtered.map((recipient) => (
                  <tr key={recipient.id}>
                    <td className="px-4 py-3 font-semibold text-padap-ink">{recipient.name}</td>
                    <td className="px-4 py-3 text-padap-muted">{recipient.role ?? "-"}</td>
                    <td className="px-4 py-3 text-padap-muted">{recipient.formattedPhone}</td>
                    <td className="px-4 py-3 text-padap-muted">{recipient.group ?? "-"}</td>
                    <td className="px-4 py-3"><Badge tone={recipient.status === "ativo" ? "green" : "neutral"}>{recipient.status}</Badge></td>
                    <td className="px-4 py-3 text-padap-muted">{recipient.receivesMarketReport ? "Sim" : "Não"}</td>
                    <td className="px-4 py-3 text-padap-muted">{recipient.receivesBriefing ? "Sim" : "Não"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => startEdit(recipient)} disabled={!canManage}><Edit2 size={13} /></Button>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => changeStatus(recipient)} disabled={!canManage}><Power size={13} /></Button>
                        <Button variant="danger" className="h-8 w-8 p-0" onClick={() => remove(recipient)} disabled={!canManage}><Trash2 size={13} /></Button>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => testWhatsApp(recipient)}><MessageCircle size={13} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-padap-line bg-padap-field p-4">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-block h-3.5 w-1 rounded-full bg-padap-green" />
            <h3 className="font-bold text-padap-ink">{editingId ? "Editar destinatário" : "Novo destinatário"}</h3>
          </div>
          <div className="mt-4 space-y-3">
            <Field label="Nome *"><Input disabled={!canManage} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></Field>
            <Field label="Cargo/Função"><Input disabled={!canManage} value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} /></Field>
            <Field label="Telefone/WhatsApp *"><Input disabled={!canManage} value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} onBlur={() => setForm((current) => ({ ...current, phone: formatPhoneNumberBR(current.phone) }))} /></Field>
            <Field label="Grupo/Setor"><Input disabled={!canManage} value={form.group} onChange={(event) => setForm((current) => ({ ...current, group: event.target.value }))} /></Field>
            <Field label="Status"><Select disabled={!canManage} value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as "ativo" | "inativo" }))}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></Select></Field>
            <Toggle checked={form.receivesMarketReport} disabled={!canManage} label="Recebe relatório de mercado" onChange={(checked) => setForm((current) => ({ ...current, receivesMarketReport: checked }))} />
            <Toggle checked={form.receivesBriefing} disabled={!canManage} label="Recebe briefing WhatsApp" onChange={(checked) => setForm((current) => ({ ...current, receivesBriefing: checked }))} />
            <Field label="Observações"><textarea disabled={!canManage} className="min-h-20 w-full rounded-lg border border-padap-line bg-white px-3.5 py-2.5 text-sm text-padap-ink outline-none focus:border-padap-green/70 disabled:opacity-60" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></Field>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={startNew}>Limpar</Button>
            <Button onClick={submit} disabled={!canManage}><Save size={15} />Salvar alterações</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm leading-6 text-padap-muted">{label}{children}</label>;
}

function Toggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center gap-3 rounded-lg border border-padap-line bg-padap-field p-3 text-sm text-padap-muted"><input type="checkbox" disabled={disabled} checked={checked} onChange={(event) => onChange(event.target.checked)} />{label}</label>;
}
