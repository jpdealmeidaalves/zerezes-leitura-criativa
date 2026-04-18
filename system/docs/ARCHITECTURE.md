# arquitetura

## visão em uma imagem

```
┌─────────────────┐       ┌────────────────┐       ┌──────────────┐
│  motion mcp     │──────▶│                │       │              │
│  (insights,     │       │                │       │              │
│   transcripts,  │       │   build.mjs    │──────▶│  dist/       │
│   competitors)  │       │                │       │  index.html  │
└─────────────────┘       │                │       │              │
                          │                │       └──────┬───────┘
┌─────────────────┐       │   consome:     │              │
│  drive mcp      │──────▶│   - config     │              ▼
│  (assets hi-res │       │   - content    │       ┌──────────────┐
│   da pasta do   │       │   - template   │       │ git push     │
│   mês)          │       │   - lib/       │       │ main         │
└─────────────────┘       │                │       └──────┬───────┘
                          │                │              │
┌─────────────────┐       │                │              ▼
│  canva mcp      │──────▶│                │       ┌──────────────┐
│  (mockups, capa │       │                │       │  vercel      │
│   pdf, deck)    │       │                │       │  deploy      │
└─────────────────┘       └────────────────┘       └──────┬───────┘
                                                          │
┌─────────────────┐                                       ▼
│  n8n            │──── orquestra tudo acima      ┌──────────────┐
│  scheduled      │     no 1º dia útil do mês     │  vercel mcp  │
│  trigger        │                                │  deploy      │
│  (mensal)       │                                │  check       │
└─────────────────┘                                └──────────────┘
```

## camadas

### 1. fontes (mcps)

cada mcp é uma fonte de dado ou destino. nenhum script chama mcp diretamente — passam pelo wrapper em `scripts/pull-*.mjs` que expõe função idempotente. detalhe em [`MCPS.md`](MCPS.md).

- **motion** — insights de criativos, transcripts, demographics, concorrentes do workspace
- **drive** — assets estáticos (hi-res jpg/png) produzidos pelo studio, por pasta mensal
- **canva** — geração de mockups e capa de PDF; consome brand kit
- **vercel** — deploy + logs runtime
- **github** — versionamento do output + trigger implícito do vercel
- **n8n** — orquestrador do fluxo mensal (não é fonte, é glue)

### 2. tenant (cliente)

cada cliente vive em `clients/<slug>/` com:

- `config.json` — validado contra `config.schema.json`. define brand kit, fontes conectadas, concorrentes a analisar, voz editorial, coleções conhecidas, personas da marca.
- `content/<ano>-<mes>.json` — dados editoriais da edição: headline, seções, pull quotes, assets selecionados. parte disto é gerada (`pull-motion`), parte é escrita por humano.
- `assets/` — referência simbólica. os arquivos físicos continuam em `zerezes-imgs/` na raiz para não quebrar o `index.html` atual. em v2 do build, `assets/` pode ser symlink ou download real.

### 3. template

`template/index.template.html` — um único template html com placeholders `{{}}` (sintaxe simples, sem handlebars ainda — substituição de strings). campos disponíveis:

- `{{client.name}}`, `{{client.tagline}}`, `{{client.brand.palette.*}}`
- `{{edition.title}}`, `{{edition.period}}`, `{{edition.sections[]}}`
- `{{sections.resumo}}`, `{{sections.tese}}`, etc.

o template inclui `lib/leitura.css` e `lib/leitura.js` via `<link>` e `<script>` — não inline. isso deixa o css cacheável entre edições.

### 4. build

`scripts/build.mjs` — node esm, sem dependência.

1. lê `clients/<slug>/config.json` e valida contra schema
2. lê `clients/<slug>/content/<edition>.json`
3. lê `template/index.template.html`
4. resolve placeholders
5. emite `dist/<slug>/<edition>/index.html` + copia `lib/` e `assets/`
6. opcionalmente substitui `/index.html` na raiz (só para o deploy atual do zerezes)

### 5. deploy

git push em `main` → vercel deploya automaticamente. `scripts/deploy-check.mjs` usa o vercel mcp pra confirmar que o deploy subiu e pegar logs se falhou.

### 6. orquestração (n8n)

`workflows/n8n-monthly-leitura.json` define um workflow disparado no 1º dia útil do mês. passos:

1. pull motion insights do mês anterior
2. pull drive assets da pasta do mês
3. gera draft de `content/<ano>-<mes>.json` com seções 00–04 pré-preenchidas (resumo, tese, funil, heatmap, coleção — baseadas em dado)
4. abre PR no github pedindo revisão humana das seções 05–10 (mercado, palavras, anatomia, apostas, checklist, outras frentes — exigem olhar editorial)
5. quando PR é mergeado, build + deploy automaticamente
6. envia notificação (slack/email) com link pro vercel

humano revisa, edita, aprova — não escreve do zero.

## separation of concerns

| camada           | responsabilidade                                     | mutável entre clientes? |
| ---------------- | ---------------------------------------------------- | ----------------------- |
| `lib/`           | estilo visual base (css, js scroll-spy, fallbacks)   | não — é o motor         |
| `template/`      | esqueleto estrutural das leituras                    | não — é o motor         |
| `scripts/`       | pipelines de automação                               | não — é o motor         |
| `clients/*/`     | tudo específico do tenant                            | sim — um por cliente    |
| `dist/`          | output buildado                                      | gerado                  |

## replicabilidade

**novo mês (mesmo cliente):**
- cria `clients/zerezes/content/maio-2026.json` (seed automático via n8n)
- revisa editorialmente
- build + push
- ~1h de trabalho humano vs ~4h hoje

**novo cliente:**
- cria `clients/<slug>/config.json` (30 min preenchendo)
- conecta mcps (drive folder id, motion workspace, etc)
- roda primeira edição manualmente pra validar
- a partir da 2ª edição, entra no fluxo n8n
- guia completo em [`NEW_CLIENT.md`](NEW_CLIENT.md)

## não-objetivos desta fase

- migrar `index.html` atual (861 linhas inline) para o template. o atual fica estável pro deploy zerezes/abril. a migração acontece naturalmente na próxima edição (maio) quando o template já estiver exercitado.
- substituir o html por framework (next/astro). o ganho não justifica o custo — html estático puro é robusto, rápido, printável em pdf.
- generalizar antes de ter o 2º cliente. só abstrair quando a duplicação aparecer de verdade.
