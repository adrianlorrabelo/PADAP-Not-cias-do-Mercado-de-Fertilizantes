const { createClient } = require('@supabase/supabase-js');
const { requireUser } = require('./_auth');

module.exports = async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  const category = typeof req.query.category === 'string' ? req.query.category : '';
  const limit = Math.min(Number(req.query.limit) || 200, 500);

  let query = supabase
    .from('news_items')
    .select('title, link, excerpt, source, category, pub_date')
    .order('pub_date', { ascending: false })
    .limit(limit);

  if (category && category !== 'Todas') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800');
  res.status(200).json({ items: data });
};
