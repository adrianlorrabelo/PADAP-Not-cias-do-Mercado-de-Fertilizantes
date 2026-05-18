import type { SelectHTMLAttributes } from "react";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-lg border border-white/10 bg-[#061314]/90 px-3.5 py-2.5 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus:border-padap-green/70 focus:shadow-[0_0_0_3px_rgba(57,211,83,.10)] ${props.className || ""}`} />;
}
