-- Meu Mapa Financeiro: tabela única do MVP (briefing, seção 29).
-- Acesso só pelo servidor (rotas /api com a service role); o navegador nunca
-- lê esta tabela direto, então nenhuma política pública é criada.

create table if not exists public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  answers jsonb not null,
  score smallint not null check (score between 0 and 100),
  profile text not null,
  primary_problem text not null,
  report_data jsonb not null,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid')),
  payment_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.diagnostics enable row level security;

create index if not exists diagnostics_email_idx on public.diagnostics (email);
