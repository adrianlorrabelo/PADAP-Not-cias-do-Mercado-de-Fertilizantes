import { Copy, MessageSquarePlus, Plus } from "lucide-react";
import type { CommercialArgument } from "../../types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { SectionHeader } from "./MarketPrimitives";

export function CommercialArgumentsLibrary({ argumentsList, onAction }: { argumentsList: CommercialArgument[]; onAction: (message: string) => void }) {
  return (
    <Card>
      <SectionHeader title="Argumentos Comerciais" subtitle="Argumentos prontos para consultores usarem com produtores." />
      <div className="grid gap-3 md:grid-cols-2">
        {argumentsList.map((item) => (
          <div key={item.id} className="rounded-lg border border-padap-line bg-padap-field p-4">
            <h3 className="font-semibold text-padap-ink">{item.category}</h3>
            <p className="mt-2 text-sm leading-6 text-padap-muted">{item.argument}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => onAction("Argumento copiado.")}><Copy size={14} />Copiar</Button>
              <Button variant="ghost" onClick={() => onAction("Argumento adicionado ao briefing.")}><Plus size={14} />Adicionar</Button>
              <Button variant="ghost" onClick={() => onAction("Mensagem comercial preparada.")}><MessageSquarePlus size={14} />Usar</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
