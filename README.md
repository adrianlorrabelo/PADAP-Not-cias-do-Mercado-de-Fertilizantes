# PADAP · Notícias do Mercado de Fertilizantes

Painel web (arquivo único, `index.html`) que exibe notícias recentes sobre o
mercado de fertilizantes em formato de cards clicáveis, com a identidade
visual da PADAP.

## O que o projeto faz

- Busca notícias em português em 8 frentes: mercado geral, ureia, fosfatados
  (MAP/DAP), potássio, comércio exterior, câmbio, geopolítica e logística.
- Usa o Google Notícias como fonte, via a API pública `rss2json.com` (sem
  necessidade de chave de API).
- Mostra cards clicáveis — cada um abre a notícia original em nova aba, com
  o nome da fonte.
- Filtros por categoria no topo.
- Atualização automática a cada 12h se a página ficar aberta, mais um botão
  "Atualizar" manual.
- Visual: fundo branco, logo da PADAP (embutida em base64 dentro do HTML),
  tipografia Sora (títulos) + Inter (texto), verde da marca como destaque.
- 100% front-end: não precisa de backend, banco de dados nem build step.
  É só um arquivo HTML que roda em qualquer navegador quando hospedado
  via HTTPS (não funciona aberto localmente com `file://` por causa de
  bloqueio de CORS do navegador).

## Estrutura

```
padap-noticias/
├── index.html   # o app inteiro (HTML + CSS + JS + logo embutida)
└── README.md    # este arquivo
```

## O que pedir ao Claude Code

Cole algo como isto para o Claude Code, na pasta onde extraiu este projeto:

> Este é o projeto "PADAP Notícias de Fertilizantes", um painel estático
> em `index.html`. Quero que você:
> 1. Inicialize um repositório git aqui.
> 2. Crie um repositório novo no GitHub chamado `padap-noticias` (via `gh`)
>    e faça o push do conteúdo.
> 3. Ative o GitHub Pages apontando para a branch principal, servindo a
>    raiz do repositório.
> 4. Me devolva a URL final publicada.

Depois disso, para futuras alterações (cores, termos de busca, categorias,
layout dos cards), basta pedir ao Claude Code para editar o `index.html` e
dar `git push` de novo — o GitHub Pages atualiza sozinho.

## Possíveis evoluções (para pedir ao Claude Code depois)

- Trocar/adicionar termos de busca por categoria (editar o array `FEEDS`
  no `<script>` do `index.html`).
- Adicionar um domínio próprio ao GitHub Pages.
- Trocar a fonte de notícias por uma API paga/mais robusta, se o volume
  de acessos crescer (o rss2json tem limite gratuito diário).
- Guardar histórico de notícias (hoje o app não persiste nada, só mostra
  o que está disponível no momento da visita).
