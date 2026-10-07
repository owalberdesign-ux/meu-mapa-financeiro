# Meu Mapa Financeiro

Diagnóstico financeiro personalizado de R$37: a pessoa responde um quiz curto, vê o score e o
pré-diagnóstico de graça e desbloqueia o Mapa completo (relatório + PDF) pelo checkout da Kiwify.
O Mapa mostra onde a pessoa está, o que mais pesa no mês, a rota com prazos até o objetivo e um
plano de 30 dias com tarefas e metas.

Especificação de origem: [`docs/briefing.md`](docs/briefing.md) (do tempo em que se chamava Raio-X do Dinheiro).

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # testes do motor financeiro
npm run build
```

## Rotas

| Rota | O que é |
|---|---|
| `/` | Landing |
| `/diagnostico` | Quiz (10 perguntas, 1 condicional) + nome/e-mail |
| `/resultado/[id]` | Pré-diagnóstico com conteúdo bloqueado, ou relatório completo se pago |
| `/exemplo` | Relatório pago completo com dados fictícios (para revisão; não indexado) |

## Onde está cada coisa

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/financial-engine.ts` | Métricas, score, limites, perfil, problema principal, alertas, projeção |
| `src/lib/report-builder.ts` | Pontos de atenção (leitura + primeiro passo), metas, plano de 30 dias, rota, alavancas, score possível e montagem do relatório (`report_data`, versão 2) |
| `src/lib/brand.ts` | Nome do produto |
| `src/lib/checkout.ts` | `buildCheckoutUrl` — único lugar com a URL da Kiwify (`s1` = ID do diagnóstico) |
| `src/lib/diagnostic-store.ts` | Onde o diagnóstico fica salvo (hoje no navegador; fase 2: Supabase) |
| `src/lib/analytics.ts` | Eventos do funil (`view_landing` … `download_pdf`) no `dataLayer`, prontos para Pixel/GA |
| `src/components/report.tsx` | Pré-diagnóstico, bloqueio e relatório completo na tela |
| `src/lib/report-insights.ts` | Leituras do PDF: pilares do score, indicadores com estado, fatias da renda, cenários |
| `src/components/pdf/` | PDF de 7 páginas (`@react-pdf/renderer`), gerado no navegador e carregado só no clique |
| `supabase/schema.sql` | Tabela `diagnostics` da fase 2 |

## Estado atual (primeira entrega)

- Tudo calculado no navegador; o diagnóstico fica salvo no aparelho da pessoa.
- Sem `NEXT_PUBLIC_KIWIFY_CHECKOUT_URL`, o botão de compra **simula o pagamento** (modo prévia) para
  mostrar a entrega. Com a variável preenchida, o botão leva ao checkout com `name`, `email` e `s1`.
- PDF: botão "Baixar meu Mapa em PDF" gera um arquivo A4 de 8 páginas com os números da pessoa
  (capa, resultado, renda, indicadores, pontos de atenção, projeção e alavancas, rota, plano de 30 dias).
  O layout é fixo; textos, estados, gráficos, rota e plano mudam conforme as respostas. Se a geração
  falhar, cai na impressão.
- Diagnósticos salvos numa versão anterior do relatório são refeitos a partir das respostas ao abrir.
- Fonte do PDF: Geist (SIL OFL) em `public/fonts`.

## Próxima etapa

1. Supabase: criar a tabela com `supabase/schema.sql`; trocar `diagnostic-store.ts` por chamadas a
   rotas `/api/diagnostics` (servidor com a service role), mantendo as mesmas funções.
2. Kiwify: preencher `NEXT_PUBLIC_KIWIFY_CHECKOUT_URL`; criar `/api/webhooks/kiwify` que valida o
   token, lê `s1` e marca o diagnóstico como pago; apontar o pós-compra para `/resultado/[id]`.
3. Tela de "pagamento ainda não confirmado" enquanto o webhook não chega.
4. E-mail com o link do relatório (backup da entrega na tela).
