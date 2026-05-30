import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Toast } from "../ui/Toast";
import { Header } from "./Header";
import { MobileSidebar, Sidebar } from "./Sidebar";
import { ErrorBoundary } from "./ErrorBoundary";

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-padap-graphite text-padap-ink">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[3px] bg-padap-green" />
      <div className="relative flex">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Header onOpenMenu={() => setMobileMenuOpen(true)} />
          <div className="mx-auto w-full max-w-[1640px] p-4 sm:p-5 lg:p-7 xl:p-8">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <Toast />
    </div>
  );
}
