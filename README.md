# PADAP Intelligence — Compras & Precificação

Aplicação web interna para compras, precificação, inteligência de mercado, propostas, pacotes comerciais, aprovações e mensagens comerciais para WhatsApp.

## Como rodar

```bash
npm install
npm run dev
```

Depois abra a URL exibida pelo Vite. Neste workspace revisado, o servidor está rodando em:

```text
http://127.0.0.1:5189/
```

Para validar produção:

```bash
npm run build
```

## Usuários mockados

- Administrador Geral: `admin@padap.com.br` / `admin123`
- Gestor / Gerente: `gestor@padap.com.br` / `gestor123`
- Compras / Precificação: `compras@padap.com.br` / `compras123`
- Consultor: `consultor@padap.com.br` / `consultor123`
- Visualizador: `visualizador@padap.com.br` / `viewer123`

## Permissões por perfil

- Administrador Geral: acesso total, usuários, configurações críticas, importação, propostas, pacotes, aprovações e relatórios completos.
- Gestor / Gerente: propostas, pacotes, aprovações, clientes, consultores, relatórios, inteligência de mercado e dados internos.
- Compras / Precificação: importar tabela, criar propostas, criar pacotes, ver custos/margens operacionais, clientes e mercado. Não aprova margem abaixo da meta.
- Consultor: vê somente propostas e clientes vinculados, status e mensagem comercial. Não vê custo, margem, comissão, impostos ou tela de importação.
- Visualizador: cockpit, inteligência de mercado e relatórios. Não altera dados.

## Funcionalidades funcionando na v1

- Login/logout mockado com sessão em LocalStorage.
- Rotas protegidas por perfil.
- Sidebar recolhível com preferência persistida.
- Sidebar mobile.
- Cockpit executivo com KPIs, semáforo comercial e ações recomendadas.
- Inteligência de mercado mockada com gráficos Recharts.
- Tabela semanal Yara com importação `.xlsx`/`.csv` via SheetJS e validações.
- Propostas com cálculo de custo final, preço mínimo, preço sugerido, margem e status.
- Pacotes comerciais com margem total, falta para meta e status.
- Aprovações com timeline e decisões simuladas.
- Clientes e consultores com dados mockados.
- Relatórios com filtros e exportações simuladas.
- Configurações persistidas no LocalStorage, com edição crítica restrita.
- Mensagens de WhatsApp sem custo, margem, comissão ou impostos.
- Toast global para ações simuladas.

## Preparado para evolução futura

- Backend Node.js/PostgreSQL/Prisma.
- Ajuste fino do layout real da planilha Yara/PADAP quando o arquivo sample for anexado.
- Exportação real de PDF/Excel.
- Integração com APIs de PTAX, mercado, notícias e web scraping.
- Auditoria persistente de aprovações e alterações críticas.
- Code splitting para reduzir o chunk inicial do bundle.

## Logo oficial

Coloque a logo oficial em:

```text
src/assets/logo/padap-logo.png
```

Enquanto a logo não existir, o componente `BrandLogo` usa um fallback textual premium.
