import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LockKeyhole, Mail, ShieldCheck, TrendingUp } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { BrandLogo } from "../components/layout/BrandLogo";

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("admin@padap.com.br");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  if (user) return <Navigate to="/" replace />;

  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-padap-graphite p-4 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(57,211,83,.26),transparent_32%),radial-gradient(circle_at_80%_5%,rgba(66,215,255,.13),transparent_28%),radial-gradient(circle_at_72%_92%,rgba(22,163,74,.14),transparent_32%),linear-gradient(135deg,#041010,#092a24_48%,#080f14)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden lg:block">
          <div className="mb-9"><BrandLogo className="[&>img]:h-[76px] [&>img]:w-16 [&_p:first-of-type]:text-[3rem] [&_p:last-of-type]:text-sm" /></div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-tight">Inteligência comercial para compras e precificação agro.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">Central PADAP para cotações, margens, pacotes, aprovações e sinais de mercado com governança corporativa.</p>
          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-4">
              <ShieldCheck className="mb-3 text-padap-green" />
              <p className="text-sm font-semibold">Controle por perfil</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Dados internos protegidos por permissão.</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-4">
              <TrendingUp className="mb-3 text-padap-cyan" />
              <p className="text-sm font-semibold">Decisão orientada a dados</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">PTAX, margem, validade e mercado no mesmo cockpit.</p>
            </div>
          </div>
        </section>

        <Card className="relative w-full max-w-md justify-self-center p-6 sm:p-7">
          <div className="mb-8 flex justify-center lg:hidden"><BrandLogo className="[&>img]:h-16 [&>img]:w-14 [&_p:first-of-type]:text-[2.35rem] [&_p:last-of-type]:text-xs" /></div>
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-padap-green">PADAP Intelligence</p>
          <h1 className="text-center text-2xl font-semibold">Compras & Precificação</h1>
          <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-slate-400">Acesse sua conta para acompanhar cotações, propostas, pacotes e inteligência de mercado.</p>
          <form className="mt-8 space-y-4" onSubmit={(event) => { event.preventDefault(); const result = login(email, password); setError(result.message || ""); }}>
            <label className="block text-sm text-slate-300"><span className="mb-2 flex items-center gap-2"><Mail size={15} />E-mail</span><Input value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label className="block text-sm text-slate-300"><span className="mb-2 flex items-center gap-2"><LockKeyhole size={15} />Senha</span><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            {error && <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
            <Button className="w-full" type="submit">Entrar</Button>
            <button className="w-full text-sm font-medium text-padap-mint transition hover:text-white" type="button">Esqueci minha senha</button>
          </form>
        </Card>
      </div>
    </main>
  );
}
