# PADAP · Notícias do Mercado de Fertilizantes

Painel web que exibe notícias sobre o mercado de fertilizantes em formato de
cards clicáveis, com a identidade visual da PADAP, e mantém um **histórico
permanente** das notícias (mesmo depois que elas saem do radar do Google
Notícias).

## O que o projeto faz

- Busca notícias em português em 8 frentes: mercado geral, ureia, fosfatados
  (MAP/DAP), potássio, comércio exterior, câmbio, geopolítica e logística.
- Usa o Google Notícias como fonte, buscando o RSS diretamente do servidor
  (sem depender de serviços gratuitos de terceiros como o rss2json).
- Um cron job da Vercel roda 1x por dia, busca notícias novas e salva num
  banco de dados Supabase — notícias antigas nunca são perdidas.
- O frontend (`index.html`) só lê o que já está salvo no banco, via
  `/api/news` — rápido e sem depender de APIs externas a cada visita.
- Mostra cards clicáveis — cada um abre a notícia original em nova aba, com
  o nome da fonte.
- Filtros por categoria no topo.
- Visual: fundo branco, logo da PADAP (embutida em base64 dentro do HTML),
  tipografia Sora (títulos) + Inter (texto), verde da marca como destaque.
- Acesso restrito por login (Supabase Auth) — sem cadastro público, os
  usuários são criados manualmente por quem administra o projeto.

## Arquitetura

```
padap-noticias/
├── index.html                  # frontend (HTML + CSS + JS + logo embutida)
├── api/
│   ├── cron-fetch-news.js      # busca RSS do Google Notícias e salva no Supabase
│   └── news.js                 # lê o Supabase e devolve JSON pro frontend
├── supabase/
│   └── schema.sql               # tabela news_items + RLS
├── vercel.json                  # agenda o cron (1x/dia)
├── package.json                 # dependências das funções serverless
└── .env.example                 # variáveis de ambiente necessárias
```

## Setup (você precisa fazer isso manualmente — contas e segredos não
podem ser criados por mim)

### 1. Criar o projeto no Supabase

1. Crie uma conta/projeto em [supabase.com](https://supabase.com) (plano
   gratuito é suficiente).
2. Abra o **SQL Editor** do projeto e rode o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql).
3. Em **Project Settings → API**, copie:
   - `Project URL` → variável `SUPABASE_URL`
   - `anon public` key → variável `SUPABASE_ANON_KEY`
   - `service_role` key → variável `SUPABASE_SERVICE_ROLE_KEY` (⚠️ nunca
     exponha essa chave no frontend, só em variáveis de ambiente do
     servidor)

### 2. Criar os usuários que terão acesso ao painel

O site inteiro (notícias, jornal e preços) fica atrás de login — não existe
cadastro público, então você controla quem entra criando os usuários
manualmente:

1. No painel do Supabase, vá em **Authentication → Users → Add user**.
2. Preencha e-mail e senha de cada pessoa que deve ter acesso (marque
   "Auto Confirm User" para não depender de e-mail de confirmação).
3. Para remover o acesso de alguém, basta excluir o usuário na mesma tela.

### 3. Criar o projeto na Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) e importe este
   repositório Git (crie o repositório no GitHub primeiro, se ainda não
   existir).
2. Em **Project Settings → Environment Variables**, adicione:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET` (qualquer string aleatória e secreta, ex: um UUID)
3. Faça o deploy. O cron configurado em `vercel.json` passa a rodar
   automaticamente todo dia às 9h (horário UTC).

> **Nota sobre o plano gratuito (Hobby) da Vercel:** cron jobs no plano
> gratuito rodam no máximo 1x por dia. Se precisar de atualizações mais
> frequentes, é necessário o plano Pro (aí dá pra rodar a cada poucas
> horas).

### 4. Rodar localmente (opcional)

```bash
npm install
cp .env.example .env.local   # preencha com os valores do Supabase
npx vercel dev
```

Isso sobe o `index.html` e as funções `/api/*` localmente, simulando o
ambiente da Vercel.

## Possíveis evoluções

- Botão para forçar uma busca imediata (endpoint separado, protegido, que
  dispara o mesmo código do `cron-fetch-news.js` sob demanda).
- Trocar/adicionar termos de busca por categoria (editar o array `FEEDS`
  em `api/cron-fetch-news.js`).
- Adicionar um domínio próprio no projeto Vercel.
- Personalizar por consultor ou marcar notícias como lidas usando o usuário
  autenticado (o login com Supabase Auth já existe).
