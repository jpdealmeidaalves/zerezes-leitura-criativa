# CLAUDE.md — contexto e regras para o agente

> Este arquivo é carregado automaticamente pelo Claude Code em toda sessão no
> projeto. Mantém a instância alinhada com o vocabulário, tom e arquitetura da
> zerezes sem precisar ser explicado de novo a cada rodada.

## contexto

plataforma multi-cliente de **leituras criativas editoriais** sobre mídia paga
(Meta Ads). cliente fundador: zerezes. o `index.html` na raiz é a edição viva
publicada na vercel (`zerezes-leitura-criativa.vercel.app`). a pasta `system/`
é o motor replicável (config por cliente + content por mês + template + build).

detalhe completo em [`system/README.md`](system/README.md) e [`system/docs/ARCHITECTURE.md`](system/docs/ARCHITECTURE.md).

## vocabulário obrigatório

| usar | NÃO usar |
| --- | --- |
| clássicos | bestsellers, best-seller, bestseller |
| entrantes | novos lançamentos, novos produtos |
| coleção | drop, lançamento (quando se refere a coleção) |
| Grau26 (nome próprio) | "grau 26" genérico em heading |

a configuração canônica fica em `system/clients/zerezes/config.json#voice.vocabulary`
e `#voice.forbidden`.

## datas são absolutas

estamos em **2026**. sempre escrever o ano por extenso — "abril de 2026", nunca
"abril" sozinho. o usuário corrigiu isso duas vezes no histórico; é regra firme.

## tom editorial

- "menos número, mais abstrato" — preferir frase com leitura que tabela cheia de
  métricas. números entram como evidência, não como foco.
- entregas grandes com autonomia são preferidas a micro-aprovações. quando em
  dúvida, fechar um bloco completo e mostrar inteiro.
- voz: editorial, lowercase em labels/seções, conversa respeitosa com
  criação/comunicação/studio.
- assinatura recorrente: `;;)`.

## arquitetura

```
config (por cliente) + content (por mês) → template → build → dist → vercel
           ↑                   ↑
   brand kit / mcps    motion · drive · canva
```

- **cliente = tenant.** tudo que muda entre clientes (paleta, voz,
  concorrentes, fontes) vive em `clients/<slug>/config.json`.
- **mcps são pluggable.** scripts em `system/scripts/pull-*.mjs` rodam "com mcp"
  (real) ou "stub" (local, fixtures).
- **mcp não é chamado no template/build.** só em `pull-*.mjs` ou step n8n.
- **output raiz é versionado.** `index.html` da raiz vai pro git porque é o
  target do Vercel.
- **`files/` é histórico imutável.** não editar edições anteriores (`report-v3`,
  `report-v4`…). para nova rodada, nova versão.

## comandos canônicos

```bash
# build de uma edição (valida config antes de renderizar)
node system/scripts/build.mjs --client zerezes --edition 2026-05

# build + copia pra raiz (alvo Vercel)
node system/scripts/build.mjs --client zerezes --edition 2026-05 --as-root

# só validar config
node system/scripts/validate-config.mjs --client zerezes

# puxar insights do motion (requer MCP conectado)
node system/scripts/pull-motion.mjs --client zerezes --edition 2026-05

# validar deploy
node system/scripts/deploy-check.mjs
```

## convenções

- `zerezes-imgs/*` são assets referenciados a partir da raiz do site.
- imagens de creators/concorrentes em alta resolução vêm do Motion
  (`motionswipefile.blob.core.windows.net`) e ficam referenciadas como URL
  absoluta — não baixar pro repo.
- ads próprios da zerezes → pasta mensal do Drive (`{MES_UPPER} {ANO}`),
  convenção `midia_{produto}_{tipo}_{etapa}_{formato}`.
- nomes literários das personas grau 26: **laura lufesi, túlio linare, letrux,
  philipp lavra**. 15 nomes de modelos (não 16).

## memória estendida

mais contexto em `.claude-memory/`:

- [`MEMORY.md`](.claude-memory/MEMORY.md) — índice dos arquivos de memória
- [`project_vocabulario.md`](.claude-memory/project_vocabulario.md) — fonte
  completa de vocabulário
- [`feedback_tone.md`](.claude-memory/feedback_tone.md) — tom preferido
- [`feedback_dates.md`](.claude-memory/feedback_dates.md) — regra de datas
- [`project_pipeline_leituras.md`](.claude-memory/project_pipeline_leituras.md) —
  pipeline de leituras
- [`reference_tools.md`](.claude-memory/reference_tools.md) — ferramentas de dados

## regras para o agente

1. nunca reintroduza "bestseller(s)" em output editorial. usar "clássicos".
2. nunca edite arquivos em `files/**` (histórico imutável).
3. quando for tocar no `index.html` da raiz, ao final lembre de rodar
   `node system/scripts/build.mjs --client zerezes --edition <yyyy-mm> --as-root`
   se a edição correspondente já tiver `content/<yyyy-mm>.json`.
4. credenciais ficam no n8n, nunca no repo. se pedirem pra commitar `.env`,
   recusar.
5. entregas longas e coerentes > micro-passos com perguntas de aprovação.
