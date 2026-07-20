const { createClient } = require('@supabase/supabase-js');

const LOGO_BASE64 = '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';

const CATEGORY_ORDER = ['Mercado', 'Ureia', 'Fosfatados', 'Potássio', 'Comércio Exterior', 'Câmbio', 'Geopolítica', 'Logística'];

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'há 1 dia';
  return `há ${days} dias`;
}

function renderLead(item) {
  if (!item) return '';
  return `
    <a class="lead" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">
      <div class="kicker">${escapeHtml(item.category)}</div>
      <h1 class="lead-headline">${escapeHtml(item.title)}</h1>
      <p class="lead-excerpt">${escapeHtml(item.excerpt)}</p>
      <div class="byline">${escapeHtml(item.source)} · ${escapeHtml(timeAgo(item.pub_date))}</div>
    </a>`;
}

function renderBrief(item) {
  return `
    <!-- REPETIR ESTE BLOCO PARA CADA ITEM DO RELATÓRIO -->
    <a class="brief" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">
      <h3 class="brief-headline">${escapeHtml(item.title)}</h3>
      <p class="brief-excerpt">${escapeHtml(item.excerpt)}</p>
      <div class="byline">${escapeHtml(item.source)} · ${escapeHtml(timeAgo(item.pub_date))}</div>
    </a>
    <!-- FIM DO BLOCO REPETÍVEL -->`;
}

function renderSection(category, items) {
  if (items.length === 0) return '';
  return `
    <section class="section">
      <h2 class="section-title">${escapeHtml(category)}</h2>
      <div class="section-rule"></div>
      <div class="briefs">
        ${items.map(renderBrief).join('\n')}
      </div>
    </section>`;
}

function renderNewspaperHtml({ edicao, periodoReferencia, categoriaPrincipal, dataGeracao, lead, sections, totalItens }) {
  const sectionsHtml = sections.map(([cat, items]) => renderSection(cat, items)).join('\n');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PADAP · Jornal de Notícias — ${escapeHtml(dataGeracao)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --white:#FFFFFF;
    --dark-green:#123B32;
    --black:#161616;
    --accent:#2FAE0F;
    --gray:#E8ECE9;
    --gray-text:#6B7570;
    --rule:#161616;
    --max-w:1040px;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;}
  body{background:var(--white); color:var(--black); font-family:'Inter',system-ui,sans-serif; -webkit-font-smoothing:antialiased;}
  a{color:inherit; text-decoration:none;}
  .page{max-width:var(--max-w); margin:0 auto; padding:30px 24px 60px;}

  /* ---------- Masthead ---------- */
  .masthead{text-align:center;}
  .masthead img{height:30px; margin-bottom:10px;}
  .masthead .title{font-family:'Playfair Display',serif; font-weight:900; font-size:56px; letter-spacing:0.01em; color:var(--black); line-height:1;}
  .masthead .subtitle{font-size:12.5px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:var(--dark-green); margin-top:8px;}
  .rule-thick{border-top:4px solid var(--rule); margin-top:16px;}
  .rule-thin{border-top:1px solid var(--rule); margin-top:3px;}
  .edition-row{display:flex; justify-content:space-between; align-items:center; padding:8px 2px; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; color:var(--gray-text); border-bottom:2px solid var(--rule);}
  .print-btn{background:var(--dark-green); color:var(--white); border:none; border-radius:999px; padding:8px 16px; font-family:'Inter',sans-serif; font-weight:600; font-size:12.5px; cursor:pointer; text-transform:none; letter-spacing:normal;}
  .print-btn:hover{background:var(--black);}

  /* ---------- Lead story ---------- */
  .lead{display:block; padding:26px 0 22px; border-bottom:1px solid var(--gray);}
  .kicker{font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--accent); margin-bottom:8px;}
  .lead-headline{font-family:'Playfair Display',serif; font-weight:800; font-size:34px; line-height:1.15; color:var(--black); margin:0 0 12px;}
  .lead:hover .lead-headline{color:var(--dark-green);}
  .lead-excerpt{font-size:16px; line-height:1.6; color:#3a3a3a; margin:0 0 10px; max-width:760px;}
  .byline{font-size:11.5px; font-weight:600; color:var(--gray-text); text-transform:uppercase; letter-spacing:0.04em;}

  /* ---------- Sections ---------- */
  .sections{column-count:3; column-gap:32px; margin-top:8px;}
  @media (max-width:900px){ .sections{column-count:2;} }
  @media (max-width:640px){ .sections{column-count:1;} }
  .section{break-inside:avoid; margin-bottom:24px; display:inline-block; width:100%;}
  .section-title{font-family:'Playfair Display',serif; font-weight:800; font-size:16px; color:var(--dark-green); margin:0 0 4px; text-transform:uppercase; letter-spacing:0.03em;}
  .section-rule{border-top:2px solid var(--dark-green); margin-bottom:12px;}
  .briefs{display:flex; flex-direction:column; gap:16px;}
  .brief{display:block; break-inside:avoid;}
  .brief-headline{font-family:'Playfair Display',serif; font-weight:700; font-size:15px; line-height:1.3; color:var(--black); margin:0 0 5px;}
  .brief:hover .brief-headline{color:var(--dark-green);}
  .brief-excerpt{font-size:12.5px; line-height:1.5; color:var(--gray-text); margin:0 0 5px;}

  .empty-box{text-align:center; padding:60px 20px; color:var(--gray-text);}

  .colophon{margin-top:40px; border-top:2px solid var(--rule); padding-top:12px; text-align:center; font-size:11px; color:var(--gray-text); text-transform:uppercase; letter-spacing:0.05em;}

  @media print{
    .print-btn{display:none;}
    .section, .lead, .brief{break-inside:avoid;}
  }
</style>
</head>
<body>

<div class="page">
  <div class="masthead">
    <img src="data:image/png;base64,${LOGO_BASE64}" alt="PADAP">
    <div class="title">PADAP</div>
    <div class="subtitle">Jornal de Notícias do Mercado de Fertilizantes</div>
  </div>
  <div class="rule-thick"></div>
  <div class="rule-thin"></div>
  <div class="edition-row">
    <span>${escapeHtml(edicao)} · ${escapeHtml(periodoReferencia)}${categoriaPrincipal !== 'Todas' ? ' · ' + escapeHtml(categoriaPrincipal) : ''}</span>
    <button class="print-btn" onclick="window.print()">Imprimir / Salvar PDF</button>
  </div>

  ${totalItens === 0 ? `
  <div class="empty-box">
    <h2>Nenhuma notícia encontrada</h2>
    <p>Não há notícias salvas para esse filtro e período.</p>
  </div>` : `
  ${renderLead(lead)}
  <div class="sections">
    ${sectionsHtml}
  </div>`}

  <div class="colophon">PADAP Notícias do Mercado de Fertilizantes · Edição gerada automaticamente</div>
</div>

</body>
</html>
`;
}

module.exports = async function handler(req, res) {
  const category = typeof req.query.category === 'string' && req.query.category ? req.query.category : 'Todas';
  const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 365);

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from('news_items')
    .select('title, link, excerpt, source, category, pub_date')
    .gte('pub_date', since)
    .order('pub_date', { ascending: false })
    .limit(300);

  if (category !== 'Todas') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).send(`Erro ao gerar jornal: ${escapeHtml(error.message)}`);
    return;
  }

  const items = data || [];
  const lead = items[0];
  const rest = items.slice(1);

  const categoriesToShow = category === 'Todas' ? CATEGORY_ORDER : [category];
  const sections = categoriesToShow
    .map((cat) => [cat, rest.filter((it) => it.category === cat)])
    .filter(([, list]) => list.length > 0);

  const now = new Date();
  const periodoReferencia = days === 1 ? 'Últimas 24h' : days === 7 ? 'Últimos 7 dias' : `Últimos ${days} dias`;
  const edicao = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const html = renderNewspaperHtml({
    edicao,
    periodoReferencia,
    categoriaPrincipal: category,
    dataGeracao: now.toLocaleDateString('pt-BR'),
    lead,
    sections,
    totalItens: items.length,
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
