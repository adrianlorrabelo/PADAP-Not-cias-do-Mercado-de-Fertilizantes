import type { ReactNode } from "react";

export function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-padap-line bg-white shadow-panel">
      <table className="min-w-[960px] divide-y divide-padap-line text-left text-sm font-medium">
        <thead className="bg-padap-green/[0.08] text-[11px] uppercase tracking-[0.12em] text-padap-emerald">
          <tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-4 py-3.5 align-middle font-bold">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-padap-line">
          {rows.map((row, index) => (
            <tr key={index} className="transition hover:bg-padap-green/10">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="max-w-[280px] px-4 py-3.5 align-top leading-5 text-padap-ink">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
