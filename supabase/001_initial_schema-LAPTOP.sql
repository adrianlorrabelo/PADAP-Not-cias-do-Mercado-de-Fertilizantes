-- =============================================================
-- 001_initial_schema.sql
-- PADAP Intelligence — Esquema inicial
-- Tabelas: usuários, consultores, clientes, produtos, tabelas
--          semanais, propostas, pacotes, aprovações, alertas,
--          fontes de mercado, destinatários WhatsApp, contatos
--          produtores, planner, configurações.
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- USUÁRIOS DO SISTEMA
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN (
                'Administrador Geral',
                'Gestor / Gerente',
                'Compras / Precificação',
                'Consultor',
                'Visualizador')),
  position    TEXT,
  status      TEXT NOT NULL DEFAULT 'Ativo'
                CHECK (status IN ('Ativo','Desativado')),
  last_access TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- CONSULTORES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consultants (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  phone      TEXT,
  region     TEXT,
  status     TEXT NOT NULL DEFAULT 'Ativo'
               CHECK (status IN ('Ativo','Inativo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- CLIENTES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id                      TEXT PRIMARY KEY,
  name                    TEXT NOT NULL,
  company                 TEXT,
  consultant_id           TEXT REFERENCES consultants(id),
  region                  TEXT,
  main_crop               TEXT,
  profile                 TEXT CHECK (profile IN (
                            'Cliente comum',
                            'Cliente grande',
                            'Cliente estratégico',
                            'Cliente especialidade/diamante',
                            'Relacionamento diretoria',
                            'Cliente de atenção')),
  brand_preference        TEXT,
  common_term             TEXT,
  price_sensitivity       TEXT CHECK (price_sensitivity IN ('Baixa','Média','Alta')),
  notes                   TEXT,
  status                  TEXT NOT NULL DEFAULT 'Ativo'
                            CHECK (status IN ('Ativo','Inativo')),
  financial_status_future TEXT CHECK (financial_status_future IN (
                            'Liberado','Atenção','Bloqueado',
                            'Consultar administrativo')),
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELAS SEMANAIS DE PREÇO (Yara, Mosaic, Fertipar…)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_tables (
  id                TEXT PRIMARY KEY,
  supplier          TEXT NOT NULL,
  file_name         TEXT,
  source_sheet_name TEXT,
  list_code         TEXT,
  list_name         TEXT,
  expires_at        TIMESTAMPTZ NOT NULL,
  ptax              NUMERIC(10,4),
  freight           NUMERIC(10,2),
  icms              NUMERIC(5,2),
  margin_icms       NUMERIC(5,2),
  imported_at       TIMESTAMPTZ DEFAULT NOW(),
  imported_by       TEXT,
  active            BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- PRODUTOS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                  TEXT PRIMARY KEY,
  weekly_table_id     TEXT REFERENCES weekly_tables(id) ON DELETE SET NULL,
  code                TEXT,
  group_name          TEXT,
  description         TEXT NOT NULL,
  reference           TEXT,
  characteristic      TEXT,
  packaging           TEXT,
  supplier            TEXT NOT NULL,
  producer_price      NUMERIC(12,2) DEFAULT 0,
  reseller_price      NUMERIC(12,2) DEFAULT 0,
  discount            NUMERIC(5,2)  DEFAULT 0,
  desvio_precificacao NUMERIC(5,2)  DEFAULT 0,
  final_price         NUMERIC(12,2) DEFAULT 0,
  available           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- PROPOSTAS COMERCIAIS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proposals (
  id                                 TEXT PRIMARY KEY,
  client_id                          TEXT REFERENCES clients(id),
  consultant_id                      TEXT REFERENCES consultants(id),
  product_id                         TEXT REFERENCES products(id),
  quantity                           NUMERIC(12,3),
  unit                               TEXT,
  supplier                           TEXT,
  product_cost                       NUMERIC(12,2),
  sale_price                         NUMERIC(12,2),
  freight                            NUMERIC(12,2) DEFAULT 0,
  taxes                              NUMERIC(12,2) DEFAULT 0,
  commission                         NUMERIC(12,2) DEFAULT 0,
  other_expenses                     NUMERIC(12,2) DEFAULT 0,
  term                               TEXT,
  freight_mode                       TEXT CHECK (freight_mode IN ('CIF','FOB')),
  validity                           TIMESTAMPTZ,
  notes                              TEXT,
  crop                               TEXT,
  status                             TEXT,
  ptax_used                          NUMERIC(10,4),
  ptax_date                          TIMESTAMPTZ,
  assistant_product_name             TEXT,
  assistant_client_name              TEXT,
  assistant_consultant_name          TEXT,
  assistant_delivery_city            TEXT,
  assistant_price_origin             TEXT,
  assistant_product_type             TEXT,
  assistant_pricing_strategy         TEXT,
  assistant_suggested_supplier       TEXT,
  assistant_suggested_minimum_margin NUMERIC(5,2),
  assistant_availability             TEXT,
  created_by                         TEXT,
  created_at                         TIMESTAMPTZ DEFAULT NOW(),
  updated_at                         TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- PACOTES COMERCIAIS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commercial_packages (
  id             TEXT PRIMARY KEY,
  client_id      TEXT REFERENCES clients(id),
  consultant_id  TEXT REFERENCES consultants(id),
  crop           TEXT,
  term           TEXT,
  validity       TIMESTAMPTZ,
  notes          TEXT,
  status         TEXT,
  client_profile TEXT,
  created_by     TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS package_items (
  id           TEXT PRIMARY KEY,
  package_id   TEXT NOT NULL REFERENCES commercial_packages(id) ON DELETE CASCADE,
  product_id   TEXT REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity     NUMERIC(12,3),
  unit         TEXT,
  unit_cost    NUMERIC(12,2),
  unit_sale    NUMERIC(12,2),
  supplier     TEXT,
  note         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- APROVAÇÕES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS approvals (
  id              TEXT PRIMARY KEY,
  target_type     TEXT CHECK (target_type IN ('Proposta','Pacote')),
  target_id       TEXT,
  client_id       TEXT REFERENCES clients(id),
  consultant_id   TEXT REFERENCES consultants(id),
  total_value     NUMERIC(14,2),
  expected_margin NUMERIC(5,2),
  term            TEXT,
  reason          TEXT,
  approver        TEXT,
  requested_by    TEXT,
  requested_at    TIMESTAMPTZ DEFAULT NOW(),
  decision        TEXT DEFAULT 'Pendente' CHECK (decision IN (
                    'Pendente','Aprovado','Reprovado',
                    'Ajustar preço','Ajustar prazo',
                    'Reconfirmar fornecedor',
                    'Enviar para diretoria/donos')),
  observation     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_history (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  approval_id TEXT NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
  user_name   TEXT NOT NULL,
  event_date  TIMESTAMPTZ DEFAULT NOW(),
  text        TEXT NOT NULL
);

-- ─────────────────────────────────────────────────────────────
-- ALERTAS DO SISTEMA
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  priority    TEXT CHECK (priority IN (
                'Crítico','Importante','Oportunidade','Informativo',
                'Risco cambial','Risco de margem',
                'Risco de validade','Risco de disponibilidade')),
  date        TIMESTAMPTZ DEFAULT NOW(),
  module      TEXT,
  action      TEXT,
  resolved    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- FONTES DE INTELIGÊNCIA DE MERCADO
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_sources (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  category        TEXT,
  url             TEXT,
  source_type     TEXT,
  confidence      TEXT CHECK (confidence IN ('Alta','Média','Baixa')),
  is_active       BOOLEAN DEFAULT TRUE,
  use_in_briefing BOOLEAN DEFAULT TRUE,
  observation     TEXT,
  last_checked_at TIMESTAMPTZ,
  last_status     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- DESTINATÁRIOS WHATSAPP (relatórios / briefings)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_recipients (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name                   TEXT NOT NULL,
  role                   TEXT,
  phone                  TEXT NOT NULL,
  formatted_phone        TEXT,
  group_name             TEXT,
  status                 TEXT DEFAULT 'ativo'
                           CHECK (status IN ('ativo','inativo')),
  receives_market_report BOOLEAN DEFAULT TRUE,
  receives_briefing      BOOLEAN DEFAULT TRUE,
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- CONTATOS PRODUTORES (Lista de Transmissão WhatsApp)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS producer_contacts (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name               TEXT NOT NULL,
  farm               TEXT,
  whatsapp           TEXT NOT NULL,
  formatted_whatsapp TEXT,
  city               TEXT,
  main_crop          TEXT,
  groups             TEXT[] DEFAULT '{}',
  notes              TEXT,
  status             TEXT DEFAULT 'ativo'
                       CHECK (status IN ('ativo','inativo')),
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- PLANNER — TAREFAS E TEMPLATES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planner_tasks (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title              TEXT NOT NULL,
  description        TEXT,
  category           TEXT,
  responsible        TEXT,
  due_date           DATE,
  priority           TEXT CHECK (priority IN ('Baixa','Média','Alta','Urgente')),
  status             TEXT DEFAULT 'Não iniciada' CHECK (status IN (
                       'Não iniciada','Em andamento','Concluída')),
  recurrence         TEXT DEFAULT 'Nenhuma' CHECK (recurrence IN (
                       'Nenhuma','Diária','Semanal','Quinzenal','Mensal')),
  recurrence_anchor  DATE,
  completed_at       TIMESTAMPTZ,
  is_recurring       BOOLEAN DEFAULT FALSE,
  origin_template_id UUID,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planner_task_templates (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title                 TEXT NOT NULL,
  description           TEXT,
  category              TEXT,
  priority              TEXT CHECK (priority IN ('Baixa','Média','Alta','Urgente')),
  recurrence            TEXT CHECK (recurrence IN (
                          'Nenhuma','Diária','Semanal','Quinzenal','Mensal')),
  suggested_responsible TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- CONFIGURAÇÕES DO SISTEMA (singleton — id sempre = 1)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id                      INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  min_fertilizer_margin   NUMERIC(5,2) DEFAULT 10,
  desired_foliar_margin   NUMERIC(5,2) DEFAULT 18,
  strategic_client_margin NUMERIC(5,2) DEFAULT 12,
  default_commission      NUMERIC(5,2) DEFAULT 45,
  default_tax             NUMERIC(5,2) DEFAULT 110,
  default_freight         NUMERIC(5,2) DEFAULT 82,
  default_validity_hours  INTEGER      DEFAULT 36,
  manual_ptax             NUMERIC(10,4) DEFAULT 5.18,
  alerts                  JSONB        DEFAULT '{}',
  updated_at              TIMESTAMPTZ  DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- (política permissiva para desenvolvimento — refinar em produção)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultants           ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients               ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_tables         ENABLE ROW LEVEL SECURITY;
ALTER TABLE products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_packages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_sources        ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_recipients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE producer_contacts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings              ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON users                  USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON consultants            USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON clients                USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON weekly_tables          USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON products               USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON proposals              USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON commercial_packages    USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON package_items          USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON approvals              USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON approval_history       USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON alerts                 USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON market_sources         USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON whatsapp_recipients    USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON producer_contacts      USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON planner_tasks          USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON planner_task_templates USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON settings               USING (true) WITH CHECK (true);
