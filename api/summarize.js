const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');

// Teto de gerações novas por dia (chamadas que de fato batem na API da
// Claude) — protege contra abuso/custo, já que o endpoint é público e sem
// autenticação. Pedidos repetidos pro mesmo período são servidos do cache
// em `news_summaries` e não contam pra esse limite.
const DAILY_GENERATION_LIMIT = 30;

function cleanText(str) {
  return String(str || '').replace(/\s+/g, ' ').trim();
}

module.exports = async function handler(req, res) {
  const from = typeof req.query.from === 'string' ? req.query.from : '';
  const to = typeof req.query.to === 'string' ? req.query.to : '';

  if (!from || !to) {
    res.status(400).json({ error: 'Parâmetros "from" e "to" (datas) são obrigatórios.' });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada no servidor.' });
    return;
  }

  const fromIso = new Date(`${from}T00:00:00`).toISOString();
  const toIso = new Date(`${to}T23:59:59`).toISOString();

  // Service role: além de ler notícias, precisa gravar no cache de resumos.
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: cached } = await supabase
    .from('news_summaries')
    .select('summary, news_count')
    .eq('from_date', from)
    .eq('to_date', to)
    .maybeSingle();

  if (cached) {
    res.status(200).json({ summary: cached.summary, count: cached.news_count, cached: true });
    return;
  }

  const oneDayAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: generatedToday } = await supabase
    .from('news_summaries')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', oneDayAgoIso);

  if ((generatedToday || 0) >= DAILY_GENERATION_LIMIT) {
    res.status(429).json({ error: 'Limite diário de resumos por IA atingido. Tente novamente mais tarde.' });
    return;
  }

  const { data, error } = await supabase
    .from('news_items')
    .select('title, excerpt, category, source, pub_date')
    .gte('pub_date', fromIso)
    .lte('pub_date', toIso)
    .order('pub_date', { ascending: false })
    .limit(80);

  if (error) {
    res.status(500).json({ error: `Erro ao buscar notícias: ${error.message}` });
    return;
  }

  const items = data || [];
  if (items.length === 0) {
    res.status(200).json({ summary: '', count: 0 });
    return;
  }

  const bulletList = items
    .slice(0, 60)
    .map((it) => `- [${cleanText(it.category)}] ${cleanText(it.title)} — ${cleanText(it.excerpt).slice(0, 200)} (Fonte: ${cleanText(it.source)})`)
    .join('\n');

  const prompt = `Abaixo está uma lista de notícias do mercado de fertilizantes agrícolas no Brasil, coletadas entre ${from} e ${to}. Escreva um resumo executivo em português, em um único parágrafo objetivo (4 a 6 frases), destacando os principais movimentos e tendências do período — preços, câmbio, geopolítica, logística, oferta e demanda. Não liste as notícias uma a uma, sintetize. Responda só com o parágrafo, sem título e sem introdução.

Notícias:
${bulletList}`;

  try {
    const anthropic = new Anthropic();

    const stream = anthropic.messages.stream({
      model: 'claude-opus-5',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      system: 'Você é um analista do mercado de fertilizantes agrícolas e escreve resumos executivos objetivos em português do Brasil.',
      messages: [{ role: 'user', content: prompt }],
    });

    const finalMessage = await stream.finalMessage();
    const textBlock = finalMessage.content.find((b) => b.type === 'text');
    const summary = textBlock ? textBlock.text.trim() : '';

    if (summary) {
      await supabase
        .from('news_summaries')
        .upsert(
          { from_date: from, to_date: to, summary, news_count: items.length },
          { onConflict: 'from_date,to_date' },
        );
    }

    res.status(200).json({ summary, count: items.length });
  } catch (e) {
    res.status(502).json({ error: `Falha ao conectar com a Claude API: ${e.message}` });
  }
};
