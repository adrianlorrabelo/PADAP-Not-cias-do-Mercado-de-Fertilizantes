import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePagination } from "../hooks/usePagination";

const items = Array.from({ length: 55 }, (_, i) => i + 1); // [1, 2, ..., 55]

describe("usePagination", () => {
  it("retorna a primeira página corretamente", () => {
    const { result } = renderHook(() => usePagination(items, 25));
    expect(result.current.page).toBe(1);
    expect(result.current.paged).toHaveLength(25);
    expect(result.current.paged[0]).toBe(1);
    expect(result.current.paged[24]).toBe(25);
  });

  it("calcula o total de páginas corretamente", () => {
    const { result } = renderHook(() => usePagination(items, 25));
    expect(result.current.totalPages).toBe(3); // 55 / 25 = 2.2 → 3 páginas
    expect(result.current.total).toBe(55);
  });

  it("navega para a segunda página", () => {
    const { result } = renderHook(() => usePagination(items, 25));
    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);
    expect(result.current.paged[0]).toBe(26);
    expect(result.current.paged[24]).toBe(50);
  });

  it("a última página tem os itens restantes", () => {
    const { result } = renderHook(() => usePagination(items, 25));
    act(() => result.current.setPage(3));
    expect(result.current.paged).toHaveLength(5); // 55 - 50 = 5 itens
    expect(result.current.paged[0]).toBe(51);
  });

  it("não ultrapassa o total de páginas", () => {
    const { result } = renderHook(() => usePagination(items, 25));
    act(() => result.current.setPage(999));
    expect(result.current.page).toBe(3); // clamped ao máximo
  });

  it("funciona com lista vazia", () => {
    const { result } = renderHook(() => usePagination([], 25));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.paged).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it("funciona quando todos os itens cabem em uma única página", () => {
    const small = [1, 2, 3];
    const { result } = renderHook(() => usePagination(small, 25));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.paged).toHaveLength(3);
  });
});
