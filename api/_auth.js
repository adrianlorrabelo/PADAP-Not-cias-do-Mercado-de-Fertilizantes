const { createClient } = require('@supabase/supabase-js');

// Valida o token Supabase enviado pelo frontend (Authorization: Bearer <token>)
// depois que o usuário faz login. Usado por todos os endpoints que exigem
// autenticação (o site inteiro, exceto o cron que usa CRON_SECRET).
async function requireUser(req, res) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Não autenticado.' });
    return null;
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    return null;
  }
  return data.user;
}

module.exports = { requireUser };
