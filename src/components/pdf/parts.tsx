import { Circle, Path, Rect, Svg, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { Status } from "@/lib/report-insights";
import { STATUS_LABEL } from "@/lib/report-insights";
import { C, TONE, s } from "@/components/pdf/theme";

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

export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width={32} height={32} rx={9} fill={C.ink} />
      <Path
        d="M8.5 23.5c4.5 0 3.5-8 8-8s3.5-6 7-6"
        fill="none"
        stroke={C.brand}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeDasharray="0.1 4.2"
      />
      <Circle cx={8.5} cy={23.5} r={2.2} fill={C.surface} />
      <Circle cx={23.5} cy={9.5} r={3.4} fill={C.brand} />
      <Circle cx={23.5} cy={9.5} r={1.3} fill={C.ink} />
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

export function SectionHeader({
  id,
  index,
  title,
  intro,
}: {
  id: string;
  index: string;
  title: string;
  intro?: ReactNode;
}) {
  return (
    <View id={id} style={{ marginBottom: 18 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            backgroundColor: C.brandSoft,
            borderRadius: 6,
            paddingVertical: 3,
            paddingHorizontal: 6,
            marginRight: 8,
          }}
        >
          <Text style={{ fontSize: 8, fontWeight: 700, color: C.brandDeep }}>{index}</Text>
        </View>
        <Text style={[s.eyebrow, { color: C.muted }]}>Parte {Number(index)} de 7</Text>
      </View>
      <Text style={[s.h1, { marginTop: 8 }]}>{title}</Text>
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
