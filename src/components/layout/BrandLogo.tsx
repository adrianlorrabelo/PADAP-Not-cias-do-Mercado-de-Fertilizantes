import symbolUrl from "../../assets/logo/padap-symbol.svg";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  if (compact) {
    return (
      <img
        src={symbolUrl}
        alt="PADAP"
        className={`h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(0,200,0,.18)] ${className}`}
      />
    );
  }

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`} aria-label="PADAP Intelligence">
      <img
        src={symbolUrl}
        alt=""
        className="h-12 w-11 shrink-0 object-contain drop-shadow-[0_0_14px_rgba(0,200,0,.18)]"
      />
      <div className="min-w-0">
        <p className="truncate text-[1.08rem] font-semibold leading-tight tracking-[0.01em] text-white">PADAP Intelligence</p>
        <p className="mt-1 truncate text-[0.72rem] font-medium leading-tight text-slate-300">Produtividade Agrícola</p>
      </div>
    </div>
  );
}
