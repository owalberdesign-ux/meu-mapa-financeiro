@AGENTS.md

# Meu Mapa Financeiro

Low ticket de R$37: landing + quiz + pré-diagnóstico + relatório completo com PDF.
A especificação de origem é `docs/briefing.md` (escrita quando o produto se chamava "Raio-X do Dinheiro").
O nome do produto fica em `src/lib/brand.ts`. Depois do briefing, o relatório ganhou: leitura em números de
cada ponto de atenção, plano de 30 dias com objetivo/tarefas/meta por semana, rota com prazos, alavancas e
score possível (tudo em `src/lib/report-builder.ts`, com testes).

## Regras que não mudam sem pedido explícito

- Diagnóstico 100% por regras determinísticas. Sem IA, sem Open Finance, sem conta/senha.
- Toda fórmula, faixa de pontuação e limite fica em `src/lib/financial-engine.ts`; textos do relatório em `src/lib/report-builder.ts`. Nada de fórmula dentro de componente.
- URL do checkout só em `src/lib/checkout.ts` (`NEXT_PUBLIC_KIWIFY_CHECKOUT_URL`).
- O PDF (`src/components/pdf/`) só desenha: números e estados vêm de `report-builder.ts` e `report-insights.ts`. Layout fixo, conteúdo sempre a partir das respostas.
- Mobile first: CTA grande, sem tabela larga, sem scroll horizontal, nada dependente de hover.
- Português do Brasil, tom claro e não punitivo. Não prometer resultado; não é consultoria financeira.
- Se não for necessário para vender ou entregar o Mapa de R$37, não entra agora.

## Comandos

- `npm run dev` · `npm run build` · `npm run lint` · `npm test` (Vitest: motor, relatório e leituras do PDF)
