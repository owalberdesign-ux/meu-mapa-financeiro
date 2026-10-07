@AGENTS.md

# Raio-X do Dinheiro

Low ticket de R$37: landing + quiz + pré-diagnóstico + relatório completo com PDF.
A especificação única do produto é `docs/briefing.md`. Leia antes de mudar regras, textos ou fluxo.

## Regras que não mudam sem pedido explícito

- Diagnóstico 100% por regras determinísticas. Sem IA, sem Open Finance, sem conta/senha.
- Toda fórmula, faixa de pontuação e limite fica em `src/lib/financial-engine.ts`; textos do relatório em `src/lib/report-builder.ts`. Nada de fórmula dentro de componente.
- URL do checkout só em `src/lib/checkout.ts` (`NEXT_PUBLIC_KIWIFY_CHECKOUT_URL`).
- Mobile first: CTA grande, sem tabela larga, sem scroll horizontal, nada dependente de hover.
- Português do Brasil, tom claro e não punitivo. Não prometer resultado; não é consultoria financeira.
- Se não for necessário para vender ou entregar o Raio-X de R$37, não entra agora.

## Comandos

- `npm run dev` · `npm run build` · `npm run lint` · `npm test` (Vitest, motor financeiro)
