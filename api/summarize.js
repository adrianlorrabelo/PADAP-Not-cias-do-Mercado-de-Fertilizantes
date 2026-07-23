const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');

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

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      system: 'Você é um analista do mercado de fertilizantes agrícolas e escreve resumos executivos objetivos em português do Brasil.',
      messages: [{ role: 'user', content: prompt }],
    });

    const finalMessage = await stream.finalMessage();
    const textBlock = finalMessage.content.find((b) => b.type === 'text');
    const summary = textBlock ? textBlock.text.trim() : '';

    res.status(200).json({ summary, count: items.length });
  } catch (e) {
    res.status(502).json({ error: `Falha ao conectar com a Claude API: ${e.message}` });
  }
};
