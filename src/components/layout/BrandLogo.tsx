import symbolUrl from "../../assets/logo/padap-symbol.svg";

type BrandLogoProps = {
  compact?: boolean;
  tone?: "light" | "green";
  className?: string;
};

export function BrandLogo({ compact = false, tone = "light", className = "" }: BrandLogoProps) {
  const textClass = tone === "green" ? "text-white" : "text-padap-ink";
  const subtitleClass = tone === "green" ? "text-white/85" : "text-padap-muted";
  const symbolClass = tone === "green" ? "rounded-lg bg-white p-1.5 shadow-[0_10px_22px_rgba(0,0,0,.16)]" : "";

  if (compact) {
    return (
      <img
        src={symbolUrl}
        alt="PADAP"
        className={`h-10 w-10 object-contain ${symbolClass} ${className}`}
      />
    );
  }

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`} aria-label="PADAP Intelligence">
      <img
        src={symbolUrl}
        alt=""
        className={`h-12 w-11 shrink-0 object-contain ${symbolClass}`}
      />
      <div className="min-w-0">
        <p className={`truncate text-[1.08rem] font-semibold leading-tight tracking-[0.01em] ${textClass}`}>PADAP Intelligence</p>
        <p className={`mt-1 truncate text-[0.72rem] font-medium leading-tight ${subtitleClass}`}>Produtividade Agricola</p>
      </div>
    </div>
  );
}
