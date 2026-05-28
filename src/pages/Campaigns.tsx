import { CalendarPlus, Clipboard, Copy, Download, Eye, FilePlus2, GripVertical, Plus, Printer, Rows3, Save, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import logoUrl from "../assets/logo/padap-symbol.svg";
import {
  campaignPreviewModes,
  campaignStatuses,
  campaignThemes,
  createBlankCampaign,
  duplicateCampaign,
  loadCampaigns,
  newProductRow,
  newSectionRow,
  saveCampaigns,
  touchCampaign,
  type Campaign,
  type CampaignPreviewMode,
  type CampaignRow,
  type CampaignStatus,
  type CampaignTheme
} from "../services/campaignService";
import { formatarMoedaBRL } from "../utils/currency";
import { notify } from "../utils/uiActions";

const cropOptions = ["Cafe", "Alho", "Cenoura", "Batata", "Milho", "Soja", "HF", "Citros", "Feijao", "Cebola", "Geral", "Outra"];
const typeOptions = ["Condicao Comercial", "Campanha Promocional", "Campanha de Plantio", "Campanha de Pos-Colheita", "Campanha Nutricional", "Campanha Especial", "Tabela de Precos", "Oferta da Semana", "Outra"];
const quickTerms = ["A vista", "30 dias", "60 dias", "90 dias", "Pos-colheita", "Safra", "Mes 10", "Mes 11", "Mes 12"];

const themeStyles: Record<CampaignTheme, { accent: string; deep: string; section: string; chip: string; soft: string }> = {
  "PADAP Verde": { accent: "#1dba2c", deep: "#0f4c4f", section: "#0f7774", chip: "#e2f8e5", soft: "#edf8ef" },
  Cafe: { accent: "#7aa85f", deep: "#35533b", section: "#537a46", chip: "#eff6e8", soft: "#f4f7ee" },
  HF: { accent: "#16b7a5", deep: "#0b6e63", section: "#0f8f7f", chip: "#e5fbf7", soft: "#eefaf8" },
  Cereais: { accent: "#d5a32d", deep: "#6b541a", section: "#9a741e", chip: "#fff7df", soft: "#fbf6e9" },
  Neutro: { accent: "#94a3b8", deep: "#334155", section: "#475569", chip: "#f1f5f9", soft: "#f8fafc" }
};

function productCount(campaign: Campaign) {
  return campaign.rows.filter((row) => row.type === "product").length;
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function parsePrice(value: string) {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".").trim();
  if (!cleaned) return "";
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : value.trim();
}

function priceText(value: number | string | undefined) {
  if (value === undefined || value === "") return "";
  if (typeof value === "number") return formatarMoedaBRL(value);
  const parsed = parsePrice(String(value));
  return typeof parsed === "number" ? formatarMoedaBRL(parsed) : String(value);
}

function normalizeFooter(note: string) {
  return note.replace(/\s*•\s*/g, "\n").trim();
}

function buildShareText(campaign: Campaign) {
  const lines = [
    `${campaign.typeLabel.toUpperCase()} - ${campaign.title.toUpperCase()}`,
    campaign.subtitle,
    campaign.description || "",
    ""
  ].filter((line, index) => index > 2 || line);

  campaign.rows.forEach((row) => {
    if (row.type === "section") {
      lines.push(row.sectionTitle || "", "");
      return;
    }
    lines.push(row.productName || "");
    campaign.paymentDates.forEach((date) => {
      const value = priceText(row.prices?.[date]);
      if (value) lines.push(`${date}: ${value}`);
    });
    if (row.observation) lines.push(`Obs.: ${row.observation}`);
    lines.push("");
  });

  if (campaign.showFooterNote !== false) lines.push(...normalizeFooter(campaign.footerNote).split("\n"));
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function parsePastedData(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return null;
  const split = (line: string) => line.includes("\t") ? line.split("\t") : line.split(";");
  const first = split(lines[0]).map((cell) => cell.trim()).filter(Boolean);
  const hasHeader = first.length > 1;
  const paymentDates = hasHeader ? first.slice(1) : [];
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const rows: CampaignRow[] = dataLines.map((line) => {
    const cells = split(line).map((cell) => cell.trim());
    const name = cells[0] || "";
    const values = cells.slice(1);
    const hasNumericValue = values.some((value) => typeof parsePrice(value) === "number");
    if (!hasNumericValue) {
      return { id: crypto.randomUUID(), type: "section", sectionTitle: name.toUpperCase() };
    }
    return {
      id: crypto.randomUUID(),
      type: "product",
      productName: name,
      prices: Object.fromEntries(paymentDates.map((date, index) => [date, parsePrice(values[index] || "")])),
      observation: "",
      highlighted: false
    };
  });
  return { paymentDates, rows };
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => loadCampaigns());
  const [activeId, setActiveId] = useState(() => campaigns[0]?.id || "");
  const [pasteText, setPasteText] = useState("");
  const [printOpen, setPrintOpen] = useState(false);
  const activeCampaign = campaigns.find((campaign) => campaign.id === activeId) || campaigns[0];

  const commitCampaign = (campaign: Campaign, message?: string) => {
    const updated = touchCampaign(campaign);
    const next = campaigns.map((item) => item.id === updated.id ? updated : item);
    setCampaigns(next);
    saveCampaigns(next);
    if (message) notify(message);
  };

  const setField = <K extends keyof Campaign>(key: K, value: Campaign[K]) => {
    commitCampaign({ ...activeCampaign, [key]: value });
  };

  const createCampaign = () => {
    const nextCampaign = createBlankCampaign();
    const next = [nextCampaign, ...campaigns];
    setCampaigns(next);
    saveCampaigns(next);
    setActiveId(nextCampaign.id);
    notify("Campanha criada a partir do modelo PADAP.");
  };

  const duplicateCurrent = (campaign: Campaign) => {
    const copy = duplicateCampaign(campaign);
    const next = [copy, ...campaigns];
    setCampaigns(next);
    saveCampaigns(next);
    setActiveId(copy.id);
    notify("Campanha duplicada.");
  };

  const deleteCampaign = (campaign: Campaign) => {
    if (!window.confirm("Excluir esta campanha?")) return;
    const next = campaigns.filter((item) => item.id !== campaign.id);
    const fallback = next[0] || createBlankCampaign();
    const finalList = next.length > 0 ? next : [fallback];
    setCampaigns(finalList);
    saveCampaigns(finalList);
    setActiveId(fallback.id);
    notify("Campanha excluida.");
  };

  const markClosed = (campaign: Campaign) => {
    commitCampaign({ ...campaign, status: "Encerrada" }, "Campanha marcada como encerrada.");
  };

  const addDate = (label?: string) => {
    const base = label || "Novo prazo";
    const count = activeCampaign.paymentDates.filter((date) => date.startsWith(base)).length;
    const unique = count > 0 ? `${base} ${count + 1}` : base;
    commitCampaign({
      ...activeCampaign,
      paymentDates: [...activeCampaign.paymentDates, unique],
      rows: activeCampaign.rows.map((row) => row.type === "product" ? { ...row, prices: { ...(row.prices || {}), [unique]: "" } } : row)
    });
  };

  const updateDate = (oldDate: string, newDate: string) => {
    const trimmed = newDate.trim();
    if (!trimmed) return;
    commitCampaign({
      ...activeCampaign,
      paymentDates: activeCampaign.paymentDates.map((date) => date === oldDate ? trimmed : date),
      rows: activeCampaign.rows.map((row) => {
        if (row.type !== "product") return row;
        const prices = { ...(row.prices || {}) };
        prices[trimmed] = prices[oldDate] || "";
        delete prices[oldDate];
        return { ...row, prices };
      })
    });
  };

  const removeDate = (date: string) => {
    if (!window.confirm("Remover esta data/prazo e os precos desta coluna?")) return;
    commitCampaign({
      ...activeCampaign,
      paymentDates: activeCampaign.paymentDates.filter((item) => item !== date),
      rows: activeCampaign.rows.map((row) => {
        if (row.type !== "product") return row;
        const prices = { ...(row.prices || {}) };
        delete prices[date];
        return { ...row, prices };
      })
    });
  };

  const moveDate = (date: string, direction: -1 | 1) => {
    const index = activeCampaign.paymentDates.indexOf(date);
    const target = index + direction;
    if (target < 0 || target >= activeCampaign.paymentDates.length) return;
    const dates = [...activeCampaign.paymentDates];
    [dates[index], dates[target]] = [dates[target], dates[index]];
    commitCampaign({ ...activeCampaign, paymentDates: dates });
  };

  const updateRow = (rowId: string, patch: Partial<CampaignRow>) => {
    commitCampaign({ ...activeCampaign, rows: activeCampaign.rows.map((row) => row.id === rowId ? { ...row, ...patch } : row) });
  };

  const moveRow = (rowId: string, direction: -1 | 1) => {
    const index = activeCampaign.rows.findIndex((row) => row.id === rowId);
    const target = index + direction;
    if (target < 0 || target >= activeCampaign.rows.length) return;
    const rows = [...activeCampaign.rows];
    [rows[index], rows[target]] = [rows[target], rows[index]];
    commitCampaign({ ...activeCampaign, rows });
  };

  const duplicateRow = (row: CampaignRow) => {
    const copy: CampaignRow = { ...row, id: crypto.randomUUID(), prices: row.prices ? { ...row.prices } : undefined };
    const index = activeCampaign.rows.findIndex((item) => item.id === row.id);
    const rows = [...activeCampaign.rows];
    rows.splice(index + 1, 0, copy);
    commitCampaign({ ...activeCampaign, rows });
  };

  const removeRow = (rowId: string) => {
    commitCampaign({ ...activeCampaign, rows: activeCampaign.rows.filter((row) => row.id !== rowId) });
  };

  const importPastedData = () => {
    const parsed = parsePastedData(pasteText);
    if (!parsed) {
      notify("Cole uma tabela com produtos e datas.");
      return;
    }
    commitCampaign({ ...activeCampaign, paymentDates: parsed.paymentDates, rows: parsed.rows }, "Dados importados.");
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(buildShareText(activeCampaign));
    notify("Texto copiado.");
  };

  const stats = useMemo(() => ({
    products: productCount(activeCampaign),
    sections: activeCampaign.rows.filter((row) => row.type === "section").length,
    dates: activeCampaign.paymentDates.length
  }), [activeCampaign]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-padap-green/80">Compras &gt; Campanhas</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Modelo Visual PADAP</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">Crie campanhas comerciais reutilizaveis, edite a tabela e acompanhe a previa oficial em tempo real.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => duplicateCurrent(activeCampaign)}><Copy size={16} /> Duplicar</Button>
          <Button onClick={createCampaign}><FilePlus2 size={16} /> Nova campanha</Button>
        </div>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.08fr)_minmax(520px,0.92fr)]">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Summary label="Produtos" value={stats.products} />
            <Summary label="Prazos" value={stats.dates} />
            <Summary label="Secoes" value={stats.sections} />
          </div>

          <CampaignList campaigns={campaigns} activeId={activeId} onOpen={setActiveId} onDuplicate={duplicateCurrent} onDelete={deleteCampaign} onCloseCampaign={markClosed} />

          <Card>
            <SectionHeader title="Dados da campanha" action={<Button onClick={() => commitCampaign(activeCampaign, "Campanha salva.")}><Save size={16} /> Salvar</Button>} />
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Nome da campanha"><Input value={activeCampaign.title} onChange={(event) => setField("title", event.target.value)} /></Field>
              <Field label="Cultura">
                <Select value={cropOptions.includes(activeCampaign.crop || "") ? activeCampaign.crop : "Outra"} onChange={(event) => setField("crop", event.target.value)}>
                  {cropOptions.map((crop) => <option key={crop}>{crop}</option>)}
                </Select>
              </Field>
              {(activeCampaign.crop === "Outra" || !cropOptions.includes(activeCampaign.crop || "")) && (
                <Field label="Cultura personalizada"><Input value={activeCampaign.crop === "Outra" ? "" : activeCampaign.crop || ""} onChange={(event) => setField("crop", event.target.value)} placeholder="Digite a cultura" /></Field>
              )}
              <Field label="Tipo / selo">
                <Select value={typeOptions.includes(activeCampaign.typeLabel) ? activeCampaign.typeLabel : "Outra"} onChange={(event) => setField("typeLabel", event.target.value)}>
                  {typeOptions.map((type) => <option key={type}>{type}</option>)}
                </Select>
              </Field>
              {(activeCampaign.typeLabel === "Outra" || !typeOptions.includes(activeCampaign.typeLabel)) && (
                <Field label="Texto do selo"><Input value={activeCampaign.typeLabel === "Outra" ? "" : activeCampaign.typeLabel} onChange={(event) => setField("typeLabel", event.target.value)} placeholder="Digite o selo" /></Field>
              )}
              <Field label="Subtitulo"><Input value={activeCampaign.subtitle} onChange={(event) => setField("subtitle", event.target.value)} /></Field>
              <Field label="Descricao curta"><Input value={activeCampaign.description || ""} onChange={(event) => setField("description", event.target.value)} /></Field>
              <Field label="Status">
                <Select value={activeCampaign.status} onChange={(event) => setField("status", event.target.value as CampaignStatus)}>
                  {campaignStatuses.map((status) => <option key={status}>{status}</option>)}
                </Select>
              </Field>
              <Field label="Tema visual">
                <Select value={activeCampaign.visualTheme || "PADAP Verde"} onChange={(event) => setField("visualTheme", event.target.value as CampaignTheme)}>
                  {campaignThemes.map((theme) => <option key={theme}>{theme}</option>)}
                </Select>
              </Field>
              <Field label="Modo da previa">
                <Select value={activeCampaign.previewMode || "Normal"} onChange={(event) => setField("previewMode", event.target.value as CampaignPreviewMode)}>
                  {campaignPreviewModes.map((mode) => <option key={mode}>{mode}</option>)}
                </Select>
              </Field>
              <Field label="Observacao de rodape"><Textarea rows={2} value={activeCampaign.footerNote} onChange={(value) => setField("footerNote", value)} /></Field>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Toggle label="Mostrar logo" checked={activeCampaign.showLogo !== false} onChange={(checked) => setField("showLogo", checked)} />
              <Toggle label="Subtitulo institucional" checked={activeCampaign.showInstitutionalSubtitle !== false} onChange={(checked) => setField("showInstitutionalSubtitle", checked)} />
              <Toggle label="Mostrar rodape" checked={activeCampaign.showFooterNote !== false} onChange={(checked) => setField("showFooterNote", checked)} />
            </div>
          </Card>

          <Card>
            <SectionHeader title="Datas e prazos" action={<Button variant="ghost" onClick={() => addDate()}><CalendarPlus size={16} /> Adicionar prazo</Button>} />
            <div className="mb-3 flex flex-wrap gap-2">
              {quickTerms.map((term) => <Button key={term} variant="ghost" className="min-h-8 px-3 py-1 text-xs" onClick={() => addDate(term)}>{term}</Button>)}
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {activeCampaign.paymentDates.map((date, index) => (
                <div key={`${date}-${index}`} className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-2">
                  <GripVertical size={15} className="text-slate-500" />
                  <Input value={date} onChange={(event) => updateDate(date, event.target.value)} className="h-9 py-1.5" />
                  <IconButton label="Subir" onClick={() => moveDate(date, -1)}>↑</IconButton>
                  <IconButton label="Descer" onClick={() => moveDate(date, 1)}>↓</IconButton>
                  <IconButton label="Remover prazo" danger onClick={() => removeDate(date)}><Trash2 size={14} /></IconButton>
                </div>
              ))}
            </div>
          </Card>

          <EditableTable
            campaign={activeCampaign}
            onAddProduct={() => commitCampaign({ ...activeCampaign, rows: [...activeCampaign.rows, newProductRow(activeCampaign.paymentDates)] })}
            onAddSection={() => commitCampaign({ ...activeCampaign, rows: [...activeCampaign.rows, newSectionRow()] })}
            onRow={updateRow}
            onDuplicate={duplicateRow}
            onRemove={removeRow}
            onMove={moveRow}
          />

          <Card>
            <SectionHeader title="Colar dados" action={<Button variant="ghost" onClick={importPastedData}><Clipboard size={16} /> Importar dados colados</Button>} />
            <Textarea
              rows={7}
              value={pasteText}
              onChange={setPasteText}
              placeholder={"Produto;30/06/2026;30/08/2026;30/09/2026\nYaraLiva Nitrabor;3430;3565;3635\nPOS-COLHEITA\nSalut;59;61;61"}
            />
          </Card>
        </div>

        <aside className="space-y-5 2xl:sticky 2xl:top-5 2xl:self-start">
          <Card>
            <SectionHeader
              title="Previa oficial"
              action={<div className="flex flex-wrap gap-2"><Button variant="ghost" onClick={copyText}><Copy size={16} /> Copiar texto</Button><Button variant="ghost" onClick={() => setPrintOpen(true)}><Printer size={16} /> Preparar print</Button><Button variant="ghost" disabled><Download size={16} /> Exportacao em breve</Button></div>}
            />
            <CampaignPreview campaign={activeCampaign} />
          </Card>
        </aside>
      </div>

      {printOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-[#020807] p-4 md:p-8">
          <div className="mx-auto mb-4 flex max-w-6xl items-center justify-between gap-3 print:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-padap-green/80">Pronto para print</p>
              <h3 className="mt-1 text-xl font-semibold text-white">{activeCampaign.title}</h3>
            </div>
            <Button variant="ghost" onClick={() => setPrintOpen(false)}>Fechar</Button>
          </div>
          <div className="mx-auto max-w-6xl">
            <CampaignPreview campaign={activeCampaign} print />
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignList({ campaigns, activeId, onOpen, onDuplicate, onDelete, onCloseCampaign }: {
  campaigns: Campaign[];
  activeId: string;
  onOpen: (id: string) => void;
  onDuplicate: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
  onCloseCampaign: (campaign: Campaign) => void;
}) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-white">Campanhas salvas</h3>
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className={`rounded-lg border p-3 ${campaign.id === activeId ? "border-padap-green/35 bg-padap-green/[0.08]" : "border-white/[0.08] bg-white/[0.03]"}`}>
            <button type="button" onClick={() => onOpen(campaign.id)} className="w-full text-left">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-5 text-white">{campaign.title}</p>
                <Badge tone={campaign.status === "Ativa" ? "green" : campaign.status === "Encerrada" ? "neutral" : "amber"}>{campaign.status}</Badge>
              </div>
              <p className="mt-2 text-xs text-slate-500">{campaign.crop || "Geral"} • {productCount(campaign)} produtos • {formatDateTime(campaign.updatedAt)}</p>
            </button>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button className="min-h-8 px-3 py-1 text-xs" variant="ghost" onClick={() => onOpen(campaign.id)}>Abrir</Button>
              <Button className="min-h-8 px-3 py-1 text-xs" variant="ghost" onClick={() => onDuplicate(campaign)}>Duplicar</Button>
              <Button className="min-h-8 px-3 py-1 text-xs" variant="amber" onClick={() => onCloseCampaign(campaign)}>Encerrar</Button>
              <Button className="min-h-8 px-3 py-1 text-xs" variant="danger" onClick={() => onDelete(campaign)}>Excluir</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function EditableTable({ campaign, onAddProduct, onAddSection, onRow, onDuplicate, onRemove, onMove }: {
  campaign: Campaign;
  onAddProduct: () => void;
  onAddSection: () => void;
  onRow: (rowId: string, patch: Partial<CampaignRow>) => void;
  onDuplicate: (row: CampaignRow) => void;
  onRemove: (rowId: string) => void;
  onMove: (rowId: string, direction: -1 | 1) => void;
}) {
  return (
    <Card>
      <SectionHeader title="Tabela editavel" action={<div className="flex flex-wrap gap-2"><Button variant="ghost" onClick={onAddSection}><Rows3 size={16} /> Adicionar secao</Button><Button onClick={onAddProduct}><Plus size={16} /> Adicionar produto</Button></div>} />
      <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
        <table className="min-w-full text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="w-24 px-3 py-3 text-left">Ordem</th>
              <th className="min-w-[260px] px-3 py-3 text-left">Produto / Secao</th>
              {campaign.paymentDates.map((date) => <th key={date} className="min-w-[150px] px-3 py-3 text-left">{date}</th>)}
              <th className="min-w-[180px] px-3 py-3 text-left">Observacao</th>
              <th className="w-24 px-3 py-3 text-center">Destaque</th>
              <th className="w-28 px-3 py-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {campaign.rows.map((row) => row.type === "section" ? (
              <tr key={row.id} className="bg-padap-green/[0.12]">
                <td className="px-3 py-3">
                  <RowOrder rowId={row.id} onMove={onMove} />
                </td>
                <td colSpan={campaign.paymentDates.length + 4} className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Input value={row.sectionTitle || ""} onChange={(event) => onRow(row.id, { sectionTitle: event.target.value })} className="h-9 max-w-sm py-1.5 text-center font-semibold uppercase" />
                    <div className="ml-auto flex gap-2">
                      <IconButton label="Duplicar secao" onClick={() => onDuplicate(row)}><Copy size={14} /></IconButton>
                      <IconButton label="Remover secao" danger onClick={() => onRemove(row.id)}><Trash2 size={14} /></IconButton>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={row.id} className={`${row.highlighted ? "bg-padap-green/[0.08]" : "bg-white/[0.015]"} align-top`}>
                <td className="px-3 py-3"><RowOrder rowId={row.id} onMove={onMove} /></td>
                <td className="px-3 py-3"><Input value={row.productName || ""} onChange={(event) => onRow(row.id, { productName: event.target.value })} /></td>
                {campaign.paymentDates.map((date) => (
                  <td key={date} className="px-3 py-3">
                    <Input
                      inputMode="decimal"
                      value={row.prices?.[date] ?? ""}
                      onChange={(event) => onRow(row.id, { prices: { ...(row.prices || {}), [date]: parsePrice(event.target.value) } })}
                      placeholder="R$"
                    />
                  </td>
                ))}
                <td className="px-3 py-3"><Input value={row.observation || ""} onChange={(event) => onRow(row.id, { observation: event.target.value })} /></td>
                <td className="px-3 py-3 text-center"><input type="checkbox" checked={!!row.highlighted} onChange={(event) => onRow(row.id, { highlighted: event.target.checked })} className="h-4 w-4 accent-padap-green" /></td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-2">
                    <IconButton label="Duplicar produto" onClick={() => onDuplicate(row)}><Copy size={14} /></IconButton>
                    <IconButton label="Remover produto" danger onClick={() => onRemove(row.id)}><Trash2 size={14} /></IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function RowOrder({ rowId, onMove }: { rowId: string; onMove: (rowId: string, direction: -1 | 1) => void }) {
  return <div className="flex gap-1"><IconButton label="Mover para cima" onClick={() => onMove(rowId, -1)}>↑</IconButton><IconButton label="Mover para baixo" onClick={() => onMove(rowId, 1)}>↓</IconButton></div>;
}

function CampaignPreview({ campaign, print = false }: { campaign: Campaign; print?: boolean }) {
  const theme = themeStyles[campaign.visualTheme || "PADAP Verde"];
  const mode = campaign.previewMode || "Normal";
  const compact = mode === "Compacto";
  const ultra = mode === "Ultra compacto";
  const cellPad = ultra ? "px-2 py-1.5" : compact ? "px-2.5 py-2" : "px-4 py-3";
  const titleSize = ultra ? "text-2xl" : compact ? "text-3xl" : "text-4xl";
  const tableText = ultra ? "text-[11px]" : compact ? "text-xs" : "text-sm";

  return (
    <div className={`campaign-preview ${print ? "min-h-[640px]" : ""} overflow-hidden rounded-lg border border-white/10 bg-[#06110f] text-white shadow-[0_24px_70px_rgba(0,0,0,.35)]`}>
      <div className="relative overflow-hidden" style={{ background: `radial-gradient(circle at 8% 0%, ${theme.accent}33, transparent 30%), linear-gradient(135deg, #061513, #102923 55%, #07100f)` }}>
        <div className={`${ultra ? "p-4" : compact ? "p-5" : "p-6"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {campaign.showLogo !== false && <img src={logoUrl} alt="PADAP" className={`${ultra ? "h-9 w-9" : "h-12 w-12"} object-contain`} />}
              <div>
                <p className={`${ultra ? "text-xl" : "text-2xl"} font-black tracking-wide text-white`}>PADAP</p>
                {campaign.showInstitutionalSubtitle !== false && <p className="text-xs font-semibold uppercase tracking-[0.22em] text-padap-mint">Produtividade Agricola</p>}
              </div>
            </div>
            <span className="rounded-full border bg-white px-4 py-2 text-xs font-black uppercase tracking-wide" style={{ borderColor: theme.accent, color: theme.deep }}>{campaign.typeLabel}</span>
          </div>
          <div className={ultra ? "mt-5" : "mt-8"}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">{campaign.crop || "Geral"}</p>
            <h3 className={`mt-2 ${titleSize} font-black tracking-normal text-white`}>{campaign.title}</h3>
            <p className="mt-2 text-base font-medium text-slate-300">{campaign.subtitle}</p>
            {campaign.description && <p className="mt-1 text-sm font-medium text-slate-400">{campaign.description}</p>}
            <div className="mt-5 h-1 w-32 rounded-full" style={{ background: theme.accent }} />
          </div>
        </div>
      </div>

      <div className={`${ultra ? "p-3" : compact ? "p-4" : "p-5"} text-[#10201a]`} style={{ background: theme.soft }}>
        <div className="overflow-hidden rounded-lg border border-[#d7e4d7] bg-white">
          <table className={`w-full min-w-[620px] ${tableText}`}>
            <thead className="text-white" style={{ background: theme.deep }}>
              <tr>
                <th className={`${cellPad} text-left`}>Produto</th>
                {campaign.paymentDates.map((date) => <th key={date} className={`${cellPad} text-center`}>{date}</th>)}
              </tr>
            </thead>
            <tbody>
              {campaign.rows.map((row) => row.type === "section" ? (
                <tr key={row.id}>
                  <td colSpan={campaign.paymentDates.length + 1} className={`${ultra ? "px-3 py-1.5" : "px-4 py-2"} text-center text-xs font-black uppercase tracking-[0.16em] text-white`} style={{ background: theme.section }}>{row.sectionTitle}</td>
                </tr>
              ) : (
                <tr key={row.id} className={`${row.highlighted ? "bg-[#f4fbf3]" : ""} border-b border-[#e4eee4] last:border-0`}>
                  <td className={`${cellPad} font-bold text-[#10201a]`}>
                    {row.productName}
                    {row.observation && <span className="mt-0.5 block text-[10px] font-semibold text-[#6a7f73]">{row.observation}</span>}
                  </td>
                  {campaign.paymentDates.map((date) => (
                    <td key={date} className={`${cellPad} text-center`}>
                      {priceText(row.prices?.[date])
                        ? <span className="inline-flex min-w-[88px] justify-center rounded-full px-2.5 py-1 font-black" style={{ background: theme.chip, color: theme.deep }}>{priceText(row.prices?.[date])}</span>
                        : <span className="text-slate-300">-</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {campaign.showFooterNote !== false && <p className="mt-4 text-center text-xs font-semibold leading-5 text-[#496156]">{campaign.footerNote}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h3 className="text-lg font-semibold text-white">{title}</h3>{action}</div>;
}

function Summary({ label, value }: { label: string; value: number }) {
  return <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-padap-mint">{value}</p></Card>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-xs font-medium text-slate-400"><span className="mb-1.5 block">{label}</span>{children}</label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-300">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-padap-green" />
    </label>
  );
}

function Textarea({ value, onChange, rows = 4, placeholder = "" }: { value: string; onChange: (value: string) => void; rows?: number; placeholder?: string }) {
  return <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} placeholder={placeholder} className="w-full rounded-lg border border-white/10 bg-[#061314]/80 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-padap-green/70 focus:bg-[#071b18] focus:shadow-[0_0_0_3px_rgba(29,186,44,.10)]" />;
}

function IconButton({ label, danger, onClick, children }: { label: string; danger?: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition ${danger ? "border-red-400/25 bg-red-500/10 text-red-100 hover:bg-red-500/20" : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-padap-green/25 hover:bg-padap-green/[0.08]"}`}>{children}</button>;
}
