import type { ButtonHTMLAttributes } from "react";
import { simulatedAction } from "../../utils/uiActions";

export function Button({ className = "", variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "amber" }) {
  const variants = {
    primary: "border border-padap-green bg-padap-green text-white shadow-glow hover:bg-[#169d25] active:translate-y-px",
    ghost: "border border-padap-line bg-white text-padap-ink hover:border-padap-emerald/35 hover:bg-padap-mint",
    danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
    amber: "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
  };
  const fallbackClick = props.type === "submit" || props.disabled || props.onClick
    ? props.onClick
    : () => simulatedAction("Ação registrada.");

  return <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold tracking-[0.01em] transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props} onClick={fallbackClick} />;
}
