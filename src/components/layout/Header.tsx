import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { simulatedAction } from "../../utils/uiActions";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { BrandLogo } from "./BrandLogo";

export function Header({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex min-h-[68px] items-center justify-between border-b border-white/[0.08] bg-[#061112]/78 px-4 shadow-[0_12px_38px_rgba(0,0,0,.18)] backdrop-blur-2xl lg:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="h-10 w-10 p-0 md:hidden" onClick={onOpenMenu}><Menu size={18} /></Button>
        <div className="flex items-center md:hidden">
          <BrandLogo compact className="h-9 w-9" />
        </div>
        <div className="hidden items-center gap-3 xl:flex">
          <div className="h-8 w-px bg-white/[0.08]" />
          <div>
            <p className="text-sm font-semibold text-white">PADAP Intelligence</p>
            <p className="text-[11px] text-slate-500">Compras & Precificação</p>
          </div>
        </div>
        <div className="hidden w-[32rem] max-w-[42vw] items-center gap-3 rounded-lg border border-white/[0.08] bg-black/20 px-3.5 py-2.5 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,.03)] sm:flex">
          <Search size={16} className="text-padap-green/70" />
          <span className="text-sm">Buscar cliente, produto, proposta...</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:block"><Badge tone="cyan">{user?.role}</Badge></div>
        <Button variant="ghost" className="h-10 w-10 p-0" onClick={() => simulatedAction("Central de notificações aberta.")}><Bell size={17} /></Button>
        <Button variant="ghost" onClick={logout}><LogOut size={16} />Sair</Button>
      </div>
    </header>
  );
}
