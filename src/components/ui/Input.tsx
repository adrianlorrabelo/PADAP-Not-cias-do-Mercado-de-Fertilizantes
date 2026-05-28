import type { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-lg border border-padap-line bg-white px-3.5 py-2.5 text-sm font-medium text-padap-ink outline-none transition placeholder:font-normal placeholder:text-padap-muted/60 disabled:cursor-not-allowed disabled:bg-padap-field disabled:opacity-70 focus:border-padap-green focus:shadow-[0_0_0_3px_rgba(29,186,44,.14)] ${props.className || ""}`} />;
}
