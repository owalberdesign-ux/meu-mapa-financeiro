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
npm test           # motor financeiro, relatório, PDF, webhook e validações do servidor
npm run build
```

## Rotas

| Rota | O que é |
|---|---|
| `/` | Landing |
| `/diagnostico` | Quiz (10 perguntas, 1 condicional) + nome/e-mail |
| `/resultado/[id]` | Pré-diagnóstico com conteúdo bloqueado, espera do pagamento ou relatório completo |
| `/obrigado` | Página de obrigado da Kiwify: leva a pessoa de volta ao Mapa dela |
| `/exemplo` | Relatório pago completo com dados fictícios (para revisão; não indexado) |
| `POST /api/diagnostics` | Cria o diagnóstico (relatório calculado no servidor) |
| `GET /api/diagnostics/[id]` | Pré-diagnóstico; o relatório completo só sai depois do pagamento |
| `POST /api/diagnostics/[id]/simulate` | Só no modo prévia (sem checkout): simula a compra |
| `POST /api/webhooks/kiwify` | Aviso de venda da Kiwify (assinatura HMAC-SHA1 com o token) |

## Onde está cada coisa

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/financial-engine.ts` | Métricas, score, limites, perfil, problema principal, alertas, projeção |
| `src/lib/report-builder.ts` | Pontos de atenção (leitura + primeiro passo), metas, plano de 30 dias, rota, alavancas, score possível e montagem do relatório (`report_data`, versão 2) |
| `src/lib/brand.ts` | Nome do produto |
| `src/lib/checkout.ts` | `buildCheckoutUrl` — único lugar com a URL da Kiwify (`s1` = ID do diagnóstico) |
| `src/lib/diagnostic-store.ts` | Lado da tela: chama `/api/diagnostics`; sem banco, cai no modo local (navegador) |
| `src/lib/server/db.ts` | Supabase (schema `mapa`) pelas funções `public.mapa_*`, com a secret key |
| `src/lib/server/diagnostics.ts` | Validação do quiz e bloqueio do conteúdo pago antes da confirmação |
| `src/lib/server/kiwify.ts` | Assinatura e leitura dos avisos da Kiwify |
| `src/lib/server/meta-capi.ts` | Compra para a API de Conversões do Meta (mesmo `event_id` do Pixel) |
| `src/lib/analytics.ts` + `src/components/Analytics.tsx` | Eventos do funil para Meta Pixel e GA4 (só com ID configurado) |
| `src/components/report.tsx` | Pré-diagnóstico, bloqueio e relatório completo na tela |
| `src/lib/report-insights.ts` | Leituras do PDF: pilares do score, indicadores com estado, fatias da renda, cenários |
| `src/components/pdf/` | PDF de 8 páginas (`@react-pdf/renderer`), gerado no navegador e carregado só no clique |
| `supabase/schema.sql` | Schema `mapa` (tabelas e funções) no projeto Supabase compartilhado com a Senny |

## Configuração (variáveis na Vercel)

| Variável | Para quê | Sem ela |
|---|---|---|
| `SUPABASE_URL` | Endereço do projeto Supabase | Modo local: diagnóstico só no navegador |
| `SUPABASE_SECRET_KEY` | Secret key do Supabase (só servidor) | Modo local |
| `NEXT_PUBLIC_KIWIFY_CHECKOUT_URL` | Link do checkout do produto | Modo prévia: o botão simula a compra |
| `KIWIFY_WEBHOOK_TOKEN` | Token do webhook, para conferir a assinatura | Webhook recusa os avisos (503) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel | Pixel não carrega |
| `NEXT_PUBLIC_GA_ID` | GA4 (`G-…`) | GA não carrega |
| `META_CAPI_TOKEN` | Token da API de Conversões (só servidor) | A compra só é contada pelo navegador |
| `META_CAPI_TEST_CODE` | Código de "Testar eventos" do Meta (opcional) | Envio normal |

Variáveis `NEXT_PUBLIC_*` entram no build: depois de mudar, publique de novo.

### Kiwify

1. Produto → checkout: copie o link e coloque em `NEXT_PUBLIC_KIWIFY_CHECKOUT_URL`. O site abre o
   checkout com `name`, `email` e `s1` (ID do diagnóstico).
2. Produto → página de obrigado personalizada: `https://meu-mapa-financeiro.vercel.app/obrigado`.
3. Apps → Webhooks → novo webhook para o produto, URL
   `https://meu-mapa-financeiro.vercel.app/api/webhooks/kiwify`, eventos de compra aprovada,
   reembolso e chargeback. Copie o token para `KIWIFY_WEBHOOK_TOKEN`.
4. Pixel: configure só no site (variável acima), não no produto da Kiwify — a compra é contada pelo
   site, uma vez por diagnóstico, e contaria duas vezes.
5. API de Conversões: com `META_CAPI_TOKEN`, o webhook também avisa a compra ao Meta pelo servidor
   (com hash do e-mail/telefone e os cookies `_fbp`/`_fbc` guardados no diagnóstico). O `event_id` é o
   ID do diagnóstico, o mesmo do Pixel, então o Meta deduplica.

O aviso de venda acha o diagnóstico pelo `s1`; sem `s1`, pelo pedido já conhecido (reembolso) ou
pelo diagnóstico pendente mais recente do mesmo e-mail nos últimos 7 dias. Todo aviso fica
registrado em `mapa.payment_events` (sem cartão nem CPF).

## Próxima etapa

- E-mail com o link do relatório (backup da entrega na tela; hoje quem compra em outro aparelho
  precisa abrir o site no aparelho em que fez o quiz).
