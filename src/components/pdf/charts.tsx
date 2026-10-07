import { Circle, Defs, Line, Path, RadialGradient, Rect, Stop, Svg, Text, View } from "@react-pdf/renderer";
import type { Scenario, Slice } from "@/lib/report-insights";
import { brl } from "@/lib/format";
import { C } from "@/components/pdf/theme";

/* ---------- geometria ---------- */

function polar(cx: number, cy: number, r: number, angle: number) {
  // ângulo em radianos, 0 = topo, sentido horário
  return { x: cx + r * Math.sin(angle), y: cy - r * Math.cos(angle) };
}

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
}

/* ---------- Medidor do score (meio círculo) ---------- */

export function ScoreGauge({
  score,
  color,
  width = 220,
  stroke = 16,
  track = C.track,
  textColor = C.ink,
  subColor = C.muted,
}: {
  score: number;
  color: string;
  width?: number;
  stroke?: number;
  track?: string;
  textColor?: string;
  subColor?: string;
}) {
  const r = (width - stroke) / 2;
  const cx = width / 2;
  const cy = r + stroke / 2;
  const height = cy + stroke / 2 + 2;
  const start = -Math.PI / 2;
  const f = Math.max(0.001, Math.min(0.999, score / 100));
  const ticks = [0.3, 0.5, 0.7, 0.85];
  return (
    <View style={{ width, height: height + 8, alignItems: "center" }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={arcPath(cx, cy, r, start, Math.PI / 2)} fill="none" stroke={track} strokeWidth={stroke} strokeLinecap="round" />
        <Path d={arcPath(cx, cy, r, start, start + f * Math.PI)} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
        {ticks.map((t) => {
          const a = start + t * Math.PI;
          const p0 = polar(cx, cy, r - stroke / 2 - 4, a);
          const p1 = polar(cx, cy, r - stroke / 2 - 9, a);
          return <Line key={t} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={subColor} strokeWidth={1} strokeOpacity={0.5} />;
        })}
      </Svg>
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center" }}>
        <Text style={{ fontSize: width * 0.26, fontWeight: 600, letterSpacing: -2, color: textColor, lineHeight: 1 }}>
          {score}
        </Text>
        <Text style={{ fontSize: 8.5, color: subColor, marginTop: 2 }}>de 100</Text>
      </View>
    </View>
  );
}

/* ---------- Escala dos perfis com o marcador ---------- */

const BANDS: { from: number; to: number; color: string; label: string }[] = [
  { from: 0, to: 30, color: C.risk, label: "No vermelho" },
  { from: 30, to: 50, color: C.warn, label: "No limite" },
  { from: 50, to: 70, color: "#FBBF24", label: "Em ajuste" },
  { from: 70, to: 85, color: "#4ADE80", label: "Em equilíbrio" },
  { from: 85, to: 100, color: C.brandStrong, label: "Em construção" },
];

export function ProfileScale({ score, label, width = 230 }: { score: number; label: string; width?: number }) {
  const h = 8;
  const gap = 2;
  const x = (v: number) => (v / 100) * width;
  const marker = Math.max(4, Math.min(width - 4, x(score)));
  const labelW = 90;
  const labelLeft = Math.max(0, Math.min(width - labelW, marker - labelW / 2));
  return (
    <View style={{ width }}>
      <Text style={{ marginLeft: labelLeft, width: labelW, textAlign: "center", fontSize: 7, fontWeight: 600, marginBottom: 3 }}>
        {label} · {score}
      </Text>
      <Svg width={width} height={h + 8} viewBox={`0 0 ${width} ${h + 8}`}>
        {BANDS.map((b, i) => (
          <Rect
            key={b.label}
            x={x(b.from) + (i ? gap / 2 : 0)}
            y={7}
            width={x(b.to) - x(b.from) - (i ? gap / 2 : 0) - (i < BANDS.length - 1 ? gap / 2 : 0)}
            height={h}
            rx={2}
            fill={b.color}
          />
        ))}
        <Path d={`M ${marker - 4} 0 L ${marker + 4} 0 L ${marker} 5.5 Z`} fill={C.ink} />
      </Svg>
      <View style={{ height: 10, marginTop: 2 }}>
        {[0, 30, 50, 70, 85, 100].map((v) => (
          <Text
            key={v}
            style={{ position: "absolute", left: Math.min(width - 12, Math.max(0, x(v) - (v ? 6 : 0))), fontSize: 6, color: C.muted }}
          >
            {v}
          </Text>
        ))}
      </View>
    </View>
  );
}

/* ---------- Rosca da renda ---------- */

export function Donut({
  slices,
  colors,
  size = 170,
  stroke = 26,
}: {
  slices: Slice[];
  colors: string[];
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = size / 2;
  const gap = 2 / r; // 2pt de respiro entre fatias
  let a = 0;
  const visible = slices.filter((sl) => sl.share > 0);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={c} cy={c} r={r} fill="none" stroke={C.track} strokeWidth={stroke} />
      {visible.length === 1 ? (
        <Circle cx={c} cy={c} r={r} fill="none" stroke={colors[slices.indexOf(visible[0])]} strokeWidth={stroke} />
      ) : (
        slices.map((sl, i) => {
          const span = sl.share * Math.PI * 2;
          const a0 = a;
          a += span;
          if (sl.share <= 0 || span <= gap) return null;
          return (
            <Path
              key={sl.key}
              d={arcPath(c, c, r, a0 + gap / 2, a0 + span - gap / 2)}
              fill="none"
              stroke={colors[i]}
              strokeWidth={stroke}
            />
          );
        })
      )}
    </Svg>
  );
}

/* ---------- Medidor horizontal com referência ---------- */

export function MeterBar({
  fill,
  target,
  color,
  width = 150,
}: {
  fill: number;
  target: number;
  color: string;
  width?: number;
}) {
  const h = 7;
  return (
    <Svg width={width} height={h + 6} viewBox={`0 0 ${width} ${h + 6}`}>
      <Rect x={0} y={3} width={width} height={h} rx={3} fill={C.track} />
      {fill > 0 ? <Rect x={0} y={3} width={Math.max(h, fill * width)} height={h} rx={3} fill={color} /> : null}
      <Rect x={target * width - 1} y={0} width={2} height={h + 6} rx={1} fill={C.ink} />
    </Svg>
  );
}

/* ---------- Barras dos pilares do score ---------- */

export function PillarBar({ points, max, width = 220 }: { points: number; max: number; width?: number }) {
  const h = 9;
  const share = points / max;
  return (
    <Svg width={width} height={h} viewBox={`0 0 ${width} ${h}`}>
      <Rect x={0} y={0} width={width} height={h} rx={3} fill={C.track} />
      {points > 0 ? (
        <Rect x={0} y={0} width={Math.max(h, share * width)} height={h} rx={3} fill={share >= 0.7 ? C.brand : share > 0.3 ? "#86EFAC" : "#BBF7D0"} />
      ) : null}
    </Svg>
  );
}

/* ---------- Cenários: hoje x com ajuste (colunas agrupadas) ---------- */

export function ScenarioChart({
  scenarios,
  width = 500,
  height = 190,
}: {
  scenarios: Scenario[];
  width?: number;
  height?: number;
}) {
  const values = scenarios.flatMap((sc) => [sc.current, sc.adjusted]);
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const top = 18;
  const bottom = 26;
  const plotH = height - top - bottom;
  const y = (v: number) => top + ((max - v) / span) * plotH;
  const zero = y(0);
  const groupW = width / scenarios.length;
  const barW = 26;
  const series = [
    { key: "current" as const, color: C.ramp[3] },
    { key: "adjusted" as const, color: C.brand },
  ];
  const label = (v: number) => (v < 0 ? `−${brl(-v)}` : brl(v));

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line x1={0} y1={zero} x2={width} y2={zero} stroke={C.line} strokeWidth={1} />
        {scenarios.map((sc, gi) => {
          const gx = gi * groupW + groupW / 2;
          return series.map((se, si) => {
            const v = sc[se.key];
            const x = gx + (si === 0 ? -barW - 3 : 3);
            const y0 = Math.min(y(v), zero);
            const h = Math.max(1, Math.abs(y(v) - zero));
            return <Rect key={`${gi}-${se.key}`} x={x} y={y0} width={barW} height={h} fill={se.color} />;
          });
        })}
      </Svg>
      {scenarios.map((sc, gi) => {
        // Rótulos ao lado das barras (cinza à esquerda, verde à direita): nunca se sobrepõem.
        const gx = gi * groupW + groupW / 2;
        return series.map((se, si) => {
          const v = sc[se.key];
          const end = v >= 0 ? y(v) : y(v);
          const labelW = 64;
          const left = si === 0 ? gx - barW - 3 - 4 - labelW : gx + 3 + barW + 4;
          return (
            <Text
              key={`t-${gi}-${se.key}`}
              style={{
                position: "absolute",
                left,
                top: Math.max(0, Math.min(height - bottom - 10, end - 5)),
                width: labelW,
                textAlign: si === 0 ? "right" : "left",
                fontSize: 7.5,
                fontWeight: se.key === "adjusted" ? 600 : 400,
                color: se.key === "adjusted" ? C.ink : C.muted,
              }}
            >
              {label(v)}
            </Text>
          );
        });
      })}
      {scenarios.map((sc, gi) => (
        <Text
          key={`m-${sc.months}`}
          style={{
            position: "absolute",
            left: gi * groupW,
            width: groupW,
            bottom: 4,
            textAlign: "center",
            fontSize: 8.5,
            color: C.muted,
          }}
        >
          Em {sc.months} meses
        </Text>
      ))}
    </View>
  );
}

/* ---------- Fundo da capa: grade + brilho verde ---------- */

export function CoverBackdrop({ width, height }: { width: number; height: number }) {
  const step = 28;
  const lines = [];
  for (let x = step; x < width; x += step) lines.push(<Line key={`v${x}`} x1={x} y1={0} x2={x} y2={height * 0.62} stroke="#FFFFFF" strokeOpacity={0.05} strokeWidth={0.6} />);
  for (let y = step; y < height * 0.62; y += step) lines.push(<Line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} stroke="#FFFFFF" strokeOpacity={0.05} strokeWidth={0.6} />);
  return (
    <View fixed style={{ position: "absolute", top: 0, left: 0, width, height }}>
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={C.brand} stopOpacity={0.32} />
          <Stop offset="100%" stopColor={C.brand} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={C.ink} />
      {lines}
      <Circle cx={width / 2} cy={height * 0.46} r={230} fill="url(#glow)" />
    </Svg>
    </View>
  );
}
