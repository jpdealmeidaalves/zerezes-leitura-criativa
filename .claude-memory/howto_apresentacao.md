---
name: howto_apresentacao
description: como gerar a apresentação institucional (formato Book Digital · Fechamento Mensal · Mídia) a partir de uma leitura criativa
type: howto
last_updated: 2026-04-30
---

> **Resumo de uma linha:** rode `build-apresentacao.mjs` para HTML/PDF ou `build-apresentacao-pptx.mjs` para PPTX editável. Ambos saem em `apresentacoes/<edicao>/`.

## quando usar

Quando o usuário pedir "gera a apresentação de [mês]", "manda em PPT" ou "adapta pra formato apresentação". O gabarito é o **[ Book Digital ] · Fechamento Mensal · Mídia** — referência: `[ Book Digital] Fechamento mensal Março 2026-final.pptx` no Drive (id `18v9b4jsRodEB87c8PK9lbklMKnVI9chE`, pasta `1lhysOVp6t_yGogOdMzTehLxOuTAxmEer`).

## o gabarito (5 sub-seções fixas)

```
1. KPIs                     ← números do mês na disciplina (sem R$)
2. Destaques Positivos      ← peças que funcionaram, agrupadas por linha
3. Destaques Negativos      ← peças que não performaram + buracos de cobertura
4. Benchmarks               ← concorrentes com tag [Marca] + tese curta
5. Oportunidades & Testes   ← hipóteses numeradas com janela [maio]/[junho]
```

## layout visual (padrão Book Digital)

- **Sidebar esquerda escura** (preto) em todos os slides — texto vertical `mídia · 2026 · mkt growth` em verde/cinza
- **Capa dark** — fundo preto, sidebar verde, tag `[Book Digital]` em verde, título branco, badge `MÍDIA`
- **Sem section-cover slides** — agenda vai direto para o conteúdo de cada seção
- **Numeração local por seção** — cada seção começa em `01`, `02`…
- **Paleta brandbook**: verde `#80AA9D`, azul `#5F8DB5`, cinza `#C1C6BF`, preto `#000000`
- **Tipografia**: Plus Jakarta Sans (Regular + Bold)
- **Formato**: A4 landscape (297mm × 210mm / 11.69" × 8.27")

## contrato de pedido

Se faltar campo, usar `AskUserQuestion` antes de gerar:

```
edição:    YYYY-MM            # mês-fonte (obrigatório)
formato:   html | pptx | ambos  # default: pptx quando usuário pede "me manda em ppt"
janela:    maio               # nome da janela de "próximos testes"
notas:     ...                # opcional
```

## comandos canônicos

```bash
# HTML + PDF (via print do navegador)
node system/scripts/build-apresentacao.mjs \
  --client zerezes --edition 2026-04 \
  --estilo fechamento-mensal --janela maio
# saída: apresentacoes/2026-04/midia-fechamento-mensal.html
# PDF: navegador → Print → Save as PDF (A4 landscape, sem margens, background graphics ativado)

# PPTX editável (PowerPoint / Google Slides)
node system/scripts/build-apresentacao-pptx.mjs \
  --client zerezes --edition 2026-04 --janela maio
# saída: apresentacoes/2026-04/midia-fechamento-mensal.pptx
# requer: npm install pptxgenjs (package.json já na raiz, instalado)
```

## pré-requisitos

- `system/clients/<client>/content/<edicao>.json` precisa existir com as 5 sub-seções de apresentação.
  - **Abril 2026:** `node system/scripts/extract-april.mjs --client zerezes` (one-shot, já feito).
  - **Edições novas (maio em diante):** fluxo normal `pull-motion` → `draft-content`.
- `npm install pptxgenjs` — já instalado (`package.json` na raiz do repo).
- Lint passa (sem `voice.forbidden`, sem R$ em corrido).

## anatomia do `content/<edicao>.json` para a apresentação

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

## decisões editoriais por sub-seção

- **KPIs:** só métricas de interação criativa — impressões, CTR, frequência, retenção, hook rate. **Sem R$.**
- **Positivos vs Negativos:** scaling/holding = positivo; declining/hidden = negativo. Buracos entram em "Negativos" como contexto.
- **Benchmarks:** sempre tag em colchetes (`[Warby Parker]`). Tese curta — 1-2 frases, sem spend.
- **Oportunidades & Testes:** numeradas, cada uma com janela `[maio]` ou `[concepção]`. Critério de sucesso explícito quando possível.

## arquivos críticos

| arquivo | função |
|---|---|
| `apresentacoes/2026-04/midia-fechamento-mensal.pptx` | output PPTX editável (abril 2026) |
| `apresentacoes/2026-04/midia-fechamento-mensal.html` | output HTML/PDF (abril 2026) |
| `system/scripts/build-apresentacao-pptx.mjs` | gerador PPTX (PptxGenJS) |
| `system/scripts/build-apresentacao.mjs` | gerador HTML |
| `system/scripts/_render-apresentacao.mjs` | renderers HTML (5 sub-seções) |
| `system/template/apresentacao-fechamento-mensal.template.html` | template HTML A4 landscape |
| `system/scripts/extract-april.mjs` | one-shot extrator abril 2026 |
| Drive `18v9b4jsRodEB87c8PK9lbklMKnVI9chE` | gabarito PPT visual (Março 2026) |

## troubleshooting

- **"content not found"** → rodar `extract-april.mjs` (abril) ou `draft-content.mjs` (futuro).
- **Lint falhando** → ajustar texto no `content/<edicao>.json`. Lint é fail-fast por design.
- **PDF cortando slide** → Print: A4 landscape, margens "None", "background graphics" ativado.
- **PPTX sem sidebar vertical** → normal se PptxGenJS clipa texto fora dos limites; o conteúdo de todas as seções está correto. Ajuste visual fino no PowerPoint/Slides.
- **pptxgenjs not found** → `npm install` na raiz do repo.
