import type { ChangeEvent } from "react";
import { ClipboardPaste, PenLine, Search } from "lucide-react";
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function QuotationInputMode({ mode, setMode, whatsappMessage, setWhatsappMessage, input, onChange, onAnalyze }: Props) {
  const update = (key: keyof QuotationAssistantInput) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ [key]: event.target.value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/20 p-1">
        <button
          type="button"
          onClick={() => setMode("whatsapp")}
          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition ${mode === "whatsapp" ? "bg-padap-green text-[#03110d]" : "text-slate-300 hover:bg-white/[0.06]"}`}
        >
          <ClipboardPaste size={16} /> Colar WhatsApp
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition ${mode === "manual" ? "bg-padap-green text-[#03110d]" : "text-slate-300 hover:bg-white/[0.06]"}`}
        >
          <PenLine size={16} /> Preencher manualmente
        </button>
      </div>

      {mode === "whatsapp" && (
        <div className="space-y-3">
          <label className="space-y-2 text-sm font-medium text-slate-200">
            <span>Cole aqui a mensagem recebida do consultor</span>
            <textarea
              value={whatsappMessage}
              onChange={(event) => setWhatsappMessage(event.target.value)}
              rows={8}
              placeholder={"Cliente João Silva\nConsultor Renan\n18 toneladas YaraMila 19-04-19\nPrazo 30 dias\nFrete CIF São Gotardo"}
              className="w-full resize-y rounded-lg border border-white/10 bg-[#061314]/80 px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-padap-green/70 focus:bg-[#071b18] focus:shadow-[0_0_0_3px_rgba(57,211,83,.10)]"
            />
          </label>
          <Button onClick={onAnalyze} className="w-full sm:w-auto"><Search size={16} />Analisar cotação</Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Cliente"><Input value={input.client} onChange={update("client")} placeholder="Nome do cliente" /></Field>
        <Field label="Consultor"><Input value={input.consultant} onChange={update("consultant")} placeholder="Nome do consultor" /></Field>
        <Field label="Produto"><Input value={input.product} onChange={update("product")} placeholder="Produto cotado" /></Field>
        <Field label="Quantidade"><Input value={input.quantity} onChange={update("quantity")} type="number" min="0" step="0.01" placeholder="0" /></Field>
        <Field label="Unidade"><Input value={input.unit} onChange={update("unit")} placeholder="toneladas, litros..." /></Field>
        <Field label="Prazo"><Input value={input.term} onChange={update("term")} placeholder="30 dias" /></Field>
        <Field label="Frete CIF/FOB">
          <Select value={input.freightMode} onChange={update("freightMode")}>
            <option value="">Selecionar</option>
            <option value="CIF">CIF</option>
            <option value="FOB">FOB</option>
          </Select>
        </Field>
        <Field label="Cidade/local de entrega"><Input value={input.deliveryCity} onChange={update("deliveryCity")} placeholder="São Gotardo" /></Field>
        <Field label="Fornecedor ou origem do preço"><Input value={input.supplierOrPriceOrigin} onChange={update("supplierOrPriceOrigin")} placeholder="Yara, Fertipar, estoque..." /></Field>
        <Field label="Preço de custo/base"><Input value={input.basePrice} onChange={update("basePrice")} type="number" min="0" step="0.01" placeholder="0,00" /></Field>
        <Field label="Validade da cotação"><Input value={input.validity} onChange={update("validity")} placeholder="24h, 30/05/2026..." /></Field>
        <Field label="Disponibilidade do produto">
          <Select value={input.availability} onChange={update("availability")}>
            {availabilityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Tipo de produto">
          <Select value={input.productType || "Não identificado"} onChange={update("productType")}>
            {productTypes.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Estratégia sugerida"><Input value={input.pricingStrategy || ""} onChange={update("pricingStrategy")} placeholder="Estratégia" /></Field>
        <Field label="Fornecedor sugerido"><Input value={input.suggestedSupplier || ""} onChange={update("suggestedSupplier")} placeholder="Fornecedor" /></Field>
        <Field label="Margem mínima sugerida (%)"><Input value={input.suggestedMinimumMargin || ""} onChange={update("suggestedMinimumMargin")} type="number" min="0" step="0.1" /></Field>
      </div>
    </div>
  );
}
