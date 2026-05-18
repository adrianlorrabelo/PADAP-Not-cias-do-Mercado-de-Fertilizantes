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
        className={`h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(57,211,83,.16)] ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`} aria-label="PADAP Produtividade Agrícola">
      <img
        src={symbolUrl}
        alt=""
        className="h-[52px] w-12 shrink-0 object-contain drop-shadow-[0_0_10px_rgba(57,211,83,.14)]"
      />
      <div className="min-w-0 leading-none">
        <p className="text-[1.95rem] font-semibold tracking-[0.06em] text-white">PADAP</p>
        <p className="-mt-0.5 text-[0.68rem] font-semibold leading-tight text-white/90">
          Produtividade
          <br />
          Agrícola
        </p>
      </div>
    </div>
  );
}
