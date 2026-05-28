import { useMemo, useState } from "react";
import type { ScenarioSimulationInput } from "../../types";
import { runScenarioSimulation } from "../../services/scenarioSimulationService";
import { formatCurrency } from "../../utils/marketFormatting";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";

const base: ScenarioSimulationInput = {
  ptaxVariation: 1,
  ureaVariation: 0,
  mapVariation: 0,
  kclVariation: 0,
  coffeeVariation: 0,
  cornVariation: 0,
  period: "Próximos 7 dias",
  applyOpenProposals: true
};

export function ScenarioSimulatorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState(base);
  const result = useMemo(() => runScenarioSimulation(input), [input]);
  const update = (key: keyof ScenarioSimulationInput, value: string | boolean) => setInput((current) => ({ ...current, [key]: typeof value === "boolean" ? value : Number(value) }));

  return (
    <Modal title="Simular cenário" open={open} onClose={onClose}>
      <div className="mb-5 flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => setInput({ ...base, ptaxVariation: 1 })}>PTAX +1%</Button>
        <Button variant="ghost" onClick={() => setInput({ ...base, ureaVariation: 3 })}>Ureia +3%</Button>
        <Button variant="ghost" onClick={() => setInput({ ...base, kclVariation: -2 })}>KCl -2%</Button>
        <Button variant="ghost" onClick={() => setInput({ ...base, coffeeVariation: -2 })}>Café -2%</Button>
        <Button variant="amber" onClick={() => setInput({ ...base, ptaxVariation: 1.2, ureaVariation: 3, mapVariation: 2, coffeeVariation: -2 })}>Cenário pessimista</Button>
        <Button onClick={() => setInput({ ...base, kclVariation: -2, coffeeVariation: 3, cornVariation: 1 })}>Cenário oportunidade</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Variação do PTAX (%)" value={input.ptaxVariation} onChange={(v) => update("ptaxVariation", v)} />
        <Field label="Variação da Ureia (%)" value={input.ureaVariation} onChange={(v) => update("ureaVariation", v)} />
        <Field label="Variação do MAP (%)" value={input.mapVariation} onChange={(v) => update("mapVariation", v)} />
        <Field label="Variação do KCl (%)" value={input.kclVariation} onChange={(v) => update("kclVariation", v)} />
        <Field label="Variação do Café (%)" value={input.coffeeVariation} onChange={(v) => update("coffeeVariation", v)} />
        <Field label="Variação do Milho (%)" value={input.cornVariation} onChange={(v) => update("cornVariation", v)} />
        <label className="text-sm leading-6 text-padap-muted">
          Período simulado
          <Select value={input.period} onChange={(event) => setInput((current) => ({ ...current, period: event.target.value }))}>
            <option>Próximos 7 dias</option>
            <option>Hoje</option>
            <option>Próximos 30 dias</option>
          </Select>
        </label>
        <label className="flex min-h-[74px] items-center gap-3 rounded-lg border border-padap-line bg-padap-field p-3 text-sm text-padap-muted">
          <input type="checkbox" checked={input.applyOpenProposals} onChange={(event) => update("applyOpenProposals", event.target.checked)} />
          Aplicar em propostas abertas?
        </label>
      </div>

      <div className="mt-5 rounded-lg border border-padap-green/20 bg-padap-green/[0.06] p-4">
        <h3 className="font-semibold text-padap-ink">Resultado da simulação</h3>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-padap-ink md:grid-cols-2">
          <p>Propostas impactadas: <strong>{result.affectedProposals}</strong></p>
          <p>Valor impactado: <strong>{formatCurrency(result.impactedValue)}</strong></p>
          <p>Margem média: <strong>{result.averageMarginBefore}% {"->"} {result.averageMarginAfter}%</strong></p>
          <p>Pacotes abaixo da meta: <strong>{result.packagesBelowTarget}</strong></p>
          <p className="md:col-span-2">Produtos sensíveis: <strong>{result.sensitiveProducts.join(", ") || "Nenhum"}</strong></p>
          <p className="md:col-span-2 text-padap-emerald">Ação recomendada: {result.recommendedAction}</p>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (value: string) => void }) {
  return (
    <label className="text-sm leading-6 text-padap-muted">
      {label}
      <Input type="number" step="0.1" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
