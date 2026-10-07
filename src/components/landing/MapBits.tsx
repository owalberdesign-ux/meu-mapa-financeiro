import Image from "next/image";

const ASSETS = {
  coins: { w: 343, h: 420 },
  compass: { w: 415, h: 420 },
  calendar: { w: 389, h: 420 },
  flag: { w: 283, h: 420 },
  pin: { w: 257, h: 360 },
  map: { w: 900, h: 636 },
} as const;

export type Asset3D = keyof typeof ASSETS;

/** Objeto 3D decorativo: flutua e sobe um pouco mais devagar que a página. A posição vem em `className`. */
export function Float3D({
  name,
  className,
  delay = 0,
  priority = false,
  parallax = true,
}: {
  name: Asset3D;
  className: string;
  delay?: number;
  priority?: boolean;
  /** Desligue quando o objeto estiver dentro de um painel que corta o que sai dele. */
  parallax?: boolean;
}) {
  const { w, h } = ASSETS[name];
  return (
    <div aria-hidden="true" className={`pointer-events-none ${parallax ? "parallax" : ""} ${className}`}>
      <Image
        src={`/3d/${name}.webp`}
        alt=""
        width={w}
        height={h}
        priority={priority}
        sizes={name === "map" ? "(min-width: 1024px) 448px, 90vw" : "200px"}
        className="h-auto w-full animate-float drop-shadow-[0_20px_22px_rgba(20,23,20,0.22)] motion-reduce:animate-none"
        style={delay ? { animationDelay: `${-delay}s` } : undefined}
      />
    </div>
  );
}

/** Trecho de rota tracejada que liga uma seção à outra, como num mapa. */
export function RouteDivider({ flip = false, dark = false }: { flip?: boolean; dark?: boolean }) {
  const d = flip ? "M820 0 C 820 70, 180 50, 180 120" : "M180 0 C 180 70, 820 50, 820 120";
  return (
    <div aria-hidden="true" className="pointer-events-none relative mx-auto h-20 max-w-6xl px-4 sm:h-28 sm:px-6">
      <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="route-reveal size-full overflow-visible">
        <path d={d} fill="none" stroke={dark ? "#ffffff1f" : "#1417140f"} strokeWidth="10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path
          d={d}
          fill="none"
          stroke={dark ? "#22c55e" : "#15803d"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 10"
          vectorEffect="non-scaling-stroke"
          className="route-march"
        />
      </svg>
    </div>
  );
}

/** Marcador de parada no lugar do "eyebrow" de cada seção. */
export function StopChip({ n, label, dark = false }: { n?: number; label: string; dark?: boolean }) {
  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full py-1 pr-3.5 pl-1 text-[13px] font-semibold ${
        dark ? "bg-white/10 text-white" : "border border-line bg-surface text-ink shadow-sm"
      }`}
    >
      <span
        className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[12px] tabular-nums ${
          n === undefined ? "bg-ink text-white" : "bg-brand-strong text-white"
        } ${dark && n === undefined ? "bg-white text-ink" : ""}`}
      >
        {n === undefined ? (
          <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
            <path d="M5 21V4h11l-1.6 3.5L16 11H7v10z" />
          </svg>
        ) : (
          n
        )}
      </span>
      <span className={dark ? "text-white/60" : "text-muted"}>{n === undefined ? "Destino" : `Parada ${n}`}</span>
      <span aria-hidden="true" className={dark ? "text-white/30" : "text-line"}>
        ·
      </span>
      {label}
    </p>
  );
}
