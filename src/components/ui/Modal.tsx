import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

export function Modal({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl border border-white/10 bg-[#081313] p-6 shadow-panel">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold leading-tight text-white">{title}</h2>
          <Button variant="ghost" className="h-9 w-9 shrink-0 p-0" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
