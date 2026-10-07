"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import type { Answers, Goal } from "@/types/diagnostic";
import { Icon } from "@/components/Icon";
import { Logo, buttonFullClass } from "@/components/ui";
import { track } from "@/lib/analytics";
import { createDiagnostic } from "@/lib/diagnostic-store";
import { thousands } from "@/lib/format";
import { GOAL_LABEL } from "@/lib/report-builder";

type MoneyField = "income" | "housing" | "essential" | "variable" | "installments" | "debt" | "saving" | "reserve";

interface Draft {
  income?: number;
  housing?: number;
  essential?: number;
  variable?: number;
  installments?: number;
  hasDebt?: boolean;
  debt?: number;
  saving?: number;
  reserve?: number;
  goal?: Goal;
}

type Question =
  | { id: MoneyField; kind: "money"; title: string; description?: string; min: 0 | 1; when?: (d: Draft) => boolean }
  | { id: "hasDebt"; kind: "yesno"; title: string; description?: string }
  | { id: "goal"; kind: "goal"; title: string; description?: string };

const QUESTIONS: Question[] = [
  {
    id: "income",
    kind: "money",
    title: "Quanto você recebe líquido por mês?",
    description: "Use o valor que realmente entra na sua conta.",
    min: 1,
  },
  {
    id: "housing",
    kind: "money",
    title: "Quanto você gasta com moradia?",
    description: "Aluguel, financiamento, condomínio ou contribuição da casa.",
    min: 0,
  },
  {
    id: "essential",
    kind: "money",
    title: "Quanto gasta com despesas essenciais?",
    description: "Contas da casa, alimentação essencial, transporte e outros gastos obrigatórios.",
    min: 0,
  },
  {
    id: "variable",
    kind: "money",
    title: "Quanto gasta com coisas não essenciais?",
    description: "Delivery, lazer, roupas, compras pessoais, assinaturas e pequenos gastos.",
    min: 0,
  },
  {
    id: "installments",
    kind: "money",
    title: "Quanto paga por mês em parcelas?",
    description: "Considere compras parceladas e compromissos semelhantes.",
    min: 0,
  },
  { id: "hasDebt", kind: "yesno", title: "Você possui alguma dívida vencida hoje?" },
  {
    id: "debt",
    kind: "money",
    title: "Qual é aproximadamente o valor total dessas dívidas?",
    description: "Pode ser uma estimativa.",
    min: 1,
    // Fica na contagem até a pessoa responder "Não" na pergunta anterior.
    when: (d) => d.hasDebt !== false,
  },
  {
    id: "saving",
    kind: "money",
    title: "Quanto você consegue guardar por mês?",
    description: "Considere o que realmente fica separado, não o que você gostaria de guardar.",
    min: 0,
  },
  {
    id: "reserve",
    kind: "money",
    title: "Quanto possui hoje em reserva financeira?",
    description: "Dinheiro disponível para imprevistos.",
    min: 0,
  },
  { id: "goal", kind: "goal", title: "Qual é sua maior prioridade financeira agora?" },
];

const GOALS = Object.entries(GOAL_LABEL) as [Goal, string][];
const STORAGE_KEY = "rxd:quiz";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function visibleQuestions(draft: Draft): Question[] {
  return QUESTIONS.filter((q) => q.kind !== "money" || !q.when || q.when(draft));
}

function toAnswers(d: Draft): Answers {
  return {
    income: d.income ?? 0,
    housing: d.housing ?? 0,
    essential: d.essential ?? 0,
    variable: d.variable ?? 0,
    installments: d.installments ?? 0,
    hasDebt: d.hasDebt === true,
    debt: d.hasDebt ? (d.debt ?? 0) : 0,
    saving: d.saving ?? 0,
    reserve: d.reserve ?? 0,
    goal: d.goal ?? "organize",
  };
}

function validate(q: Question, d: Draft): string | null {
  if (q.kind === "money") {
    const v = d[q.id];
    if (v === undefined) {
      return q.min === 1 ? "Informe um valor para continuar." : "Informe um valor. Se não tiver esse gasto, digite 0.";
    }
    if (q.min === 1 && v < 1) {
      return q.id === "debt"
        ? "Informe um valor maior que zero, ou volte e marque que não possui dívida vencida."
        : "Informe um valor maior que zero.";
    }
    return null;
  }
  if (q.kind === "yesno") return d.hasDebt === undefined ? "Escolha uma opção para continuar." : null;
  return d.goal === undefined ? "Escolha uma opção para continuar." : null;
}

interface Saved {
  draft: Draft;
  step: number;
  name: string;
  email: string;
}

function readSaved(): string {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function parseSaved(raw: string): Saved | null {
  try {
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

const noSubscribe = () => () => {};

/**
 * O progresso salvo só existe no navegador: no servidor (e na hidratação) o
 * quiz aparece vazio e, no cliente, retoma de onde a pessoa parou.
 */
export function Quiz() {
  const saved = useSyncExternalStore(noSubscribe, readSaved, () => null);
  if (saved === null) return <QuizFrame progress={0} />;
  return <QuizFlow saved={parseSaved(saved)} />;
}

function QuizFlow({ saved }: { saved: Saved | null }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => saved?.draft ?? {});
  // step === questions.length é a tela de nome + e-mail.
  const [step, setStep] = useState(() => saved?.step ?? 0);
  const [name, setName] = useState(() => saved?.name ?? "");
  const [email, setEmail] = useState(() => saved?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const advanceTimer = useRef<number | undefined>(undefined);
  const resumed = useRef(saved !== null);

  const questions = visibleQuestions(draft);
  const total = questions.length;
  const isLead = step >= total;
  const question = isLead ? null : questions[step];

  useEffect(() => {
    if (!resumed.current) track("start_quiz");
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, step, name, email } satisfies Saved));
    } catch {
      // Sem armazenamento: o quiz segue normalmente, só não retoma após recarregar.
    }
  }, [draft, step, name, email]);

  useEffect(() => {
    track("quiz_step", { step: step + 1, question: isLead ? "lead" : (question?.id ?? "") });
  }, [step, isLead, question?.id]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  function goNext(nextDraft: Draft = draft) {
    if (!question) return;
    const message = validate(question, nextDraft);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    const nextTotal = visibleQuestions(nextDraft).length;
    if (step + 1 >= nextTotal) track("complete_quiz");
    setStep(step + 1);
  }

  function goBack() {
    window.clearTimeout(advanceTimer.current);
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function choose(patch: Draft) {
    const next = { ...draft, ...patch };
    setDraft(next);
    setError(null);
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => goNext(next), 220);
  }

  async function submitLead(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Informe seu nome.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Informe um e-mail válido.");
      return;
    }
    setError(null);
    setSubmitting(true);
    track("submit_lead");
    try {
      const [diagnostic] = await Promise.all([
        createDiagnostic({ name, email, answers: toAnswers(draft) }),
        // Pausa curta para a tela de cálculo não piscar.
        new Promise((r) => setTimeout(r, 1100)),
      ]);
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
      router.push(`/resultado/${diagnostic.id}`);
    } catch {
      setSubmitting(false);
      setError("Não conseguimos gerar seu diagnóstico agora. Tente de novo em instantes.");
    }
  }

  const progress = isLead ? 1 : step / total;

  if (submitting) {
    return (
      <div className="grid min-h-dvh place-items-center px-6" role="status" aria-live="polite">
        <div className="text-center">
          <span className="mx-auto block size-12 animate-spin rounded-full border-4 border-brand-soft border-t-brand-strong motion-reduce:animate-none" />
          <p className="mt-6 text-xl font-semibold">Calculando seu Raio-X…</p>
          <p className="mt-2 text-muted">Cruzando renda, despesas, parcelas e reserva.</p>
        </div>
      </div>
    );
  }

  return (
    <QuizFrame progress={progress} stepLabel={isLead ? undefined : `Etapa ${step + 1} de ${total}`}>
      {isLead ? (
        <form key="lead" onSubmit={submitLead} noValidate className="flex flex-1 flex-col pt-8 pb-6 animate-rise motion-reduce:animate-none">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-strong">Último passo</p>
          <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-3xl">
            Seu diagnóstico está quase pronto.
          </h1>
          <p className="mt-2 text-lg text-muted">Para identificar e enviar seu Raio-X, informe:</p>

          <label className="mt-8 block text-sm font-medium" htmlFor="name">
            Nome
          </label>
          <input
            id="name"
            autoFocus
            autoComplete="name"
            enterKeyHint="next"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 h-14 w-full rounded-2xl border border-line bg-surface px-4 text-lg outline-none transition focus:border-brand-strong focus:ring-4 focus:ring-brand-soft"
          />
          <label className="mt-5 block text-sm font-medium" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            enterKeyHint="done"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 h-14 w-full rounded-2xl border border-line bg-surface px-4 text-lg outline-none transition focus:border-brand-strong focus:ring-4 focus:ring-brand-soft"
          />
          <p className="mt-3 text-sm text-muted">Usamos seu e-mail só para enviar o seu Raio-X.</p>

          <ErrorText message={error} />

          <div className="mt-auto flex flex-col gap-3 pt-10">
            <button type="submit" className={buttonFullClass}>
              Ver meu pré-diagnóstico
              <Icon name="arrowRight" />
            </button>
            <BackButton onClick={goBack} />
          </div>
        </form>
      ) : question ? (
        <form
          key={question.id}
          onSubmit={(e) => {
            e.preventDefault();
            goNext();
          }}
          noValidate
          className="flex flex-1 flex-col pt-8 pb-6 animate-rise motion-reduce:animate-none"
        >
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-balance sm:text-3xl">
            {question.title}
          </h1>
          {question.description ? <p className="mt-2 text-lg text-muted">{question.description}</p> : null}

          <div className="mt-8">
            {question.kind === "money" ? (
              <MoneyInput
                value={draft[question.id]}
                label={question.title}
                onChange={(v) => {
                  setDraft({ ...draft, [question.id]: v });
                  setError(null);
                }}
              />
            ) : question.kind === "yesno" ? (
              <Options
                label={question.title}
                options={[
                  ["yes", "Sim"],
                  ["no", "Não"],
                ]}
                selected={draft.hasDebt === undefined ? undefined : draft.hasDebt ? "yes" : "no"}
                onSelect={(v) => choose({ hasDebt: v === "yes" })}
              />
            ) : (
              <Options
                label={question.title}
                options={GOALS}
                selected={draft.goal}
                onSelect={(v) => choose({ goal: v as Goal })}
              />
            )}
          </div>

          <ErrorText message={error} />

          <div className="mt-auto flex flex-col gap-3 pt-10">
            <button type="submit" className={buttonFullClass}>
              Continuar
              <Icon name="arrowRight" />
            </button>
            {step === 0 ? (
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl text-[15px] font-medium text-muted hover:text-ink"
              >
                <Icon name="arrowLeft" className="size-4" />
                Voltar
              </Link>
            ) : (
              <BackButton onClick={goBack} />
            )}
          </div>
        </form>
      ) : null}
    </QuizFrame>
  );
}

function QuizFrame({
  progress,
  stepLabel,
  children,
}: {
  progress: number;
  stepLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 sm:px-6">
      <header className="pt-4 pb-2">
        <div className="flex h-8 items-center justify-between">
          <Logo />
          {stepLabel ? <p className="text-sm tabular-nums text-muted">{stepLabel}</p> : null}
        </div>
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-track"
          role="progressbar"
          aria-label="Progresso do quiz"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(4, progress * 100)}%` }}
          />
        </div>
      </header>
      {children}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl text-[15px] font-medium text-muted hover:text-ink"
    >
      <Icon name="arrowLeft" className="size-4" />
      Voltar
    </button>
  );
}

function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-4 flex items-start gap-2 text-[15px] font-medium text-risk-strong">
      <Icon name="risk" className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

function MoneyInput({
  value,
  label,
  onChange,
}: {
  value: number | undefined;
  label: string;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div className="flex h-20 items-center gap-3 rounded-2xl border border-line bg-surface px-5 transition focus-within:border-brand-strong focus-within:ring-4 focus-within:ring-brand-soft">
      <span className="text-2xl font-medium text-muted">R$</span>
      <input
        autoFocus
        aria-label={label}
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="next"
        placeholder="0"
        value={value === undefined ? "" : thousands(value)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
          onChange(digits === "" ? undefined : Number(digits));
        }}
        className="w-full min-w-0 bg-transparent text-4xl font-semibold tracking-tight outline-none placeholder:text-line"
      />
    </div>
  );
}

function Options({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: [string, string][];
  selected: string | undefined;
  onSelect: (value: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-2.5">
      {options.map(([value, text]) => {
        const active = selected === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(value)}
            className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-5 py-3 text-left text-[17px] font-medium transition ${
              active
                ? "border-brand-strong bg-brand-soft text-brand-deep"
                : "border-line bg-surface hover:border-ink/25"
            }`}
          >
            {text}
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${
                active ? "border-brand-strong bg-brand-strong text-white" : "border-line"
              }`}
            >
              {active ? <Icon name="check" className="size-3.5" strokeWidth={3} /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
