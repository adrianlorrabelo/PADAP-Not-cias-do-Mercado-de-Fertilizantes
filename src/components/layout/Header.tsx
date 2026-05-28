import { Bell, Command, LogOut, Menu, Search } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { simulatedAction } from "../../utils/uiActions";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { BrandLogo } from "./BrandLogo";

export function Header({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex min-h-[64px] items-center justify-between border-b border-padap-line bg-white/92 px-4 shadow-[0_10px_28px_rgba(23,46,29,.08)] backdrop-blur-2xl lg:px-7">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="h-10 w-10 p-0 md:hidden" onClick={onOpenMenu}><Menu size={18} /></Button>
        <div className="flex items-center md:hidden">
          <BrandLogo compact className="h-9 w-9" />
        </div>
        <div className="hidden items-center gap-3 xl:flex">
          <div className="h-8 w-px bg-padap-line" />
          <div>
            <p className="text-sm font-bold text-padap-ink">PADAP Intelligence</p>
            <p className="text-[11px] font-medium text-padap-muted">Painel operacional</p>
          </div>
        </div>
        <div className="hidden w-[28rem] max-w-[38vw] items-center gap-3 rounded-lg border border-padap-line bg-padap-field px-3.5 py-2 text-padap-muted sm:flex">
          <Search size={16} className="text-padap-green" />
          <span className="text-sm font-medium">Buscar no sistema</span>
          <Command size={14} className="ml-auto text-padap-muted" />
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
