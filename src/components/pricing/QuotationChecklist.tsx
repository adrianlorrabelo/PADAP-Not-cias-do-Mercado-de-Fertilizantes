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
    <section className="rounded-xl border border-padap-line bg-white p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-padap-ink">Checklist de envio</h2>
        {pending > 0 && <span className="text-xs text-padap-amber">Não é recomendado enviar ainda.</span>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 rounded-lg border border-padap-line bg-padap-field px-3 py-2 text-sm font-medium text-padap-ink">
            <input type="checkbox" checked={value[key]} onChange={(event) => onChange({ ...value, [key]: event.target.checked })} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
