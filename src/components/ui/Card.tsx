import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`overflow-hidden rounded-xl border border-padap-line bg-white p-5 text-padap-ink shadow-panel ring-1 ring-black/[0.02] transition duration-200 hover:border-padap-green/40 hover:shadow-lift ${className}`}>{children}</section>;
}
