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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  if (user) return <Navigate to="/" replace />;

  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-padap-graphite p-4 text-padap-ink">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,#ffffff_0%,#f5f7f2_48%,#eaf4e5_100%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-1.5 bg-padap-green" />

      <div className="relative grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden lg:block">
          <div className="mb-9"><BrandLogo className="[&>img]:h-[76px] [&>img]:w-16 [&_p:first-of-type]:text-[3rem] [&_p:last-of-type]:text-sm" /></div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-tight text-padap-ink">Inteligencia comercial para produtividade agricola.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-padap-muted">Central PADAP para cotacoes, margens, pacotes, aprovacoes e sinais de mercado com governanca corporativa.</p>
          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-4">
            <div className="rounded-xl border border-padap-line bg-white p-4 shadow-panel">
              <ShieldCheck className="mb-3 text-padap-green" />
              <p className="text-sm font-semibold">Controle por perfil</p>
              <p className="mt-1 text-xs leading-5 text-padap-muted">Dados internos protegidos por permissao.</p>
            </div>
            <div className="rounded-xl border border-padap-line bg-white p-4 shadow-panel">
              <TrendingUp className="mb-3 text-padap-cyan" />
              <p className="text-sm font-semibold">Decisao orientada a dados</p>
              <p className="mt-1 text-xs leading-5 text-padap-muted">PTAX, margem, validade e mercado no mesmo cockpit.</p>
            </div>
          </div>
        </section>

        <Card className="relative w-full max-w-md justify-self-center p-6 sm:p-7">
          <div className="mb-8 flex justify-center lg:hidden"><BrandLogo className="[&>img]:h-16 [&>img]:w-14 [&_p:first-of-type]:text-[2.35rem] [&_p:last-of-type]:text-xs" /></div>
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-padap-green">PADAP Intelligence</p>
          <h1 className="text-center text-2xl font-semibold text-padap-ink">Compras & Precificacao</h1>
          <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-padap-muted">Acesse sua conta para acompanhar cotacoes, propostas, pacotes e inteligencia de mercado.</p>
          <form className="mt-8 space-y-4" onSubmit={(event) => { event.preventDefault(); const result = login(email, password); setError(result.message || ""); }}>
            <label className="block text-sm font-medium text-padap-ink"><span className="mb-2 flex items-center gap-2"><Mail size={15} />E-mail</span><Input value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label className="block text-sm font-medium text-padap-ink"><span className="mb-2 flex items-center gap-2"><LockKeyhole size={15} />Senha</span><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <Button className="w-full" type="submit">Entrar</Button>
            <button className="w-full text-sm font-medium text-padap-emerald transition hover:text-padap-green" type="button">Esqueci minha senha</button>
          </form>
        </Card>
      </div>
    </main>
  );
}
