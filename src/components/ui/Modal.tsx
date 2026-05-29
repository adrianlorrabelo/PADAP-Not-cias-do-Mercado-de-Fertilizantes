import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

export function Modal({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/35 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl border border-padap-line bg-white shadow-panel">
        {/* Green header band */}
        <div className="flex items-center justify-between gap-4 border-b border-padap-green/20 bg-padap-green/[0.07] px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
            <h2 className="text-base font-bold leading-tight text-padap-ink">{title}</h2>
          </div>
          <Button variant="ghost" className="h-9 w-9 shrink-0 p-0" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </Button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
