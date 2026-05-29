import { BookOpen, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { MarketNews } from "../../types";
import { formatDateTime } from "../../utils/marketFormatting";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { NewsReaderModal } from "./NewsReaderModal";
import { SectionHeader } from "./MarketPrimitives";

export function TrustedNewsFeed({ news, onCopy }: { news: MarketNews[]; onCopy: (url: string) => void }) {
  const [reading, setReading] = useState<MarketNews | null>(null);

  return (
    <>
      <Card>
        <SectionHeader title="Feed de Notícias" subtitle="Notícias com fonte, impacto PADAP, URL original e nível de confiança." />
        <div className="grid gap-3 xl:grid-cols-2">
          {news.map((item) => (
            <article key={item.id} className="flex flex-col rounded-lg border border-padap-line bg-padap-field p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="cyan">{item.category ?? item.tag}</Badge>
                <Badge tone="green">{item.confidence ?? 80}% confiança</Badge>
                <Badge>{item.sourceStatus ?? "ativa"}</Badge>
              </div>
              <h3 className="mt-3 font-semibold text-padap-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-padap-muted">{item.summary}</p>
              <p className="mt-2 text-sm text-padap-emerald">Impacto PADAP: {item.impact}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-padap-muted">
                <span>{item.source} - {formatDateTime(item.date)}</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-padap-green/30 bg-padap-green/10 px-3 text-sm font-semibold text-padap-emerald transition hover:bg-padap-green/20"
                    onClick={() => setReading(item)}
                  >
                    <BookOpen size={13} />
                    Ler completo
                  </button>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-padap-line bg-white px-3 text-sm font-semibold text-padap-ink transition hover:border-padap-green/25">
                    <ExternalLink size={14} />Ver fonte
                  </a>
                  <button type="button" className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-padap-line bg-white px-3 text-sm font-semibold text-padap-ink transition hover:border-padap-green/25 hover:bg-padap-green/[0.08]" onClick={(e) => { e.preventDefault(); if (item.url) onCopy(item.url); }}>
                    <Copy size={14} />Copiar link
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Card>

      <NewsReaderModal news={reading} open={reading !== null} onClose={() => setReading(null)} />
    </>
  );
}
