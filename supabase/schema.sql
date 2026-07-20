-- PADAP Notícias de Fertilizantes — schema do histórico de notícias
-- Rode este script no SQL Editor do seu projeto Supabase.

create table if not exists news_items (
  id bigint generated always as identity primary key,
  link text not null unique,
  title text not null,
  excerpt text,
  source text,
  category text not null,
  pub_date timestamptz,
  first_seen_at timestamptz not null default now()
);

create index if not exists news_items_pub_date_idx on news_items (pub_date desc);
create index if not exists news_items_category_idx on news_items (category);

-- Leitura pública (o frontend consulta via chave anon), escrita só pela
-- função de cron, que usa a service role key e ignora RLS.
alter table news_items enable row level security;

drop policy if exists "Public read access" on news_items;
create policy "Public read access"
  on news_items for select
  to anon
  using (true);
