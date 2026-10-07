import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { ScoreCard } from "@/components/ScoreCard";
import { TrackView } from "@/components/TrackView";
import { Card, Eyebrow, Logo, Stat, buttonClass } from "@/components/ui";
import { brl, pct } from "@/lib/format";
import { DISCLAIMER } from "@/lib/legal";
import { PRIORITY_LABEL } from "@/lib/report-builder";
import { SAMPLE_DIAGNOSTIC } from "@/lib/sample";

const HERO_BENEFITS = [
  "Score financeiro de 0 a 100",
  "Principais pontos de atenção",
  "Projeção da sua situação financeira",
  "Plano personalizado de 30 dias",
  "Relatório completo em PDF",
];

const PAINS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "wallet",
    title: "Dinheiro some",
    text: "Você recebe e poucos dias depois já não sabe onde foi parar.",
  },
  {
    icon: "card",
    title: "Parcelas acumuladas",
    text: "Compras feitas meses atrás continuam consumindo sua renda atual.",
  },
  {
    icon: "trendDown",
    title: "Nada sobra",
    text: "Você paga tudo, mas nunca consegue transformar renda em reserva.",
  },
];

const STEPS = [
  {
    title: "Responda",
    text: "Informe renda, despesas, parcelas, dívidas e objetivo.",
  },
  {
    title: "Descubra",
    text: "O sistema calcula seu score e identifica sua principal prioridade.",
  },
  {
    title: "Organize",
    text: "Receba seu diagnóstico completo e um plano de ação de 30 dias.",
  },
];

const DELIVERABLES = [
  "Score financeiro de 0 a 100",
  "Perfil financeiro",
  "Renda x despesas",
  "Margem mensal",
  "Percentual da renda comprometida",
  "Peso dos parcelamentos",
  "Situação das dívidas",
  "Taxa de poupança",
  "Reserva disponível",
  "3 principais pontos de atenção",
  "Projeção de 3, 6 e 12 meses",
  "Plano de ação de 30 dias",
  "PDF personalizado",
];

const OFFER_INFO: { icon: IconName; text: string }[] = [
  { icon: "card", text: "Pagamento via PIX ou cartão" },
  { icon: "good", text: "Acesso liberado após aprovação" },
  { icon: "file", text: "Relatório disponível online" },
  { icon: "download", text: "Versão em PDF para baixar" },
];

const FAQ = [
  {
    q: "Preciso conectar minha conta bancária?",
    a: "Não. O diagnóstico é criado apenas com as informações que você fornece.",
  },
  { q: "O Raio-X acessa meu banco?", a: "Não." },
  {
    q: "É uma consultoria financeira?",
    a: "Não. É uma ferramenta educacional de diagnóstico e organização financeira baseada nos dados informados pelo usuário.",
  },
  {
    q: "O resultado é personalizado?",
    a: "Sim. Cálculos, score, perfil, alertas e plano mudam de acordo com as respostas.",
  },
  {
    q: "Como recebo meu relatório?",
    a: "Após a confirmação do pagamento, o relatório completo é liberado online. Você também pode baixar a versão em PDF.",
  },
  { q: "Preciso criar conta?", a: "Não." },
];

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-strong">
        <Icon name="check" className="size-3.5" strokeWidth={3} />
      </span>
      <span>{children}</span>
    </li>
  );
}

function StartLink({ children }: { children: React.ReactNode }) {
  return (
    <Link href="/diagnostico" className={buttonClass}>
      {children}
      <Icon name="arrowRight" className="size-5" />
    </Link>
  );
}

function HeroPreview() {
  const { report } = SAMPLE_DIAGNOSTIC;
  const m = report.metrics;
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_70%_30%,#dcfce7_0%,transparent_70%)]"
      />
      <Card className="shadow-[0_24px_60px_-32px_rgba(20,23,20,0.35)]">
        <p className="mb-5 text-[13px] font-medium text-muted">Exemplo de resultado</p>
        <ScoreCard score={report.score} profile={report.profile} />
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Stat label="Renda" value={brl(m.income)} />
          <Stat label="Margem mensal" value={brl(m.monthlyMargin)} />
          <Stat label="Renda comprometida" value={pct(m.commitmentRate)} />
          <Stat
            label="Prioridade"
            value={PRIORITY_LABEL[report.primaryProblem]}
            valueClassName="text-base leading-snug"
          />
        </div>
      </Card>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <TrackView event="view_landing" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <Link
          href="/diagnostico"
          className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-brand-strong hover:bg-brand-soft sm:inline-flex"
        >
          Fazer meu Raio-X
        </Link>
      </header>

      <main>
        {/* 01 — Hero */}
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-6 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pt-14 lg:pb-24">
          <div>
            <Eyebrow>Raio-X do Dinheiro</Eyebrow>
            <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl">
              Seu salário some e você não sabe onde foi parar?
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Descubra como está sua vida financeira, quanto da sua renda já está comprometida e
              qual deve ser sua prioridade nos próximos 30 dias.
            </p>
            <ul className="mt-6 space-y-2.5 text-[16px]">
              {HERO_BENEFITS.map((b) => (
                <CheckItem key={b}>{b}</CheckItem>
              ))}
            </ul>
            <div className="mt-8">
              <StartLink>Fazer meu Raio-X</StartLink>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                <Icon name="shield" className="size-4 shrink-0" />
                Leva cerca de 3 minutos. Sem conectar sua conta bancária.
              </p>
            </div>
          </div>
          <HeroPreview />
        </section>

        {/* 02 — Dor */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
              Você não precisa ganhar mais para começar a entender o problema.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
              Muitas vezes, o problema não é apenas quanto entra. É quanto da sua renda já está
              comprometida antes mesmo do mês começar.
            </p>
            <div className="mt-10 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {PAINS.map((p) => (
                <div key={p.title} className="rounded-3xl bg-canvas p-6">
                  <span className="grid size-11 place-items-center rounded-2xl bg-surface text-ink shadow-sm">
                    <Icon name={p.icon} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{p.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 03 — Como funciona */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
            Em poucos minutos você entende sua situação.
          </h2>
          <ol className="mt-10 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-3xl border border-line bg-surface p-6">
                <span className="text-sm font-semibold tabular-nums text-brand-strong">
                  0{i + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <StartLink>Começar meu diagnóstico</StartLink>
          </div>
        </section>

        {/* 04 — O que o cliente recebe */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
            <div>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                Seu Raio-X mostra o que os números estão dizendo.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Tudo calculado a partir das suas respostas, sem acesso ao seu banco.
              </p>
            </div>
            <ul className="grid gap-x-8 gap-y-3.5 text-[16px] sm:grid-cols-2">
              {DELIVERABLES.map((d) => (
                <CheckItem key={d}>{d}</CheckItem>
              ))}
            </ul>
          </div>
        </section>

        {/* 05 — Oferta */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-xl rounded-[2rem] bg-ink p-7 text-white sm:p-10">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">
              Desbloqueie seu Raio-X completo
            </h2>
            <p className="mt-6 flex items-baseline gap-1">
              <span className="text-2xl font-medium text-white/70">R$</span>
              <span className="text-7xl font-semibold tracking-tighter">37</span>
            </p>
            <p className="mt-4 leading-relaxed text-white/75">
              Um diagnóstico personalizado da sua situação financeira, com prioridades claras e
              um plano simples para os próximos 30 dias.
            </p>
            <div className="mt-8 [&>a]:w-full">
              <StartLink>Quero ver meu Raio-X completo</StartLink>
            </div>
            <ul className="mt-7 grid gap-3 text-[15px] text-white/80 sm:grid-cols-2">
              {OFFER_INFO.map((o) => (
                <li key={o.text} className="flex items-center gap-2.5">
                  <Icon name={o.icon} className="size-4 shrink-0 text-brand" />
                  {o.text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 06 — FAQ */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
            <h2 className="text-3xl font-semibold tracking-tight">Perguntas frequentes</h2>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <Icon
                      name="chevronDown"
                      className="size-5 shrink-0 text-muted transition group-open:rotate-180"
                    />
                  </summary>
                  <p className="pb-5 leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Logo />
          <p className="mt-5 max-w-3xl text-[13px] leading-relaxed text-muted">{DISCLAIMER}</p>
          <p className="mt-4 text-[13px] text-muted">© 2026 Raio-X do Dinheiro</p>
        </div>
      </footer>
    </>
  );
}
