import { ExternalLink } from "lucide-react";
import type { MarketNews } from "../../types";
import { formatDateTime } from "../../utils/marketFormatting";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

function categoryTone(category: string): "green" | "amber" | "red" | "cyan" | "neutral" {
  if (category === "Câmbio") return "amber";
  if (category === "Fertilizantes") return "green";
  if (category === "Geopolítica" || category === "Matérias-primas") return "red";
  if (category === "Importações" || category === "Oferta e demanda") return "cyan";
  return "neutral";
}

export function NewsReaderModal({ news, open, onClose }: { news: MarketNews | null; open: boolean; onClose: () => void }) {
  if (!news) return null;
  const cat = news.category ?? news.tag ?? "Mercado";
  const paragraphs = (news.fullContent ?? news.summary).split("\n").filter(Boolean);

  return (
    <Modal title="Leitura da notícia" open={open} onClose={onClose}>
      <div className="space-y-5">
        {/* Categoria + confiança */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={categoryTone(cat)}>{cat}</Badge>
          {news.confidence !== undefined && (
            <Badge tone={news.confidence >= 90 ? "green" : news.confidence >= 75 ? "cyan" : "neutral"}>
              {news.confidence}% confiança
            </Badge>
          )}
          {news.sourceStatus && (
            <Badge tone={news.sourceStatus === "ativa" ? "green" : "neutral"}>{news.sourceStatus}</Badge>
          )}
        </div>

        {/* Título */}
        <h2 className="text-2xl font-black leading-tight text-padap-ink">{news.title}</h2>

        {/* Metadados */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-padap-line pb-4 text-xs text-padap-muted">
          {news.author && <span><strong className="text-padap-ink">Por:</strong> {news.author}</span>}
          <span><strong className="text-padap-ink">Fonte:</strong> {news.source}</span>
          <span><strong className="text-padap-ink">Publicado:</strong> {formatDateTime(news.date)}</span>
        </div>

        {/* Corpo do artigo */}
        <div className="space-y-4 text-[15px] leading-8 text-padap-ink">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Impacto PADAP */}
        {news.impact && (
          <div className="rounded-xl border border-padap-emerald/25 bg-padap-emerald/[0.06] px-5 py-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-padap-emerald">Impacto PADAP</p>
            <p className="text-sm leading-6 text-padap-ink">{news.impact}</p>
          </div>
        )}

        {/* Rodapé com fonte e link */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-padap-line pt-4 text-xs text-padap-muted">
          <span>
            <strong className="text-padap-ink">{news.source}</strong>
            {news.author ? ` · Por ${news.author}` : ""}
            {" · "}{formatDateTime(news.date)}
          </span>
          {news.url && (
            <a href={news.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost">
                <ExternalLink size={13} />
                Ver na fonte original
              </Button>
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}
