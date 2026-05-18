import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { usePermissions } from "./hooks/usePermissions";
import Login from "./pages/Login";
import Cockpit from "./pages/Cockpit";
import MarketIntelligence from "./pages/MarketIntelligence";
import WeeklyTable from "./pages/WeeklyTable";
import Proposals from "./pages/Proposals";
import Packages from "./pages/Packages";
import Approvals from "./pages/Approvals";
import Clients from "./pages/Clients";
import Consultants from "./pages/Consultants";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import type { Role } from "./types";

function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin } = usePermissions();
  return isAdmin ? children : <Navigate to="/" replace />;
}

function RoleOnly({ children, allowed }: { children: ReactNode; allowed: Role[] }) {
  const { user } = usePermissions();
  return user && allowed.includes(user.role) ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Cockpit />} />
        <Route path="/mercado" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação", "Visualizador"]}><MarketIntelligence /></RoleOnly>} />
        <Route path="/tabela" element={<RoleOnly allowed={["Administrador Geral", "Compras / Precificação"]}><WeeklyTable /></RoleOnly>} />
        <Route path="/propostas" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação", "Consultor"]}><Proposals /></RoleOnly>} />
        <Route path="/pacotes" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação"]}><Packages /></RoleOnly>} />
        <Route path="/aprovacoes" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação"]}><Approvals /></RoleOnly>} />
        <Route path="/clientes" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação", "Consultor"]}><Clients /></RoleOnly>} />
        <Route path="/consultores" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação"]}><Consultants /></RoleOnly>} />
        <Route path="/relatorios" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Visualizador"]}><Reports /></RoleOnly>} />
        <Route path="/usuarios" element={<AdminOnly><Users /></AdminOnly>} />
        <Route path="/configuracoes" element={<Settings />} />
      </Route>
    </Routes>
  );
}
