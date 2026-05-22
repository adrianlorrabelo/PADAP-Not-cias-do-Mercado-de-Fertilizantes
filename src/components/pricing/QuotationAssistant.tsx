import { useMemo, useState } from "react";
import { ClipboardCheck, Sparkles } from "lucide-react";
import type { QuotationAssistantInput } from "../../types";
import {
  buildQuotationDiagnosis,
  buildQuotationRecommendation,
  calculateQuotationSecurityScore,
  classifyProductType,
  createEmptyQuotationInput,
  parseWhatsAppQuotationMessage,
  suggestPricingStrategy,
  validateQuotationRequiredFields
} from "../../utils/quotationAssistant";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { QuotationDiagnosisCard } from "./QuotationDiagnosisCard";
import { QuotationInputMode } from "./QuotationInputMode";
import { QuotationPendingFields } from "./QuotationPendingFields";
import { QuotationSecurityScore } from "./QuotationSecurityScore";

type Props = {
  onApply: (input: QuotationAssistantInput) => void;
};

type LogEntry = {
  date: string;
  analyzedText: string;
  productType: string;
  strategy: string;
  score: number;
  pending: string[];
};

export function QuotationAssistant({ onApply }: Props) {
  const [mode, setMode] = useState<"whatsapp" | "manual">("whatsapp");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [input, setInput] = useState<QuotationAssistantInput>(() => createEmptyQuotationInput());
  const [applyNotice, setApplyNotice] = useState(false);

  const enrichedInput = useMemo(() => {
    const productType = input.productType && input.productType !== "Não identificado" ? input.productType : classifyProductType(input.product);
    const suggestion = suggestPricingStrategy(productType, input);
    return {
      ...input,
      productType,
      pricingStrategy: input.pricingStrategy || suggestion.strategy,
      suggestedSupplier: input.suggestedSupplier || suggestion.suggestedSupplier,
      suggestedMinimumMargin: input.suggestedMinimumMargin || String(suggestion.minimumMargin)
    };
  }, [input]);

  const diagnosis = useMemo(() => buildQuotationDiagnosis(enrichedInput), [enrichedInput]);
  const pending = useMemo(() => validateQuotationRequiredFields(enrichedInput), [enrichedInput]);
  const score = useMemo(() => calculateQuotationSecurityScore(enrichedInput), [enrichedInput]);
  const recommendation = useMemo(() => buildQuotationRecommendation(enrichedInput), [enrichedInput]);

  function updateInput(patch: Partial<QuotationAssistantInput>) {
    setApplyNotice(false);
    setInput((current) => {
      const next = { ...current, ...patch };
      if (patch.product !== undefined) {
        const productType = classifyProductType(next.product);
        const suggestion = suggestPricingStrategy(productType, next);
        return {
          ...next,
          productType,
          pricingStrategy: suggestion.strategy,
          suggestedSupplier: suggestion.suggestedSupplier,
          suggestedMinimumMargin: String(suggestion.minimumMargin)
        };
      }
      return next;
    });
  }

  function analyzeMessage() {
    const parsed = parseWhatsAppQuotationMessage(whatsappMessage);
    setInput(parsed);
    setApplyNotice(false);
    saveLog(parsed, whatsappMessage);
  }

  function applySuggestions() {
    setApplyNotice(true);
    onApply(enrichedInput);
    saveLog(enrichedInput, whatsappMessage);
  }

  function saveLog(data: QuotationAssistantInput, analyzedText: string) {
    const dataScore = calculateQuotationSecurityScore(data);
    const entry: LogEntry = {
      date: new Date().toISOString(),
      analyzedText,
      productType: data.productType || classifyProductType(data.product),
      strategy: data.pricingStrategy || "",
      score: dataScore.percentage,
      pending: validateQuotationRequiredFields(data)
    };

    try {
      const current = JSON.parse(localStorage.getItem("padap.quotationAssistant.log") || "[]") as LogEntry[];
      localStorage.setItem("padap.quotationAssistant.log", JSON.stringify([entry, ...current].slice(0, 30)));
    } catch {
      localStorage.setItem("padap.quotationAssistant.log", JSON.stringify([entry]));
    }
  }

  return (
    <Card className="mb-6 overflow-hidden border-padap-green/20 bg-[radial-gradient(circle_at_top_left,rgba(57,211,83,0.16),transparent_35%),linear-gradient(145deg,rgba(8,36,31,0.92),rgba(5,12,14,0.88))]">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-padap-green/25 bg-padap-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-padap-mint">
            <Sparkles size={14} /> Assistente
          </div>
          <h2 className="text-2xl font-semibold text-white">Assistente da Cotação</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Entenda a cotação recebida, identifique pendências e escolha a melhor estratégia de precificação.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-lg border border-white/10 bg-black/15 p-4">
          <h3 className="mb-4 text-sm font-semibold text-white">Entrada da cotação</h3>
          <QuotationInputMode
            mode={mode}
            setMode={setMode}
            whatsappMessage={whatsappMessage}
            setWhatsappMessage={setWhatsappMessage}
            input={enrichedInput}
            onChange={updateInput}
            onAnalyze={analyzeMessage}
          />
        </div>

        <div className="space-y-4">
          <QuotationDiagnosisCard diagnosis={diagnosis} />
          <QuotationSecurityScore score={score} />
          <QuotationPendingFields pending={pending} />
          <div className={`rounded-lg border p-4 ${enrichedInput.availability === "Indisponível" ? "border-red-400/30 bg-red-500/10" : "border-padap-cyan/25 bg-padap-cyan/10"}`}>
            <h3 className="text-sm font-semibold text-white">Ação recomendada</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">{recommendation}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">Recomendação textual apenas. O semáforo permanece manual ou nas regras já existentes.</p>
          </div>
          {applyNotice ? (
            <div className="rounded-lg border border-padap-green/25 bg-padap-green/10 p-3 text-sm text-padap-mint">
              Sugestões aplicadas à cotação atual. Você pode editar tudo depois.
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300">
              As sugestões serão aplicadas à cotação atual. Você poderá editar tudo depois.
            </div>
          )}
          <Button onClick={applySuggestions} className="w-full"><ClipboardCheck size={16} />Aplicar sugestões na cotação</Button>
        </div>
      </div>
    </Card>
  );
}
