import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages = buildPageRange(page, totalPages);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-padap-line pt-4 text-sm text-padap-muted">
      <span className="text-xs font-medium">
        Exibindo <strong className="text-padap-ink">{start}–{end}</strong> de <strong className="text-padap-ink">{total}</strong> registros
      </span>

      <div className="flex items-center gap-1">
        <PageBtn onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Página anterior">
          <ChevronLeft size={14} />
        </PageBtn>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-padap-muted">…</span>
          ) : (
            <PageBtn key={p} onClick={() => onPageChange(p as number)} active={p === page}>
              {p}
            </PageBtn>
          )
        )}

        <PageBtn onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Próxima página">
          <ChevronRight size={14} />
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({ children, active, disabled, onClick, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-bold transition
        ${active
          ? "border-padap-green bg-padap-green text-white shadow-glow"
          : "border-padap-line bg-white text-padap-ink hover:border-padap-emerald/40 hover:bg-padap-mint"
        }
        disabled:cursor-not-allowed disabled:opacity-40`}
      {...rest}
    >
      {children}
    </button>
  );
}

function buildPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");
  pages.push(total);

  return pages;
}
