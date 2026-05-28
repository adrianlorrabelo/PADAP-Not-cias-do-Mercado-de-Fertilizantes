import { useState, type ChangeEvent, type ReactNode } from "react";
import { ChevronDown, ClipboardPaste, PenLine, Search } from "lucide-react";
import type { ProductAvailability, ProductClassification, QuotationAssistantInput } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

type Props = {
  mode: "whatsapp" | "manual";
  setMode: (mode: "whatsapp" | "manual") => void;
  whatsappMessage: string;
  setWhatsappMessage: (value: string) => void;
  input: QuotationAssistantInput;
  onChange: (patch: Partial<QuotationAssistantInput>) => void;
  onAnalyze: () => void;
};

const availabilityOptions: ProductAvailability[] = ["Confirmada", "Aguardando fornecedor", "Indisponível", "Não verificada"];
const productTypes: ProductClassification[] = ["Adubo especialidade", "Adubo commodity", "Foliar", "Produto em estoque", "Pacote comercial", "Cotação manual", "Não identificado"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.12em] text-padap-muted">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function QuotationInputMode({ mode, setMode, whatsappMessage, setWhatsappMessage, input, onChange, onAnalyze }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const update = (key: keyof QuotationAssistantInput) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ [key]: event.target.value });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-padap-line bg-padap-field p-1">
        <button
          type="button"
          onClick={() => setMode("whatsapp")}
          className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-bold transition ${mode === "whatsapp" ? "bg-padap-green text-white shadow-sm" : "text-padap-ink hover:bg-white"}`}
        >
          <ClipboardPaste size={14} /> Colar WhatsApp
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-bold transition ${mode === "manual" ? "bg-padap-green text-white shadow-sm" : "text-padap-ink hover:bg-white"}`}
        >
          <PenLine size={14} /> Preencher manualmente
        </button>
      </div>

      {mode === "whatsapp" ? (
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="space-y-1 text-xs font-semibold text-padap-ink">
            <span>Cole aqui a mensagem recebida do consultor</span>
            <textarea
              value={whatsappMessage}
              onChange={(event) => setWhatsappMessage(event.target.value)}
              rows={3}
              placeholder={"Cliente João Silva\nConsultor Renan\n18 toneladas YaraMila 19-04-19\nPrazo 30 dias\nFrete CIF São Gotardo"}
              className="max-h-28 min-h-20 w-full resize-y rounded-lg border border-padap-line bg-white px-3 py-2 text-xs font-medium leading-5 text-padap-ink outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-padap-green focus:shadow-[0_0_0_3px_rgba(29,186,44,.10)]"
            />
          </label>
          <Button onClick={onAnalyze} className="min-h-9 px-3 py-1.5 text-xs"><Search size={14} />Analisar cotação</Button>
        </div>
      ) : (
        <p className="rounded-lg border border-padap-line bg-padap-field px-3 py-2 text-xs font-medium leading-5 text-padap-muted">
          Preencha os campos gerais e os produtos abaixo. Todos os dados permanecem editáveis.
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowAdvanced((value) => !value)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-padap-emerald hover:text-padap-green"
      >
        <ChevronDown size={14} className={`transition ${showAdvanced ? "rotate-180" : ""}`} />
        Campos avançados
      </button>

      {showAdvanced && (
        <div className="grid gap-2 border-t border-padap-line pt-3 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Cidade/local"><Input className="px-2.5 py-2 text-xs" value={input.deliveryCity} onChange={update("deliveryCity")} placeholder="São Gotardo" /></Field>
          <Field label="Origem do preço"><Input className="px-2.5 py-2 text-xs" value={input.supplierOrPriceOrigin} onChange={update("supplierOrPriceOrigin")} placeholder="Yara, estoque..." /></Field>
          <Field label="Validade"><Input className="px-2.5 py-2 text-xs" value={input.validity} onChange={update("validity")} placeholder="24h" /></Field>
          <Field label="Disponibilidade">
            <Select className="px-2.5 py-2 text-xs" value={input.availability} onChange={update("availability")}>
              {availabilityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </Select>
          </Field>
          <Field label="Tipo">
            <Select className="px-2.5 py-2 text-xs" value={input.productType || "Não identificado"} onChange={update("productType")}>
              {productTypes.map((item) => <option key={item} value={item}>{item}</option>)}
            </Select>
          </Field>
          <Field label="Estratégia"><Input className="px-2.5 py-2 text-xs" value={input.pricingStrategy || ""} onChange={update("pricingStrategy")} placeholder="Estratégia" /></Field>
          <Field label="Fornecedor"><Input className="px-2.5 py-2 text-xs" value={input.suggestedSupplier || ""} onChange={update("suggestedSupplier")} placeholder="Fornecedor" /></Field>
          <Field label="Margem mín. (%)"><Input className="px-2.5 py-2 text-xs" value={input.suggestedMinimumMargin || ""} onChange={update("suggestedMinimumMargin")} type="number" min="0" step="0.1" /></Field>
        </div>
      )}
    </div>
  );
}
