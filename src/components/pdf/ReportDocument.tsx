import { Document, Link, Page, Text, View } from "@react-pdf/renderer";
import type { Diagnostic } from "@/types/diagnostic";
import { brl, pct, shortDate } from "@/lib/format";
import { DISCLAIMER, PROJECTION_DISCLAIMER } from "@/lib/legal";
import {
  GOAL_LABEL,
  PLAN_TITLE,
  PRIMARY_PROBLEM_TEXT,
  PRIORITY_LABEL,
  PROFILE_LABEL,
  PROFILE_TONE,
} from "@/lib/report-builder";
import {
  buildIndicators,
  incomeSlices,
  projectionScenarios,
  scoreCapNote,
  scorePillars,
  summarySentence,
  type Status,
} from "@/lib/report-insights";
import { CoverBackdrop, Donut, MeterBar, PillarBar, ProfileScale, ScenarioChart, ScoreGauge } from "@/components/pdf/charts";
import { CheckSquare, Dot, LogoMark, PageChrome, PdfIcon, SectionHeader, StatusChip } from "@/components/pdf/parts";
import { C, TONE, s } from "@/components/pdf/theme";

const A4 = { width: 595.28, height: 841.89 };
const money = (v: number) => (v < 0 ? `−${brl(-v)}` : brl(v));

const SECTIONS: [string, string][] = [
  ["resultado", "Seu resultado"],
  ["renda", "Para onde vai sua renda"],
  ["indicadores", "Seus indicadores"],
  ["atencao", "Pontos de atenção"],
  ["projecao", "Potencial de ajuste e projeção"],
  ["rota", "Sua rota"],
  ["plano", "Plano de 30 dias"],
];

function problemStatus(problem: Diagnostic["report"]["primaryProblem"]): Status {
  if (problem === "DEFICIT" || problem === "DEBT") return "risk";
  return problem === "NONE" ? "good" : "attention";
}

/* ---------------- 1. Capa ---------------- */

function Cover({ d }: { d: Diagnostic }) {
  const r = d.report;
  const m = r.metrics;
  const tone = TONE[PROFILE_TONE[r.profile]];
  const kpis: [string, string, string][] = [
    ["Renda mensal", brl(m.income), "líquida"],
    [m.monthlyMargin < 0 ? "Falta no mês" : "Sobra no mês", money(m.monthlyMargin), pct(m.marginRate) + " da renda"],
    ["Renda comprometida", pct(m.commitmentRate), "antes do mês começar"],
  ];
  return (
    <Page size="A4" style={{ fontFamily: "Geist", color: C.surface, backgroundColor: C.ink }}>
      <CoverBackdrop width={A4.width} height={A4.height} />
      <View style={{ padding: 44, flexGrow: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <LogoMark size={24} />
            <Text style={{ marginLeft: 8, fontSize: 8, fontWeight: 600, letterSpacing: 2 }}>MEU MAPA FINANCEIRO</Text>
          </View>
          <Text style={{ fontSize: 8.5, color: "#A7ADA8" }}>{shortDate(d.createdAt)}</Text>
        </View>

        <View style={{ marginTop: 56 }}>
          <Text style={{ fontSize: 11, color: "#A7ADA8" }}>Diagnóstico financeiro de</Text>
          <Text style={{ fontSize: 34, fontWeight: 600, letterSpacing: -1.2, marginTop: 4, lineHeight: 1.1 }}>{d.name}</Text>
          <Text style={{ fontSize: 10.5, color: "#C9CEC9", marginTop: 10, width: 360, lineHeight: 1.5 }}>
            Um retrato do seu mês, com o que mais pesa, quanto pode melhorar e um plano para os próximos 30 dias.
          </Text>
        </View>

        <View style={{ alignItems: "center", marginTop: 34 }}>
          <Text style={{ fontSize: 7.5, fontWeight: 600, letterSpacing: 1.6, color: "#A7ADA8", marginBottom: 10 }}>SEU SCORE</Text>
          <ScoreGauge score={r.score} color={tone.fill} width={250} stroke={18} track="#2A302B" textColor={C.surface} subColor="#A7ADA8" />
          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: tone.fill,
              borderRadius: 20,
              paddingVertical: 4,
              paddingHorizontal: 10,
            }}
          >
            <PdfIcon name={PROFILE_TONE[r.profile]} size={9} color={C.ink} strokeWidth={2.4} />
            <Text style={{ marginLeft: 5, fontSize: 8, fontWeight: 700, letterSpacing: 0.8, color: C.ink }}>
              {PROFILE_LABEL[r.profile].toUpperCase()}
            </Text>
          </View>
          <Text style={{ marginTop: 16, fontSize: 7.5, fontWeight: 600, letterSpacing: 1.6, color: "#A7ADA8" }}>
            SUA PRIORIDADE
          </Text>
          <Text style={{ marginTop: 4, fontSize: 17, fontWeight: 600 }}>{PRIORITY_LABEL[r.primaryProblem]}</Text>
        </View>

        <View style={{ flexDirection: "row", marginTop: 30 }}>
          {kpis.map(([label, value, note], i) => (
            <View
              key={label}
              style={{ flex: 1, backgroundColor: "#1E2420", borderRadius: 12, padding: 12, marginLeft: i ? 8 : 0 }}
            >
              <Text style={{ fontSize: 7.5, color: "#A7ADA8" }}>{label}</Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginTop: 4,
                  color: i === 1 && m.monthlyMargin < 0 ? "#FCA5A5" : C.surface,
                }}
              >
                {value}
              </Text>
              <Text style={{ fontSize: 7, color: "#8C938D", marginTop: 2 }}>{note}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: "auto" }}>
          <Text style={{ fontSize: 7.5, fontWeight: 600, letterSpacing: 1.6, color: "#A7ADA8", marginBottom: 8 }}>
            NESTE RELATÓRIO
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {SECTIONS.map(([id, title], i) => (
              <Link key={id} src={`#${id}`} style={{ width: "50%", textDecoration: "none", color: C.surface }}>
                <View style={{ flexDirection: "row", paddingVertical: 5, borderTopWidth: 1, borderTopColor: "#2A302B", marginRight: i % 2 ? 0 : 12 }}>
                  <Text style={{ fontSize: 8.5, color: C.brand, width: 22 }}>{`0${i + 1}`}</Text>
                  <Text style={{ fontSize: 8.5, flexGrow: 1 }}>{title}</Text>
                  <Text style={{ fontSize: 8.5, color: "#8C938D" }}>{i + 2}</Text>
                </View>
              </Link>
            ))}
          </View>
        </View>
      </View>
    </Page>
  );
}

/* ---------------- 2. Seu resultado ---------------- */

function ResultPage({ d }: { d: Diagnostic }) {
  const r = d.report;
  const profileStatus = PROFILE_TONE[r.profile];
  const pStatus = problemStatus(r.primaryProblem);
  const capNote = scoreCapNote(r);
  return (
    <Page size="A4" style={s.page}>
      <PageChrome name={d.name} />
      <SectionHeader id="resultado" index="01" title="Seu resultado" intro={summarySentence(r)} />

      <View style={{ flexDirection: "row" }}>
        <View style={[s.card, { width: 262, alignItems: "center" }]}>
          <Text style={[s.label, { alignSelf: "flex-start", marginBottom: 10 }]}>Seu score</Text>
          <ScoreGauge score={r.score} color={TONE[profileStatus].fill} width={190} stroke={15} />
          <View style={{ marginTop: 10 }}>
            <StatusChip status={profileStatus} label={PROFILE_LABEL[r.profile]} />
          </View>
          <View style={{ marginTop: 16 }}>
            <ProfileScale score={r.score} label={PROFILE_LABEL[r.profile]} width={228} />
          </View>
        </View>

        <View style={[s.card, { flex: 1, marginLeft: 12, borderColor: TONE[pStatus].fill, backgroundColor: TONE[pStatus].soft }]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <PdfIcon name={pStatus} size={10} color={TONE[pStatus].strong} />
            <Text style={[s.eyebrow, { color: TONE[pStatus].strong, marginLeft: 5 }]}>Sua prioridade</Text>
          </View>
          <Text style={{ fontSize: 17, fontWeight: 600, marginTop: 8, letterSpacing: -0.3 }}>
            {PRIORITY_LABEL[r.primaryProblem]}
          </Text>
          <Text style={{ fontSize: 10, lineHeight: 1.5, marginTop: 6, color: "#2F3631" }}>
            {PRIMARY_PROBLEM_TEXT[r.primaryProblem]}
          </Text>
          <View style={{ marginTop: "auto", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#00000014" }}>
            <Text style={s.label}>Seu objetivo</Text>
            <Text style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>{GOAL_LABEL[r.goal]}</Text>
            <Text style={[s.label, { marginTop: 8 }]}>Seu foco nos próximos 30 dias</Text>
            <Text style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>{PLAN_TITLE[r.planFocus]}</Text>
          </View>
        </View>
      </View>

      <View style={[s.card, { marginTop: 12 }]} wrap={false}>
        <Text style={s.h2}>De onde vêm seus pontos</Text>
        <Text style={[s.body, { fontSize: 9, marginTop: 2 }]}>
          O score soma cinco pilares. Cada barra mostra quantos pontos você fez em cada um.
        </Text>
        <View style={{ marginTop: 12 }}>
          {scorePillars(r).map((p) => (
            <View key={p.key} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, borderTopWidth: 1, borderTopColor: C.line }}>
              <Text style={{ width: 120, fontSize: 9.5 }}>{p.label}</Text>
              <PillarBar points={p.points} max={p.max} width={262} />
              <Text style={{ flexGrow: 1, textAlign: "right", fontSize: 9.5, marginLeft: 10 }}>
                <Text style={{ fontWeight: 600 }}>{p.points}</Text>
                <Text style={{ color: C.muted }}> de {p.max}</Text>
              </Text>
            </View>
          ))}
        </View>
        {capNote ? (
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, backgroundColor: C.warnSoft, borderRadius: 10, padding: 10 }}>
            <PdfIcon name="attention" size={10} color={C.warnStrong} />
            <Text style={{ marginLeft: 6, fontSize: 9, flex: 1 }}>{capNote}</Text>
          </View>
        ) : null}
      </View>
    </Page>
  );
}

/* ---------------- 3. Para onde vai sua renda ---------------- */

function IncomePage({ d }: { d: Diagnostic }) {
  const r = d.report;
  const m = r.metrics;
  const { slices, deficit } = incomeSlices(r, d.answers);
  const colors = slices.map((sl, i) => (sl.key === "margin" ? C.brand : C.ramp[i]));
  const committed = d.answers.housing + d.answers.essential + d.answers.installments;
  const intro = deficit
    ? `Seus gastos somam ${brl(m.totalExpenses)}, ${pct(m.totalExpenses / m.income)} da renda. Cada fatia mostra uma parte desses gastos.`
    : `Cada fatia mostra uma parte da sua renda de ${brl(m.income)}.`;
  const kpis: [string, string, string][] = [
    ["Renda", brl(m.income), C.ink],
    ["Despesas", brl(m.totalExpenses), C.ink],
    [deficit ? "Falta no mês" : "Sobra no mês", money(m.monthlyMargin), deficit ? C.riskStrong : C.brandStrong],
  ];
  return (
    <Page size="A4" style={s.page}>
      <PageChrome name={d.name} />
      <SectionHeader id="renda" index="02" title="Para onde vai sua renda" intro={intro} />

      <View style={{ flexDirection: "row" }}>
        {kpis.map(([label, value, color], i) => (
          <View key={label} style={[s.soft, { flex: 1, marginLeft: i ? 8 : 0 }]}>
            <Text style={s.label}>{label}</Text>
            <Text style={[s.value, { fontSize: 18, marginTop: 3, color }]}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={[s.card, { marginTop: 12, flexDirection: "row", alignItems: "center" }]} wrap={false}>
        <View style={{ width: 190, height: 190, alignItems: "center", justifyContent: "center" }}>
          <Donut slices={slices} colors={colors} size={180} stroke={28} />
          <View style={{ position: "absolute", alignItems: "center" }}>
            <Text style={{ fontSize: 8, color: C.muted }}>{deficit ? "Falta no mês" : "Sobra no mês"}</Text>
            <Text style={{ fontSize: 17, fontWeight: 600, color: deficit ? C.riskStrong : C.brandStrong, marginTop: 2 }}>
              {money(m.monthlyMargin)}
            </Text>
            <Text style={{ fontSize: 7.5, color: C.muted, marginTop: 1 }}>{pct(m.marginRate)} da renda</Text>
          </View>
        </View>
        <View style={{ flex: 1, marginLeft: 18 }}>
          {slices.map((sl, i) => (
            <View
              key={sl.key}
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 7, borderTopWidth: i ? 1 : 0, borderTopColor: C.line }}
            >
              <Dot color={colors[i]} size={8} />
              <Text style={{ marginLeft: 7, fontSize: 9.5, flexGrow: 1 }}>{sl.label}</Text>
              <Text style={{ fontSize: 10.5, fontWeight: 600 }}>{brl(sl.value)}</Text>
              <Text style={{ width: 42, textAlign: "right", fontSize: 8.5, color: C.muted }}>{pct(sl.ofIncome)}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 7.5, color: C.muted, marginTop: 6 }}>Percentuais em relação à renda.</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <View style={[s.card, { flex: 1 }]}>
          <Text style={s.label}>Já tem destino antes do mês começar</Text>
          <Text style={[s.value, { marginTop: 4 }]}>{brl(committed)}</Text>
          <Text style={[s.body, { fontSize: 9, marginTop: 4 }]}>
            Moradia, despesas essenciais e parcelas somam {pct(m.commitmentRate)} da renda.
          </Text>
        </View>
        <View style={[s.card, { flex: 1, marginLeft: 12 }]}>
          <Text style={s.label}>Gastos não essenciais</Text>
          <Text style={[s.value, { marginTop: 4 }]}>{brl(d.answers.variable)}</Text>
          <Text style={[s.body, { fontSize: 9, marginTop: 4 }]}>
            Meta sugerida: <Text style={{ color: C.brandStrong, fontWeight: 600 }}>{brl(r.adjustment.reductionTarget)} a menos</Text> por mês, 12% desses gastos.
          </Text>
        </View>
      </View>
    </Page>
  );
}

/* ---------------- 4. Indicadores ---------------- */

function IndicatorsPage({ d }: { d: Diagnostic }) {
  const indicators = buildIndicators(d.report, d.answers);
  return (
    <Page size="A4" style={s.page}>
      <PageChrome name={d.name} />
      <SectionHeader
        id="indicadores"
        index="03"
        title="Seus indicadores"
        intro="Cada número da sua vida financeira ao lado de uma referência. O traço escuro no medidor marca onde fica a referência."
      />
      {indicators.map((ind) => (
        <View
          key={ind.key}
          wrap={false}
          style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 7 }}
        >
          <View style={{ width: 150 }}>
            <Text style={{ fontSize: 10.5, fontWeight: 600 }}>{ind.label}</Text>
            <Text style={{ fontSize: 8, color: C.muted, marginTop: 2 }}>{ind.detail}</Text>
          </View>
          <View style={{ width: 175 }}>
            <MeterBar fill={ind.fill} target={ind.target} color={TONE[ind.status].fill} width={160} />
            <Text style={{ fontSize: 7.5, color: C.muted, marginTop: 3 }}>{ind.reference}</Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.3, marginBottom: 4 }}>{ind.value}</Text>
            <StatusChip status={ind.status} />
          </View>
        </View>
      ))}
    </Page>
  );
}

/* ---------------- 5. Pontos de atenção ---------------- */

function AttentionPage({ d }: { d: Diagnostic }) {
  const r = d.report;
  const strengths = buildIndicators(r, d.answers).filter((i) => i.status === "good");
  return (
    <Page size="A4" style={s.page}>
      <PageChrome name={d.name} />
      <SectionHeader
        id="atencao"
        index="04"
        title={r.alerts.length ? "Seus pontos de atenção" : "Nenhum ponto de atenção"}
        intro={
          r.alerts.length
            ? "O que mais pesa no seu mês, em ordem de prioridade, e por onde começar."
            : "Nenhum dos seus indicadores está em faixa de atenção. O foco agora é manter a constância."
        }
      />
      {r.alerts.map((a, i) => {
        const t = TONE[a.severity];
        return (
          <View key={a.type} wrap={false} style={[s.card, { flexDirection: "row", marginBottom: 10, borderColor: t.fill }]}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: t.soft, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 13, fontWeight: 700, color: t.strong }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <StatusChip status={a.severity} label={a.severity === "risk" ? "Risco" : "Atenção"} />
              <Text style={{ fontSize: 14, fontWeight: 600, marginTop: 6, letterSpacing: -0.2 }}>{a.title}</Text>
              <Text style={{ fontSize: 10.5, fontWeight: 600, marginTop: 2 }}>{a.figure}</Text>
              <Text style={[s.body, { marginTop: 4, color: "#3A423C" }]}>{a.analysis}</Text>
              <View style={{ flexDirection: "row", alignItems: "flex-start", backgroundColor: C.canvas, borderRadius: 10, padding: 9, marginTop: 8 }}>
                <PdfIcon name="arrow" size={10} color={C.brandStrong} />
                <Text style={{ marginLeft: 6, fontSize: 9.5, flex: 1 }}>
                  <Text style={{ fontWeight: 600, color: C.brandDeep }}>Primeiro passo: </Text>
                  {a.firstStep}
                </Text>
              </View>
            </View>
          </View>
        );
      })}

      {strengths.length && !r.alerts.length ? (
        <View>
          <Text style={s.h2}>Seus pontos fortes</Text>
          <Text style={[s.body, { fontSize: 9, marginTop: 2 }]}>Todos os seus indicadores estão em uma faixa saudável.</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
            {strengths.map((ind, i) => (
              <View
                key={ind.key}
                wrap={false}
                style={{ width: "48.8%", marginLeft: i % 2 ? "2.4%" : 0, marginBottom: 9, backgroundColor: C.brandSoft, borderRadius: 12, padding: 12 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <PdfIcon name="good" size={10} color={C.brandDeep} />
                  <Text style={{ marginLeft: 5, fontSize: 9, color: C.brandDeep, fontWeight: 600 }}>{ind.label}</Text>
                </View>
                <Text style={{ fontSize: 17, fontWeight: 600, marginTop: 6, letterSpacing: -0.3 }}>{ind.value}</Text>
                <Text style={{ fontSize: 8, color: C.muted, marginTop: 2 }}>{ind.detail} · {ind.reference}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : strengths.length && r.alerts.length < 3 ? (
        <View wrap={false} style={{ marginTop: 6 }}>
          <Text style={s.h2}>Seus pontos fortes</Text>
          <Text style={[s.body, { fontSize: 9, marginTop: 2 }]}>Indicadores que já estão em uma faixa saudável.</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
            {strengths.map((ind) => (
              <View
                key={ind.key}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.brandSoft, borderRadius: 20, paddingVertical: 5, paddingHorizontal: 9, marginRight: 6, marginBottom: 6 }}
              >
                <PdfIcon name="good" size={9} color={C.brandDeep} />
                <Text style={{ marginLeft: 5, fontSize: 8.5, color: C.brandDeep }}>
                  {ind.label}: <Text style={{ fontWeight: 600 }}>{ind.value}</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Page>
  );
}

/* ---------------- 6. Potencial de ajuste e projeção ---------------- */

function ProjectionPage({ d }: { d: Diagnostic }) {
  const r = d.report;
  const m = r.metrics;
  const target = r.adjustment.reductionTarget;
  const deficit = m.monthlyMargin < 0;
  const after = m.monthlyMargin + target;
  const scenarios = projectionScenarios(r);
  const twelve = scenarios[2];
  const terms: { label: string; value: string; note: string; color: string }[] = [
    { label: deficit ? "Falta hoje" : "Sobra hoje", value: money(m.monthlyMargin), note: "por mês", color: deficit ? C.riskStrong : C.ink },
    { label: "Ajuste sugerido", value: `+${brl(target)}`, note: "12% dos não essenciais", color: C.brandStrong },
    {
      label: deficit ? "Novo resultado" : "Seu potencial",
      value: money(after),
      note: "por mês",
      color: after < 0 ? C.warnStrong : C.brandStrong,
    },
  ];
  return (
    <Page size="A4" style={s.page}>
      <PageChrome name={d.name} />
      <SectionHeader
        id="projecao"
        index="05"
        title="Potencial de ajuste e projeção"
        intro="Com uma redução moderada dos gastos variáveis e preservando sua margem atual, existe espaço para melhorar seu fluxo mensal."
      />

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {terms.map((t, i) => (
          <View key={t.label} style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            {i ? <Text style={{ fontSize: 16, color: C.muted, marginHorizontal: 6 }}>{i === 1 ? "+" : "="}</Text> : null}
            <View style={[s.soft, { flex: 1, backgroundColor: i === 2 && after >= 0 ? C.brandSoft : C.canvas }]}>
              <Text style={s.label}>{t.label}</Text>
              <Text style={[s.value, { fontSize: 17, marginTop: 3, color: t.color }]}>{t.value}</Text>
              <Text style={{ fontSize: 7.5, color: C.muted, marginTop: 1 }}>{t.note}</Text>
            </View>
          </View>
        ))}
      </View>
      {deficit && after < 0 ? (
        <Text style={[s.body, { fontSize: 9, marginTop: 6 }]}>
          O ajuste reduz o déficit. Para zerar, ainda faltam {brl(-after)} por mês: o plano de 30 dias começa por aí.
        </Text>
      ) : null}

      <View style={[s.card, { marginTop: 14 }]} wrap={false}>
        <Text style={s.h2}>Acumulado em 3, 6 e 12 meses</Text>
        <View style={{ flexDirection: "row", marginTop: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginRight: 14 }}>
            <Dot color={C.ramp[3]} size={8} />
            <Text style={{ fontSize: 8.5, marginLeft: 5, color: C.muted }}>Mantendo o mês como está</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Dot color={C.brand} size={8} />
            <Text style={{ fontSize: 8.5, marginLeft: 5, color: C.muted }}>Com o ajuste sugerido</Text>
          </View>
        </View>
        <View style={{ marginTop: 8 }}>
          <ScenarioChart scenarios={scenarios} width={475} height={160} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, backgroundColor: C.ink, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12 }}>
          <Text style={{ fontSize: 8, color: "#A7ADA8", flex: 1 }}>
            {deficit
              ? "Em 12 meses, o ajuste diminui o buraco em"
              : "Em 12 meses, o ajuste deixa a mais com você"}
          </Text>
          <Text style={{ fontSize: 15, fontWeight: 600, color: C.brand }}>{brl(twelve.adjusted - twelve.current)}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", marginTop: 12 }} wrap={false}>
        <View style={[s.card, { width: 190, marginRight: 12 }]}>
          <Text style={s.h2}>Score possível em 30 dias</Text>
          <Text style={[s.body, { fontSize: 8, marginTop: 2 }]}>Com o ajuste feito e o valor liberado guardado.</Text>
          {r.outlook.hint ? (
            <Text style={{ fontSize: 9, lineHeight: 1.45, marginTop: 10, color: "#3A423C" }}>
              {r.outlook.hint}
            </Text>
          ) : null}
          {!r.outlook.hint ? (
          <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 12 }}>
            <View>
              <Text style={s.label}>Hoje</Text>
              <Text style={{ fontSize: 26, fontWeight: 600, letterSpacing: -1 }}>{r.outlook.scoreNow}</Text>
            </View>
            <View style={{ marginHorizontal: 10, marginBottom: 8 }}>
              <PdfIcon name="arrow" size={14} color={C.muted} />
            </View>
            <View>
              <Text style={s.label}>Possível</Text>
              <Text style={{ fontSize: 26, fontWeight: 600, letterSpacing: -1, color: C.brandStrong }}>{r.outlook.scoreAfter}</Text>
            </View>
          </View>
          ) : null}
          {!r.outlook.hint ? (
            <View style={{ marginTop: 8 }}>
              <StatusChip status={PROFILE_TONE[r.outlook.profileAfter]} label={PROFILE_LABEL[r.outlook.profileAfter]} />
            </View>
          ) : null}
        </View>
        <View style={[s.card, { flex: 1 }]}>
          <Text style={s.h2}>O que mais move o seu mês</Text>
          <Text style={[s.body, { fontSize: 8, marginTop: 2 }]}>Quanto cada mudança soma à sua sobra mensal.</Text>
          <View style={{ marginTop: 6 }}>
            {r.levers.map((l, i) => (
              <View key={l.label} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 5, borderTopWidth: i ? 1 : 0, borderTopColor: C.line }}>
                <Text style={{ fontSize: 9, flex: 1 }}>{l.label}</Text>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 10.5, fontWeight: 600, color: C.brandStrong }}>+{brl(l.monthly)}</Text>
                  <Text style={{ fontSize: 7, color: C.muted }}>sobra vai a {money(l.marginAfter)}</Text>
                </View>
              </View>
            ))}
            {r.levers.length === 0 ? (
              <Text style={[s.body, { fontSize: 9 }]}>Seus gastos já estão enxutos: o próximo passo é aumentar a renda.</Text>
            ) : null}
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 7.5, color: C.muted, marginTop: 10, lineHeight: 1.4 }}>{PROJECTION_DISCLAIMER}</Text>
    </Page>
  );
}

/* ---------------- 7. Sua rota ---------------- */

function RouteRow({
  kind,
  index,
  horizon,
  title,
  detail,
  last,
}: {
  kind: "start" | "step" | "goal";
  index?: number;
  horizon: string;
  title: string;
  detail: string;
  last: boolean;
}) {
  const marker =
    kind === "start"
      ? { bg: C.ink, fg: C.surface }
      : kind === "goal"
        ? { bg: C.brand, fg: C.ink }
        : { bg: C.brandSoft, fg: C.brandDeep };
  return (
    <View style={{ flexDirection: "row" }} wrap={false}>
      <View style={{ width: 34, alignItems: "center" }}>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: marker.bg, alignItems: "center", justifyContent: "center" }}>
          {kind === "start" ? (
            <Dot color={C.brand} size={9} />
          ) : kind === "goal" ? (
            <PdfIcon name="check" size={12} color={C.ink} strokeWidth={3} />
          ) : (
            <Text style={{ fontSize: 10.5, fontWeight: 700, color: marker.fg }}>{index}</Text>
          )}
        </View>
        {!last ? (
          <View style={{ width: 0, flexGrow: 1, borderLeftWidth: 2, borderLeftColor: kind === "start" ? C.line : C.brand, borderStyle: "dashed", marginVertical: 3 }} />
        ) : null}
      </View>
      <View
        style={[
          s.card,
          {
            flex: 1,
            marginLeft: 8,
            marginBottom: last ? 0 : 7,
            paddingVertical: 8,
            backgroundColor: kind === "goal" ? C.brandSoft : kind === "start" ? C.canvas : C.surface,
            borderColor: kind === "goal" ? C.brand : C.line,
          },
        ]}
      >
        <Text style={[s.eyebrow, { color: kind === "start" ? C.muted : C.brandStrong }]}>{horizon}</Text>
        <Text style={{ fontSize: 12, fontWeight: 600, marginTop: 3, letterSpacing: -0.2 }}>{title}</Text>
        <Text style={[s.body, { fontSize: 9, marginTop: 1, lineHeight: 1.4 }]}>{detail}</Text>
      </View>
    </View>
  );
}

function RoutePage({ d }: { d: Diagnostic }) {
  const r = d.report;
  const m = r.metrics;
  return (
    <Page size="A4" style={s.page}>
      <PageChrome name={d.name} />
      <SectionHeader
        id="rota"
        index="06"
        title="Sua rota"
        intro={`Do ponto em que você está até o seu objetivo: ${GOAL_LABEL[r.goal].toLowerCase()}. Cada etapa começa quando a anterior termina.`}
      />
      <RouteRow
        kind="start"
        horizon="Você está aqui"
        title={`Score ${r.score} · ${m.monthlyMargin < 0 ? "faltam" : "sobram"} ${brl(Math.abs(m.monthlyMargin))} por mês`}
        detail={`${PROFILE_LABEL[r.profile]} · ${pct(m.commitmentRate)} da renda já tem destino · reserva de ${brl(d.answers.reserve)}`}
        last={false}
      />
      {r.route.map((step, i) => (
        <RouteRow
          key={step.key}
          kind={i === r.route.length - 1 ? "goal" : "step"}
          index={i + 1}
          horizon={step.horizon}
          title={step.title}
          detail={step.detail}
          last={i === r.route.length - 1}
        />
      ))}
      <View wrap={false} style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 10, backgroundColor: C.canvas, borderRadius: 12, padding: 10 }}>
        <PdfIcon name="target" size={12} color={C.brandStrong} />
        <Text style={{ marginLeft: 8, fontSize: 9, lineHeight: 1.5, flex: 1, color: "#3A423C" }}>
          Os prazos são uma estimativa com o ritmo do plano, sem contar juros e rendimentos. Cada alavanca da página anterior que você usar encurta o caminho.
        </Text>
      </View>
    </Page>
  );
}

/* ---------------- 8. Plano de 30 dias ---------------- */

function PlanPage({ d, reportUrl }: { d: Diagnostic; reportUrl: string }) {
  const r = d.report;
  return (
    <Page size="A4" style={s.page}>
      <PageChrome name={d.name} />
      <SectionHeader
        id="plano"
        index="07"
        title={PLAN_TITLE[r.planFocus]}
        intro="Quatro semanas, cada uma com um objetivo, três tarefas com os seus números e uma meta para conferir. Marque o que for concluindo."
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {r.plan30d.map((w, i) => (
          <View
            key={w.week}
            wrap={false}
            style={[s.card, { width: "48.8%", marginLeft: i % 2 ? "2.4%" : 0, marginBottom: 10, padding: 12 }]}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: C.brandStrong, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 9, fontWeight: 700, color: C.surface }}>{w.week}</Text>
              </View>
              <View style={{ marginLeft: 7 }}>
                <Text style={[s.eyebrow, { fontSize: 6.5 }]}>Semana {w.week}</Text>
                <Text style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: -0.2 }}>{w.title}</Text>
              </View>
            </View>
            <Text style={[s.body, { fontSize: 8, marginTop: 6, lineHeight: 1.4 }]}>{w.goal}</Text>
            <View style={{ marginTop: 6 }}>
              {w.actions.map((action) => (
                <View key={action} style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 5 }}>
                  <CheckSquare size={9} />
                  <Text style={{ marginLeft: 5, fontSize: 8.4, lineHeight: 1.4, flex: 1 }}>{action}</Text>
                </View>
              ))}
            </View>
            <View style={{ marginTop: 8, backgroundColor: C.brandSoft, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 8 }}>
              <Text style={{ fontSize: 8.2, lineHeight: 1.4 }}>
                <Text style={{ fontWeight: 600, color: C.brandDeep }}>Meta da semana: </Text>
                {w.target}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View wrap={false} style={{ marginTop: 4, flexDirection: "row", alignItems: "center", backgroundColor: C.ink, borderRadius: 14, padding: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 7.5, fontWeight: 600, letterSpacing: 1.6, color: C.brand }}>DAQUI A 30 DIAS</Text>
          <Text style={{ fontSize: 11.5, fontWeight: 600, color: C.surface, marginTop: 5 }}>
            Refaça seu Mapa e compare com o score de hoje: {r.score}.
          </Text>
          <Text style={{ fontSize: 8.5, color: "#C9CEC9", marginTop: 3 }}>
            Meta possível com o plano: {r.outlook.scoreAfter}.
          </Text>
        </View>
        <Link src={reportUrl} style={{ textDecoration: "none" }}>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.brandStrong, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 11 }}>
            <Text style={{ fontSize: 8.5, fontWeight: 600, color: C.surface, marginRight: 5 }}>Abrir meu relatório online</Text>
            <PdfIcon name="link" size={9} color={C.surface} />
          </View>
        </Link>
      </View>

      <Text style={{ fontSize: 6.8, color: C.muted, marginTop: 10, lineHeight: 1.45 }}>{DISCLAIMER}</Text>
    </Page>
  );
}

export function ReportDocument({ diagnostic, reportUrl }: { diagnostic: Diagnostic; reportUrl: string }) {
  return (
    <Document
      title={`Meu Mapa Financeiro — ${diagnostic.name}`}
      author="Meu Mapa Financeiro"
      subject="Diagnóstico financeiro personalizado"
      language="pt-BR"
    >
      <Cover d={diagnostic} />
      <ResultPage d={diagnostic} />
      <IncomePage d={diagnostic} />
      <IndicatorsPage d={diagnostic} />
      <AttentionPage d={diagnostic} />
      <ProjectionPage d={diagnostic} />
      <RoutePage d={diagnostic} />
      <PlanPage d={diagnostic} reportUrl={reportUrl} />
    </Document>
  );
}
