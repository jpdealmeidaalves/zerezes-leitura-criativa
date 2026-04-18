# nova edição mensal — checklist

passo a passo para produzir a leitura criativa do próximo mês. assume que o cliente já existe em `system/clients/<slug>/`.

## pré-requisitos

- `clients/<slug>/config.json` preenchido e validado
- pasta mensal no drive existe e tem os assets hi-res do studio
- workspace motion com dados do mês fechados (pelo menos os primeiros 15 dias)

## fluxo

### 1. pull de dados (automatizável)

```bash
# da raiz do repo
node system/scripts/pull-motion.mjs --client zerezes --edition 2026-05
node system/scripts/pull-drive.mjs  --client zerezes --edition 2026-05
```

saída:

- `clients/zerezes/content/2026-05.motion-snapshot.json` — raw do motion
- `clients/zerezes/assets/2026-05/` — assets baixados do drive

em produção, o n8n faz isto no 1º dia útil do mês.

### 2. content draft (automatizável parcial)

```bash
node system/scripts/draft-content.mjs --client zerezes --edition 2026-05
```

saída: `clients/zerezes/content/2026-05.json` com:

- seção 00 (resumo) — auto-preenchido com top findings dos insights motion
- seção 02 (funil) — auto-preenchido com split spend topo/meio/fundo + lista de assets
- seção 03 (heatmap) — auto-preenchido com matriz cluster × etapa
- seção 04 (coleção) — lista de modelos com spend por modelo
- seções 01, 05, 06, 07, 08, 09, 10 — **stubs esperando revisão editorial humana**

### 3. revisão editorial (humano — mídia)

abre `clients/<slug>/content/<edition>.json` e preenche:

- seção 01 (tese) — qual a narrativa central do mês? 1 parágrafo + 1 pull quote
- seção 05 (mercado) — o que cada concorrente disse de novo este mês? 1 bloco por concorrente
- seção 06 (palavras) — tabela comparativa de copy (título/headline de cada marca)
- seção 07 (anatomia) — se vale repetir o template do mês anterior ou atualizar
- seção 08 (apostas) — 5 a 7 apostas concretas pro mês seguinte, cada uma com:
  - qual ativação
  - por que agora
  - qual cluster/funil
  - quem executa (criação/studio/mídia)
- seção 09 (checklist) — derivável da seção 08
- seção 10 (outras frentes) — coleções/ativações fora do foco central

**regra de ouro:** as seções 00–04 são evidência; 05–10 são interpretação. a automação faz evidência, o humano faz interpretação.

### 4. build

```bash
node system/scripts/build.mjs --client zerezes --edition 2026-05
```

saída: `dist/zerezes/2026-05/index.html`. em modo "produção zerezes" (padrão), também sobrescreve `/index.html` na raiz para manter o deploy `zerezes-leitura-criativa.vercel.app` no ar.

### 5. canva — capa pdf + deck

```bash
node system/scripts/generate-canva.mjs --client zerezes --edition 2026-05 --kind capa-pdf,deck
```

sobe capa pdf pra `dist/zerezes/2026-05/capa.pdf` e deck pra `dist/zerezes/2026-05/deck.pptx`.

### 6. deploy

```bash
git add -A
git commit -m "leitura: zerezes/2026-05"
git push origin main
```

vercel deploya automaticamente. aguarda ~45s.

### 7. validação

```bash
node system/scripts/deploy-check.mjs --client zerezes
```

confirma que o deploy subiu, pega url de produção, checa status 200 no endpoint raiz.

### 8. distribuição

compartilha o link com o time:

- criação & comunicação — link da leitura
- studio — link + checklist (seção 09) filtrado em "responsabilidade: studio"
- liderança — deck canva (versão condensada 16:9)

## tempo estimado por etapa

| etapa                    | manual hoje | com automação (meta) |
| ------------------------ | ----------- | -------------------- |
| pull dados + screenshots | 90min       | 0 (n8n)              |
| content draft            | 60min       | 0 (n8n)              |
| revisão editorial        | 90min       | 60min                |
| build + deploy           | 30min       | 5min                 |
| canva                    | 45min       | 10min                |
| validação + distribuição | 15min       | 5min                 |
| **total**                | **~5h**     | **~80min**           |

## antipadrões (não fazer)

- editar `/index.html` na raiz diretamente — edita em `content/<edition>.json` e roda build.
- commitar assets temporários do drive em `clients/*/assets/` se não for pra usar na leitura.
- rodar `build.mjs` sem ter o `.motion-snapshot.json` — quebra reprodutibilidade.
- mexer em `lib/` pra customização de cliente — lib é motor, customização vive em `config.json`.
