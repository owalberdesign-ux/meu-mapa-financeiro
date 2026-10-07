import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { TrackView } from "@/components/TrackView";
import { IncomeStart } from "@/components/landing/IncomeStart";
import { Float3D, RouteDivider, StopChip } from "@/components/landing/MapBits";
import { MapScene } from "@/components/landing/MapScene";
import {
  IncomeBar,
  StepAnswer,
  StepDiscover,
  StepOrganize,
  TileAlerts,
  TilePdf,
  TilePlan,
  TileRoute,
  TileScore,
} from "@/components/landing/illustrations";
import { StickyCta } from "@/components/landing/StickyCta";
import { Logo, buttonClass, buttonFullClass } from "@/components/ui";
import { DISCLAIMER } from "@/lib/legal";

const HERO_BENEFITS = [
  "Score financeiro de 0 a 100",
  "Pontos de atenção com o primeiro passo",
  "Rota com prazos até o seu objetivo",
  "Plano de 30 dias com metas semanais",
  "Mapa completo em PDF",
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

const STEPS: { title: string; text: string; art: ReactNode }[] = [
  {
    title: "Responda",
    text: "Informe renda, despesas, parcelas, dívidas e objetivo.",
    art: <StepAnswer />,
  },
  {
    title: "Descubra",
    text: "O sistema calcula seu score e identifica sua principal prioridade.",
    art: <StepDiscover />,
  },
  {
    title: "Siga a rota",
    text: "Receba seu diagnóstico completo, a rota até o seu objetivo e um plano de 30 dias com tarefas.",
    art: <StepOrganize />,
  },
];

const ALSO_INCLUDED = [
  "Perfil financeiro",
  "Pilares do score",
  "Para onde vai sua renda",
  "7 indicadores com referência",
  "Alavancas do seu mês",
  "Score possível em 30 dias",
  "Projeção de 3, 6 e 12 meses",
  "Seus pontos fortes",
];

const UNLOCKS = [
  "Seus pontos de atenção, com o primeiro passo",
  "Quanto você pode recuperar e o seu score possível",
  "Sua rota até o objetivo, com prazos",
  "Plano de 30 dias com tarefas e metas semanais",
  "Seu Mapa completo em PDF, com 8 páginas",
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
  { q: "O Meu Mapa Financeiro acessa meu banco?", a: "Não." },
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

function StartLink({ children, full = false }: { children: ReactNode; full?: boolean }) {
  return (
    <Link href="/diagnostico" className={full ? buttonFullClass : `${buttonClass} sm:min-w-72`}>
      {children}
      <Icon name="arrowRight" className="size-5" />
    </Link>
  );
}

function SectionHeading({
  stop,
  label,
  title,
  text,
  dark = false,
}: {
  /** Número da parada na rota da página; sem número é o destino. */
  stop?: number;
  label: string;
  title: string;
  text?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <StopChip n={stop} label={label} dark={dark} />
      <h2 className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-tight text-balance sm:text-[2.6rem]">
        {title}
      </h2>
      {text ? (
        <p className={`mt-4 text-lg leading-relaxed ${dark ? "text-white/70" : "text-muted"}`}>{text}</p>
      ) : null}
    </div>
  );
}

function Tile({
  title,
  text,
  className = "",
  children,
}: {
  title: string;
  text: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`reveal tilt-hover flex flex-col rounded-3xl bg-surface p-5 text-ink sm:p-6 ${className}`}>
      <h3 className="text-[17px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-[14px] leading-snug text-muted">{text}</p>
      <div className="mt-5 flex-1">{children}</div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <TrackView event="view_landing" />
      <StickyCta />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <Link
          href="/diagnostico"
          className="rounded-xl px-3 py-2 text-sm font-semibold whitespace-nowrap text-brand-strong hover:bg-brand-soft max-[399px]:hidden"
        >
          Fazer meu Mapa
        </Link>
      </header>

      <main>
        {/* Você está aqui */}
        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-contours [mask-image:radial-gradient(ellipse_90%_75%_at_70%_20%,black_25%,transparent_80%)]"
          />
          <div className="mx-auto grid max-w-6xl gap-4 px-4 pt-6 pb-6 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-10 lg:pt-10 lg:pb-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 py-1 pr-3.5 pl-2.5 text-[13px] font-medium shadow-sm backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-brand" />
                </span>
                Diagnóstico financeiro personalizado
              </p>
              <h1 className="mt-5 text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.035em] text-balance sm:text-[4rem]">
                Seu salário{" "}
                <span className="bg-linear-to-r from-ink from-20% to-ink/15 bg-clip-text text-transparent">
                  some
                </span>{" "}
                e você não sabe onde foi parar?
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
                Seu Mapa Financeiro mostra onde você está, quanto da sua renda já está comprometida e a
                rota, com prazos, até o seu objetivo.
              </p>
              <div id="hero-cta" className="mt-7 max-w-xl">
                <IncomeStart />
                <p className="mt-3 flex items-center gap-2 px-1 text-sm text-muted">
                  <Icon name="shield" className="size-4 shrink-0 text-brand-strong" />
                  Leva cerca de 3 minutos. Sem conectar sua conta bancária.
                </p>
              </div>
              <ul className="mt-6 grid gap-2 text-[15px] sm:grid-cols-2 sm:gap-x-6">
                {HERO_BENEFITS.map((b) => (
                  <li key={b} className="flex items-center gap-2.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-strong text-white">
                      <Icon name="check" className="size-3" strokeWidth={3.5} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <MapScene />
          </div>
        </section>

        <RouteDivider />

        {/* Parada 1 — O problema */}
        <section className="px-4 sm:px-6">
          <div className="relative isolate mx-auto grid max-w-6xl gap-10 overflow-hidden rounded-[2rem] border border-line bg-surface p-6 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:p-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-contours opacity-60 [mask-image:linear-gradient(to_left,black,transparent_60%)]"
            />
            <div>
              <SectionHeading
                stop={1}
                label="O problema"
                title="Você não precisa ganhar mais para começar a entender o problema."
                text="Muitas vezes, o problema não é apenas quanto entra. É quanto da sua renda já está comprometida antes mesmo do mês começar."
              />
              <ul className="mt-8 space-y-5">
                {PAINS.map((p) => (
                  <li key={p.title} className="reveal flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-canvas text-ink">
                      <Icon name={p.icon} />
                    </span>
                    <div>
                      <h3 className="text-[17px] font-semibold">{p.title}</h3>
                      <p className="mt-0.5 leading-relaxed text-muted">{p.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal relative">
              <Float3D name="coins" className="absolute -top-14 -right-3 w-20 sm:-top-16 sm:w-28" />
              <IncomeBar />
            </div>
          </div>
        </section>

        <RouteDivider flip />

        {/* Parada 2 — Como funciona */}
        <section className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Float3D name="calendar" delay={2} className="absolute top-0 right-4 hidden w-28 md:block lg:w-36" />
          <SectionHeading stop={2} label="Como funciona" title="Em poucos minutos você entende sua situação." />
          <ol className="relative mt-10 grid gap-5 md:grid-cols-3 md:gap-4">
            <span
              aria-hidden="true"
              className="absolute top-5 bottom-5 left-[19px] border-l-[3px] border-dashed border-brand/45 md:top-[19px] md:right-[16%] md:bottom-auto md:left-[16%] md:border-t-[3px] md:border-l-0"
            />
            {STEPS.map((s, i) => (
              <li key={s.title} className="reveal relative grid grid-cols-[40px_1fr] gap-4 md:grid-cols-1">
                <span className="relative grid size-10 place-items-center rounded-full bg-brand-strong text-[15px] font-semibold tabular-nums text-white ring-8 ring-canvas md:mx-auto">
                  {i + 1}
                </span>
                <div className="tilt-hover rounded-3xl border border-line bg-surface p-5 sm:p-6">
                  {s.art}
                  <h3 className="mt-6 text-xl font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <StartLink>Começar meu Mapa</StartLink>
          </div>
        </section>

        <RouteDivider />

        {/* Parada 3 — O que o cliente recebe */}
        <section className="px-4 sm:px-6">
          <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-ink p-6 text-white sm:p-10 lg:p-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-contours-light [mask-image:radial-gradient(ellipse_80%_60%_at_80%_0%,black,transparent)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-32 -right-24 -z-10 size-96 rounded-full bg-brand/25 blur-3xl"
            />
            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <SectionHeading
                dark
                stop={3}
                label="O que você recebe"
                title="Seu Mapa mostra onde você está e a rota até onde quer chegar."
                text="Feito a partir das suas respostas: cada número explicado, cada etapa com prazo e cada semana com tarefas."
              />
              <div className="relative mx-auto w-full max-w-md">
                <Float3D name="map" parallax={false} className="w-full" />
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
              <Tile
                title="Score de 0 a 100"
                text="Seu perfil financeiro em uma escala simples."
                className="sm:col-span-2 lg:col-span-1 lg:row-span-2"
              >
                <TileScore />
              </Tile>
              <Tile title="Pontos de atenção com o primeiro passo" text="O que mais pesa no seu mês, em reais, e por onde começar.">
                <TileAlerts />
              </Tile>
              <Tile title="Sua rota com prazos" text="Do ponto em que você está até o seu objetivo, etapa por etapa.">
                <TileRoute />
              </Tile>
              <Tile title="Plano de 30 dias" text="Objetivo, tarefas com os seus números e uma meta para cada semana.">
                <TilePlan />
              </Tile>
              <Tile title="PDF de 8 páginas" text="Com o seu nome e os seus números, para salvar e acompanhar.">
                <div className="grid h-full min-h-52 place-items-center">
                  <TilePdf />
                </div>
              </Tile>
            </div>
            <div className="mt-8">
              <p className="text-sm text-white/60">E também:</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {ALSO_INCLUDED.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[14px] text-white/85"
                  >
                    <Icon name="check" className="size-3.5 text-brand" strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <RouteDivider flip />

        {/* Destino — Oferta */}
        <section id="oferta" className="mx-auto max-w-6xl scroll-mt-6 px-4 pb-16 sm:px-6 lg:pb-24">
          <div className="reveal relative isolate grid overflow-hidden rounded-[2rem] border border-line bg-surface lg:grid-cols-[1.1fr_1fr]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-contours opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
            />
            <div className="relative p-7 sm:p-10">
              <Float3D name="flag" delay={4} className="absolute top-4 right-4 w-16 sm:top-8 sm:right-8 sm:w-24 lg:right-4" />
              <StopChip label="Pagamento único" />
              <h2 className="mt-4 max-w-[15ch] text-[2rem] font-semibold leading-tight tracking-tight sm:text-4xl">
                Desbloqueie seu Mapa Financeiro completo
              </h2>
              <p className="mt-6 flex items-start gap-1.5 leading-none">
                <span className="mt-3 text-2xl font-medium text-muted">R$</span>
                <span className="text-8xl font-semibold tracking-tighter">37</span>
              </p>
              <p className="mt-5 max-w-md leading-relaxed text-muted">
                Um diagnóstico personalizado da sua situação financeira, com prioridades claras, a rota até o
                seu objetivo e um plano simples para os próximos 30 dias.
              </p>
              <div className="mt-8">
                <StartLink full>Quero ver meu Mapa completo</StartLink>
              </div>
              <ul className="mt-6 grid gap-3 text-[14px] text-muted sm:grid-cols-2">
                {OFFER_INFO.map((o) => (
                  <li key={o.text} className="flex items-center gap-2.5">
                    <Icon name={o.icon} className="size-4 shrink-0 text-brand-strong" />
                    {o.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-line bg-canvas/70 p-7 sm:p-10 lg:border-t-0 lg:border-l">
              <p className="text-[15px] font-semibold">Ao desbloquear, você vê:</p>
              <ol className="relative mt-5 space-y-3">
                {UNLOCKS.map((u, i) => (
                  <li key={u} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 text-[15px] shadow-[0_1px_0_rgba(20,23,20,0.04)] ring-1 ring-line">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-strong text-white">
                      <Icon name="check" className="size-4" strokeWidth={3} />
                      <span className="sr-only">Item {i + 1}</span>
                    </span>
                    {u}
                  </li>
                ))}
              </ol>
              <p className="mt-6 flex items-center gap-2 text-[13px] text-muted">
                <Icon name="shield" className="size-4 shrink-0 text-brand-strong" />
                Seu score e o pré-diagnóstico aparecem antes do pagamento.
              </p>
            </div>
          </div>
        </section>

        {/* Dúvidas */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-24">
            <div className="max-w-2xl">
              <h2 className="text-[2rem] font-semibold leading-[1.1] tracking-tight text-balance sm:text-[2.6rem]">
                Perguntas frequentes
              </h2>
            </div>
            <div className="space-y-2.5">
              {FAQ.map((f) => (
                <details key={f.q} className="group rounded-2xl bg-canvas px-5 open:bg-surface open:ring-1 open:ring-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4.5 text-[17px] font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface text-muted transition group-open:rotate-180 group-open:bg-canvas">
                      <Icon name="chevronDown" className="size-4" />
                    </span>
                  </summary>
                  <p className="pb-5 leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line pb-24 sm:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Logo />
          <p className="mt-5 max-w-3xl text-[13px] leading-relaxed text-muted">{DISCLAIMER}</p>
          <p className="mt-4 text-[13px] text-muted">© 2026 Meu Mapa Financeiro</p>
        </div>
      </footer>
    </>
  );
}
