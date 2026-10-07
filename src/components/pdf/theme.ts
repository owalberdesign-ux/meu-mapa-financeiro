import { Font, StyleSheet } from "@react-pdf/renderer";
import type { Status } from "@/lib/report-insights";

/** Mesmas cores da interface (src/app/globals.css). */
export const C = {
  ink: "#141714",
  canvas: "#F6F7F5",
  surface: "#FFFFFF",
  muted: "#667067",
  line: "#E4E8E4",
  track: "#EEF1EE",
  brand: "#22C55E",
  brandStrong: "#15803D",
  brandDeep: "#166534",
  brandSoft: "#DCFCE7",
  warn: "#F59E0B",
  warnStrong: "#B45309",
  warnSoft: "#FEF3C7",
  risk: "#EF4444",
  riskStrong: "#B91C1C",
  riskSoft: "#FEE2E2",
  /** Rampa de um tom só para os gastos (validada: monotônica, ponta clara ≥ 2:1). */
  ramp: ["#2B312C", "#4D5850", "#727E76", "#9AA59E"],
} as const;

export const TONE: Record<Status, { fill: string; strong: string; soft: string }> = {
  good: { fill: C.brand, strong: C.brandDeep, soft: C.brandSoft },
  attention: { fill: C.warn, strong: C.warnStrong, soft: C.warnSoft },
  risk: { fill: C.risk, strong: C.riskStrong, soft: C.riskSoft },
};

/* ---------- Peças 3D (PNG: o PDF não lê WebP), servidas de /public/3d ---------- */

export const ART = {
  map: [560, 396],
  pin: [206, 288],
  coins: [275, 336],
  compass: [332, 336],
  calendar: [311, 336],
  flag: [227, 336],
  sign: [203, 336],
  binoculars: [343, 270],
} as const satisfies Record<string, readonly [number, number]>;

export type ArtName = keyof typeof ART;

let assetOrigin = "";

export function artSrc(name: ArtName) {
  return `${assetOrigin}/3d/${name}.png`;
}

let registeredFor: string | null = null;

/** Geist (SIL OFL) servida de /public/fonts; as peças 3D vêm da mesma origem. */
export function registerFonts(origin: string) {
  assetOrigin = origin;
  if (registeredFor === origin) return;
  const weights: [number, string][] = [
    [400, "Regular"],
    [500, "Medium"],
    [600, "SemiBold"],
    [700, "Bold"],
  ];
  Font.register({
    family: "Geist",
    fonts: weights.map(([fontWeight, name]) => ({ src: `${origin}/fonts/Geist-${name}.ttf`, fontWeight })),
  });
  // Sem hifenização automática: quebra só entre palavras.
  Font.registerHyphenationCallback((word) => [word]);
  registeredFor = origin;
}

export const s = StyleSheet.create({
  page: {
    fontFamily: "Geist",
    fontSize: 10,
    color: C.ink,
    backgroundColor: C.surface,
    paddingTop: 72,
    paddingBottom: 64,
    paddingHorizontal: 44,
  },
  eyebrow: {
    fontSize: 7.5,
    fontWeight: 600,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: C.brandStrong,
  },
  h1: { fontSize: 24, fontWeight: 600, letterSpacing: -0.6, lineHeight: 1.15 },
  h2: { fontSize: 13, fontWeight: 600, letterSpacing: -0.2 },
  body: { fontSize: 10, lineHeight: 1.5, color: C.muted },
  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    padding: 16,
  },
  soft: { backgroundColor: C.canvas, borderRadius: 12, padding: 12 },
  row: { flexDirection: "row" },
  label: { fontSize: 8, color: C.muted },
  value: { fontSize: 15, fontWeight: 600, letterSpacing: -0.3 },
});
