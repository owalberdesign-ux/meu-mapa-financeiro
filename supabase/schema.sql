-- Meu Mapa Financeiro: dados no schema "mapa" do projeto Supabase compartilhado com a Senny.
--
-- Ninguém lê o schema "mapa" direto: ele não é exposto pela API e anon/authenticated não têm
-- acesso. O site (rotas /api no servidor) usa só as funções public.mapa_*, que só o papel
-- service_role executa, ou seja, só quem tem a secret key do Supabase (SUPABASE_SECRET_KEY, na Vercel).

create schema if not exists mapa;
revoke all on schema mapa from public, anon, authenticated;

create table if not exists mapa.diagnostics (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  answers jsonb not null,
  score smallint not null check (score between 0 and 100),
  profile text not null,
  primary_problem text not null,
  report_data jsonb not null,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'refunded')),
  payment_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  refunded_at timestamptz,
  -- Identificadores do anúncio (cookies do Pixel, navegador, IP) para o aviso de compra ao Meta.
  tracking jsonb
);

alter table mapa.diagnostics add column if not exists tracking jsonb;

create index if not exists diagnostics_email_idx on mapa.diagnostics (email, created_at desc);
create index if not exists diagnostics_payment_idx on mapa.diagnostics (payment_id);

-- Cada aviso da Kiwify (sem dados de cartão nem CPF), para conferir pagamentos.
create table if not exists mapa.payment_events (
  id bigint generated always as identity primary key,
  received_at timestamptz not null default now(),
  order_id text,
  event_type text,
  order_status text,
  email text,
  diagnostic_id uuid references mapa.diagnostics (id) on delete set null,
  applied boolean not null default false
);

alter table mapa.diagnostics enable row level security;
alter table mapa.payment_events enable row level security;

create or replace function public.mapa_create_diagnostic(p_row jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row mapa.diagnostics;
begin
  insert into mapa.diagnostics (name, email, answers, score, profile, primary_problem, report_data, tracking)
  values (
    p_row ->> 'name',
    lower(p_row ->> 'email'),
    p_row -> 'answers',
    (p_row ->> 'score')::smallint,
    p_row ->> 'profile',
    p_row ->> 'primary_problem',
    p_row -> 'report_data',
    p_row -> 'tracking'
  )
  returning * into v_row;
  return to_jsonb(v_row);
end;
$$;

create or replace function public.mapa_get_diagnostic(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row mapa.diagnostics;
begin
  select * into v_row from mapa.diagnostics where id = p_id;
  if v_row.id is null then
    return null;
  end if;
  return to_jsonb(v_row);
end;
$$;

-- p_event: { diagnostic_id, order_id, status: 'paid' | 'refunded' | 'ignored', event_type, order_status, email }
-- Acha o diagnóstico pelo s1; senão pelo pedido já conhecido; senão (só para pagamento) pelo
-- diagnóstico pendente mais recente do mesmo e-mail nos últimos 7 dias.
create or replace function public.mapa_record_payment(p_event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_status text := p_event ->> 'status';
  v_order text := nullif(p_event ->> 'order_id', '');
  v_email text := lower(nullif(p_event ->> 'email', ''));
  v_row mapa.diagnostics;
begin
  if (p_event ->> 'diagnostic_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select id into v_id from mapa.diagnostics where id = (p_event ->> 'diagnostic_id')::uuid;
  end if;

  if v_id is null and v_order is not null then
    select id into v_id from mapa.diagnostics
    where payment_id = v_order
    order by created_at desc
    limit 1;
  end if;

  if v_id is null and v_status = 'paid' and v_email is not null then
    select id into v_id from mapa.diagnostics
    where email = v_email and payment_status = 'pending' and created_at > now() - interval '7 days'
    order by created_at desc
    limit 1;
  end if;

  if v_id is not null and v_status = 'paid' then
    update mapa.diagnostics
    set payment_status = 'paid',
        payment_id = coalesce(v_order, payment_id),
        paid_at = coalesce(paid_at, now()),
        refunded_at = null
    where id = v_id
    returning * into v_row;
  elsif v_id is not null and v_status = 'refunded' then
    update mapa.diagnostics
    set payment_status = 'refunded',
        refunded_at = now()
    where id = v_id
    returning * into v_row;
  end if;

  insert into mapa.payment_events (order_id, event_type, order_status, email, diagnostic_id, applied)
  values (v_order, p_event ->> 'event_type', p_event ->> 'order_status', v_email, v_id, v_row.id is not null);

  return jsonb_build_object('diagnostic_id', v_id, 'applied', v_row.id is not null);
end;
$$;

-- Só o servidor do site (secret key = papel service_role) executa as funções.
revoke all on function public.mapa_create_diagnostic(jsonb) from public, anon, authenticated;
revoke all on function public.mapa_get_diagnostic(uuid) from public, anon, authenticated;
revoke all on function public.mapa_record_payment(jsonb) from public, anon, authenticated;
grant execute on function public.mapa_create_diagnostic(jsonb) to service_role;
grant execute on function public.mapa_get_diagnostic(uuid) to service_role;
grant execute on function public.mapa_record_payment(jsonb) to service_role;
