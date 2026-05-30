-- ============================================================
-- PADAP Intelligence — Setup de Usuários no Supabase Auth
-- Execute no SQL Editor: https://supabase.com/dashboard/project/tkxlrthqebhtawjxzojs/sql
--
-- Substitua as senhas pelos valores reais do seu .env.local
-- antes de executar. Faça isso UMA única vez.
-- ============================================================

-- Função auxiliar: cria usuário + define metadados de perfil
-- (usa a API interna do Supabase; só funciona no SQL Editor do dashboard)

select auth.users from auth.users limit 1; -- teste de permissão

-- -------------------------------------------------------
-- Administrador Geral
-- -------------------------------------------------------
do $$
declare uid uuid;
begin
  insert into auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, role
  ) values (
    gen_random_uuid(),
    'admin@padap.com.br',
    crypt('SUBSTITUA_SENHA_ADMIN', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Mariana PADAP","role":"Administrador Geral","position":"Diretoria","status":"Ativo"}',
    now(), now(), 'authenticated'
  )
  on conflict (email) do update
    set raw_user_meta_data = '{"name":"Mariana PADAP","role":"Administrador Geral","position":"Diretoria","status":"Ativo"}',
        updated_at = now()
  returning id into uid;

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), uid, 'admin@padap.com.br',
    json_build_object('sub', uid, 'email', 'admin@padap.com.br'),
    'email', now(), now(), now()
  ) on conflict do nothing;
end $$;

-- -------------------------------------------------------
-- Gestor / Gerente
-- -------------------------------------------------------
do $$
declare uid uuid;
begin
  insert into auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, role
  ) values (
    gen_random_uuid(),
    'gestor@padap.com.br',
    crypt('SUBSTITUA_SENHA_GESTOR', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Rafael Costa","role":"Gestor / Gerente","position":"Gerente Comercial","status":"Ativo"}',
    now(), now(), 'authenticated'
  )
  on conflict (email) do update
    set raw_user_meta_data = '{"name":"Rafael Costa","role":"Gestor / Gerente","position":"Gerente Comercial","status":"Ativo"}',
        updated_at = now()
  returning id into uid;

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), uid, 'gestor@padap.com.br',
    json_build_object('sub', uid, 'email', 'gestor@padap.com.br'),
    'email', now(), now(), now()
  ) on conflict do nothing;
end $$;

-- -------------------------------------------------------
-- Compras / Precificação
-- -------------------------------------------------------
do $$
declare uid uuid;
begin
  insert into auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, role
  ) values (
    gen_random_uuid(),
    'compras@padap.com.br',
    crypt('SUBSTITUA_SENHA_COMPRAS', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Bruna Oliveira","role":"Compras / Precificação","position":"Compras e Precificação","status":"Ativo"}',
    now(), now(), 'authenticated'
  )
  on conflict (email) do update
    set raw_user_meta_data = '{"name":"Bruna Oliveira","role":"Compras / Precificação","position":"Compras e Precificação","status":"Ativo"}',
        updated_at = now()
  returning id into uid;

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), uid, 'compras@padap.com.br',
    json_build_object('sub', uid, 'email', 'compras@padap.com.br'),
    'email', now(), now(), now()
  ) on conflict do nothing;
end $$;

-- -------------------------------------------------------
-- Consultor
-- -------------------------------------------------------
do $$
declare uid uuid;
begin
  insert into auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, role
  ) values (
    gen_random_uuid(),
    'consultor@padap.com.br',
    crypt('SUBSTITUA_SENHA_CONSULTOR', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Lucas Almeida","role":"Consultor","position":"Consultor Agro","status":"Ativo"}',
    now(), now(), 'authenticated'
  )
  on conflict (email) do update
    set raw_user_meta_data = '{"name":"Lucas Almeida","role":"Consultor","position":"Consultor Agro","status":"Ativo"}',
        updated_at = now()
  returning id into uid;

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), uid, 'consultor@padap.com.br',
    json_build_object('sub', uid, 'email', 'consultor@padap.com.br'),
    'email', now(), now(), now()
  ) on conflict do nothing;
end $$;

-- -------------------------------------------------------
-- Visualizador
-- -------------------------------------------------------
do $$
declare uid uuid;
begin
  insert into auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, role
  ) values (
    gen_random_uuid(),
    'visualizador@padap.com.br',
    crypt('SUBSTITUA_SENHA_VIEWER', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Ana Paula","role":"Visualizador","position":"Controladoria","status":"Ativo"}',
    now(), now(), 'authenticated'
  )
  on conflict (email) do update
    set raw_user_meta_data = '{"name":"Ana Paula","role":"Visualizador","position":"Controladoria","status":"Ativo"}',
        updated_at = now()
  returning id into uid;

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), uid, 'visualizador@padap.com.br',
    json_build_object('sub', uid, 'email', 'visualizador@padap.com.br'),
    'email', now(), now(), now()
  ) on conflict do nothing;
end $$;

-- -------------------------------------------------------
-- Seed: Fontes de mercado padrão
-- -------------------------------------------------------
insert into public.market_sources (id, name, category, source_type, confidence, is_active, use_in_briefing, url, observation)
values
  ('banco-central', 'Banco Central', 'Câmbio', 'API', 'Alta', true, true, 'https://www.bcb.gov.br/', 'Fonte oficial para câmbio e PTAX.'),
  ('lista-yara-padap', 'Lista Yara / Tabela PADAP', 'Interna', 'Fonte interna', 'Alta', true, true, null, 'Base interna de compras e precificação.'),
  ('anda', 'ANDA', 'Oferta e demanda', 'Link monitorado', 'Alta', true, true, 'https://anda.org.br/', null),
  ('globalfert', 'GlobalFert', 'Fertilizantes', 'Link monitorado', 'Alta', true, true, 'https://globalfert.com.br/', null),
  ('noticias-agricolas', 'Notícias Agrícolas', 'Fertilizantes', 'Link monitorado', 'Média', true, true, 'https://www.noticiasagricolas.com.br/', null),
  ('agrolink', 'Agrolink', 'Fertilizantes', 'Link monitorado', 'Média', true, true, 'https://www.agrolink.com.br/', null),
  ('cepea', 'CEPEA', 'Café', 'Link monitorado', 'Alta', true, true, 'https://www.cepea.esalq.usp.br/', null),
  ('conab', 'CONAB', 'Oferta e demanda', 'Link monitorado', 'Alta', true, true, 'https://www.conab.gov.br/', null)
on conflict (id) do nothing;
