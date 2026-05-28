import type { SelectHTMLAttributes } from "react";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-lg border border-padap-line bg-white px-3.5 py-2.5 text-sm font-medium text-padap-ink outline-none transition disabled:cursor-not-allowed disabled:bg-padap-field disabled:opacity-70 focus:border-padap-green focus:shadow-[0_0_0_3px_rgba(29,186,44,.14)] ${props.className || ""}`} />;
}
