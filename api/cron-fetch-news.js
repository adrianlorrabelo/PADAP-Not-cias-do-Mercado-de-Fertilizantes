const { createClient } = require('@supabase/supabase-js');
const { XMLParser } = require('fast-xml-parser');

const FEEDS = [
  { q: 'fertilizantes mercado preço', cat: 'Mercado' },
  { q: 'ureia preço Brasil', cat: 'Ureia' },
  { q: 'MAP DAP fosfato fertilizante', cat: 'Fosfatados' },
  { q: 'cloreto de potássio KCl fertilizante', cat: 'Potássio' },
  { q: 'exportação importação fertilizantes Brasil', cat: 'Comércio Exterior' },
  { q: 'dólar câmbio agronegócio', cat: 'Câmbio' },
  { q: 'China Rússia fertilizantes exportação restrição', cat: 'Geopolítica' },
  { q: 'porto frete logística fertilizantes Brasil', cat: 'Logística' },
];

const HTML_ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'" };

function stripHtml(html) {
  return (html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#39|nbsp|amp|lt|gt|quot|apos);/g, (_, e) => HTML_ENTITIES[e])
    .replace(/\s+/g, ' ')
    .trim();
}

function hostFromUrl(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAndParseFeed(feed) {
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(feed.q)}+when:7d&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
  const res = await fetch(rssUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PadapNoticiasBot/1.0)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ao buscar "${feed.q}"`);

  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);
  const rawItems = parsed?.rss?.channel?.item;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  return items
    .map((it) => {
      const link = typeof it.link === 'string' ? it.link : '';
      const title = typeof it.title === 'string' ? it.title : '';
      const source = (it.source && (it.source['#text'] || it.source)) || hostFromUrl(link) || 'Fonte';
      return {
        link,
        title,
        excerpt: stripHtml(it.description).slice(0, 180),
        source: typeof source === 'string' ? source : hostFromUrl(link) || 'Fonte',
        category: feed.cat,
        pub_date: it.pubDate ? new Date(it.pubDate).toISOString() : null,
      };
    })
    .filter((it) => it.link && it.title);
}

function brDateToIso(brDate) {
  const [day, month, year] = brDate.split('/');
  return `${year}-${month}-${day}`;
}

async function fetchAndStorePtax(supabase) {
  const res = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/1?formato=json');
  if (!res.ok) throw new Error(`HTTP ${res.status} ao buscar PTAX no Banco Central`);
  const data = await res.json();
  const latest = Array.isArray(data) ? data[0] : null;
  if (!latest) throw new Error('Resposta vazia da API do Banco Central');

  const { error } = await supabase
    .from('economic_indicators')
    .upsert(
      {
        indicator: 'PTAX',
        value: Number(latest.valor),
        observed_at: brDateToIso(latest.data),
        source: 'Banco Central (PTAX)',
      },
      { onConflict: 'indicator,observed_at', ignoreDuplicates: true },
    );
  if (error) throw error;
}

module.exports = async function handler(req, res) {
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || req.headers['authorization'] !== expected) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  let upserted = 0;
  const errors = [];

  for (const feed of FEEDS) {
    try {
      const rows = await fetchAndParseFeed(feed);
      if (rows.length > 0) {
        const { error } = await supabase
          .from('news_items')
          .upsert(rows, { onConflict: 'link', ignoreDuplicates: true });
        if (error) throw error;
        upserted += rows.length;
      }
    } catch (e) {
      errors.push({ feed: feed.q, error: String(e) });
    }
    await sleep(300);
  }

  try {
    await fetchAndStorePtax(supabase);
  } catch (e) {
    errors.push({ feed: 'PTAX (Banco Central)', error: String(e) });
  }

  res.status(200).json({ ok: true, upserted, errors });
};
