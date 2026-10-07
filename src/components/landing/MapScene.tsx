"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { brl } from "@/lib/format";
import { SAMPLE_DIAGNOSTIC } from "@/lib/sample";
import { Meter, StatusBadge } from "@/components/ui";
import { PROFILE_LABEL, PROFILE_TONE } from "@/lib/report-builder";

const { report } = SAMPLE_DIAGNOSTIC;
const m = report.metrics;

function shortHorizon(horizon: string) {
  if (horizon.startsWith("Seu destino")) return "Destino";
  if (horizon === "Próximos 30 dias") return "Próximos 30 dias";
  return horizon.replace("Em cerca de ", "Em ~");
}

type Stop = { key: string; x: number; y: number; kind: "start" | "pin" | "flag"; eyebrow: string; title: string };

/** Paradas do exemplo, posicionadas sobre o tabuleiro (coordenadas em %). */
const STOPS: Stop[] = [
  {
    key: "start",
    x: 12,
    y: 67,
    kind: "start",
    eyebrow: "Você está aqui",
    title: `Score ${report.score} · sobram ${brl(m.monthlyMargin)}`,
  },
  {
    key: report.route[0].key,
    x: 37,
    y: 58,
    kind: "pin",
    eyebrow: shortHorizon(report.route[0].horizon),
    title: report.route[0].title,
  },
  {
    key: report.route[1].key,
    x: 63,
    y: 51,
    kind: "pin",
    eyebrow: shortHorizon(report.route[1].horizon),
    title: report.route[1].title.replace("Primeiro degrau da reserva: ", "Reserva de "),
  },
  {
    key: "goal",
    x: 86,
    y: 44,
    kind: "flag",
    eyebrow: "Destino",
    title: report.route[report.route.length - 1].title,
  },
];

const ROUTE = "M12 67 C 20 76, 30 66, 37 58 S 52 44, 63 51 S 80 54, 86 44";

const BASE = { rx: 56, rz: -34 };

/** Distância do cartão até o chão, para não cobrir o objeto da parada. */
const CARD_OFFSET: Record<Stop["kind"], string> = {
  start: "bottom-7",
  pin: "bottom-16 sm:bottom-[76px]",
  flag: "bottom-[86px] sm:bottom-[100px]",
};

export function MapScene() {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const [tilt, setTilt] = useState(BASE);
  const frame = useRef<number | null>(null);

  // Percorre as paradas sozinho até a pessoa tocar em uma.
  useEffect(() => {
    if (touched) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % STOPS.length), 2800);
    return () => window.clearInterval(id);
  }, [touched]);

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const dy = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setTilt({ rx: BASE.rx - dy * 7, rz: BASE.rz + dx * 9 }));
  }

  const vars = { "--rx": `${tilt.rx}deg`, "--rz": `${tilt.rz}deg` } as CSSProperties;
  const tone = PROFILE_TONE[report.profile];

  return (
    <div
      className="relative mx-auto h-[430px] w-full max-w-[520px] select-none sm:h-[500px]"
      style={vars}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setTilt(BASE)}
      aria-label="Exemplo de mapa financeiro: do ponto em que a pessoa está até o destino"
      role="group"
    >
      {/* brilho verde atrás do tabuleiro */}
      <div aria-hidden="true" className="absolute inset-x-10 top-16 bottom-10 -z-10 rounded-full bg-brand/25 blur-3xl" />

      {/* Só os botões das paradas recebem toque: no 3D o papel do mapa "roubaria" o clique. */}
      <div className="pointer-events-none absolute inset-x-0 top-12 bottom-0 grid place-items-center [perspective:1300px] sm:top-8">
        <div className="board-sway [transform-style:preserve-3d]">
          <div
            className="relative size-[280px] [transform-style:preserve-3d] transition-transform duration-500 ease-out sm:size-[380px]"
            style={{ transform: "rotateX(var(--rx)) rotateZ(var(--rz))" }}
          >
            {/* espessura do tabuleiro */}
            <div aria-hidden="true" className="absolute inset-0 rounded-[30px] bg-[#cfd8cf]" style={{ transform: "translateZ(-14px)" }} />
            <div aria-hidden="true" className="absolute inset-0 rounded-[30px] bg-[#e1e7e1]" style={{ transform: "translateZ(-7px)" }} />
            {/* papel do mapa */}
            <div
              aria-hidden="true"
              className="absolute inset-0 overflow-hidden rounded-[30px] border border-white bg-[#fbfcfa] shadow-[0_40px_80px_-30px_rgba(20,23,20,0.55)]"
            >
              <div className="absolute inset-0 bg-grid opacity-70" />
              <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" preserveAspectRatio="none">
                <path d="M-4 22 C 10 12, 24 16, 34 6 L 34 -4 L -4 -4 Z" fill="#dcfce7" />
                <path d="M40 104 C 46 86, 66 78, 76 86 S 98 80, 104 68 L 104 104 Z" fill="#dcfce7" />
                <path d="M54 4 C 60 14, 74 18, 84 12 S 98 4, 104 8 L 104 -4 L 54 -4 Z" fill="#bbf7d0" opacity="0.7" />
                <path d="M-4 74 C 6 70, 16 76, 22 84 S 20 100, 12 104 L -4 104 Z" fill="#bbf7d0" opacity="0.7" />
                <path d="M30 104 C 34 92, 26 84, 34 74 S 48 66, 52 60" fill="none" stroke="#93c5fd" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
                {/* onda no chão em volta do "você está aqui" */}
                <circle cx={STOPS[0].x} cy={STOPS[0].y} r="2" fill="#141714" className="pin-pulse" />
                <path d={ROUTE} fill="none" stroke="#14171412" strokeWidth="12" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path
                  d={ROUTE}
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="3 9"
                  className="route-march"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            {/* morrinhos em relevo */}
            {[
              { x: 74, y: 70, s: 34, z: 10 },
              { x: 26, y: 24, s: 26, z: 7 },
              { x: 46, y: 18, s: 18, z: 5 },
            ].map((h) => (
              <div
                key={`${h.x}-${h.y}`}
                aria-hidden="true"
                className="absolute rounded-full bg-[radial-gradient(circle_at_35%_30%,#86efac,#22c55e_60%,#15803d)] shadow-[0_10px_18px_-8px_rgba(21,128,61,0.6)]"
                style={{
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  width: h.s,
                  height: h.s,
                  transform: `translate(-50%, -50%) translateZ(${h.z}px)`,
                }}
              />
            ))}

            {STOPS.map((stop, i) => {
              const isActive = i === active;
              return (
                <div
                  key={stop.key}
                  className="absolute [transform-style:preserve-3d]"
                  style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
                >
                  {/* sombra no chão */}
                  <span
                    aria-hidden="true"
                    className="absolute block h-4 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(20,23,20,0.32),transparent)]"
                  />
                  {/* objeto em pé, sempre de frente para quem olha */}
                  <div
                    className="pointer-events-none absolute -top-[200px] -left-[110px] h-[200px] w-[220px] origin-bottom transition-transform duration-500 ease-out [transform-style:preserve-3d]"
                    style={{ transform: "rotateZ(calc(var(--rz) * -1)) rotateX(calc(var(--rx) * -1))" }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setTouched(true);
                        setActive(i);
                      }}
                      aria-label={`${stop.eyebrow}: ${stop.title}`}
                      aria-pressed={isActive}
                      className={`pointer-events-auto absolute bottom-0 left-1/2 -translate-x-1/2 cursor-pointer rounded-full outline-none focus-visible:ring-4 focus-visible:ring-brand/40 ${
                        stop.kind === "start" ? "translate-y-3.5" : ""
                      }`}
                    >
                      {stop.kind === "start" ? (
                        <span className="mb-1 grid size-6 place-items-center">
                          <span className="size-4 rounded-full border-[3px] border-white bg-ink shadow-[0_2px_4px_rgba(20,23,20,0.3)]" />
                        </span>
                      ) : (
                        <Image
                          src={stop.kind === "flag" ? "/3d/flag.webp" : "/3d/pin.webp"}
                          alt=""
                          width={stop.kind === "flag" ? 283 : 257}
                          height={stop.kind === "flag" ? 420 : 360}
                          priority
                          className={`h-auto max-w-none transition-transform duration-300 ${
                            stop.kind === "flag" ? "w-12 sm:w-14" : "w-8 sm:w-10"
                          } ${isActive ? "-translate-y-1.5 scale-110" : ""}`}
                        />
                      )}
                    </button>

                    {/* cartão da parada */}
                    <div
                      className={`pointer-events-none absolute left-1/2 w-max max-w-[170px] -translate-x-1/2 rounded-2xl border border-line bg-surface px-3 py-2 text-left shadow-[0_14px_30px_-14px_rgba(20,23,20,0.45)] transition-all duration-300 sm:max-w-[200px] ${CARD_OFFSET[stop.kind]} ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                      }`}
                      aria-hidden={!isActive}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-strong">
                        {stop.eyebrow}
                      </p>
                      <p className="text-[12px] font-semibold leading-snug sm:text-[13px]">{stop.title}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* objetos 3D flutuando em volta */}
      <Image
        src="/3d/coins.webp"
        alt=""
        width={343}
        height={420}
        priority
        aria-hidden="true"
        className="pointer-events-none absolute top-4 left-0 h-auto w-16 animate-float drop-shadow-[0_18px_20px_rgba(20,23,20,0.25)] motion-reduce:animate-none sm:w-24"
      />
      <Image
        src="/3d/compass.webp"
        alt=""
        width={415}
        height={420}
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-4 h-auto w-16 animate-float [animation-delay:-3s] drop-shadow-[0_18px_20px_rgba(20,23,20,0.25)] motion-reduce:animate-none sm:w-24"
      />

      {/* score do exemplo */}
      <div className="absolute bottom-2 left-0 w-[150px] animate-float rounded-2xl border border-line bg-surface/95 p-3 shadow-[0_18px_40px_-18px_rgba(20,23,20,0.45)] backdrop-blur [animation-delay:-5s] motion-reduce:animate-none sm:w-[170px]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Seu score</p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="leading-none">
            <span className="text-3xl font-semibold tracking-tighter">{report.score}</span>
            <span className="text-[11px] text-muted"> /100</span>
          </p>
          <StatusBadge tone={tone} compact>
            {PROFILE_LABEL[report.profile]}
          </StatusBadge>
        </div>
        <div className="mt-2">
          <Meter value={report.score / 100} tone={tone} label="Score do exemplo" />
        </div>
      </div>

      <p className="absolute top-0 right-0 flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-2.5 py-1 text-[12px] font-medium text-muted shadow-sm backdrop-blur">
        <span className="size-1.5 rounded-full bg-brand" />
        Explore as paradas
      </p>
    </div>
  );
}
