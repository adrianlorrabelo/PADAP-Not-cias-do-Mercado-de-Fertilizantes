import type { QuotationChecklist as Checklist } from "../../types";

const items: Array<[keyof Checklist, string]> = [
  ["priceChecked", "Preço conferido"],
  ["freightChecked", "Frete conferido"],
  ["termChecked", "Prazo conferido"],
  ["validityChecked", "Validade conferida"],
  ["availabilityChecked", "Disponibilidade conferida"],
  ["marginChecked", "Margem conferida"],
  ["supplierChecked", "Fornecedor confirmado"]
];

export function QuotationChecklist({ value, onChange }: { value: Checklist; onChange: (value: Checklist) => void }) {
  const pending = items.filter(([key]) => !value[key]).length;

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#071918]/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Checklist de envio</h2>
        {pending > 0 && <span className="text-xs text-padap-amber">Não é recomendado enviar ainda.</span>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-sm text-slate-200">
            <input type="checkbox" checked={value[key]} onChange={(event) => onChange({ ...value, [key]: event.target.checked })} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
