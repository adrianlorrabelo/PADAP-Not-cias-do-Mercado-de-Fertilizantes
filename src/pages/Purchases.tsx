/* eslint-disable react-refresh/only-export-components */
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import { Roles, type Role } from "../types";

export type PurchaseTab = {
  to: string;
  label: string;
  roles: Role[];
};

export const purchaseTabs: PurchaseTab[] = [
  { to: "/compras/tabela-da-semana", label: "Lista Yara", roles: [Roles.Admin, Roles.Purchasing] },
  { to: "/compras/propostas", label: "Propostas", roles: [Roles.Admin, Roles.Manager, Roles.Purchasing, Roles.Consultant] },
  { to: "/compras/pacotes", label: "Pacotes", roles: [Roles.Admin, Roles.Manager, Roles.Purchasing] },
  { to: "/compras/estoque", label: "Estoque", roles: [Roles.Admin, Roles.Manager, Roles.Purchasing] },
  { to: "/compras/planner", label: "Planner", roles: [Roles.Admin, Roles.Manager, Roles.Purchasing] },
  { to: "/compras/campanhas", label: "Campanhas", roles: [Roles.Admin, Roles.Manager, Roles.Purchasing] },
  { to: "/compras/carteira", label: "Carteira", roles: [Roles.Admin, Roles.Purchasing] },
];

export function canAccessPurchaseTab(tab: PurchaseTab, role?: Role) {
  return !!role && tab.roles.includes(role);
}

export function getDefaultPurchasePath(role?: Role) {
  return purchaseTabs.find((tab) => canAccessPurchaseTab(tab, role))?.to || "/";
}

function tabClass(isActive: boolean) {
  return `inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "border-padap-green/35 bg-padap-green/10 text-padap-emerald shadow-[0_4px_16px_rgba(29,186,44,.12)]"
      : "border-padap-line bg-white text-padap-muted hover:border-padap-green/35 hover:bg-padap-green/10 hover:text-padap-ink"
  }`;
}

export function PurchasesIndexRedirect() {
  const { user } = usePermissions();
  return <Navigate to={getDefaultPurchasePath(user?.role)} replace />;
}

export default function Purchases() {
  const { user } = usePermissions();
  const visibleTabs = purchaseTabs.filter((tab) => canAccessPurchaseTab(tab, user?.role));

  if (visibleTabs.length === 0) return <Navigate to="/" replace />;

  return (
    <div>
      <div className="page-title">
        <h1>Compras</h1>
        <p>Lista Yara, propostas, pacotes e estoque reunidos em um fluxo único de navegação.</p>
      </div>

      <div className="mb-6 overflow-x-auto rounded-xl border border-padap-line bg-padap-field p-1.5 shadow-panel">
        <nav className="flex min-w-max gap-2" aria-label="Navegação de Compras">
          {visibleTabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} className={({ isActive }) => tabClass(isActive)}>
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
