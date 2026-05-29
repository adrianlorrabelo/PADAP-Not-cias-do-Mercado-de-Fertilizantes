CREATE TABLE IF NOT EXISTS public.purchase_portfolio (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_compra               TEXT        NOT NULL DEFAULT '',
  fornecedor                  TEXT        NOT NULL DEFAULT '',
  emissao                     DATE        NOT NULL,
  vencimento                  DATE        NOT NULL,
  pedido_fornecedor           TEXT        NOT NULL DEFAULT '',
  produto                     TEXT        NOT NULL DEFAULT '',
  qtd_ton                     NUMERIC     NOT NULL DEFAULT 0,
  valor_ton                   NUMERIC     NOT NULL DEFAULT 0,
  semaforo_aprovacao_override TEXT        CHECK (semaforo_aprovacao_override IN ('verde','amarelo','vermelho') OR semaforo_aprovacao_override IS NULL),
  observacoes                 TEXT        NOT NULL DEFAULT '',
  created_by                  UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_purchase_portfolio_updated_at
BEFORE UPDATE ON public.purchase_portfolio
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.purchase_portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_or_manager_select" ON public.purchase_portfolio
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('Administrador Geral','Gestor / Gerente')
    )
  );

CREATE POLICY "owner_insert" ON public.purchase_portfolio
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "owner_update" ON public.purchase_portfolio
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE POLICY "owner_delete" ON public.purchase_portfolio
  FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_purchase_portfolio_created_by ON public.purchase_portfolio(created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_portfolio_vencimento ON public.purchase_portfolio(vencimento);
CREATE INDEX IF NOT EXISTS idx_purchase_portfolio_fornecedor ON public.purchase_portfolio(fornecedor);
