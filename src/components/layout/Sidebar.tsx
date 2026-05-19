import { BarChart3, Boxes, Brain, ChevronLeft, ChevronRight, ClipboardCheck, FileSpreadsheet, Home, MessageCircle, PackageOpen, Settings, Users, UserCog, UserRoundCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { usePermissions } from "../../hooks/usePermissions";
import type { Role } from "../../types";
import { Button } from "../ui/Button";
import { Tooltip } from "../ui/Tooltip";
import { BrandLogo } from "./BrandLogo";

type SidebarItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
};

const pricingRole: Role = "Compras / Precificação";

const items: SidebarItem[] = [
  { to: "/", label: "Cockpit", icon: Home },
  { to: "/mercado", label: "Central de Inteligência de Mercado", icon: Brain, roles: ["Administrador Geral", "Gestor / Gerente", pricingRole, "Visualizador"] },
  { to: "/lista-transmissao", label: "Lista de Transmissão", icon: MessageCircle, roles: ["Administrador Geral", "Gestor / Gerente", pricingRole, "Visualizador"] },
  { to: "/tabela", label: "Tabela da Semana", icon: FileSpreadsheet, roles: ["Administrador Geral", pricingRole] },
  { to: "/propostas", label: "Propostas", icon: ClipboardCheck, roles: ["Administrador Geral", "Gestor / Gerente", pricingRole, "Consultor"] },
  { to: "/pacotes", label: "Pacotes", icon: Boxes, roles: ["Administrador Geral", "Gestor / Gerente", pricingRole] },
  { to: "/aprovacoes", label: "Aprovações", icon: UserRoundCheck, roles: ["Administrador Geral", "Gestor / Gerente", pricingRole] },
  { to: "/clientes", label: "Clientes", icon: Users, roles: ["Administrador Geral", "Gestor / Gerente", pricingRole, "Consultor"] },
  { to: "/consultores", label: "Consultores", icon: UserCog, roles: ["Administrador Geral", "Gestor / Gerente", pricingRole] },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3, roles: ["Administrador Geral", "Gestor / Gerente", "Visualizador"] },
  { to: "/usuarios", label: "Usuários", icon: PackageOpen, roles: ["Administrador Geral"] },
  { to: "/configuracoes", label: "Configurações", icon: Settings }
];

function canShowItem(item: SidebarItem, role?: Role) {
  return !item.roles || (!!role && item.roles.includes(role));
}

function menuLinkClass(isActive: boolean, collapsed = false) {
  return `group relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition duration-200 ${
    isActive
      ? "bg-padap-green/[0.10] text-white ring-1 ring-padap-green/20 shadow-[0_12px_30px_rgba(0,0,0,.16)] before:absolute before:inset-y-2 before:left-0 before:w-[2px] before:rounded-full before:bg-padap-green"
      : "text-slate-400 hover:bg-white/[0.045] hover:text-white"
  } ${collapsed ? "justify-center" : ""}`;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useLocalStorage("padap.ui.sidebarCollapsed", typeof window !== "undefined" ? window.innerWidth < 900 : false);
  const { user } = usePermissions();
  const visible = items.filter((item) => canShowItem(item, user?.role));

  return (
    <aside className={`sticky top-0 hidden h-screen shrink-0 border-r border-white/[0.07] bg-[#03100f]/92 p-3 shadow-[18px_0_56px_rgba(0,0,0,.28)] backdrop-blur-2xl transition-all duration-300 md:block ${collapsed ? "w-[76px]" : "w-[292px]"}`}>
      <div className="flex h-full flex-col">
        <div className={`mb-7 border-b border-white/[0.07] ${collapsed ? "flex flex-col items-center gap-4 px-0 pb-5 pt-2" : "px-2 pb-5 pt-2"}`}>
          <div className={collapsed ? "flex justify-center" : "rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 shadow-[0_16px_34px_rgba(0,0,0,.10)]"}>
            <BrandLogo compact={collapsed} />
          </div>
          {!collapsed && (
            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-padap-green/90">Compras & Precificação</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Inteligência comercial agro</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-0.5">
          {visible.map((item) => {
            const Icon = item.icon;
            const link = (
              <NavLink to={item.to} className={({ isActive }) => menuLinkClass(isActive, collapsed)}>
                <Icon size={18} className="shrink-0 opacity-90" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
            return collapsed ? <Tooltip key={item.to} label={item.label}>{link}</Tooltip> : <div key={item.to}>{link}</div>;
          })}
        </nav>

        {collapsed ? (
          <Button variant="ghost" className="mx-auto h-10 w-10 p-0" onClick={() => setCollapsed(false)} aria-label="Expandir menu">
            <ChevronRight size={16} />
          </Button>
        ) : (
          <Button variant="ghost" className="mt-4 min-h-9 w-full justify-center px-3 py-2 text-xs text-slate-300" onClick={() => setCollapsed(true)} aria-label="Recolher menu">
            <ChevronLeft size={14} />Recolher menu
          </Button>
        )}
      </div>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = usePermissions();
  const visible = items.filter((item) => canShowItem(item, user?.role));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm md:hidden" onClick={onClose}>
      <aside className="h-full w-80 max-w-[86vw] border-r border-white/[0.08] bg-[#03100f] p-4 shadow-panel" onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between border-b border-white/[0.07] pb-5 pt-1">
          <div>
            <BrandLogo />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-padap-green/90">Compras & Precificação</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">Inteligência comercial agro</p>
          </div>
          <Button variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label="Fechar menu">
            <ChevronLeft size={16} />
          </Button>
        </div>
        <nav className="space-y-1">
          {visible.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} onClick={onClose} className={({ isActive }) => menuLinkClass(isActive)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
