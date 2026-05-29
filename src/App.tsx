import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { usePermissions } from "./hooks/usePermissions";
import Login from "./pages/Login";
import Cockpit from "./pages/Cockpit";
import MarketIntelligence from "./pages/MarketIntelligence";
import WeeklyTable from "./pages/WeeklyTable";
import BroadcastList from "./pages/BroadcastList";
import Purchases, { PurchasesIndexRedirect } from "./pages/Purchases";
import Proposals from "./pages/Proposals";
import Packages from "./pages/Packages";
import Stock from "./pages/Stock";
import Planner from "./pages/Planner";
import Campaigns from "./pages/Campaigns";
import Approvals from "./pages/Approvals";
import Clients from "./pages/Clients";
import Consultants from "./pages/Consultants";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import PurchasePortfolio from "./pages/PurchasePortfolio";
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
        <Route path="/compras" element={<Purchases />}>
          <Route index element={<PurchasesIndexRedirect />} />
          <Route path="tabela-da-semana" element={<RoleOnly allowed={["Administrador Geral", "Compras / Precificação"]}><WeeklyTable /></RoleOnly>} />
          <Route path="propostas" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação", "Consultor"]}><Proposals /></RoleOnly>} />
          <Route path="pacotes" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação"]}><Packages /></RoleOnly>} />
          <Route path="estoque" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação"]}><Stock /></RoleOnly>} />
          <Route path="planner" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação"]}><Planner /></RoleOnly>} />
          <Route path="campanhas" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação"]}><Campaigns /></RoleOnly>} />
        </Route>
        <Route path="/tabela" element={<Navigate to="/compras/tabela-da-semana" replace />} />
        <Route path="/tabela-da-semana" element={<Navigate to="/compras/tabela-da-semana" replace />} />
        <Route path="/propostas" element={<Navigate to="/compras/propostas" replace />} />
        <Route path="/pacotes" element={<Navigate to="/compras/pacotes" replace />} />
        <Route path="/estoque" element={<Navigate to="/compras/estoque" replace />} />
        <Route path="/aprovacoes" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação"]}><Approvals /></RoleOnly>} />
        <Route path="/clientes" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação", "Consultor"]}><Clients /></RoleOnly>} />
        <Route path="/consultores" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação"]}><Consultants /></RoleOnly>} />
        <Route path="/relatorios" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Visualizador"]}><Reports /></RoleOnly>} />
        <Route path="/usuarios" element={<AdminOnly><Users /></AdminOnly>} />
        <Route path="/lista-transmissao" element={<RoleOnly allowed={["Administrador Geral", "Gestor / Gerente", "Compras / Precificação", "Visualizador"]}><BroadcastList /></RoleOnly>} />
        <Route path="/carteira-compras" element={<RoleOnly allowed={["Administrador Geral", "Compras / Precificação"]}><PurchasePortfolio /></RoleOnly>} />
        <Route path="/configuracoes" element={<Settings />} />
      </Route>
    </Routes>
  );
}

