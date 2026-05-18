import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Toast } from "../ui/Toast";
import { Header } from "./Header";
import { MobileSidebar, Sidebar } from "./Sidebar";

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-padap-graphite text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_-8%,rgba(57,211,83,.18),transparent_30%),radial-gradient(circle_at_88%_4%,rgba(66,215,255,.095),transparent_26%),radial-gradient(circle_at_54%_108%,rgba(22,163,74,.12),transparent_32%),linear-gradient(135deg,#041011,#08221f_44%,#071015)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="relative flex">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Header onOpenMenu={() => setMobileMenuOpen(true)} />
          <div className="mx-auto max-w-[1500px] p-4 sm:p-5 lg:p-8 xl:p-10"><Outlet /></div>
        </main>
      </div>
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <Toast />
    </div>
  );
}
