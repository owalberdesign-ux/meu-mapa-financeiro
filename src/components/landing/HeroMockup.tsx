import { Icon } from "@/components/Icon";
import { CountUp } from "@/components/ScoreCard";
import { LogoMark, Meter, StatusBadge } from "@/components/ui";
import { brl, pct } from "@/lib/format";
import { PRIORITY_LABEL, PROFILE_LABEL, PROFILE_TONE } from "@/lib/report-builder";
import { SAMPLE_DIAGNOSTIC } from "@/lib/sample";

const { report } = SAMPLE_DIAGNOSTIC;
const m = report.metrics;

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas px-2.5 py-2">
      <p className="text-[10px] leading-tight text-muted">{label}</p>
      <p className="mt-0.5 text-[13px] font-semibold leading-tight tracking-tight">{value}</p>
    </div>
  );
}

/** Tela de pré-diagnóstico dentro de um celular, com a linha do raio-x passando. */
function Phone() {
  const tone = PROFILE_TONE[report.profile];
  return (
    <div className="relative mx-auto w-[248px] rounded-[2.6rem] bg-ink p-2.5 shadow-[0_40px_80px_-30px_rgba(20,23,20,0.55)] sm:w-[280px]">
      <div className="relative overflow-hidden rounded-[2.1rem] bg-canvas px-3.5 pt-3 pb-4">
        <div className="flex items-center justify-between px-1 text-[10px] font-semibold">
          <span>9:41</span>
          <span className="h-4 w-16 rounded-full bg-ink" />
          <span className="flex gap-0.5">
            <span className="size-1 rounded-full bg-ink" />
            <span className="size-1 rounded-full bg-ink" />
            <span className="size-1 rounded-full bg-ink/40" />
          </span>
        </div>

        <div className="mt-4 flex items-center gap-1.5">
          <LogoMark className="size-5" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-strong">
            Pré-diagnóstico
          </span>
        </div>
        <p className="mt-2 text-[15px] font-semibold leading-snug tracking-tight">
          Mariana, este é o retrato do seu mês.
        </p>

        <div className="mt-3 rounded-2xl border border-line bg-surface p-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">Seu score</p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="leading-none whitespace-nowrap">
              <span className="text-[2.6rem] font-semibold tracking-tighter">
                <CountUp value={report.score} />
              </span>
              <span className="ml-0.5 text-sm text-muted">/ 100</span>
            </p>
            <span className="mb-1">
              <StatusBadge tone={tone} compact>
                {PROFILE_LABEL[report.profile]}
              </StatusBadge>
            </span>
          </div>
          <div className="mt-2.5">
            <Meter value={report.score / 100} tone={tone} label="Score do exemplo" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <MiniStat label="Renda" value={brl(m.income)} />
            <MiniStat label="Margem" value={brl(m.monthlyMargin)} />
            <MiniStat label="Comprometida" value={pct(m.commitmentRate)} />
            <MiniStat label="Prioridade" value={PRIORITY_LABEL[report.primaryProblem]} />
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2 rounded-2xl bg-ink px-3 py-2.5 text-white">
          <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-white/10 text-brand">
            <Icon name="lock" className="size-3.5" />
          </span>
          <span className="text-[11px] leading-tight">
            {report.alerts.length} pontos de atenção encontrados
          </span>
        </div>

      </div>
    </div>
  );
}

function FloatCard({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div
      className={`absolute rounded-2xl border border-line bg-surface/95 p-3 shadow-[0_18px_40px_-18px_rgba(20,23,20,0.45)] backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

/** "Em cerca de 7 meses" → "Em ~7 meses"; destino vira só "Destino". */
function shortHorizon(horizon: string): string {
  if (horizon.startsWith("Seu destino")) return "Destino";
  if (horizon === "Próximos 30 dias") return "Agora · 30 dias";
  return horizon.replace("Em cerca de ", "Em ~");
}

const routePreview = [report.route[0], report.route[1], report.route[report.route.length - 1]];

export function HeroMockup() {
  return (
    <div
      role="img"
      aria-label={`Exemplo de resultado: score ${report.score} de 100, perfil ${PROFILE_LABEL[report.profile]}, renda comprometida de ${pct(m.commitmentRate)}`}
      className="relative isolate mx-auto w-full max-w-[420px] pt-20 pb-36 sm:py-8"
    >
      <div aria-hidden="true">
        <div className="absolute inset-x-10 top-24 bottom-24 -z-10 rounded-full bg-brand/25 blur-3xl" />
        <Phone />

        <FloatCard className="top-0 left-0 w-[160px] animate-float motion-reduce:animate-none sm:top-24 sm:-left-16 sm:w-[170px] lg:-left-20">
          <p className="flex items-center gap-1 text-[11px] font-semibold text-warn-strong">
            <Icon name="attention" className="size-3.5" strokeWidth={2.2} />
            Atenção
          </p>
          <p className="mt-1.5 text-[11px] leading-tight text-muted">Renda comprometida</p>
          <p className="text-xl font-semibold tracking-tight">{pct(m.commitmentRate)}</p>
          <div className="mt-1.5">
            <Meter value={m.commitmentRate} tone="attention" label="Renda comprometida" />
          </div>
        </FloatCard>

        <FloatCard className="right-0 bottom-0 w-[176px] animate-float [animation-delay:-3.5s] motion-reduce:animate-none sm:-right-14 sm:bottom-24 sm:w-[184px] lg:-right-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-strong">Sua rota</p>
          <ol className="mt-2">
            {routePreview.map((step, i) => (
              <li key={step.key} className="relative flex gap-2 pb-2.5 last:pb-0">
                {i < routePreview.length - 1 ? (
                  <span className="absolute top-3.5 bottom-0 left-[5px] border-l-2 border-dashed border-brand/50" />
                ) : null}
                <span
                  className={`relative mt-0.5 size-3 shrink-0 rounded-full ${
                    i === routePreview.length - 1 ? "bg-brand" : i === 0 ? "bg-ink" : "border-2 border-brand bg-surface"
                  }`}
                />
                <span className="text-[11px] leading-tight">
                  <span className="block text-muted">{shortHorizon(step.horizon)}</span>
                  <span className="font-semibold">{step.title}</span>
                </span>
              </li>
            ))}
          </ol>
        </FloatCard>

        <FloatCard className="bottom-4 -left-28 hidden w-[210px] lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-strong">
            Semana 1 · {report.plan30d[0].title}
          </p>
          <p className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-snug">
            <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-brand-strong text-white">
              <Icon name="check" className="size-2.5" strokeWidth={3.5} />
            </span>
            {report.plan30d[0].target}
          </p>
        </FloatCard>
      </div>
    </div>
  );
}
