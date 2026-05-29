-- =============================================================
-- seed.sql
-- PADAP Intelligence — Dados iniciais
-- 5 usuários de acesso · 3 consultores · 5 clientes (região São Gotardo)
-- 1 tabela semanal Yara · 8 produtos (Yara / Mosaic / Fertipar)
-- 3 propostas · 1 pacote comercial · 1 aprovação
-- 10 fontes de mercado · 6 indicadores · 3 previsões do analista
-- Configurações padrão
-- =============================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- USUÁRIOS (5 ativos + 1 inativo)
-- ─────────────────────────────────────────────────────────────
INSERT INTO users (id, name, email, password, role, position, status, last_access)
VALUES
  ('u-admin',     'Mariana PADAP',   'admin@padap.com.br',        'admin123',     'Administrador Geral',    'Diretoria',              'Ativo',      NOW()),
  ('u-gestor',    'Rafael Costa',    'gestor@padap.com.br',       'gestor123',    'Gestor / Gerente',       'Gerente Comercial',      'Ativo',      NOW()),
  ('u-compras',   'Bruna Oliveira',  'compras@padap.com.br',      'compras123',   'Compras / Precificação', 'Compras e Precificação', 'Ativo',      NOW()),
  ('u-consultor', 'Lucas Almeida',   'consultor@padap.com.br',    'consultor123', 'Consultor',              'Consultor Agro',         'Ativo',      NOW()),
  ('u-viewer',    'Ana Paula',       'visualizador@padap.com.br', 'viewer123',    'Visualizador',           'Controladoria',          'Ativo',      NOW()),
  ('u-off',       'Usuário Inativo', 'inativo@padap.com.br',      'inativo123',   'Consultor',              'Consultor',              'Desativado', '2026-04-20T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- CONSULTORES
-- ─────────────────────────────────────────────────────────────
INSERT INTO consultants (id, name, email, phone, region, status)
VALUES
  ('c-1', 'Lucas Almeida',    'lucas@padap.com.br',    '+55 34 99999-1201', 'Alto Paranaíba',    'Ativo'),
  ('c-2', 'Fernanda Ribeiro', 'fernanda@padap.com.br', '+55 34 99999-3320', 'Triângulo Mineiro', 'Ativo'),
  ('c-3', 'Thiago Martins',   'thiago@padap.com.br',   '+55 34 99999-8810', 'Cerrado Mineiro',   'Ativo')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- CLIENTES (5 — região São Gotardo e entorno)
-- ─────────────────────────────────────────────────────────────
INSERT INTO clients (id, name, company, consultant_id, region, main_crop, profile,
                     brand_preference, common_term, price_sensitivity, notes,
                     status, financial_status_future)
VALUES
  ('cl-1', 'Grupo Santa Clara',  'Fazenda Santa Clara',    'c-1', 'Rio Paranaíba', 'Café',    'Cliente estratégico',           'YaraMila',  'Mês 11',  'Média', 'Alta recorrência em químicos.',                'Ativo', 'Liberado'),
  ('cl-2', 'Agro Vale Verde',    'Vale Verde Agrícola',    'c-2', 'São Gotardo',   'Cenoura', 'Cliente grande',                'YaraBasa',  'Safra',   'Alta',  'Negocia pacotes por cultura.',                 'Ativo', 'Atenção'),
  ('cl-3', 'Irmãos Prado',       'Prado Alimentos',        'c-3', 'Patos de Minas','Milho',   'Cliente comum',                 'Fertipar',  '60 dias', 'Média', 'Prefere frete CIF.',                           'Ativo', 'Liberado'),
  ('cl-4', 'Diamante Agro',      'Diamante Specialty',     'c-1', 'Campos Altos',  'Alho',    'Cliente especialidade/diamante','YaraVita',  '90 dias', 'Baixa', 'Foco em qualidade e disponibilidade.',         'Ativo', 'Liberado'),
  ('cl-5', 'São Gotardo Agro',   'São Gotardo Agrícola',   'c-2', 'São Gotardo',   'Café',    'Cliente grande',                'YaraBela',  'Mês 10',  'Média', 'Cliente estratégico da região, foco café.',    'Ativo', 'Liberado')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- TABELA SEMANAL YARA
-- ─────────────────────────────────────────────────────────────
INSERT INTO weekly_tables (id, supplier, expires_at, ptax, freight, icms, margin_icms,
                            imported_at, imported_by, active)
VALUES
  ('wt-yara-2026-20', 'Yara', NOW() + INTERVAL '36 hours',
   5.18, 82, 7, 10.8, NOW(), 'Bruna Oliveira', true)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- PRODUTOS (8 — Yara, Fertipar, Mosaic, Fertigran, Sibra)
-- ─────────────────────────────────────────────────────────────
INSERT INTO products (id, weekly_table_id, code, group_name, description, reference,
                      characteristic, packaging, supplier, producer_price,
                      reseller_price, discount, desvio_precificacao, final_price, available)
VALUES
  ('p-1', 'wt-yara-2026-20', 'YB-1020',  'Fertilizantes', 'YaraBasa 10-20-20',   'Base café',           'Granulado',       'Big bag',      'Yara',       3550, 3720, 0, 0, 3980, true),
  ('p-2', 'wt-yara-2026-20', 'YM-0830',  'Fertilizantes', 'YaraMila 08-30-10',   'Plantio',             'Mistura premium', 'Saco 50 kg',   'Yara',       4020, 4210, 0, 0, 4490, true),
  ('p-3', 'wt-yara-2026-20', 'YV-CAL',   'Foliares',      'YaraVita Caltrac',    'Cálcio',              'Suspensão',       'Galão 10 L',   'Yara',       1480, 1680, 0, 0, 2140, true),
  ('p-4', NULL,              'KCL-STD',  'Potássicos',    'KCl Granulado',       'Cloreto de Potássio', 'Granulado',       'Big bag',      'Fertipar',   2680, 2790, 0, 0, 3010, true),
  ('p-5', NULL,              'MAP-1160', 'Fosfatados',    'MAP 11-60',           'Fosfatado',           'Importado',       'Big bag',      'Sibra',      4620, 4780, 0, 0, 5110, false),
  ('p-6', NULL,              'URE-PRL',  'Nitrogenados',  'Ureia Perolada',      'Nitrogênio',          'Perolada',        'Saco 50 kg',   'Fertigran',  2860, 2990, 0, 0, 3290, true),
  ('p-7', NULL,              'MOS-NPK',  'Fertilizantes', 'Mosaic NPK 20-05-20', 'Cobertura',           'Granulado',       'Saco 50 kg',   'Mosaic',     3620, 3750, 0, 0, 4020, true),
  ('p-8', NULL,              'MOS-MAP',  'Fosfatados',    'Mosaic MAP 11-52',    'Plantio fosfato',     'Granulado',       'Big bag',      'Mosaic',     5050, 5180, 0, 0, 5480, true)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- PROPOSTAS COMERCIAIS (3 exemplos)
-- ─────────────────────────────────────────────────────────────
INSERT INTO proposals (id, client_id, consultant_id, product_id, quantity, unit, supplier,
                       product_cost, sale_price, freight, taxes, commission, other_expenses,
                       term, freight_mode, validity, notes, crop, status,
                       ptax_used, ptax_date, created_by, created_at)
VALUES
  ('PR-1024', 'cl-1', 'c-1', 'p-1', 48, 'Tonelada', 'Yara',
   3560, 4080, 82, 110, 45, 12,
   'Mês 11', 'CIF', NOW() + INTERVAL '10 hours',
   'Reconfirmar disponibilidade antes do pedido.',
   'Café', 'Aguardando aprovação',
   5.12, '2026-05-14T12:00:00Z', 'Bruna Oliveira', NOW()),

  ('PR-1025', 'cl-2', 'c-2', 'p-2', 32, 'Tonelada', 'Yara',
   4100, 4680, 95, 135, 50, 0,
   'Safra', 'FOB', NOW() + INTERVAL '28 hours',
   'Cliente sensível a preço.',
   'Cenoura', 'Em precificação',
   5.18, '2026-05-15T12:00:00Z', 'Bruna Oliveira', NOW()),

  ('PR-1026', 'cl-4', 'c-1', 'p-3', 18, 'Galão', 'Yara',
   1480, 2140, 22, 88, 80, 8,
   '90 dias', 'CIF', NOW() + INTERVAL '44 hours',
   'Foliares com margem desejada superior.',
   'Alho', 'Enviada ao consultor',
   5.18, '2026-05-15T12:00:00Z', 'Mariana PADAP', NOW())
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- PACOTE COMERCIAL (1 pacote com 3 itens)
-- ─────────────────────────────────────────────────────────────
INSERT INTO commercial_packages (id, client_id, consultant_id, crop, term, validity,
                                  notes, status, client_profile, created_by, created_at)
VALUES
  ('PK-2201', 'cl-1', 'c-1', 'Café', 'Mês 11', NOW() + INTERVAL '16 hours',
   'Pacote para fechamento semanal.', 'Rascunho',
   'Cliente estratégico', 'Bruna Oliveira', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO package_items (id, package_id, product_id, product_name, quantity, unit,
                            unit_cost, unit_sale, supplier, note)
VALUES
  ('pi-1', 'PK-2201', 'p-1', 'YaraBasa 10-20-20', 36, 'Tonelada', 3754, 4145, 'Yara',     'Base'),
  ('pi-2', 'PK-2201', 'p-4', 'KCl Granulado',     18, 'Tonelada', 2795, 3045, 'Fertipar', 'Compensação de margem'),
  ('pi-3', 'PK-2201', 'p-3', 'YaraVita Caltrac',  10, 'Galão',    1668, 2220, 'Yara',     'Especialidade')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- APROVAÇÃO (1 pendente)
-- ─────────────────────────────────────────────────────────────
INSERT INTO approvals (id, target_type, target_id, client_id, consultant_id,
                       total_value, expected_margin, term, reason, approver,
                       requested_by, requested_at, decision, observation)
VALUES
  ('AP-501', 'Proposta', 'PR-1024', 'cl-1', 'c-1',
   195840, 8.9, 'Mês 11',
   'Cliente estratégico com margem próxima de 9% e PTAX alterado.',
   'Rafael Costa', 'Bruna Oliveira', NOW(), 'Pendente',
   'Aguardando validação de diretoria se o prazo for mantido.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO approval_history (approval_id, user_name, event_date, text)
VALUES
  ('AP-501', 'Bruna Oliveira', NOW(), 'Solicitação aberta por margem abaixo da meta.');

-- ─────────────────────────────────────────────────────────────
-- FONTES DE MERCADO (10 principais)
-- ─────────────────────────────────────────────────────────────
INSERT INTO market_sources (id, name, category, url, source_type, confidence,
                             is_active, use_in_briefing, observation, last_status)
VALUES
  ('bcb',              'Banco Central do Brasil',      'Câmbio',             'https://www.bcb.gov.br/',                     'Oficial',           'Alta', true,  true, 'Fonte base para PTAX e câmbio.',                      'Atualizada'),
  ('comex',            'Comex Stat / MDIC',            'Importações',        'https://comexstat.mdic.gov.br/',              'Oficial',           'Alta', true,  true, 'Referência para fluxo de importação.',                'Atualizada'),
  ('cepea',            'CEPEA',                        'Culturas',           'https://www.cepea.esalq.usp.br/',             'Oficial/Acadêmica', 'Alta', true,  true, 'Indicadores agropecuários nacionais.',                'Atualizada'),
  ('conab',            'CONAB',                        'Oferta e demanda',   'https://www.conab.gov.br/',                   'Oficial',           'Alta', true,  true, 'Safras e abastecimento.',                             'Atualizada'),
  ('anda',             'ANDA',                         'Fertilizantes',      'https://anda.org.br/',                        'Institucional',     'Alta', true,  true, 'Estatísticas oficiais do setor de adubos no Brasil.', 'Atualizada'),
  ('globalfert',       'GlobalFert',                   'Fertilizantes',      'https://globalfert.com.br/',                  'Inteligência',      'Alta', true,  true, 'Notícias, importações e preços do mercado nacional.', 'Atualizada'),
  ('reuters',          'Reuters Brasil / Commodities', 'Macro e geopolítica','https://www.reuters.com/',                    'Notícias',          'Alta', true,  true, 'Mercado, câmbio, Petrobras e empresas globais.',      'Monitorando'),
  ('noticias-agricolas','Notícias Agrícolas',          'Agro',               'https://www.noticiasagricolas.com.br/',       'Notícias',          'Média',true,  true, 'Fertilizantes, entregas, preços e importação.',       'Atualizada'),
  ('cru',              'CRU',                          'Commodities',        'https://www.crugroup.com/',                   'Inteligência',      'Alta', false, true, 'Preços e análises globais de commodities.',           'Pendente'),
  ('tfi',              'The Fertilizer Institute',     'Fertilizantes',      'https://www.tfi.org/',                        'Setorial',          'Média',true,  true, 'Referência setorial internacional de adubos.',        'Monitorando')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- INDICADORES DE INTELIGÊNCIA DE MERCADO (estado atual)
-- ─────────────────────────────────────────────────────────────
INSERT INTO market_intelligence_indicators
  (id, name, value, unit, daily_change, weekly_change, trend,
   source, source_type, impact_padap, history, last_updated_at)
VALUES
  ('ind-ptax',  'PTAX (USD/BRL)',       '5,18',  'R$/USD',  '+0,9%', '+1,8%', 'Alta',
   'Banco Central', 'Externa',
   'Impacto direto em todos os preços de importação.',
   '[{"label":"Seg","value":5.10},{"label":"Ter","value":5.12},{"label":"Qua","value":5.15},{"label":"Qui","value":5.18}]',
   NOW()),

  ('ind-ureia', 'Ureia (CFR Brasil)',   '390',   'USD/t',   '+2,3%', '+5,8%', 'Alta',
   'Argus / CRU', 'Externa',
   'Alta em nitrogenados pressiona propostas abertas de ureia.',
   '[{"label":"Sem-3","value":370},{"label":"Sem-2","value":375},{"label":"Sem-1","value":382},{"label":"Atual","value":390}]',
   NOW()),

  ('ind-map',   'MAP (CFR Brasil)',     '580',   'USD/t',   '+1,1%', '+3,6%', 'Alta',
   'CRU / GlobalFert', 'Externa',
   'Fosfatados em alta — revisar propostas de MAP.',
   '[{"label":"Sem-3","value":558},{"label":"Sem-2","value":564},{"label":"Sem-1","value":574},{"label":"Atual","value":580}]',
   NOW()),

  ('ind-kcl',   'KCl (CFR Brasil)',     '310',   'USD/t',   '-1,8%', '-4,2%', 'Queda',
   'CRU / GlobalFert', 'Externa',
   'Queda de KCl abre janela de negociação com clientes de potássio.',
   '[{"label":"Sem-3","value":328},{"label":"Sem-2","value":322},{"label":"Sem-1","value":316},{"label":"Atual","value":310}]',
   NOW()),

  ('ind-cafe',  'Café Arábica (CEPEA)', '1280',  'R$/saca', '+3,1%', '+4,4%', 'Alta',
   'CEPEA', 'Externa',
   'Alta do café melhora relação de troca — argumento comercial positivo.',
   '[{"label":"Sem-3","value":1195},{"label":"Sem-2","value":1220},{"label":"Sem-1","value":1241},{"label":"Atual","value":1280}]',
   NOW()),

  ('ind-milho', 'Milho (CEPEA)',        '72',    'R$/saca', '-0,7%', '-1,9%', 'Queda',
   'CEPEA', 'Externa',
   'Queda do milho piora relação de troca em nitrogenados.',
   '[{"label":"Sem-3","value":75},{"label":"Sem-2","value":74},{"label":"Sem-1","value":73},{"label":"Atual","value":72}]',
   NOW())
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- PREVISÕES DO ANALISTA (3 exemplos calibrados)
-- ─────────────────────────────────────────────────────────────
INSERT INTO analyst_predictions
  (prediction_date, product, prediction, horizon,
   observed_result, hit_trend, precision, note)
VALUES
  ('2026-05-01', 'Ureia',
   'Alta de 5% em 2 semanas por pressão cambial e demanda China.',
   '15 dias',
   'Alta de 5,8% observada — acerto na direção e magnitude.',
   true, 91,
   'Pressão cambial foi o driver principal, conforme previsto.'),

  ('2026-05-05', 'KCl',
   'Queda entre 3-5% por melhora pontual de oferta russa.',
   '10 dias',
   'Queda de 4,2% — dentro do intervalo previsto.',
   true, 88,
   'Safra russa entrou com volume adicional no mercado.'),

  ('2026-05-10', 'MAP',
   'Alta moderada de 3% com aumento de demanda global de fosfato.',
   '10 dias',
   'Em andamento — 3,6% acumulado até hoje.',
   true, 85,
   'Demanda Brasil + Índia sustentou a alta de fosfatados.');

-- ─────────────────────────────────────────────────────────────
-- CONFIGURAÇÕES PADRÃO DO SISTEMA
-- ─────────────────────────────────────────────────────────────
INSERT INTO settings (id, min_fertilizer_margin, desired_foliar_margin,
                      strategic_client_margin, default_commission, default_tax,
                      default_freight, default_validity_hours, manual_ptax)
VALUES (1, 10, 18, 12, 45, 110, 82, 36, 5.18)
ON CONFLICT (id) DO UPDATE SET
  min_fertilizer_margin   = EXCLUDED.min_fertilizer_margin,
  desired_foliar_margin   = EXCLUDED.desired_foliar_margin,
  strategic_client_margin = EXCLUDED.strategic_client_margin,
  default_commission      = EXCLUDED.default_commission,
  default_tax             = EXCLUDED.default_tax,
  default_freight         = EXCLUDED.default_freight,
  default_validity_hours  = EXCLUDED.default_validity_hours,
  manual_ptax             = EXCLUDED.manual_ptax,
  updated_at              = NOW();

COMMIT;
