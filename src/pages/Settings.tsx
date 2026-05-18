import { useContext } from "react";
import { AppSettingsContext } from "../contexts/AppSettingsContext";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { usePermissions } from "../hooks/usePermissions";
import { simulatedAction } from "../utils/uiActions";

export default function Settings() {
  const context = useContext(AppSettingsContext)!;
  const { settings, setSettings } = context;
  const { isAdmin, user } = usePermissions();
  const canEditPtax = isAdmin || user?.role === "Compras / Precificação";
  const update = (key: keyof typeof settings, value: number) => setSettings((current) => ({ ...current, [key]: value }));
  return (
    <div>
      <div className="page-title"><h1>Configurações</h1><p>Parâmetros comerciais e alertas inteligentes persistidos no LocalStorage para a primeira versão.</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Configurações comerciais</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field disabled={!isAdmin} label="Margem mínima fertilizantes (%)" value={settings.minFertilizerMargin} onChange={(v) => update("minFertilizerMargin", v)} />
            <Field disabled={!isAdmin} label="Margem desejada foliares (%)" value={settings.desiredFoliarMargin} onChange={(v) => update("desiredFoliarMargin", v)} />
            <Field disabled={!isAdmin} label="Margem flexível estratégico (%)" value={settings.strategicClientMargin} onChange={(v) => update("strategicClientMargin", v)} />
            <Field disabled={!isAdmin} label="Comissão padrão (%)" value={settings.defaultCommission} onChange={(v) => update("defaultCommission", v)} />
            <Field disabled={!isAdmin} label="Imposto padrão (%)" value={settings.defaultTax} onChange={(v) => update("defaultTax", v)} />
            <Field disabled={!isAdmin} label="Frete padrão" value={settings.defaultFreight} onChange={(v) => update("defaultFreight", v)} />
            <Field disabled={!isAdmin} label="Validade padrão (h)" value={settings.defaultValidityHours} onChange={(v) => update("defaultValidityHours", v)} />
            <Field disabled={!canEditPtax} label="PTAX manual" value={settings.manualPtax} onChange={(v) => update("manualPtax", v)} />
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Prazos e alertas</h2>
          <Select><option>À vista</option><option>30 dias</option><option>60 dias</option><option>90 dias</option><option>120 dias</option><option>Mês 04</option><option>Mês 11</option><option>Safra</option><option>Personalizado</option></Select>
          <div className="mt-4 grid gap-3">
            {Object.entries(settings.alerts).map(([key, active]) => <label key={key} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm"><span>{key}</span><input type="checkbox" checked={active} disabled={!isAdmin} onChange={(event) => isAdmin ? setSettings((current) => ({ ...current, alerts: { ...current.alerts, [key]: event.target.checked } })) : simulatedAction("Este perfil não pode alterar alertas críticos.")} /></label>)}
          </div>
          <div className="mt-4"><Badge tone="cyan">Alterações críticas registrariam usuário responsável no backend futuro</Badge></div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, disabled = false }: { label: string; value: number; disabled?: boolean; onChange: (value: number) => void }) {
  return <label className="text-sm text-slate-300">{label}<Input className="mt-2" type="number" value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}
