import type { ReactNode } from "react";

export function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.09] bg-[#061314]/55 shadow-panel">
      <table className="min-w-[960px] divide-y divide-white/[0.08] text-left text-sm">
        <thead className="bg-gradient-to-r from-white/[0.065] to-white/[0.025] text-[11px] uppercase tracking-[0.12em] text-slate-400">
          <tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-4 py-3.5 align-middle font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-white/[0.07]">
          {rows.map((row, index) => (
            <tr key={index} className="transition hover:bg-padap-green/[0.045]">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="max-w-[280px] px-4 py-3.5 align-top leading-5 text-slate-200">
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
