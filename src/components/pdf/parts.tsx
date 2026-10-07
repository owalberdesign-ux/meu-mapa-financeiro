import { Circle, Image, Link, Path, Rect, Svg, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { Status } from "@/lib/report-insights";
import { STATUS_LABEL } from "@/lib/report-insights";
import { ART, C, TONE, artSrc, s, type ArtName } from "@/components/pdf/theme";

/* ---------- Ícones (traços Lucide, ISC) ---------- */

const ICON_PATHS: Record<string, string[]> = {
  check: ["M20 6 9 17l-5-5"],
  attention: [
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
    "M12 9v4",
    "M12 17h.01",
  ],
  risk: [
    "M12 16h.01",
    "M12 8v4",
    "M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",
  ],
  good: ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z", "m9 12 2 2 4-4"],
  arrow: ["M5 12h14", "m12 5 7 7-7 7"],
  target: ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z", "M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0z", "M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"],
  link: ["M15 3h6v6", "M10 14 21 3", "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"],
};

export function PdfIcon({
  name,
  size = 10,
  color = C.ink,
  strokeWidth = 2,
}: {
  name: keyof typeof ICON_PATHS;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {ICON_PATHS[name].map((d) => (
        <Path
          key={d}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

/** Mapa dobrado com a rota e o pin de destino (mesmo desenho da interface). */
export function LogoMark({ size = 22, onDark = false }: { size?: number; onDark?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Path d="M4 13.5 14 9.5v22L4 35.5z" fill="#15803D" />
      <Path d="M14 9.5 26 13.5v22l-12-4z" fill={C.brand} />
      <Path d="M26 13.5 36 9.5v22l-10 4z" fill={C.brandDeep} />
      <Path
        d="M8.2 29.6c3.4-1.6 4.6-4.9 8.2-5.2 3.5-.3 4.4 2.6 7.8 1.6 2.6-.8 3.5-3.6 5.4-5.4"
        fill="none"
        stroke={C.surface}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeDasharray="0.1 3"
      />
      <Circle cx={8.2} cy={29.6} r={1.7} fill={C.surface} />
      <Path
        d="M30 3.2c2.9 0 5.1 2.2 5.1 5 0 3.6-5.1 9.4-5.1 9.4s-5.1-5.8-5.1-9.4c0-2.8 2.2-5 5.1-5z"
        fill={onDark ? C.surface : C.ink}
        stroke={onDark ? C.ink : C.surface}
        strokeWidth={1.4}
      />
      <Circle cx={30} cy={8.2} r={1.8} fill={C.brand} />
    </Svg>
  );
}

/* ---------- Estado: ícone + rótulo, nunca só cor ---------- */

export function StatusChip({ status, label }: { status: Status; label?: string }) {
  const t = TONE[status];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: t.soft,
        borderRadius: 20,
        paddingVertical: 3,
        paddingHorizontal: 7,
      }}
    >
      <PdfIcon name={status} size={8} color={t.strong} strokeWidth={2.4} />
      <Text
        style={{
          marginLeft: 4,
          fontSize: 7,
          fontWeight: 600,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: t.strong,
        }}
      >
        {label ?? STATUS_LABEL[status]}
      </Text>
    </View>
  );
}

/* ---------- Cabeçalho e rodapé das páginas internas ---------- */

export function PageChrome({ name }: { name: string }) {
  return (
    <>
      <View
        fixed
        style={{
          position: "absolute",
          top: 28,
          left: 44,
          right: 44,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <LogoMark size={16} />
          <Text style={{ marginLeft: 6, fontSize: 8.5, fontWeight: 600 }}>
            Meu Mapa <Text style={{ fontWeight: 400, color: C.muted }}>Financeiro</Text>
          </Text>
        </View>
        <Text style={{ fontSize: 8, color: C.muted }}>Diagnóstico de {name}</Text>
      </View>
      <View
        fixed
        style={{
          position: "absolute",
          bottom: 28,
          left: 44,
          right: 44,
          flexDirection: "row",
          justifyContent: "space-between",
          borderTopWidth: 1,
          borderTopColor: C.line,
          paddingTop: 8,
        }}
      >
        <Text style={{ fontSize: 7, color: C.muted }}>
          Ferramenta educacional. Não é consultoria financeira.
        </Text>
        <Text
          style={{ fontSize: 7, color: C.muted }}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </View>
    </>
  );
}

/* ---------- A rota do relatório: as 7 paradas ---------- */

export const STOPS: { id: string; title: string; art: ArtName }[] = [
  { id: "resultado", title: "Seu resultado", art: "pin" },
  { id: "renda", title: "Para onde vai sua renda", art: "coins" },
  { id: "indicadores", title: "Seus indicadores", art: "compass" },
  { id: "atencao", title: "Pontos de atenção", art: "sign" },
  { id: "projecao", title: "Potencial e projeção", art: "binoculars" },
  { id: "rota", title: "Sua rota", art: "map" },
  { id: "plano", title: "Plano de 30 dias", art: "calendar" },
];

/** Peça 3D com a proporção certa: informe a altura ou a largura. */
export function Art3D({ name, height, width }: { name: ArtName; height?: number; width?: number }) {
  const [w, h] = ART[name];
  const H = height ?? ((width ?? 60) * h) / w;
  const W = width ?? (H * w) / h;
  // Peça decorativa: o Image do react-pdf não tem texto alternativo.
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image src={artSrc(name)} style={{ width: W, height: H }} />;
}

/** Paradas clicáveis no topo de cada parte: a atual em destaque. */
function RouteNav({ current }: { current: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {STOPS.map((stop, i) => {
        const n = i + 1;
        const done = n < current;
        const here = n === current;
        return (
          <View key={stop.id} style={{ flexDirection: "row", alignItems: "center" }}>
            {i > 0 ? (
              <View
                style={{
                  width: 9,
                  borderTopWidth: 1.4,
                  borderStyle: "dashed",
                  borderTopColor: n <= current ? C.brand : C.line,
                  marginHorizontal: 2,
                }}
              />
            ) : null}
            <Link src={`#${stop.id}`} style={{ textDecoration: "none" }}>
              <View
                style={{
                  width: here ? 17 : 13,
                  height: here ? 17 : 13,
                  borderRadius: 9,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: here ? C.brandStrong : done ? C.brandSoft : C.surface,
                  borderWidth: here || done ? 0 : 1,
                  borderColor: C.line,
                }}
              >
                <Text
                  style={{
                    fontSize: here ? 7.5 : 6.5,
                    fontWeight: 700,
                    color: here ? C.surface : done ? C.brandDeep : C.muted,
                  }}
                >
                  {n}
                </Text>
              </View>
            </Link>
          </View>
        );
      })}
      <Text style={[s.eyebrow, { color: C.muted, marginLeft: 8 }]}>
        Parada {current} de {STOPS.length}
      </Text>
    </View>
  );
}

export function SectionHeader({ stop, title, intro }: { stop: number; title: string; intro?: ReactNode }) {
  const { id, art } = STOPS[stop - 1];
  return (
    <View id={id} style={{ marginBottom: 18 }}>
      <View style={{ position: "absolute", top: -10, right: -4, width: 76, height: 62, alignItems: "flex-end", justifyContent: "flex-end" }}>
        <Art3D name={art} height={art === "map" ? 50 : art === "binoculars" ? 46 : 60} />
      </View>
      <RouteNav current={stop} />
      <Text style={[s.h1, { marginTop: 8, paddingRight: 84 }]}>{title}</Text>
      {intro ? <Text style={[s.body, { marginTop: 6, fontSize: 10.5 }]}>{intro}</Text> : null}
    </View>
  );
}

/** Quadradinho de marcar: desenhado, funciona impresso e na tela. */
export function CheckSquare({ size = 14 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Rect x={0.75} y={0.75} width={12.5} height={12.5} rx={3.5} fill={C.surface} stroke={C.ramp[3]} strokeWidth={1.2} />
    </Svg>
  );
}

export function Dot({ color, size = 7 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10">
      <Circle cx={5} cy={5} r={5} fill={color} />
    </Svg>
  );
}
