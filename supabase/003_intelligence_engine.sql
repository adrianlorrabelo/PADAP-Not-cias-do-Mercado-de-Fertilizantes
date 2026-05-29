-- =============================================================
-- 003_intelligence_engine.sql
-- PADAP Intelligence — Motor de inteligência de mercado
-- Tabelas: análises geradas, indicadores normalizados, séries
--          temporais, scores de decisão, previsões do analista,
--          auditoria do sistema.
-- Depende de: 001_initial_schema.sql, 002_market_snapshot.sql
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- ANÁLISES DE MERCADO (geradas pelo motor / IA)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_analyses (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  update_history_id       UUID REFERENCES market_update_history(id) ON DELETE SET NULL,
  generated_at            TIMESTAMPTZ DEFAULT NOW(),
  summary_title           TEXT,
  what_changed            TEXT,
  impact_padap            TEXT,
  what_to_watch           TEXT,
  horizon                 TEXT,
  confidence              TEXT,
  thermometer_score       INTEGER CHECK (thermometer_score BETWEEN 0 AND 100),
  thermometer_risk        TEXT CHECK (thermometer_risk IN ('Baixo','Médio','Alto')),
  thermometer_opportunity TEXT CHECK (thermometer_opportunity IN ('Baixa','Média','Alta')),
  thermometer_trend       TEXT,
  products_in_attention   JSONB DEFAULT '[]',
  opportunities           JSONB DEFAULT '[]',
  briefing                JSONB DEFAULT '{}',
  raw_analyst_insight     JSONB DEFAULT '{}',
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_analyses_generated_at
  ON market_analyses(generated_at DESC);

-- ─────────────────────────────────────────────────────────────
-- INDICADORES DE INTELIGÊNCIA (estado atual de cada indicador)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_intelligence_indicators (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name            TEXT NOT NULL,
  value           TEXT,
  unit            TEXT,
  daily_change    TEXT,
  weekly_change   TEXT,
  trend           TEXT,
  source          TEXT,
  source_type     TEXT CHECK (source_type IN ('Interna','Externa','Manual')),
  impact_padap    TEXT,
  history         JSONB DEFAULT '[]',
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- SÉRIES TEMPORAIS NORMALIZADAS (time series por indicador)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS indicator_series (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  indicator_id   TEXT,
  indicator_name TEXT NOT NULL,
  value          NUMERIC(14,4),
  unit           TEXT,
  source         TEXT,
  recorded_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_indicator_series_name_date
  ON indicator_series(indicator_name, recorded_at DESC);

-- ─────────────────────────────────────────────────────────────
-- SCORES DE DECISÃO POR PRODUTO (resultado de cada análise)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS decision_scores (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id        UUID REFERENCES market_analyses(id) ON DELETE SET NULL,
  product            TEXT NOT NULL,
  score              INTEGER CHECK (score BETWEEN 0 AND 100),
  situation          TEXT,
  risk               TEXT CHECK (risk IN ('Baixo','Médio','Alto')),
  opportunity        TEXT CHECK (opportunity IN ('Baixa','Média','Alta')),
  recommended_action TEXT,
  tone               TEXT CHECK (tone IN ('green','amber','red','cyan')),
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decision_scores_analysis
  ON decision_scores(analysis_id);

-- ─────────────────────────────────────────────────────────────
-- PREVISÕES DO ANALISTA (rastreamento de acertos / calibração)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyst_predictions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_date DATE,
  product         TEXT NOT NULL,
  prediction      TEXT,
  horizon         TEXT,
  observed_result TEXT,
  hit_trend       BOOLEAN,
  precision       NUMERIC(5,2) CHECK (precision BETWEEN 0 AND 100),
  note            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- LOG DE AUDITORIA DO SISTEMA
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name   TEXT,
  user_email  TEXT,
  action      TEXT NOT NULL,
  module      TEXT,
  target_type TEXT,
  target_id   TEXT,
  description TEXT,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
  ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_email
  ON audit_log(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_log_module
  ON audit_log(module);
CREATE INDEX IF NOT EXISTS idx_audit_log_target
  ON audit_log(target_type, target_id);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
ALTER TABLE market_analyses                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_intelligence_indicators  ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_series                ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_scores                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyst_predictions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log                       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON market_analyses                USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON market_intelligence_indicators USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON indicator_series               USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON decision_scores                USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON analyst_predictions            USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON audit_log                      USING (true) WITH CHECK (true);
