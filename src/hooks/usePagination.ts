import { useEffect, useState } from "react";

export function usePagination<T>(items: T[], pageSize = 25) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Volta para a página 1 sempre que o tamanho da lista mudar (filtros, busca)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [items.length]);

  return { page: safePage, setPage, totalPages, paged, total: items.length };
}
