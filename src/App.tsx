import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { usePermissions } from "./hooks/usePermissions";
import { Roles, type Role } from "./types";
import Login from "./pages/Login";

const Cockpit = lazy(() => import("./pages/Cockpit"));
const MarketIntelligence = lazy(() => import("./pages/MarketIntelligence"));
const WeeklyTable = lazy(() => import("./pages/WeeklyTable"));
const BroadcastList = lazy(() => import("./pages/BroadcastList"));
const Purchases = lazy(() => import("./pages/Purchases"));
const PurchasesIndexRedirect = lazy(() =>
  import("./pages/Purchases").then((m) => ({ default: m.PurchasesIndexRedirect }))
);
const Proposals = lazy(() => import("./pages/Proposals"));
const Packages = lazy(() => import("./pages/Packages"));
const Stock = lazy(() => import("./pages/Stock"));
const Planner = lazy(() => import("./pages/Planner"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const Approvals = lazy(() => import("./pages/Approvals"));
const Clients = lazy(() => import("./pages/Clients"));
const Consultants = lazy(() => import("./pages/Consultants"));
const Reports = lazy(() => import("./pages/Reports"));
const Users = lazy(() => import("./pages/Users"));
const Settings = lazy(() => import("./pages/Settings"));
const PurchasePortfolio = lazy(() => import("./pages/PurchasePortfolio"));

function PageLoader() {
  return (
    <div className="flex h-full min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-padap-line border-t-padap-green" />
    </div>
  );
}

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
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<Cockpit />} />
          <Route path="/mercado" element={<RoleOnly allowed={[Roles.Admin, Roles.Manager, Roles.Purchasing, Roles.Viewer]}><MarketIntelligence /></RoleOnly>} />
          <Route path="/compras" element={<Purchases />}>
            <Route index element={<PurchasesIndexRedirect />} />
            <Route path="tabela-da-semana" element={<RoleOnly allowed={[Roles.Admin, Roles.Purchasing]}><WeeklyTable /></RoleOnly>} />
            <Route path="propostas" element={<RoleOnly allowed={[Roles.Admin, Roles.Manager, Roles.Purchasing, Roles.Consultant]}><Proposals /></RoleOnly>} />
            <Route path="pacotes" element={<RoleOnly allowed={[Roles.Admin, Roles.Manager, Roles.Purchasing]}><Packages /></RoleOnly>} />
            <Route path="estoque" element={<RoleOnly allowed={[Roles.Admin, Roles.Manager, Roles.Purchasing]}><Stock /></RoleOnly>} />
            <Route path="planner" element={<RoleOnly allowed={[Roles.Admin, Roles.Manager, Roles.Purchasing]}><Planner /></RoleOnly>} />
            <Route path="campanhas" element={<RoleOnly allowed={[Roles.Admin, Roles.Manager, Roles.Purchasing]}><Campaigns /></RoleOnly>} />
            <Route path="carteira" element={<RoleOnly allowed={[Roles.Admin, Roles.Purchasing]}><PurchasePortfolio /></RoleOnly>} />
          </Route>
          <Route path="/tabela" element={<Navigate to="/compras/tabela-da-semana" replace />} />
          <Route path="/tabela-da-semana" element={<Navigate to="/compras/tabela-da-semana" replace />} />
          <Route path="/propostas" element={<Navigate to="/compras/propostas" replace />} />
          <Route path="/pacotes" element={<Navigate to="/compras/pacotes" replace />} />
          <Route path="/estoque" element={<Navigate to="/compras/estoque" replace />} />
          <Route path="/aprovacoes" element={<RoleOnly allowed={[Roles.Admin, Roles.Manager, Roles.Purchasing]}><Approvals /></RoleOnly>} />
          <Route path="/clientes" element={<RoleOnly allowed={[Roles.Admin, Roles.Manager, Roles.Purchasing, Roles.Consultant]}><Clients /></RoleOnly>} />
          <Route path="/consultores" element={<RoleOnly allowed={[Roles.Admin, Roles.Manager, Roles.Purchasing]}><Consultants /></RoleOnly>} />
          <Route path="/relatorios" element={<RoleOnly allowed={[Roles.Admin, Roles.Manager, Roles.Viewer]}><Reports /></RoleOnly>} />
          <Route path="/usuarios" element={<AdminOnly><Users /></AdminOnly>} />
          <Route path="/lista-transmissao" element={<RoleOnly allowed={[Roles.Admin, Roles.Manager, Roles.Purchasing, Roles.Viewer]}><BroadcastList /></RoleOnly>} />
          <Route path="/carteira-compras" element={<Navigate to="/compras/carteira" replace />} />
          <Route path="/configuracoes" element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
