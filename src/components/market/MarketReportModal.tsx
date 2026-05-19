import { useState } from "react";
import type { GeneratedMarketReport, MarketReportConfig } from "../../types";
import { createGeneratedMarketReport, downloadMarketReportPdf, getDefaultMarketReportConfig, validateMarketReportConfig } from "../../services/marketReportService";
import { notify } from "../../utils/uiActions";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";

const crops = ["Café", "Alho", "Cenoura", "HF geral", "Milho", "Soja"];
const fertilizers = ["Ureia", "Sulfato de Amônio", "MAP", "KCl", "SSP/TSP", "Yara Especialidades"];

export function MarketReportModal({ open, onClose, report, onGenerated }: { open: boolean; onClose: () => void; report: GeneratedMarketReport | null; onGenerated: (report: GeneratedMarketReport) => void }) {
  const [config, setConfig] = useState<MarketReportConfig>(getDefaultMarketReportConfig());
  const [loading, setLoading] = useState(false);
  const setToggle = (key: keyof MarketReportConfig, value: boolean) => setConfig((current) => ({ ...current, [key]: value }));

  const generate = async (reportAudience: MarketReportConfig["reportAudience"]) => {
    const nextConfig = { ...config, reportAudience };
    const errors = validateMarketReportConfig(nextConfig);
    if (errors.length) {
      notify(errors[0]);
      return;
    }

    setLoading(true);
    try {
      const nextReport = createGeneratedMarketReport(nextConfig);
      await downloadMarketReportPdf(nextReport);
      setConfig(nextConfig);
      onGenerated(nextReport);
      notify(reportAudience === "client" ? "PDF Cliente gerado com sucesso." : "PDF Consultor gerado com sucesso.");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Erro ao gerar relatório PDF", error);
      notify("Não foi possível gerar o relatório. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const downloadLast = async () => {
    if (!report) {
      await generate(config.reportAudience);
      return;
    }
    setLoading(true);
    try {
      await downloadMarketReportPdf(report);
      notify("Relatório baixado com sucesso.");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Erro ao baixar relatório PDF", error);
      notify("Não foi possível baixar o relatório. Tente gerar novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Gerar relatório PDF" open={open} onClose={onClose}>
      <div className="rounded-lg border border-padap-green/20 bg-padap-green/[0.06] p-3 text-sm leading-6 text-slate-200">
        Escolha a versão do PDF. Cliente/Produtor é curto e seguro para envio externo. Consultor traz leitura técnica, preços referenciais, fretes, argumentos e alertas internos.
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-sm leading-6 text-slate-300">
          Período
          <Select value={config.period} disabled={loading} onChange={(event) => setConfig((current) => ({ ...current, period: event.target.value as MarketReportConfig["period"] }))}>
            <option>Hoje</option>
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
            <option>Personalizado</option>
          </Select>
        </label>
        <label className="text-sm leading-6 text-slate-300">
          Tipo de relatório
          <Select value={config.type} disabled={loading} onChange={(event) => setConfig((current) => ({ ...current, type: event.target.value as MarketReportConfig["type"] }))}>
            <option>Briefing comercial rápido</option>
            <option>Relatório completo</option>
            <option>Resumo executivo</option>
          </Select>
        </label>
        <Checklist title="Culturas incluídas" items={crops} selected={config.crops} disabled={loading} onChange={(selected) => setConfig((current) => ({ ...current, crops: selected }))} />
        <Checklist title="Fertilizantes incluídos" items={fertilizers} selected={config.fertilizers} disabled={loading} onChange={(selected) => setConfig((current) => ({ ...current, fertilizers: selected }))} />
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <Toggle label="Incluir relação de troca" checked={config.includeExchangeRatio} disabled={loading} onChange={(value) => setToggle("includeExchangeRatio", value)} />
        <Toggle label="Incluir notícias" checked={config.includeNews} disabled={loading} onChange={(value) => setToggle("includeNews", value)} />
        <Toggle label="Incluir oportunidades comerciais" checked={config.includeOpportunities} disabled={loading} onChange={(value) => setToggle("includeOpportunities", value)} />
        <Toggle label="Incluir recomendações para consultores" checked={config.includeRecommendations} disabled={loading} onChange={(value) => setToggle("includeRecommendations", value)} />
        <Toggle label="Incluir fontes e links" checked={config.includeSources} disabled={loading} onChange={(value) => setToggle("includeSources", value)} />
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
        {report && <Button variant="ghost" onClick={downloadLast} disabled={loading}>Baixar último PDF</Button>}
        <Button variant="ghost" onClick={() => generate("client")} disabled={loading}>{loading ? "Gerando..." : "Gerar PDF Cliente"}</Button>
        <Button onClick={() => generate("consultant")} disabled={loading}>{loading ? "Gerando..." : "Gerar PDF Consultor"}</Button>
      </div>
    </Modal>
  );
}

function Checklist({ title, items, selected, disabled, onChange }: { title: string; items: string[]; selected: string[]; disabled?: boolean; onChange: (items: string[]) => void }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="mb-2 text-sm font-semibold text-white">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" disabled={disabled} checked={selected.includes(item)} onChange={(event) => onChange(event.target.checked ? [...selected, item] : selected.filter((selectedItem) => selectedItem !== item))} />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">
      <input type="checkbox" disabled={disabled} checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}
