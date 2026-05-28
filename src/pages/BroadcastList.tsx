import { useMemo, useRef, useState, type ButtonHTMLAttributes, type ChangeEvent, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { CheckCircle2, Copy, Download, Edit2, Eye, FileText, Filter, MessageCircle, Plus, Save, Search, Send, Trash2, Upload, UserPlus, Users } from "lucide-react";
import type { BroadcastHistory, BroadcastManualStatus, ProducerContact, ReportAudience } from "../types";
import {
  buildProducerMessage,
  createProducerContact,
  createProducerWhatsAppUrl,
  defaultBroadcastGroups,
  deleteProducerContact,
  duplicateProducerContact,
  getBroadcastGroups,
  getBroadcastHistory,
  getProducerContacts,
  parseGroups,
  registerBroadcastHistory,
  saveBroadcastGroups,
  saveBroadcastHistory,
  saveProducerContacts,
  uniqueClean,
  updateProducerContact,
  type ProducerContactInput
} from "../services/broadcastListService";
import { createGeneratedMarketReport, createMarketReportPdfBlob, downloadMarketReportPdf, getDefaultMarketReportConfig } from "../services/marketReportService";
import { formatPhoneNumberBR } from "../services/whatsappReportService";
import type { GeneratedMarketReport } from "../types";
import { notify } from "../utils/uiActions";

const emptyForm: ProducerContactInput = {
  name: "",
  farm: "",
  whatsapp: "",
  city: "",
  mainCrop: "Cafe",
  groups: ["PADAP"],
  notes: "",
  status: "ativo"
};

const statusLabels: Record<ProducerContact["status"], string> = {
  ativo: "Ativo",
  inativo: "Inativo"
};

const queueStatusLabels: Record<BroadcastManualStatus, string> = {
  pendente: "Pendente",
  enviado: "Enviado",
  erro: "Erro",
  nao_enviar: "Nao enviar"
};

const reportLabels: Record<ReportAudience, string> = {
  client: "PDF Cliente",
  consultant: "PDF Consultor"
};

export default function BroadcastList() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [producers, setProducers] = useState<ProducerContact[]>(() => getProducerContacts());
  const [groups, setGroups] = useState<string[]>(() => getBroadcastGroups());
  const [history, setHistory] = useState<BroadcastHistory[]>(() => getBroadcastHistory());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProducerContactInput>(emptyForm);
  const [newGroup, setNewGroup] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ crop: "Todos", city: "Todos", group: "Todos", status: "Todos" });
  const [reportType, setReportType] = useState<ReportAudience>("client");
  const [reportPeriod, setReportPeriod] = useState("Ultimos 7 dias");
  const [generatedReport, setGeneratedReport] = useState<GeneratedMarketReport | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [queueStatuses, setQueueStatuses] = useState<Record<string, BroadcastManualStatus>>({});
  const [queueNotes, setQueueNotes] = useState<Record<string, string>>({});
  const [queueMessages, setQueueMessages] = useState<Record<string, string>>({});

  const selectedProducers = useMemo(() => producers.filter((producer) => selectedIds.includes(producer.id)), [producers, selectedIds]);
  const crops = useMemo(() => uniqueClean([...defaultBroadcastGroups.slice(0, 6), ...producers.map((producer) => producer.mainCrop)]), [producers]);
  const cities = useMemo(() => uniqueClean(producers.map((producer) => producer.city)), [producers]);
  const filteredProducers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return producers.filter((producer) => {
      const matchesQuery = !term || [producer.name, producer.farm, producer.whatsapp, producer.formattedWhatsapp].some((value) => value.toLowerCase().includes(term));
      const matchesCrop = filters.crop === "Todos" || producer.mainCrop === filters.crop;
      const matchesCity = filters.city === "Todos" || producer.city === filters.city;
      const matchesGroup = filters.group === "Todos" || producer.groups.includes(filters.group);
      const matchesStatus = filters.status === "Todos" || producer.status === filters.status;
      return matchesQuery && matchesCrop && matchesCity && matchesGroup && matchesStatus;
    });
  }, [filters, producers, query]);

  const reportDate = generatedReport ? new Date(generatedReport.generatedAt).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR");

  const persistProducers = (next: ProducerContact[], message: string) => {
    saveProducerContacts(next);
    setProducers(next);
    setSelectedIds((current) => current.filter((id) => next.some((producer) => producer.id === id)));
    notify(message);
  };

  const persistGroups = (next: string[]) => {
    const cleaned = uniqueClean(next);
    saveBroadcastGroups(cleaned);
    setGroups(cleaned);
  };

  const submitProducer = () => {
    const result = editingId ? updateProducerContact(editingId, form, producers) : createProducerContact(form, producers);
    if (!result.ok) {
      notify(result.message);
      return;
    }
    persistProducers(result.producers, editingId ? "Produtor atualizado com sucesso." : "Produtor cadastrado com sucesso.");
    persistGroups([...groups, ...form.groups]);
    clearForm();
  };

  const clearForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setNewGroup("");
  };

  const startEdit = (producer: ProducerContact) => {
    setEditingId(producer.id);
    setForm({
      name: producer.name,
      farm: producer.farm,
      whatsapp: producer.formattedWhatsapp,
      city: producer.city,
      mainCrop: producer.mainCrop || "Cafe",
      groups: producer.groups,
      notes: producer.notes,
      status: producer.status
    });
  };

  const removeProducer = (producer: ProducerContact) => {
    if (!window.confirm(`Excluir ${producer.name} da lista de transmissao?`)) return;
    persistProducers(deleteProducerContact(producer.id, producers), "Produtor excluido.");
    if (editingId === producer.id) clearForm();
  };

  const duplicateProducer = (producer: ProducerContact) => {
    const result = duplicateProducerContact(producer.id, producers);
    if (!result.ok) return notify(result.message);
    persistProducers(result.producers, "Produtor duplicado. Revise o nome e WhatsApp antes de usar.");
  };

  const toggleGroup = (group: string, checked: boolean) => {
    setForm((current) => ({ ...current, groups: checked ? uniqueClean([...current.groups, group]) : current.groups.filter((item) => item !== group) }));
  };

  const addGroup = () => {
    const name = newGroup.trim();
    if (!name) return;
    persistGroups([...groups, name]);
    setForm((current) => ({ ...current, groups: uniqueClean([...current.groups, name]) }));
    setNewGroup("");
  };

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds((current) => checked ? uniqueClean([...current, id]) : current.filter((item) => item !== id));
  };

  const selectFiltered = () => setSelectedIds(uniqueClean([...selectedIds, ...filteredProducers.map((producer) => producer.id)]));
  const clearSelection = () => setSelectedIds([]);

  const changeReportType = (value: ReportAudience) => {
    if (value === "consultant" && !window.confirm("PDF Consultor pode conter leitura interna. Confirma usar esta versao nesta tela?")) return;
    setReportType(value);
    setGeneratedReport(null);
  };

  const makeReport = (audience = reportType) => createGeneratedMarketReport({
    ...getDefaultMarketReportConfig(),
    reportAudience: audience,
    period: reportPeriod as ReturnType<typeof getDefaultMarketReportConfig>["period"]
  });

  const generateReport = async () => {
    if (reportType === "consultant" && !window.confirm("Confirma gerar PDF Consultor? Use com cuidado para nao enviar dados internos ao produtor.")) return;
    setLoadingPdf(true);
    try {
      const report = makeReport(reportType);
      await downloadMarketReportPdf(report);
      setGeneratedReport(report);
      notify(`${reportLabels[reportType]} gerado e baixado com sucesso.`);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Erro ao gerar PDF para lista de transmissao", error);
      notify("Nao foi possivel gerar o PDF. Tente novamente.");
    } finally {
      setLoadingPdf(false);
    }
  };

  const previewReport = async () => {
    if (!generatedReport) {
      notify("Gere o PDF antes de visualizar.");
      return;
    }
    setLoadingPdf(true);
    try {
      const blob = await createMarketReportPdfBlob(generatedReport);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Erro ao visualizar PDF", error);
      notify("Nao foi possivel visualizar o PDF.");
    } finally {
      setLoadingPdf(false);
    }
  };

  const downloadReport = async () => {
    if (!generatedReport) {
      notify("Gere o PDF antes de baixar.");
      return;
    }
    setLoadingPdf(true);
    try {
      await downloadMarketReportPdf(generatedReport);
      notify("PDF baixado com sucesso.");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Erro ao baixar PDF", error);
      notify("Nao foi possivel baixar o PDF.");
    } finally {
      setLoadingPdf(false);
    }
  };

  const prepareQueue = () => {
    if (!selectedProducers.length) {
      notify("Selecione pelo menos um produtor para preparar o envio.");
      return;
    }
    if (!generatedReport) notify("Gere e baixe o PDF antes de abrir o WhatsApp. A fila foi preparada mesmo assim.");
    const messages = Object.fromEntries(selectedProducers.map((producer) => [producer.id, queueMessages[producer.id] || buildProducerMessage(producer.name, generatedReport?.period ?? reportPeriod)]));
    const statuses = Object.fromEntries(selectedProducers.map((producer) => [producer.id, queueStatuses[producer.id] ?? "pendente"]));
    setQueueMessages((current) => ({ ...current, ...messages }));
    setQueueStatuses((current) => ({ ...current, ...statuses }));
    notify(`Fila preparada com ${selectedProducers.length} produtor(es).`);
  };

  const copyText = async (text: string, message = "Mensagem copiada.") => {
    try {
      await navigator.clipboard.writeText(text);
      notify(message);
    } catch {
      notify("Nao foi possivel copiar. Selecione o texto manualmente.");
    }
  };

  const openWhatsApp = (producer: ProducerContact, message?: string) => {
    const finalMessage = message || queueMessages[producer.id] || buildProducerMessage(producer.name, generatedReport?.period ?? reportPeriod);
    const opened = window.open(createProducerWhatsAppUrl(producer, finalMessage), "_blank", "noopener,noreferrer");
    notify(opened ? "WhatsApp aberto. Baixe o PDF e anexe manualmente." : "O navegador bloqueou a abertura do WhatsApp.");
  };

  const setQueueStatus = (producerId: string, status: BroadcastManualStatus) => {
    setQueueStatuses((current) => ({ ...current, [producerId]: status }));
  };

  const registerHistory = (producer: ProducerContact) => {
    const message = queueMessages[producer.id] || buildProducerMessage(producer.name, generatedReport?.period ?? reportPeriod);
    const status = queueStatuses[producer.id] ?? "pendente";
    const result = registerBroadcastHistory({
      producer,
      reportType,
      reportDate,
      period: generatedReport?.period ?? reportPeriod,
      status,
      notes: queueNotes[producer.id] ?? "",
      message
    }, history);
    setHistory(result.history);
    notify("Historico registrado.");
  };

  const updateHistoryStatus = (id: string, status: BroadcastManualStatus) => {
    const next = history.map((item) => item.id === id ? { ...item, status } : item);
    saveBroadcastHistory(next);
    setHistory(next);
  };

  const exportCsv = () => {
    const rows = [
      ["nome_produtor", "fazenda", "whatsapp", "cidade", "cultura", "grupo", "observacoes"],
      ...producers.map((producer) => [
        producer.name,
        producer.farm,
        producer.formattedWhatsapp,
        producer.city,
        producer.mainCrop,
        producer.groups.join(";"),
        producer.notes
      ])
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `lista_transmissao_padap_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const importCsv = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const rows = parseCsv(text);
      const imported = rows.slice(1).map((row) => ({
        name: row[0] ?? "",
        farm: row[1] ?? "",
        whatsapp: row[2] ?? "",
        city: row[3] ?? "",
        mainCrop: row[4] ?? "",
        groups: parseGroups(row[5] ?? ""),
        notes: row[6] ?? "",
        status: "ativo" as const
      }));
      let next = producers;
      let count = 0;
      imported.forEach((item) => {
        const result = createProducerContact(item, next);
        if (result.ok) {
          next = result.producers;
          count += 1;
        }
      });
      persistProducers(next, `${count} produtor(es) importado(s).`);
      persistGroups([...groups, ...imported.flatMap((item) => item.groups), ...imported.map((item) => item.mainCrop)]);
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-2xl bg-[#f6f8f5] p-4 text-slate-900 shadow-[0_28px_80px_rgba(0,0,0,.18)] md:p-6">
      <div className="mb-5 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-padap-emerald">PADAP Intelligence</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">Lista de Transmissao</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Cadastre produtores e prepare o envio dos relatorios de mercado pelo WhatsApp de forma semi-manual e segura.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LightButton onClick={clearForm} icon={<UserPlus size={16} />}>Novo produtor</LightButton>
          <LightButton variant="secondary" onClick={() => fileInputRef.current?.click()} icon={<Upload size={16} />}>Importar CSV</LightButton>
          <LightButton variant="secondary" onClick={exportCsv} icon={<Download size={16} />}>Exportar CSV</LightButton>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={importCsv} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">{editingId ? "Editar produtor" : "Cadastro de produtor"}</h2>
            <span className="rounded-full bg-padap-green/10 px-3 py-1 text-xs font-semibold text-padap-emerald">Editavel</span>
          </div>
          <div className="space-y-3">
            <Field label="Nome do produtor *"><LightInput value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></Field>
            <Field label="Nome da fazenda *"><LightInput value={form.farm} onChange={(event) => setForm((current) => ({ ...current, farm: event.target.value }))} /></Field>
            <Field label="Numero de WhatsApp *"><LightInput placeholder="(34) 99999-9999" value={form.whatsapp} onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))} onBlur={() => setForm((current) => ({ ...current, whatsapp: formatPhoneNumberBR(current.whatsapp) }))} /></Field>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Field label="Cidade/regiao"><LightInput value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} /></Field>
              <Field label="Cultura principal"><LightInput value={form.mainCrop} onChange={(event) => setForm((current) => ({ ...current, mainCrop: event.target.value }))} /></Field>
            </div>
            <Field label="Status">
              <LightSelect value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ProducerContact["status"] }))}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </LightSelect>
            </Field>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Grupo/lista de transmissao</p>
              <div className="grid max-h-44 gap-2 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 xl:grid-cols-1">
                {groups.map((group) => (
                  <label key={group} className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.groups.includes(group)} onChange={(event) => toggleGroup(group, event.target.checked)} />
                    {group}
                  </label>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <LightInput placeholder="Novo grupo" value={newGroup} onChange={(event) => setNewGroup(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addGroup(); } }} />
                <LightButton className="px-3" onClick={addGroup} icon={<Plus size={15} />}>Add</LightButton>
              </div>
            </div>
            <Field label="Observacoes"><LightTextarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></Field>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <LightButton variant="secondary" onClick={clearForm}>Limpar</LightButton>
            <LightButton onClick={submitProducer} icon={<Save size={16} />}>Salvar</LightButton>
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Produtores cadastrados</h2>
                <p className="mt-1 text-sm text-slate-500">{filteredProducers.length} visivel(is) | {selectedProducers.length} selecionado(s)</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <LightButton variant="secondary" onClick={selectFiltered} icon={<CheckCircle2 size={15} />}>Selecionar filtrados</LightButton>
                <LightButton variant="secondary" onClick={clearSelection}>Limpar selecao</LightButton>
              </div>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
              <div className="relative xl:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <LightInput className="pl-9" placeholder="Buscar por nome, fazenda ou numero" value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
              <FilterSelect value={filters.crop} onChange={(value) => setFilters((current) => ({ ...current, crop: value }))} options={["Todos", ...crops]} />
              <FilterSelect value={filters.city} onChange={(value) => setFilters((current) => ({ ...current, city: value }))} options={["Todos", ...cities]} />
              <FilterSelect value={filters.group} onChange={(value) => setFilters((current) => ({ ...current, group: value }))} options={["Todos", ...groups]} />
              <FilterSelect value={filters.status} onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={["Todos", "ativo", "inativo"]} labels={{ ativo: "Ativo", inativo: "Inativo" }} />
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-[1120px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-3 py-3"><input type="checkbox" checked={filteredProducers.length > 0 && filteredProducers.every((producer) => selectedIds.includes(producer.id))} onChange={(event) => event.target.checked ? selectFiltered() : setSelectedIds((current) => current.filter((id) => !filteredProducers.some((producer) => producer.id === id)))} /></th>
                    <th className="px-3 py-3">Produtor</th>
                    <th className="px-3 py-3">Fazenda</th>
                    <th className="px-3 py-3">WhatsApp</th>
                    <th className="px-3 py-3">Cidade/regiao</th>
                    <th className="px-3 py-3">Cultura</th>
                    <th className="px-3 py-3">Grupo/lista</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducers.length === 0 && <tr><td colSpan={9} className="px-3 py-6 text-center text-slate-500">Nenhum produtor encontrado.</td></tr>}
                  {filteredProducers.map((producer) => (
                    <tr key={producer.id} className="align-top hover:bg-slate-50/70">
                      <td className="px-3 py-3"><input type="checkbox" checked={selectedIds.includes(producer.id)} onChange={(event) => toggleSelection(producer.id, event.target.checked)} /></td>
                      <td className="px-3 py-3 font-semibold text-slate-950">{producer.name}</td>
                      <td className="px-3 py-3 text-slate-700">{producer.farm}</td>
                      <td className="px-3 py-3 text-slate-700">{producer.formattedWhatsapp}</td>
                      <td className="px-3 py-3 text-slate-700">{producer.city || "-"}</td>
                      <td className="px-3 py-3 text-slate-700">{producer.mainCrop || "-"}</td>
                      <td className="px-3 py-3"><div className="flex flex-wrap gap-1">{producer.groups.map((group) => <LightBadge key={group}>{group}</LightBadge>)}</div></td>
                      <td className="px-3 py-3"><StatusBadge active={producer.status === "ativo"}>{statusLabels[producer.status]}</StatusBadge></td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <IconButton title="Editar" onClick={() => startEdit(producer)}><Edit2 size={14} /></IconButton>
                          <IconButton title="Duplicar" onClick={() => duplicateProducer(producer)}><Copy size={14} /></IconButton>
                          <IconButton title="Abrir WhatsApp" onClick={() => openWhatsApp(producer)}><MessageCircle size={14} /></IconButton>
                          <IconButton title="Selecionar para envio" onClick={() => toggleSelection(producer.id, true)}><Send size={14} /></IconButton>
                          <IconButton title="Excluir" danger onClick={() => removeProducer(producer)}><Trash2 size={14} /></IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-950">Relatorio para envio</h2>
              <div className="mt-4 space-y-3">
                <Field label="Tipo de PDF">
                  <LightSelect value={reportType} onChange={(event) => changeReportType(event.target.value as ReportAudience)}>
                    <option value="client">PDF Cliente</option>
                    <option value="consultant">PDF Consultor</option>
                  </LightSelect>
                </Field>
                <Field label="Periodo">
                  <LightSelect value={reportPeriod} onChange={(event) => { setReportPeriod(event.target.value); setGeneratedReport(null); }}>
                    <option>Hoje</option>
                    <option>Ultimos 7 dias</option>
                    <option>Ultimos 30 dias</option>
                    <option>Personalizado</option>
                  </LightSelect>
                </Field>
                <InfoRow label="Data do boletim" value={reportDate} />
                <InfoRow label="Arquivo" value={generatedReport?.fileName ?? "Nenhum PDF gerado"} />
                {reportType === "consultant" && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-800">PDF Consultor pode conter leitura interna. Use com confirmacao e cuidado.</div>}
                <div className="rounded-lg border border-padap-green/20 bg-padap-green/10 p-3 text-sm leading-5 text-slate-700">Baixe o PDF e anexe manualmente no WhatsApp.</div>
              </div>
              <div className="mt-4 grid gap-2">
                <LightButton onClick={generateReport} disabled={loadingPdf} icon={<FileText size={16} />}>{loadingPdf ? "Gerando..." : `Gerar ${reportLabels[reportType]}`}</LightButton>
                <LightButton variant="secondary" onClick={previewReport} disabled={loadingPdf} icon={<Eye size={16} />}>Visualizar PDF</LightButton>
                <LightButton variant="secondary" onClick={downloadReport} disabled={loadingPdf} icon={<Download size={16} />}>Baixar PDF</LightButton>
                <LightButton onClick={prepareQueue} icon={<Send size={16} />}>Preparar envio no WhatsApp</LightButton>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Fila de envio</h2>
                  <p className="mt-1 text-sm text-slate-500">{selectedProducers.length} produtor(es) selecionado(s)</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700"><Users size={15} />{selectedProducers.length}</div>
              </div>
              <div className="space-y-3">
                {selectedProducers.length === 0 && <EmptyState text="Selecione produtores na tabela para montar a fila de envio." />}
                {selectedProducers.map((producer) => {
                  const message = queueMessages[producer.id] ?? buildProducerMessage(producer.name, generatedReport?.period ?? reportPeriod);
                  return (
                    <div key={producer.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-950">{producer.name}</h3>
                          <p className="text-sm text-slate-600">{producer.farm} | {producer.formattedWhatsapp}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <LightButton className="min-h-9 px-3 py-1.5 text-xs" onClick={() => openWhatsApp(producer, message)} icon={<MessageCircle size={14} />}>Abrir WhatsApp</LightButton>
                          <LightButton variant="secondary" className="min-h-9 px-3 py-1.5 text-xs" onClick={() => copyText(message)} icon={<Copy size={14} />}>Copiar mensagem</LightButton>
                          <LightButton variant="secondary" className="min-h-9 px-3 py-1.5 text-xs" onClick={() => registerHistory(producer)} icon={<Save size={14} />}>Registrar</LightButton>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_170px]">
                        <LightTextarea rows={5} value={message} onChange={(event) => setQueueMessages((current) => ({ ...current, [producer.id]: event.target.value }))} />
                        <div className="space-y-2">
                          <LightSelect value={queueStatuses[producer.id] ?? "pendente"} onChange={(event) => setQueueStatus(producer.id, event.target.value as BroadcastManualStatus)}>
                            {Object.entries(queueStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </LightSelect>
                          <LightTextarea rows={4} placeholder="Observacao" value={queueNotes[producer.id] ?? ""} onChange={(event) => setQueueNotes((current) => ({ ...current, [producer.id]: event.target.value }))} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Historico de envios</h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Data/hora</th>
                    <th className="px-3 py-3">Produtor</th>
                    <th className="px-3 py-3">Fazenda</th>
                    <th className="px-3 py-3">Numero</th>
                    <th className="px-3 py-3">Relatorio</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Observacao</th>
                    <th className="px-3 py-3">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.length === 0 && <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-500">Nenhum envio registrado.</td></tr>}
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-3 text-slate-700">{new Date(item.sentAt).toLocaleString("pt-BR")}</td>
                      <td className="px-3 py-3 font-semibold text-slate-950">{item.producerName}</td>
                      <td className="px-3 py-3 text-slate-700">{item.farm}</td>
                      <td className="px-3 py-3 text-slate-700">{item.whatsapp}</td>
                      <td className="px-3 py-3 text-slate-700">{reportLabels[item.reportType]} | {item.period}</td>
                      <td className="px-3 py-3">
                        <LightSelect className="min-w-36" value={item.status} onChange={(event) => updateHistoryStatus(item.id, event.target.value as BroadcastManualStatus)}>
                          {Object.entries(queueStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </LightSelect>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{item.notes || "-"}</td>
                      <td className="px-3 py-3"><LightButton variant="secondary" className="min-h-8 px-3 py-1.5 text-xs" onClick={() => copyText(item.message)}>Copiar mensagem</LightButton></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<div className="mt-1">{children}</div></label>;
}

function LightInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-padap-emerald focus:ring-4 focus:ring-padap-green/10 disabled:cursor-not-allowed disabled:opacity-60 ${props.className ?? ""}`} />;
}

function LightTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-padap-emerald focus:ring-4 focus:ring-padap-green/10 ${props.className ?? ""}`} />;
}

function LightSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition focus:border-padap-emerald focus:ring-4 focus:ring-padap-green/10 disabled:cursor-not-allowed disabled:opacity-60 ${props.className ?? ""}`} />;
}

function LightButton({ children, icon, variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode; variant?: "primary" | "secondary" | "danger" }) {
  const styles = {
    primary: "border-padap-emerald bg-padap-emerald text-white hover:bg-[#0b3e41]",
    secondary: "border-slate-200 bg-white text-slate-700 hover:border-padap-emerald/40 hover:bg-padap-green/10 hover:text-slate-950",
    danger: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
  };
  return <button type="button" {...props} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}>{icon}{children}</button>;
}

function IconButton({ children, title, danger, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { title: string; danger?: boolean }) {
  return <button type="button" title={title} aria-label={title} {...props} className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${danger ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100" : "border-slate-200 bg-white text-slate-600 hover:border-padap-emerald/40 hover:bg-padap-green/10 hover:text-slate-950"}`}>{children}</button>;
}

function LightBadge({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full border border-padap-green/20 bg-padap-green/10 px-2 py-0.5 text-xs font-semibold text-padap-emerald">{children}</span>;
}

function StatusBadge({ active, children }: { active: boolean; children: ReactNode }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${active ? "border-padap-green/20 bg-padap-green/10 text-padap-emerald" : "border-slate-200 bg-slate-100 text-slate-600"}`}>{children}</span>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-1 break-all text-sm font-medium text-slate-800">{value}</p></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">{text}</div>;
}

function FilterSelect({ value, options, labels, onChange }: { value: string; options: string[]; labels?: Record<string, string>; onChange: (value: string) => void }) {
  return (
    <div className="relative">
      <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
      <LightSelect className="pl-9" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{labels?.[option] ?? option}</option>)}
      </LightSelect>
    </div>
  );
}

function escapeCsv(value: string) {
  const escaped = value.replaceAll('"', '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
