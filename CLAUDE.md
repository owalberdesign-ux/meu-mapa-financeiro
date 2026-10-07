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

## Servidor, banco e pagamento

- Banco: schema `mapa` no projeto Supabase compartilhado com a Senny (decisão dos sócios). Nada do Mapa em `public` além das funções `public.mapa_*`, que só o `service_role` executa. Não tocar em tabelas da Senny.
- Mudança de banco: atualize `supabase/schema.sql` e aplique como migração.
- O conteúdo pago só sai do servidor depois do pagamento (`forClient` em `src/lib/server/diagnostics.ts`).
- Pagamento confirmado só pelo webhook da Kiwify (`/api/webhooks/kiwify`, assinatura conferida). A simulação existe só enquanto o checkout não está configurado.
- Segredos (secret key do Supabase, token da Kiwify, token da API de Conversões do Meta) ficam só nas variáveis da Vercel.
- Compra no Meta: Pixel no navegador + API de Conversões no webhook, sempre com `event_id` = ID do diagnóstico (deduplicação). Pixel só no site, nunca também na Kiwify.

## Visual de mapa

- A landing é uma rota: hero com o mapa 3D interativo (`src/components/landing/MapScene.tsx`), seções como "Paradas" ligadas por trechos de rota (`MapBits.tsx`).
- Peças 3D em `public/3d/`: WebP na web, PNG no PDF (o react-pdf não lê WebP). Mesmo prompt/estilo para peças novas.
- `public/pdf-preview/*.webp` são páginas reais do PDF do exemplo (`/exemplo`). Quando o PDF mudar, gere de novo.
- PDF: capa com a rota das 7 partes clicável e, no topo de cada parte, as paradas clicáveis (`STOPS` em `src/components/pdf/parts.tsx`). Continua com 8 páginas.

## Comandos

- `npm run dev` · `npm run build` · `npm run lint` · `npm test` (Vitest: motor, relatório e leituras do PDF)
