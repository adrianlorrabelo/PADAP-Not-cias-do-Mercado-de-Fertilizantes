-- =============================================================
-- 002_market_snapshot.sql
-- PADAP Intelligence — Tabela de snapshot de mercado
-- Salva o estado do mercado quando o usuário clica em "Atualizar"
-- Depende de: 001_initial_schema.sql (tabela market_sources)
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- HISTÓRICO DE ATUALIZAÇÕES (cada clique em "Atualizar")
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_update_history (
  id                         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  triggered_by               TEXT CHECK (triggered_by IN ('Manual','Automática')),
  status                     TEXT CHECK (status IN ('Completa','Parcial','Com falhas')),
  sources_checked            INTEGER DEFAULT 0,
  sources_succeeded          INTEGER DEFAULT 0,
  sources_failed             INTEGER DEFAULT 0,
  internal_sources_used      INTEGER DEFAULT 0,
  external_sources_available INTEGER DEFAULT 0,
  confidence                 TEXT,
  summary                    TEXT,
  analysis_id                UUID,
  analysis_summary           TEXT,
  analysis_score             NUMERIC(5,2),
  updated_at                 TIMESTAMPTZ DEFAULT NOW(),
  created_at                 TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- RESULTADO POR FONTE EM CADA ATUALIZAÇÃO
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_source_results (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  update_history_id UUID NOT NULL REFERENCES market_update_history(id) ON DELETE CASCADE,
  source_id         TEXT REFERENCES market_sources(id) ON DELETE SET NULL,
  source_name       TEXT,
  category          TEXT,
  status            TEXT CHECK (status IN (
                      'Atualizada','Indisponível','Erro','Manual','Pendente')),
  message           TEXT,
  checked_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_source_results_history
  ON market_source_results(update_history_id);

-- ─────────────────────────────────────────────────────────────
-- SNAPSHOT DOS INDICADORES DE MERCADO (estado no momento da atualização)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_snapshot_data (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  update_history_id UUID REFERENCES market_update_history(id) ON DELETE CASCADE,
  ptax              NUMERIC(10,4),
  ptax_variation    NUMERIC(5,2),
  urea_price        NUMERIC(12,2),
  map_price         NUMERIC(12,2),
  kcl_price         NUMERIC(12,2),
  npk_price         NUMERIC(12,2),
  coffee_price      NUMERIC(10,2),
  soy_price         NUMERIC(10,2),
  corn_price        NUMERIC(10,2),
  market_status     TEXT,
  thermometer_score INTEGER CHECK (thermometer_score BETWEEN 0 AND 100),
  extra_indicators  JSONB DEFAULT '{}',
  snapped_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_snapshot_snapped_at
  ON market_snapshot_data(snapped_at DESC);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
ALTER TABLE market_update_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_source_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_snapshot_data  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON market_update_history USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON market_source_results USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON market_snapshot_data  USING (true) WITH CHECK (true);
