import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-white/[0.09] bg-[linear-gradient(145deg,rgba(10,31,29,0.84),rgba(5,13,15,0.74))] p-5 shadow-panel backdrop-blur-2xl ring-1 ring-white/[0.03] transition duration-300 hover:border-padap-green/20 hover:shadow-lift ${className}`}>{children}</section>;
}
