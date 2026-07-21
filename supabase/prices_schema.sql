-- PADAP Notícias — preços de fertilizantes (entrada manual) e indicadores
-- econômicos (coleta automática). Rode este script no SQL Editor do Supabase,
-- depois do schema.sql.

create table if not exists price_observations (
  id bigint generated always as identity primary key,
  product text not null,
  location text not null,
  price_min numeric not null,
  price_max numeric not null,
  unit text not null default 'US$/t',
  observed_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists price_observations_product_idx on price_observations (product);
create index if not exists price_observations_observed_at_idx on price_observations (observed_at desc);

create table if not exists economic_indicators (
  id bigint generated always as identity primary key,
  indicator text not null,
  value numeric not null,
  observed_at date not null,
  source text not null default 'Banco Central (PTAX)',
  created_at timestamptz not null default now(),
  unique (indicator, observed_at)
);

create index if not exists economic_indicators_observed_at_idx on economic_indicators (observed_at desc);

-- Leitura pública para ambas (o frontend consulta via chave anon).
-- Escrita só pelos endpoints /api/prices (POST) e pelo cron, que usam a
-- service role key e ignoram RLS — não há política de INSERT para "anon".
alter table price_observations enable row level security;
alter table economic_indicators enable row level security;

drop policy if exists "Public read access" on price_observations;
create policy "Public read access"
  on price_observations for select
  to anon
  using (true);

drop policy if exists "Public read access" on economic_indicators;
create policy "Public read access"
  on economic_indicators for select
  to anon
  using (true);
