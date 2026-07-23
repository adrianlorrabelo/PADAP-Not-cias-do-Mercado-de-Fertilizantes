const { createClient } = require('@supabase/supabase-js');

function getSupabase(key) {
  return createClient(process.env.SUPABASE_URL, key);
}

async function handleGet(req, res) {
  const supabase = getSupabase(process.env.SUPABASE_ANON_KEY);
  const { data, error } = await supabase
    .from('price_observations')
    .select('product, location, price_min, price_max, unit, observed_at')
    .order('observed_at', { ascending: false })
    .limit(500);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // Mantém, por produto+praça, a observação mais recente e a anterior
  // (pra mostrar "atual vs última semana" como no relatório de referência).
  const grouped = new Map();
  for (const row of data || []) {
    const key = `${row.product}|${row.location}`;
    if (!grouped.has(key)) grouped.set(key, []);
    const list = grouped.get(key);
    if (list.length < 2) list.push(row);
  }

  const items = Array.from(grouped.values()).map(([current, previous]) => ({
    product: current.product,
    location: current.location,
    unit: current.unit,
    observed_at: current.observed_at,
    price_min: current.price_min,
    price_max: current.price_max,
    previous_price_min: previous ? previous.price_min : null,
    previous_price_max: previous ? previous.price_max : null,
  }));

  const { data: ptaxRows } = await supabase
    .from('economic_indicators')
    .select('value, observed_at')
    .eq('indicator', 'PTAX')
    .order('observed_at', { ascending: false })
    .limit(1);
  const ptax = ptaxRows && ptaxRows.length > 0 ? ptaxRows[0] : null;

  items.sort((a, b) => a.product.localeCompare(b.product) || a.location.localeCompare(b.location));

  res.status(200).json({ items, ptax });
}

async function handlePost(req, res) {
  const body = req.body || {};
  const product = typeof body.product === 'string' ? body.product.trim() : '';
  const location = typeof body.location === 'string' ? body.location.trim() : '';
  const priceMin = Number(body.price_min);
  const priceMax = Number(body.price_max);
  const unit = typeof body.unit === 'string' && body.unit.trim() ? body.unit.trim() : 'US$/t';
  const observedAt = typeof body.observed_at === 'string' && body.observed_at
    ? body.observed_at
    : new Date().toISOString().slice(0, 10);

  if (!product || !location || !Number.isFinite(priceMin) || !Number.isFinite(priceMax)) {
    res.status(400).json({ error: 'Preencha produto, praça e os preços mínimo e máximo.' });
    return;
  }

  const supabase = getSupabase(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase.from('price_observations').insert({
    product,
    location,
    price_min: priceMin,
    price_max: priceMax,
    unit,
    observed_at: observedAt,
  });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ ok: true });
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  res.status(405).json({ error: 'Método não suportado.' });
};
