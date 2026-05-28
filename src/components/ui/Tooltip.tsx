import type { ReactNode } from "react";

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-padap-line bg-white px-2 py-1 text-xs font-semibold text-padap-ink shadow-xl group-hover:block">{label}</span>
    </span>
  );
}
