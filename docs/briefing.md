# BRIEFING COMPLETO — RAIO-X DO DINHEIRO
## Documento para implementação da Landing Page + Quiz no Claude Code

> **Objetivo deste documento:** servir como especificação única para construir a primeira versão do produto **Raio-X do Dinheiro**, um low ticket de **R$ 37,00**.  
> A prioridade é **velocidade de lançamento, simplicidade, conversão e baixo custo operacional**.  
> Não transformar este MVP em SaaS complexo.

---

# 1. VISÃO GERAL DO PRODUTO

## Nome provisório
**Raio-X do Dinheiro**

## Categoria
Diagnóstico financeiro personalizado de baixo ticket.

## Preço inicial
**R$ 37,00**

## Promessa principal
> **Descubra por que seu dinheiro não sobra e receba um plano personalizado para os próximos 30 dias.**

## Problema central
O público sente que:
- o salário entra e desaparece;
- não sabe exatamente para onde o dinheiro foi;
- ganha, paga as contas e termina o mês sem sobra;
- possui muitas parcelas;
- tem dívidas ou gastos mal distribuídos;
- quer começar a guardar dinheiro, mas não consegue;
- não sabe qual deve ser sua primeira prioridade financeira.

## O que NÃO estamos vendendo
- curso;
- e-book genérico;
- planilha;
- consultoria individual;
- ferramenta de Open Finance;
- aplicativo bancário;
- assinatura.

## O que estamos vendendo
Um **diagnóstico financeiro personalizado**, construído a partir das respostas do próprio usuário.

A sensação deve ser:

> “Eu coloquei meus números e o sistema analisou minha situação e me mostrou o que fazer.”

---

# 2. PRINCÍPIOS DO MVP

Este produto é um **low ticket**.

Portanto:

1. O usuário deve entender a oferta em poucos segundos.
2. O quiz deve ser simples e rápido.
3. Não exigir criação de conta antes da compra.
4. Não exigir senha.
5. Não usar IA na versão 1.
6. Não conectar banco.
7. Não usar Open Finance.
8. Não criar dashboard complexo.
9. Não criar área de membros própria.
10. Não criar app mobile.
11. Não criar funcionalidades que não sejam essenciais à venda e entrega.
12. Todo diagnóstico deve ser gerado por **regras e cálculos determinísticos**.
13. O relatório deve parecer personalizado e premium mesmo sem IA.
14. O PDF deve reutilizar o mesmo conteúdo do relatório web.
15. Toda a experiência deve funcionar muito bem no celular.

---

# 3. FUNIL PRINCIPAL

Fluxo obrigatório:

```text
ANÚNCIO
   ↓
LANDING PAGE
   ↓
QUIZ FINANCEIRO
   ↓
NOME + E-MAIL
   ↓
CÁLCULO DO SCORE
   ↓
PRÉ-DIAGNÓSTICO
   ↓
CTA: DESBLOQUEAR POR R$37
   ↓
CHECKOUT KIWIFY
   ↓
PAGAMENTO APROVADO
   ↓
RELATÓRIO COMPLETO
   ↓
BOTÃO: BAIXAR PDF
   +
E-MAIL COM LINK DO RELATÓRIO
```

A página construída agora deve contemplar principalmente:

- Landing;
- Quiz;
- captura do lead;
- pré-diagnóstico;
- CTA de checkout;
- estrutura preparada para integração.

---

# 4. DIREÇÃO VISUAL

## Sensação desejada
O produto deve transmitir:

- clareza;
- inteligência;
- controle;
- simplicidade;
- confiança;
- modernidade.

## Evitar
- visual de banco tradicional;
- excesso de azul corporativo;
- estética de curso barato;
- “infoproduto 2019”;
- exagero de selos e contadores falsos;
- excesso de gradientes;
- excesso de elementos;
- aparência infantil;
- dashboard super complexo.

## Estilo
Interface moderna, limpa e premium.

Sugestão de direção:

- background claro ou off-white;
- blocos brancos;
- textos quase pretos;
- verde como cor de ação/dinheiro;
- cinzas suaves;
- bordas discretas;
- cards arredondados;
- tipografia limpa;
- muito respiro.

## Paleta sugerida

```css
--background: #F6F7F5;
--surface: #FFFFFF;
--text-primary: #141714;
--text-secondary: #667067;
--border: #E4E8E4;

--green-primary: #22C55E;
--green-dark: #15803D;
--green-soft: #DCFCE7;

--warning: #F59E0B;
--danger: #EF4444;
```

Não precisa seguir exatamente os HEX se uma solução visual melhor aparecer, mas manter o conceito.

## Tipografia
Pode usar:
- Inter;
- Geist;
- Manrope;
- Plus Jakarta Sans.

---

# 5. LANDING PAGE — ESTRUTURA

A LP deve ser curta.

Não criar uma página com 20 seções.

## SEÇÃO 01 — HERO

### Eyebrow
**RAIO-X DO DINHEIRO**

### Headline principal
> **Seu salário some e você não sabe onde foi parar?**

### Subheadline
> Descubra como está sua vida financeira, quanto da sua renda já está comprometida e qual deve ser sua prioridade nos próximos 30 dias.

### Benefícios rápidos
- Score financeiro de 0 a 100
- Principais pontos de atenção
- Projeção da sua situação financeira
- Plano personalizado de 30 dias
- Relatório completo em PDF

### CTA
**FAZER MEU RAIO-X**

### Microcopy
> Leva cerca de 3 minutos. Sem conectar sua conta bancária.

---

# 6. MOCKUP / DEMONSTRAÇÃO NO HERO

Ao lado ou abaixo do hero, mostrar uma prévia visual do resultado.

Exemplo:

```text
SEU SCORE

47 / 100

PERFIL:
NO LIMITE
```

Cards:

```text
Renda
R$ 4.500

Margem mensal
R$ 650

Renda comprometida
85,6%

Prioridade
Recuperar margem
```

A pessoa precisa enxergar rapidamente que vai receber algo concreto.

---

# 7. SEÇÃO 02 — DOR

Título:

> **Você não precisa ganhar mais para começar a entender o problema.**

Texto:

> Muitas vezes, o problema não é apenas quanto entra. É quanto da sua renda já está comprometida antes mesmo do mês começar.

Pode haver 3 cards:

### Dinheiro some
> Você recebe e poucos dias depois já não sabe onde foi parar.

### Parcelas acumuladas
> Compras feitas meses atrás continuam consumindo sua renda atual.

### Nada sobra
> Você paga tudo, mas nunca consegue transformar renda em reserva.

---

# 8. SEÇÃO 03 — COMO FUNCIONA

Título:

> **Em poucos minutos você entende sua situação.**

3 passos:

### 01 — Responda
Informe renda, despesas, parcelas, dívidas e objetivo.

### 02 — Descubra
O sistema calcula seu score e identifica sua principal prioridade.

### 03 — Organize
Receba seu diagnóstico completo e um plano de ação de 30 dias.

CTA:

**COMEÇAR MEU DIAGNÓSTICO**

---

# 9. SEÇÃO 04 — O QUE O CLIENTE RECEBE

Título:

> **Seu Raio-X mostra o que os números estão dizendo.**

Itens:

- Score financeiro de 0 a 100
- Perfil financeiro
- Renda x despesas
- Margem mensal
- Percentual da renda comprometida
- Peso dos parcelamentos
- Situação das dívidas
- Taxa de poupança
- Reserva disponível
- 3 principais pontos de atenção
- Projeção de 3, 6 e 12 meses
- Plano de ação de 30 dias
- PDF personalizado

---

# 10. SEÇÃO 05 — OFERTA

Título:

> **Desbloqueie seu Raio-X completo**

Preço:

# R$ 37

Texto:

> Um diagnóstico personalizado da sua situação financeira, com prioridades claras e um plano simples para os próximos 30 dias.

CTA:

**QUERO VER MEU RAIO-X COMPLETO**

Informações:

- pagamento via PIX ou cartão;
- acesso liberado após aprovação;
- relatório disponível online;
- versão em PDF para baixar.

---

# 11. SEÇÃO 06 — FAQ

## Preciso conectar minha conta bancária?
Não. O diagnóstico é criado apenas com as informações que você fornece.

## O Raio-X acessa meu banco?
Não.

## É uma consultoria financeira?
Não. É uma ferramenta educacional de diagnóstico e organização financeira baseada nos dados informados pelo usuário.

## O resultado é personalizado?
Sim. Cálculos, score, perfil, alertas e plano mudam de acordo com as respostas.

## Como recebo meu relatório?
Após a confirmação do pagamento, o relatório completo é liberado online. O usuário também poderá baixar a versão em PDF.

## Preciso criar conta?
Não na versão inicial.

---

# 12. DISCLAIMER

Adicionar discretamente no rodapé e/ou relatório:

> O Raio-X do Dinheiro é uma ferramenta educacional de organização financeira. As informações apresentadas são baseadas exclusivamente nos dados fornecidos pelo usuário e não constituem recomendação de investimento, crédito, contabilidade ou consultoria financeira profissional.

Evitar promessas de:
- quitar dívidas garantidamente;
- enriquecer;
- ganhar dinheiro;
- retorno financeiro garantido.

---

# 13. QUIZ — EXPERIÊNCIA

O quiz deve acontecer preferencialmente dentro da própria aplicação/página.

## Formato
Uma pergunta por tela.

Mostrar:

```text
Etapa 3 de 10
████████░░░░
```

Ter:
- botão Continuar;
- botão Voltar;
- barra de progresso;
- transições discretas;
- validação;
- campos grandes no mobile.

O usuário deve sentir que está avançando rapidamente.

---

# 14. PERGUNTAS DO QUIZ

## Pergunta 1
### Quanto você recebe líquido por mês?

Descrição:
> Use o valor que realmente entra na sua conta.

Campo:
`R$`

ID:
`income`

---

## Pergunta 2
### Quanto você gasta com moradia?

Descrição:
> Aluguel, financiamento, condomínio ou contribuição da casa.

ID:
`housing`

---

## Pergunta 3
### Quanto gasta com despesas essenciais?

Descrição:
> Contas da casa, alimentação essencial, transporte e outros gastos obrigatórios.

ID:
`essential`

---

## Pergunta 4
### Quanto gasta com coisas não essenciais?

Descrição:
> Delivery, lazer, roupas, compras pessoais, assinaturas e pequenos gastos.

ID:
`variable`

---

## Pergunta 5
### Quanto paga por mês em parcelas?

Descrição:
> Considere compras parceladas e compromissos semelhantes.

ID:
`installments`

---

## Pergunta 6
### Você possui alguma dívida vencida hoje?

Opções:
- Sim
- Não

ID:
`hasDebt`

Se NÃO:
- `debt = 0`
- pular próxima pergunta.

---

## Pergunta condicional 7
### Qual é aproximadamente o valor total dessas dívidas?

Descrição:
> Pode ser uma estimativa.

ID:
`debt`

Só mostrar se:

```js
hasDebt === true
```

---

## Pergunta 8
### Quanto você consegue guardar por mês?

Descrição:
> Considere o que realmente fica separado, não o que você gostaria de guardar.

ID:
`saving`

---

## Pergunta 9
### Quanto possui hoje em reserva financeira?

Descrição:
> Dinheiro disponível para imprevistos.

ID:
`reserve`

---

## Pergunta 10
### Qual é sua maior prioridade financeira agora?

Opções:

```text
Sair das dívidas
Fazer o dinheiro sobrar
Montar uma reserva
Comprar alguma coisa
Começar a investir
Me organizar melhor
```

ID:
`goal`

---

# 15. CAPTURA DE LEAD

Somente DEPOIS do quiz.

Tela:

## Seu diagnóstico está quase pronto.

> Para identificar e enviar seu Raio-X, informe:

Campos:

```text
Nome
E-mail
```

CTA:

**VER MEU PRÉ-DIAGNÓSTICO**

Evitar pedir:
- telefone;
- CPF;
- senha;
- endereço.

Quanto menor o atrito, melhor.

---

# 16. CÁLCULOS

## Despesas fixas essenciais

```js
fixedExpenses = housing + essential
```

## Despesas totais

```js
totalExpenses =
  housing +
  essential +
  variable +
  installments
```

## Margem mensal

```js
monthlyMargin = income - totalExpenses
```

## Margem percentual

```js
marginRate = monthlyMargin / income
```

## Comprometimento

```js
commitmentRate =
  (housing + essential + installments) / income
```

## Peso das parcelas

```js
installmentRate = installments / income
```

## Taxa de poupança

```js
savingRate = saving / income
```

## Meses de reserva

```js
reserveMonths = reserve / fixedExpenses
```

Evitar divisão por zero.

---

# 17. SCORE FINANCEIRO

Total máximo:

# 100 pontos

Dividido em:

```text
Fluxo mensal        30
Dívidas             25
Comprometimento     20
Poupança            15
Reserva              10
-----------------------
TOTAL               100
```

---

# 18. SCORE — FLUXO MENSAL

Base:

```js
marginRate = monthlyMargin / income
```

Pontos:

```text
>= 20%        30 pontos
10%–19,99%    25
5%–9,99%      18
0%–4,99%      10
< 0%           0
```

---

# 19. SCORE — DÍVIDAS

Se não existe dívida vencida:

```text
25 pontos
```

Caso exista:

```js
debtRatio = debt / income
```

```text
<= 0,5x renda       18
0,5x–1x             12
1x–2x                6
> 2x                 0
```

---

# 20. SCORE — COMPROMETIMENTO

```text
<= 50%        20
50%–60%       16
60%–70%       10
70%–80%        5
> 80%          0
```

---

# 21. SCORE — POUPANÇA

```text
>= 20%        15
10%–19,99%    12
5%–9,99%       7
1%–4,99%       3
0%             0
```

---

# 22. SCORE — RESERVA

```text
>= 6 meses      10
3–5,99 meses     8
1–2,99 meses     5
0,5–0,99 mês     2
0                 0
```

---

# 23. HARD CAPS DO SCORE

Regras obrigatórias para evitar scores incoerentes.

## Se houver déficit mensal

```js
if (monthlyMargin < 0) {
  score = Math.min(score, 49)
}
```

## Se houver déficit + dívida vencida

```js
if (monthlyMargin < 0 && debt > 0) {
  score = Math.min(score, 29)
}
```

Depois:

```js
score = Math.max(0, Math.min(100, Math.round(score)))
```

---

# 24. PERFIS

```text
0–29
NO VERMELHO

30–49
NO LIMITE

50–69
EM AJUSTE

70–84
EM EQUILÍBRIO

85–100
EM CONSTRUÇÃO
```

---

# 25. IDENTIFICAÇÃO DO PROBLEMA PRINCIPAL

Checar nesta ordem.

## Prioridade 1 — déficit

```js
monthlyMargin < 0
```

Tipo:

```text
DEFICIT
```

Texto:

> Hoje suas despesas ultrapassam sua renda. Sua primeira prioridade é interromper esse déficit mensal.

---

## Prioridade 2 — dívida vencida

```js
debt > 0
```

Tipo:

```text
DEBT
```

Texto:

> Você possui dívidas vencidas que estão pressionando sua organização financeira. Sua prioridade deve ser estabilizar o mês e reduzir esse passivo.

---

## Prioridade 3 — comprometimento elevado

```js
commitmentRate > 0.70
```

Tipo:

```text
HIGH_COMMITMENT
```

Texto:

> Uma parcela alta da sua renda já está comprometida antes mesmo do mês começar.

---

## Prioridade 4 — parcelamentos altos

```js
installmentRate > 0.20
```

Tipo:

```text
INSTALLMENTS
```

Texto:

> Uma parte relevante da sua renda está sendo consumida por compras feitas nos meses anteriores.

---

## Prioridade 5 — baixa poupança

```js
savingRate < 0.05
```

Tipo:

```text
LOW_SAVING
```

Texto:

> Você consegue sustentar seus gastos, mas ainda transforma pouco da renda em segurança financeira.

---

## Prioridade 6 — reserva baixa

```js
reserveMonths < 1
```

Tipo:

```text
LOW_RESERVE
```

Texto:

> Sua estrutura financeira funciona, mas ainda está vulnerável a imprevistos.

---

# 26. PRÉ-DIAGNÓSTICO GRATUITO

Antes do pagamento, mostrar apenas:

```text
Nome

SCORE
47 / 100

PERFIL
NO LIMITE

Renda
R$ 4.500

Despesas
R$ 3.850

Margem
R$ 650

Comprometimento
85,6%
```

Mostrar também o problema principal.

Exemplo:

> Uma parcela alta da sua renda já está comprometida antes mesmo do mês começar.

---

# 27. CONTEÚDO BLOQUEADO

Logo abaixo:

### Seu Raio-X completo encontrou:

```text
🔒 Seus 3 maiores pontos de atenção
🔒 Quanto você pode recuperar por mês
🔒 Sua projeção de 3, 6 e 12 meses
🔒 Seu plano personalizado de 30 dias
🔒 Seu relatório completo em PDF
```

CTA principal:

# DESBLOQUEAR MEU RAIO-X — R$37

Microcopy:

> Pagamento via PIX ou cartão. Relatório liberado após aprovação.

---

# 28. CHECKOUT — KIWIFY

Não implementar checkout próprio.

Usar Kiwify.

O botão deverá futuramente enviar para URL do checkout.

Preparar função central:

```ts
buildCheckoutUrl({
  diagnosticId,
  name,
  email
})
```

Exemplo conceitual:

```text
CHECKOUT_URL
?name=...
&email=...
&s1=DIAGNOSTIC_ID
```

`s1` deverá carregar o ID do diagnóstico.

Não deixar URL fixa espalhada em vários componentes.

Criar variável:

```env
NEXT_PUBLIC_KIWIFY_CHECKOUT_URL=
```

---

# 29. BANCO — SUPABASE

Para o MVP usar somente uma tabela:

```sql
diagnostics
```

Campos mínimos:

```text
id
name
email

answers

score
profile
primary_problem

report_data

payment_status
payment_id

created_at
paid_at
```

Sugestão:

- `answers` como JSONB;
- `report_data` como JSONB.

Não normalizar demais agora.

---

# 30. OBJETO DE RESPOSTAS

Formato esperado:

```json
{
  "income": 4500,
  "housing": 1200,
  "essential": 1100,
  "variable": 900,
  "installments": 650,
  "hasDebt": true,
  "debt": 1200,
  "saving": 100,
  "reserve": 800,
  "goal": "surplus"
}
```

---

# 31. OBJETO DO RELATÓRIO

Exemplo:

```json
{
  "score": 47,
  "profile": "NO_LIMITE",

  "metrics": {
    "income": 4500,
    "totalExpenses": 3850,
    "monthlyMargin": 650,
    "commitmentRate": 0.8556,
    "installmentRate": 0.1444,
    "savingRate": 0.0222,
    "reserveMonths": 0.34
  },

  "primaryProblem": "HIGH_COMMITMENT",

  "alerts": [],

  "projection": {},

  "plan30d": []
}
```

---

# 32. RELATÓRIO COMPLETO

Depois do pagamento, o relatório deve conter apenas os elementos essenciais.

## Bloco 01 — Resultado

```text
47 / 100
NO LIMITE
```

---

## Bloco 02 — Seus números

```text
Renda
Despesas
Margem
Comprometimento
```

---

## Bloco 03 — 3 principais pontos de atenção

Selecionar automaticamente os 3 problemas mais relevantes.

Possíveis alertas:

```text
DEFICIT
DEBT
HIGH_COMMITMENT
INSTALLMENTS
HIGH_VARIABLE
LOW_SAVING
LOW_RESERVE
```

---

# 33. POTENCIAL DE AJUSTE

Criar uma estimativa conservadora.

No MVP:

```js
variableReductionTarget = variable * 0.12
```

Ou seja:

12% dos gastos variáveis.

Exemplo:

```text
Gastos variáveis:
R$ 900

Meta sugerida:
R$ 108
```

Não apresentar como garantia.

Texto:

> Com uma redução moderada dos gastos variáveis e preservando sua margem atual, existe espaço para melhorar seu fluxo mensal.

---

# 34. PROJEÇÃO

Não prometer retorno.

Calcular projeção baseada apenas no potencial mensal.

Exemplo:

```js
monthlyPotential =
  Math.max(0, monthlyMargin) +
  variableReductionTarget
```

Depois:

```js
threeMonths = monthlyPotential * 3
sixMonths = monthlyPotential * 6
twelveMonths = monthlyPotential * 12
```

Mostrar:

```text
3 meses
R$ X

6 meses
R$ X

12 meses
R$ X
```

Disclaimer próximo:

> Projeção matemática baseada nos dados informados e nos ajustes sugeridos. Não representa garantia de resultado.

---

# 35. PLANO DE 30 DIAS

Deve ser gerado por regras.

Não usar IA.

Estrutura:

```text
Semana 1
Semana 2
Semana 3
Semana 4
```

---

# 36. PLANO — DÉFICIT

## Semana 1
> Suspenda novos parcelamentos e identifique despesas que podem ser eliminadas imediatamente.

## Semana 2
> Reduza gastos variáveis conforme a meta calculada pelo sistema.

## Semana 3
> Revise despesas recorrentes e priorize apenas gastos essenciais.

## Semana 4
> Defina um teto de gastos que mantenha seu próximo mês dentro da renda disponível.

---

# 37. PLANO — DÍVIDAS

## Semana 1
> Liste suas dívidas por valor e prioridade.

## Semana 2
> Evite criar novos parcelamentos enquanto existir saldo vencido.

## Semana 3
> Direcione parte da margem recuperada para a dívida prioritária.

## Semana 4
> Recalcule o saldo e estabeleça a próxima meta de pagamento.

---

# 38. PLANO — COMPROMETIMENTO ALTO

## Semana 1
> Identifique quais compromissos fixos podem ser renegociados ou eliminados.

## Semana 2
> Evite assumir novos pagamentos recorrentes.

## Semana 3
> Reduza gastos variáveis para recuperar margem.

## Semana 4
> Defina um limite máximo de comprometimento para os próximos meses.

---

# 39. PLANO — BAIXA POUPANÇA / RESERVA

## Semana 1
> Defina um valor mínimo para separar assim que receber.

## Semana 2
> Trate esse valor como compromisso fixo.

## Semana 3
> Direcione parte da economia obtida para sua reserva.

## Semana 4
> Feche o mês mantendo o valor separado e defina a meta do mês seguinte.

---

# 40. PDF

O PDF NÃO deve ser outro produto separado.

Ele deve reutilizar o mesmo relatório.

Botão:

**BAIXAR MEU RAIO-X EM PDF**

Idealmente:

```text
report page
↓
print stylesheet
↓
PDF
```

Layout:

- A4;
- clean;
- 6 a 8 páginas no máximo;
- leitura boa no celular;
- mesmos dados do dashboard.

---

# 41. ESTRUTURA DO PDF

## Página 1
Capa

```text
RAIO-X DO DINHEIRO
Diagnóstico de [NOME]

Score
Perfil
Data
```

## Página 2
Resumo financeiro.

## Página 3
Principais pontos de atenção.

## Página 4
Distribuição e potencial de ajuste.

## Página 5
Projeção.

## Página 6
Plano de 30 dias.

Pode compactar em menos páginas se ficar melhor.

---

# 42. ENTREGA DO PRODUTO

Após pagamento aprovado:

Tela:

# Seu Raio-X está pronto.

Botões:

**ABRIR MEU RELATÓRIO**

**BAIXAR PDF**

Também enviar e-mail.

---

# 43. E-MAIL

Não precisa implementar serviço específico nesta primeira etapa, mas deixar arquitetura preparada.

Assunto:

```text
Seu Raio-X do Dinheiro está pronto
```

Corpo:

```text
Olá, [nome].

Seu diagnóstico financeiro completo já foi liberado.

[Acessar meu Raio-X]

Dentro do relatório você também poderá baixar sua versão em PDF.
```

O e-mail é backup.

A entrega principal acontece na tela.

---

# 44. ROTAS SUGERIDAS

Se usar Next.js:

```text
/
Landing + entrada do quiz

/diagnostico
Quiz

/resultado/[id]
Pré-diagnóstico ou relatório completo

/api/diagnostics
Criação/atualização

/api/webhooks/kiwify
Confirmação de pagamento
```

É aceitável manter landing + quiz em uma única página se simplificar o MVP.

---

# 45. ARQUITETURA SUGERIDA

```text
/components
  Hero
  Benefits
  HowItWorks
  Quiz
  QuizProgress
  LeadCapture
  ScoreCard
  PreviewResult
  LockedReport
  FullReport
  ReportHeader
  FinancialMetrics
  FinancialAlerts
  Projection
  Plan30D

/lib
  financial-engine.ts
  report-builder.ts
  checkout.ts
  supabase.ts

/types
  diagnostic.ts

/app
  page.tsx
  resultado/[id]/page.tsx
  api/...
```

Não é obrigatório seguir os nomes exatamente.

---

# 46. MOTOR FINANCEIRO

Toda lógica matemática deve ficar centralizada.

Exemplo:

```ts
calculateFinancialMetrics()
calculateFinancialScore()
applyScoreCaps()
detectPrimaryProblem()
detectAlerts()
buildProjection()
buildPlan30D()
buildReport()
```

Não espalhar fórmulas dentro de componentes React.

---

# 47. RESPONSIVIDADE

Prioridade total:

## Mobile first

O tráfego de Meta Ads provavelmente virá majoritariamente do celular.

Requisitos:

- CTA grande;
- nenhuma tabela larga;
- cards empilháveis;
- inputs com tamanho confortável;
- fonte mínima legível;
- sem scroll horizontal;
- quiz ocupando quase toda a largura;
- não depender de hover.

---

# 48. PERFORMANCE

A página deve ser leve.

Evitar:
- vídeos pesados no carregamento inicial;
- bibliotecas gigantes;
- animações complexas;
- imagens gigantes;
- dependências desnecessárias.

O objetivo é vender um produto de R$37, não demonstrar tecnologia.

---

# 49. MICROINTERAÇÕES

Permitidas:

- progress bar;
- transição leve entre perguntas;
- score aparecendo suavemente;
- cards entrando;
- botão mostrando loading;
- confirmação visual.

Evitar animações exageradas.

---

# 50. ANALYTICS — PREPARAR EVENTOS

Mesmo que não sejam conectados agora, estruturar pontos de evento:

```text
view_landing
start_quiz
quiz_step
complete_quiz
submit_lead
view_preview
click_checkout
purchase
view_report
download_pdf
```

Deixar helpers fáceis para futuramente integrar Meta Pixel/GA.

---

# 51. ESTADOS IMPORTANTES

Tratar:

- carregamento;
- erro ao salvar;
- usuário volta no quiz;
- campo vazio;
- income = 0;
- pagamento ainda não confirmado;
- diagnóstico inexistente;
- relatório bloqueado;
- relatório pago.

---

# 52. SEGURANÇA / PRIVACIDADE

Não coletar:

- senha bancária;
- número de cartão;
- número de conta;
- extratos;
- CPF se não houver necessidade;
- dados financeiros além do necessário.

Não expor diagnóstico de uma pessoa para outra.

No relatório pago, usar link/ID seguro.

---

# 53. NÃO FAZER

Não adicionar sem solicitação:

- chatbot;
- IA;
- assinatura;
- gamificação;
- Open Finance;
- dashboard de investimentos;
- área do usuário;
- avatar;
- notificações;
- aplicativo;
- comunidade;
- newsletter;
- blog;
- simuladores extras;
- sistema de metas complexo;
- várias páginas institucionais.

A regra é:

> Se não for necessário para vender ou entregar o Raio-X de R$37, não entra agora.

---

# 54. CRITÉRIO DE SUCESSO DO MVP

O MVP está pronto quando uma pessoa consegue:

1. abrir a landing;
2. entender a oferta;
3. iniciar o quiz;
4. responder;
5. informar nome/e-mail;
6. receber score e pré-diagnóstico;
7. clicar para comprar;
8. pagar;
9. ter o pagamento associado ao diagnóstico;
10. abrir o relatório completo;
11. baixar o PDF.

Só isso.

---

# 55. COPY PRINCIPAL CONSOLIDADA

## Headline

> **Seu salário some e você não sabe onde foi parar?**

## Subheadline

> Descubra como está sua vida financeira, quanto da sua renda já está comprometida e qual deve ser sua prioridade nos próximos 30 dias.

## CTA

> **FAZER MEU RAIO-X**

## Oferta após quiz

> **Seu Raio-X completo encontrou pontos que podem estar impedindo seu dinheiro de sobrar.**

Bloqueados:

- Seus 3 maiores pontos de atenção
- Quanto você pode melhorar por mês
- Sua projeção financeira
- Seu plano personalizado de 30 dias
- Seu relatório em PDF

## CTA de compra

> **DESBLOQUEAR MEU RAIO-X — R$37**

---

# 56. ORIENTAÇÃO FINAL PARA O CLAUDE

Construa primeiro uma versão funcional e visualmente consistente.

Prioridade:

```text
CONVERSÃO
>
SIMPLICIDADE
>
CLAREZA
>
PERFORMANCE
>
SOFISTICAÇÃO TÉCNICA
```

Não overengineer.

O projeto deve parecer um produto real e confiável, mas continuar simples o suficiente para ser lançado rapidamente como low ticket.

Se alguma decisão técnica não estiver definida neste documento, escolher a alternativa:

1. mais simples;
2. mais barata;
3. mais rápida de implementar;
4. que gere menos manutenção.

Não modificar as regras do score ou do produto sem necessidade.

Não inventar novas funcionalidades.

O objetivo da primeira versão é **validar se as pessoas pagam R$37 pelo diagnóstico**.

---

# 57. PRIMEIRA ENTREGA ESPERADA

Antes de integrar Kiwify e Supabase, entregar:

- landing responsiva;
- quiz funcional;
- cálculo local;
- captura de nome/e-mail;
- score;
- perfil;
- pré-diagnóstico;
- bloco do conteúdo bloqueado;
- CTA de R$37;
- mock completo do relatório pago;
- estrutura preparada para conectar backend.

Depois avançar para:

- Supabase;
- checkout;
- webhook;
- liberação;
- PDF;
- e-mail.

---

**Fim da especificação.**
