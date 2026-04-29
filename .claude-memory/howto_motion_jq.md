---
name: howto_motion_jq
description: receitas jq para parsear payloads grandes do Motion MCP salvos em tool-results/
type: howto
---

Quando `get_creative_insights` retorna payload acima do limite de tokens, o resultado fica gravado em `tool-results/*.txt` (string JSON). Use jq pra extrair só o que precisar, em vez de tentar `Read` o arquivo inteiro.

## convencao do arquivo

`tool-results/<tool>-<id>.txt` contem **uma string JSON** (não JSON puro). Dois passos: extrair string → parsear JSON.

```bash
# extrai conteudo JSON cru
cat tool-results/get_creative_insights-XXXX.txt | jq -r .
```

## receitas canonicas

### 1. listar todos os ads ativos com spend e CTR
```bash
jq -r '
  .ads[]
  | select(.spend > 0)
  | "\(.spend|floor) \t \(.ctr|tonumber*100|floor/100)%\t \(.name)"
' tool-results/get_creative_insights-XXXX.json | sort -rn | head -30
```

### 2. extrair URLs motionaccountassets (fallback de thumbnail)
Quando `pubUrl/thumbnailUrl` vem null pra ads novos:

```bash
grep -oE 'https://motionaccountassets\.blob\.core\.windows\.net/[^"]+' \
  tool-results/get_creative_insights-XXXX.txt \
  | sort -u
```

Sub-asset ID = creativeAssetId + 1 (hex). Ex: asset `692b56` → imagem em `692b57/image.jpg`.

### 3. mapear creativeAssetId → ad name (pra cruzar com URLs)
```bash
jq -r '
  .ads[]
  | "\(.creativeAssetId) \(.name)"
' tool-results/get_creative_insights-XXXX.json
```

## fluxo recomendado

1. Roda `get_creative_insights` com `insightType=SPEND` (sempre primeiro — protocolo SPEND-first).
2. Se payload exceder, ele cai automaticamente em `tool-results/`.
3. `jq` pra triar; nunca tenta `Read` direto — derrota o objetivo de não estourar contexto.
4. Pra thumbnails sumidos, use `system/scripts/_thumbnails.mjs` (helper já versionado).

## referencias cruzadas

- `reference_tools.md` — pattern motionaccountassets completo
- `system/scripts/_thumbnails.mjs` — implementação do fallback
- protocolo SPEND-first descrito em `project_pipeline_leituras.md`
