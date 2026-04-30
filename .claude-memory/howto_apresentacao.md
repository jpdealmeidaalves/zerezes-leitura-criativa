---
name: howto_apresentacao
description: como gerar a apresentação institucional (formato Book Digital · Fechamento Mensal · Mídia) a partir de uma leitura criativa
type: howto
---

> **Resumo de uma linha:** rode `build-apresentacao.mjs --client zerezes --edition <YYYY-MM>` e o HTML/PDF sai em `apresentacoes/<edicao>/midia-fechamento-mensal.html`.

## quando usar

Quando o usuário pedir "gera a apresentação de [mês]" ou "adapta a leitura criativa para o formato apresentação". Gabarito interno consolidado, espelha o **Book Digital · Fechamento Mensal** que o time já usa (referência: PDF de março 2026 no Drive, id `1_M2UHN0l5_hfgNCHuqxYMgJpQNjF4_ZN`).

## o gabarito (5 sub-seções fixas)

```
1. KPIs                     ← números do mês na disciplina (sem R$)
2. Destaques Positivos      ← peças que funcionaram, agrupadas por linha
3. Destaques Negativos      ← peças que não performaram + buracos de cobertura
4. Benchmarks               ← concorrentes com tag [Marca] + tese curta
5. Oportunidades & Testes   ← hipóteses numeradas com janela [maio]/[junho]
```

Visual: paleta brandbook clássico Zerezes (verde `#80AA9D`, azul `#5F8DB5`, cinza `#C1C6BF`, preto), tipografia Plus Jakarta Sans, A4 landscape.

## contrato de pedido

Quando o usuário chamar pra gerar, responder com `AskUserQuestion` se faltar campo. O pedido completo é:

```
edição:    YYYY-MM            # mês-fonte (obrigatório)
estilo:    fechamento-mensal  # default; outros: futuro
janela:    maio               # nome da janela de "próximos testes"
notas:     ...                # opcional
```

## comando canônico

```bash
node system/scripts/build-apresentacao.mjs \
  --client zerezes \
  --edition 2026-04 \
  --estilo fechamento-mensal \
  --janela maio
```

Saída: `apresentacoes/2026-04/midia-fechamento-mensal.html`. Para PDF, abrir no navegador → Print → Save as PDF (A4 landscape, sem margens, ativar "background graphics").

## pré-requisitos

- `system/clients/<client>/content/<edicao>.json` precisa existir.
  - **Abril 2026:** rodar `node system/scripts/extract-april.mjs --client zerezes` (one-shot, já feito; só re-rodar se editar `index.html`).
  - **Edições novas (maio em diante):** vem do fluxo normal `pull-motion` → `draft-content`.
- `cfg.presentation.palette` e `cfg.presentation.fonts` no `config.json` (já configurados pra Zerezes).
- Lint passa (sem `voice.forbidden`, sem typos).

## anatomia do `content/<edicao>.json` para a apresentação

A apresentação consome **5 sub-seções dentro de `sections.*`**:

```json
{
  "sections": {
    "kpis":                 { "kicker", "title", "metrics": [...], "lead_html" },
    "destaques_positivos":  { "kicker", "title", "grupos": [{"linha", "pecas": [{"nome","data","cap","pontos":[]}]}] },
    "destaques_negativos":  { "kicker", "title", "grupos": [...] },
    "benchmarks":           { "kicker", "title", "items": [{"tag","tese"}] },
    "oportunidades_testes": { "kicker", "title", "hipoteses": [{"tag","titulo","descricao"}] }
  }
}
```

Edições novas que ainda não trazem essas 5 sub-seções podem co-existir com as seções da leitura criativa longa (`resumo`, `tese`, `funil`, `mercado`, `apostas`, `outras_frentes`). Estratégia recomendada: **adicionar as 5 sub-seções de apresentação no mesmo `content/<edicao>.json`** — não precisa de arquivos separados.

## fluxo recomendado pelo agente

1. Confirmar com `AskUserQuestion` qualquer campo do contrato faltante.
2. Verificar se `content/<edicao>.json` existe e tem as 5 sub-seções:
   - se sim → buildar direto
   - se faltar parte do conteúdo → autorar primeiro, lintar, buildar
3. Rodar `build-apresentacao.mjs`.
4. Listar pro usuário os 3-5 pontos editoriais que decidiu (qual peça classificar como positiva/negativa, quais hipóteses priorizar).
5. Push opcional pro Drive na pasta do mês via Drive MCP.

## decisões editoriais por sub-seção

- **KPIs:** só métricas de interação criativa — impressões, CTR, frequência, retenção, hook rate. **Sem R$.**
- **Positivos vs Negativos:** classifica pela fase do ad (scaling/holding = positivo; declining/hidden = negativo). Buracos de cobertura entram em "Negativos" como contexto.
- **Benchmarks:** sempre tag em colchetes (`[Warby Parker]`). Tese curta — 1-2 frases por marca, sem citação de spend.
- **Oportunidades & Testes:** numeradas, cada uma com janela `[maio]` ou `[concepção]`. Critério de sucesso explícito quando possível.

## arquivos críticos

- Drive `[ Book Digital] Fechamento mensal Março 2026.pdf` — gabarito visual.
- `system/template/apresentacao-fechamento-mensal.template.html` — template A4 landscape.
- `system/scripts/_render-apresentacao.mjs` — renderers por sub-seção.
- `system/scripts/build-apresentacao.mjs` — comando.
- `system/scripts/extract-april.mjs` — one-shot abril 2026.
- `system/clients/zerezes/config.json#presentation` — paleta + fontes da apresentação.

## troubleshooting

- **"content not found"** → rodar `extract-april.mjs` (abril) ou `draft-content.mjs` (futuro).
- **Lint falhando em "espaço largo" / "bestseller" / "R$ X"** → ajustar texto no `content/<edicao>.json`. Lint é fail-fast por design.
- **PDF cortando slide** → garantir Print configurado: A4 landscape, margens "None", "background graphics" ativado.
- **Cores erradas** → conferir se `cfg.presentation.palette` está preenchido. Se ausente, build cai pra `cfg.brand.palette` (paleta editorial creme/laranja, não brandbook).
