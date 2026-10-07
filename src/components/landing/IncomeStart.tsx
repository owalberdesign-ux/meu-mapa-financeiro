"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { buttonClass } from "@/components/ui";
import { track } from "@/lib/analytics";
import { thousands } from "@/lib/format";

const QUIZ_KEY = "rxd:quiz";

/**
 * Primeira pergunta do quiz já no topo da página: quem digita a renda entra
 * no quiz direto na segunda etapa.
 */
export function IncomeStart() {
  const router = useRouter();
  const [income, setIncome] = useState<number | undefined>(undefined);

  function start(e: FormEvent) {
    e.preventDefault();
    if (income && income > 0) {
      try {
        sessionStorage.setItem(
          QUIZ_KEY,
          JSON.stringify({ draft: { income }, step: 1, name: "", email: "" }),
        );
      } catch {
        // Sem armazenamento: o quiz começa do zero, sem prejuízo.
      }
      track("start_quiz", { source: "hero_income" });
    }
    router.push("/diagnostico");
  }

  return (
    <form onSubmit={start} className="rounded-3xl border border-line bg-surface p-3 shadow-[0_18px_50px_-30px_rgba(20,23,20,0.45)] sm:p-3.5">
      <label htmlFor="hero-income" className="block px-2 pt-1 text-[13px] font-medium text-muted">
        Quanto você recebe por mês?
      </label>
      <div className="mt-2 flex flex-col gap-2.5 sm:flex-row">
        <div className="flex h-14 flex-1 items-center gap-2 rounded-2xl bg-canvas px-4 focus-within:ring-4 focus-within:ring-brand-soft">
          <span className="text-lg font-medium text-muted">R$</span>
          <input
            id="hero-income"
            inputMode="numeric"
            autoComplete="off"
            placeholder="4.500"
            value={income === undefined ? "" : thousands(income)}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
              setIncome(digits === "" ? undefined : Number(digits));
            }}
            className="w-full min-w-0 bg-transparent text-2xl font-semibold tracking-tight outline-none placeholder:text-muted/40"
          />
        </div>
        <button type="submit" className={`${buttonClass} sm:w-auto`}>
          Traçar meu mapa
          <Icon name="arrowRight" className="size-5" />
        </button>
      </div>
    </form>
  );
}
