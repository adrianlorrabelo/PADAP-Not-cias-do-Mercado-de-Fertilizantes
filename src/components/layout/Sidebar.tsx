import { BarChart3, Brain, ChevronLeft, ChevronRight, Home, MessageCircle, PackageOpen, Settings, ShoppingCart, Users, UserCog, UserRoundCheck, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { usePermissions } from "../../hooks/usePermissions";
import { purchaseTabs } from "../../pages/Purchases";
import type { Role } from "../../types";
import { Button } from "../ui/Button";
import { Tooltip } from "../ui/Tooltip";
import { BrandLogo } from "./BrandLogo";

type SidebarSection = "principal" | "operacao" | "gestao";

type SidebarItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  section: SidebarSection;
  roles?: Role[];
};

const pricingRole: Role = "Compras / Precificação";
const purchaseRoles = [...new Set(purchaseTabs.flatMap((tab) => tab.roles))];

const items: SidebarItem[] = [
  { to: "/", label: "Cockpit", icon: Home, section: "principal" },
  { to: "/mercado", label: "Mercado", icon: Brain, section: "principal", roles: ["Administrador Geral", "Gestor / Gerente", pricingRole, "Visualizador"] },
  { to: "/compras", label: "Compras", icon: ShoppingCart, section: "principal", roles: purchaseRoles },
  { to: "/aprovacoes", label: "Aprovações", icon: UserRoundCheck, section: "operacao", roles: ["Administrador Geral", "Gestor / Gerente", pricingRole] },
  { to: "/carteira-compras", label: "Controle de Carteira", icon: Wallet, section: "operacao", roles: ["Administrador Geral", pricingRole] },
  { to: "/lista-transmissao", label: "Transmissão", icon: MessageCircle, section: "operacao", roles: ["Administrador Geral", "Gestor / Gerente", pricingRole, "Visualizador"] },
  { to: "/clientes", label: "Clientes", icon: Users, section: "operacao", roles: ["Administrador Geral", "Gestor / Gerente", pricingRole, "Consultor"] },
  { to: "/consultores", label: "Consultores", icon: UserCog, section: "gestao", roles: ["Administrador Geral", "Gestor / Gerente", pricingRole] },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3, section: "gestao", roles: ["Administrador Geral", "Gestor / Gerente", "Visualizador"] },
  { to: "/usuarios", label: "Usuários", icon: PackageOpen, section: "gestao", roles: ["Administrador Geral"] },
  { to: "/configuracoes", label: "Configurações", icon: Settings, section: "gestao" }
];

const sections: Array<{ id: SidebarSection; label: string }> = [
  { id: "principal", label: "Comando" },
  { id: "operacao", label: "Operação" },
  { id: "gestao", label: "Gestão" }
];

function canShowItem(item: SidebarItem, role?: Role) {
  return !item.roles || (!!role && item.roles.includes(role));
}

function menuLinkClass(isActive: boolean, collapsed = false) {
  return `group relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition duration-200 ${
    isActive
      ? "bg-white text-[#0f4c4f] shadow-[0_10px_24px_rgba(0,0,0,.16)] ring-1 ring-white/70 before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-[#1dba2c]"
      : "text-white/88 hover:bg-white/14 hover:text-white"
  } ${collapsed ? "justify-center" : ""}`;
}

function SidebarLinks({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { user } = usePermissions();
  const visible = items.filter((item) => canShowItem(item, user?.role));

  return (
    <nav className={collapsed ? "flex-1 space-y-4 px-0.5" : "flex-1 space-y-4 px-0.5"}>
      {sections.map((section) => {
        const sectionItems = visible.filter((item) => item.section === section.id);
        if (!sectionItems.length) return null;

        return (
          <div key={section.id} className="space-y-1">
            {!collapsed && <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/78">{section.label}</p>}
            {sectionItems.map((item) => {
              const Icon = item.icon;
              const link = (
                <NavLink to={item.to} onClick={onNavigate} className={({ isActive }) => menuLinkClass(isActive, collapsed)}>
                  <Icon size={18} className="shrink-0 opacity-90" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );

              return collapsed ? <Tooltip key={item.to} label={item.label}>{link}</Tooltip> : <div key={item.to}>{link}</div>;
            })}
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useLocalStorage("padap.ui.sidebarCollapsed", typeof window !== "undefined" ? window.innerWidth < 900 : false);

  return (
    <aside className={`padap-green-sidebar sticky top-0 hidden h-screen shrink-0 border-r border-[#0b3e41] bg-[linear-gradient(180deg,#0f4c4f_0%,#0a3c3f_55%,#072a2c_100%)] p-3 shadow-[14px_0_34px_rgba(15,76,79,.22)] transition-all duration-300 md:block ${collapsed ? "w-[76px]" : "w-[256px]"}`}>
      <div className="flex h-full flex-col">
        <div className={`mb-5 border-b border-white/22 ${collapsed ? "flex flex-col items-center gap-4 px-0 pb-5 pt-2" : "px-2 pb-5 pt-2"}`}>
          <div className={collapsed ? "flex justify-center" : "p-1"}>
            <BrandLogo compact={collapsed} tone="green" />
          </div>
          {!collapsed && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white">Intelligence</p>
              <p className="mt-1 text-xs font-medium leading-5 text-white/85">Comercial simples e preciso</p>
            </div>
          )}
        </div>

        <SidebarLinks collapsed={collapsed} />

        {collapsed ? (
          <Button variant="ghost" className="mx-auto h-10 w-10 p-0" onClick={() => setCollapsed(false)} aria-label="Expandir menu">
            <ChevronRight size={16} />
          </Button>
        ) : (
          <Button variant="ghost" className="mt-4 min-h-9 w-full justify-center border-white/25 bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/18 hover:text-white" onClick={() => setCollapsed(true)} aria-label="Recolher menu">
            <ChevronLeft size={14} />Recolher menu
          </Button>
        )}
      </div>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm md:hidden" onClick={onClose}>
      <aside className="padap-green-sidebar h-full w-80 max-w-[86vw] border-r border-[#0b3e41] bg-[linear-gradient(180deg,#1dba2c_0%,#0f7774_45%,#0f4c4f_100%)] p-4 shadow-panel" onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between border-b border-white/22 pb-5 pt-1">
          <div>
            <BrandLogo tone="green" />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">Intelligence</p>
            <p className="mt-1 text-xs font-medium leading-5 text-white/85">Comercial simples e preciso</p>
          </div>
          <Button variant="ghost" className="h-9 w-9 border-white/25 bg-white/10 p-0 text-white hover:bg-white/18 hover:text-white" onClick={onClose} aria-label="Fechar menu">
            <ChevronLeft size={16} />
          </Button>
        </div>
        <SidebarLinks onNavigate={onClose} />
      </aside>
    </div>
  );
}
