-- ============================================================
-- PADAP Intelligence — Schema Supabase
-- Execute no SQL Editor do dashboard: https://supabase.com/dashboard
-- ============================================================

-- Extensão para UUIDs
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------
-- CONFIGURAÇÕES DE USUÁRIO (por usuário autenticado)
-- ----------------------------------------------------------------
create table if not exists public.user_settings (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;
create policy "user_settings: só o próprio usuário" on public.user_settings
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- TABELA YARA SEMANAL
-- ----------------------------------------------------------------
create table if not exists public.weekly_tables (
  id           text primary key,
  supplier     text not null default 'Yara',
  file_name    text,
  list_code    text,
  list_name    text,
  expires_at   timestamptz not null,
  ptax         numeric(10,4) not null,
  freight      numeric(10,2) not null default 0,
  icms         numeric(10,4) not null default 0,
  margin_icms  numeric(10,4) not null default 0,
  products     jsonb not null default '[]',
  metadata     jsonb not null default '{}',
  imported_at  timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  imported_by  text not null,
  active       boolean not null default true
);

alter table public.weekly_tables enable row level security;
create policy "weekly_tables: leitura para autenticados" on public.weekly_tables
  for select using (auth.role() = 'authenticated');
create policy "weekly_tables: escrita para autenticados" on public.weekly_tables
  for all using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- FONTES DE MERCADO
-- ----------------------------------------------------------------
create table if not exists public.market_sources (
  id          text primary key,
  name        text not null,
  category    text not null,
  source_type text not null,
  confidence  text not null,
  is_active   boolean not null default true,
  use_in_briefing boolean not null default false,
  url         text,
  observation text,
  last_status text not null default 'Inativa',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.market_sources enable row level security;
create policy "market_sources: leitura para autenticados" on public.market_sources
  for select using (auth.role() = 'authenticated');
create policy "market_sources: escrita para autenticados" on public.market_sources
  for all using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- PROPOSTAS COMERCIAIS
-- ----------------------------------------------------------------
create table if not exists public.proposals (
  id              text primary key,
  client_id       text not null,
  consultant_id   text not null,
  product_id      text not null,
  quantity        numeric not null,
  unit            text not null,
  supplier        text not null,
  product_cost    numeric not null,
  sale_price      numeric not null,
  freight         numeric not null default 0,
  taxes           numeric not null default 0,
  commission      numeric not null default 0,
  other_expenses  numeric not null default 0,
  term            text not null,
  freight_mode    text not null default 'CIF',
  validity        timestamptz not null,
  notes           text not null default '',
  crop            text not null default '',
  status          text not null default 'Em precificação',
  ptax_used       numeric(10,4) not null,
  ptax_date       timestamptz not null,
  created_by      text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  metadata        jsonb not null default '{}'
);

alter table public.proposals enable row level security;
create policy "proposals: leitura para autenticados" on public.proposals
  for select using (auth.role() = 'authenticated');
create policy "proposals: escrita para autenticados" on public.proposals
  for all using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- PACOTES COMERCIAIS
-- ----------------------------------------------------------------
create table if not exists public.commercial_packages (
  id             text primary key,
  client_id      text not null,
  consultant_id  text not null,
  crop           text not null default '',
  term           text not null,
  validity       timestamptz not null,
  notes          text not null default '',
  status         text not null default 'Rascunho',
  client_profile text not null default '',
  items          jsonb not null default '[]',
  created_by     text not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.commercial_packages enable row level security;
create policy "commercial_packages: leitura para autenticados" on public.commercial_packages
  for select using (auth.role() = 'authenticated');
create policy "commercial_packages: escrita para autenticados" on public.commercial_packages
  for all using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- APROVAÇÕES
-- ----------------------------------------------------------------
create table if not exists public.approvals (
  id            text primary key,
  target_type   text not null,
  target_id     text not null,
  client_id     text not null,
  consultant_id text not null,
  total_value   numeric not null,
  expected_margin numeric not null,
  term          text not null,
  reason        text not null,
  approver      text not null,
  requested_by  text not null,
  requested_at  timestamptz not null default now(),
  decision      text not null default 'Pendente',
  observation   text not null default '',
  history       jsonb not null default '[]',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.approvals enable row level security;
create policy "approvals: leitura para autenticados" on public.approvals
  for select using (auth.role() = 'authenticated');
create policy "approvals: escrita para autenticados" on public.approvals
  for all using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- PLANNER — TAREFAS
-- ----------------------------------------------------------------
create table if not exists public.planner_tasks (
  id           text primary key,
  title        text not null,
  description  text,
  category     text not null,
  responsible  text,
  due_date     date not null,
  priority     text not null,
  status       text not null default 'Não iniciada',
  recurrence   text not null default 'Nenhuma',
  template_id  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  completed_at timestamptz,
  created_by   text
);

alter table public.planner_tasks enable row level security;
create policy "planner_tasks: leitura para autenticados" on public.planner_tasks
  for select using (auth.role() = 'authenticated');
create policy "planner_tasks: escrita para autenticados" on public.planner_tasks
  for all using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- PLANNER — MODELOS (TEMPLATES)
-- ----------------------------------------------------------------
create table if not exists public.planner_templates (
  id                   text primary key,
  title                text not null,
  description          text,
  category             text not null,
  priority             text not null,
  recurrence           text not null default 'Nenhuma',
  suggested_responsible text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.planner_templates enable row level security;
create policy "planner_templates: leitura para autenticados" on public.planner_templates
  for select using (auth.role() = 'authenticated');
create policy "planner_templates: escrita para autenticados" on public.planner_templates
  for all using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- ESTOQUE — ITENS
-- ----------------------------------------------------------------
create table if not exists public.stock_items (
  id               text primary key,
  unit             text not null,
  "group"          text not null,
  product_name     text not null,
  physical_stock   numeric not null default 0,
  pv_retira_loja   numeric not null default 0,
  purchase_order   numeric not null default 0,
  consigned_balance numeric not null default 0,
  available_stock  numeric not null default 0,
  type             text not null default 'product',
  source_file_name text not null default '',
  imported_at      timestamptz not null default now()
);

alter table public.stock_items enable row level security;
create policy "stock_items: leitura para autenticados" on public.stock_items
  for select using (auth.role() = 'authenticated');
create policy "stock_items: escrita para autenticados" on public.stock_items
  for all using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- ESTOQUE — REGRAS DE MÍNIMO
-- ----------------------------------------------------------------
create table if not exists public.stock_minimum_rules (
  id              text primary key,
  product_name    text not null,
  "group"         text,
  unit_of_measure text,
  minimum_stock   numeric not null,
  observation     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.stock_minimum_rules enable row level security;
create policy "stock_minimum_rules: leitura para autenticados" on public.stock_minimum_rules
  for select using (auth.role() = 'authenticated');
create policy "stock_minimum_rules: escrita para autenticados" on public.stock_minimum_rules
  for all using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- ESTOQUE — HISTÓRICO DE IMPORTAÇÕES
-- ----------------------------------------------------------------
create table if not exists public.stock_import_history (
  id            text primary key,
  unit          text not null,
  file_name     text not null,
  imported_at   timestamptz not null,
  product_count int not null default 0,
  warning_count int not null default 0
);

alter table public.stock_import_history enable row level security;
create policy "stock_import_history: leitura para autenticados" on public.stock_import_history
  for select using (auth.role() = 'authenticated');
create policy "stock_import_history: escrita para autenticados" on public.stock_import_history
  for all using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- ESTOQUE — TABELA DE PRECIFICAÇÃO
-- ----------------------------------------------------------------
create table if not exists public.stock_pricing_tables (
  id               text primary key,
  file_name        text not null,
  imported_at      timestamptz not null,
  month_reference  text,
  active           boolean not null default true,
  products         jsonb not null default '[]',
  import_warnings  jsonb not null default '[]',
  metadata         jsonb not null default '{}'
);

alter table public.stock_pricing_tables enable row level security;
create policy "stock_pricing_tables: leitura para autenticados" on public.stock_pricing_tables
  for select using (auth.role() = 'authenticated');
create policy "stock_pricing_tables: escrita para autenticados" on public.stock_pricing_tables
  for all using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- CAMPANHAS
-- ----------------------------------------------------------------
create table if not exists public.campaigns (
  id              text primary key,
  title           text not null,
  type_label      text not null,
  subtitle        text not null default '',
  description     text,
  crop            text,
  status          text not null default 'Rascunho',
  payment_dates   jsonb not null default '[]',
  rows            jsonb not null default '[]',
  footer_note     text not null default '',
  visual_theme    text not null default 'PADAP Verde',
  preview_mode    text not null default 'Normal',
  show_logo       boolean not null default true,
  show_institutional_subtitle boolean not null default true,
  show_footer_note boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.campaigns enable row level security;
create policy "campaigns: leitura para autenticados" on public.campaigns
  for select using (auth.role() = 'authenticated');
create policy "campaigns: escrita para autenticados" on public.campaigns
  for all using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- CARTEIRA DE COMPRAS (já existia — mantida para referência)
-- ----------------------------------------------------------------
-- A tabela purchase_portfolio já deve existir se o projeto foi
-- inicializado anteriormente. Esta migration não a recria.
