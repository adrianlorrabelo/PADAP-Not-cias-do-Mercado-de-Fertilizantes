import type { ButtonHTMLAttributes } from "react";
import { simulatedAction } from "../../utils/uiActions";

export function Button({ className = "", variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "amber" }) {
  const variants = {
    primary: "border border-padap-mint/30 bg-gradient-to-b from-padap-mint to-padap-green text-[#03110d] shadow-glow hover:brightness-110 active:translate-y-px",
    ghost: "border border-white/10 bg-white/[0.045] text-slate-100 hover:border-padap-green/25 hover:bg-padap-green/[0.08] hover:text-white",
    danger: "bg-red-500/12 text-red-100 border border-red-400/25 hover:bg-red-500/22",
    amber: "bg-padap-amber/12 text-amber-100 border border-padap-amber/30 hover:bg-padap-amber/22"
  };
  const fallbackClick = props.type === "submit" || props.disabled || props.onClick
    ? props.onClick
    : () => simulatedAction("Ação registrada.");

  return <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold tracking-[0.01em] transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props} onClick={fallbackClick} />;
}
