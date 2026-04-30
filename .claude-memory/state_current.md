---
name: state_current
description: snapshot vivo do estado do projeto — atualizado a cada rodada, primeiro arquivo a ler na proxima sessao
type: state
last_updated: 2026-04-30
---

> Este arquivo é o "primeiro briefing" para uma nova sessão. Resume **onde estamos agora**, o que está aberto, e quais ações imediatas fazem sentido. Manter curto. Atualizar ao final de cada rodada.

## edicao publicada

**Abril de 2026 (01–28)** — `index.html` na raiz do repo. Autorada manualmente, hardcoded.

- URL produção: `https://zerezes-leitura-criativa.vercel.app/` — **mas atenção:** produção segue o branch `main`, que está **defasado**. Última PR mergeada foi a #4 (final de março). Tudo de abril está no branch da PR #5.
- URL preview do branch (sempre atualizada): `https://zerezes-leitura-cria-git-af01d2-jpdealmeidaalves-1986s-projects.vercel.app/`
- Branch ativa: `claude/update-april-report-data-LTh64`
- PR #5 — **aberta**, aguardando merge do usuário.

## próxima edicao

**Maio de 2026** — não draftada. Tentativa de preview pré-mês em 29/04 foi rejeitada pelo usuário. **Não tentar de novo até ter dados Motion reais (1ª semana de maio em diante).**

Plano confirmado pelo usuário (29/04):
- 01–31 maio: Grau26, AON Solar, AON Sports (linhas de **conversão**)
- 14–31 maio: Clássicos novas cores (**consideração** — micro-evento, não relançamento)

## infraestrutura `system/` — estado

Pronta, mas não exercitada em produção. Maio é a 1ª chance.

| componente | arquivo | status |
|---|---|---|
| build | `system/scripts/build.mjs` | ✅ funciona, valida config + lint + render + contrast guard + archive |
| validate config | `system/scripts/validate-config.mjs` | ✅ |
| pull motion | `system/scripts/pull-motion.mjs` | ✅ stub-friendly, com fallback de thumbnail |
| pull windsor | `system/scripts/pull-windsor.mjs` | ✅ escopo só criativo (sem $) |
| pull drive | `system/scripts/pull-drive.mjs` | ✅ destravado (root_folder_id preenchido) |
| draft content | `system/scripts/draft-content.mjs` | ✅ |
| lint editorial | `system/scripts/lint-content.mjs` | ✅ pega `voice.forbidden` + typos |
| renderers | `system/scripts/_render.mjs` | ✅ 7 seções (resumo, tese, funil, consideração, mercado, apostas, outras_frentes) |
| thumbnail helper | `system/scripts/_thumbnails.mjs` | ✅ resolve URLs `motionaccountassets` |
| template | `system/template/index.template.html` | ✅ placeholders `{{section_*}}` |
| n8n workflow | `workflows/n8n-monthly-leitura.json` | existe, não exercitado |

## pendências (frente 2 do plano de melhorias — mostly done)

| campo | valor | status |
|---|---|---|
| `sources.drive.root_folder_id` | `1lFADkpEqaCRT_PnAFD4hA-MfocKssjT3` | ✅ |
| `sources.drive.brandbook_folder_id` | `19D6L2GgHsq5QDVMl0tTjycERqDnRg-Tq` | ✅ |
| `sources.canva.brand_kit_id` | `VIA_DRIVE` | usuário não usa Canva nativo; brandbook vive no Drive |
| `sources.canva.folder_id` | `VIA_DRIVE` | idem |

## comandos canônicos (cole-e-rode)

```bash
# validar config
node system/scripts/validate-config.mjs --client zerezes

# puxar dados (n8n ou ambiente com MCP conectado)
node system/scripts/pull-motion.mjs   --client zerezes --edition 2026-05
node system/scripts/pull-drive.mjs    --client zerezes --edition 2026-05
node system/scripts/pull-windsor.mjs  --client zerezes --edition 2026-05

# draftar content/<edicao>.json a partir dos snapshots
node system/scripts/draft-content.mjs --client zerezes --edition 2026-05

# editar content/2026-05.json à mão (humano)

# lintar antes de buildar (opcional — build já faz)
node system/scripts/lint-content.mjs --client zerezes --edition 2026-05

# build → dist/zerezes/2026-05/index.html
node system/scripts/build.mjs --client zerezes --edition 2026-05

# build + escreve /index.html raiz (alvo Vercel produção)
node system/scripts/build.mjs --client zerezes --edition 2026-05 --as-root

# validar deploy (depois do push)
node system/scripts/deploy-check.mjs
```

## regras-mãe (decisões duradouras)

1. **Datas absolutas sempre.** Estamos em **2026**. Nunca "abril" sozinho. Ver `feedback_dates.md`.
2. **Vocabulário Zerezes** sobre vocabulário de mercado. Ver `project_vocabulario.md`. Lint do `voice.forbidden` cobre.
3. **Tom direto em headlines/labels; tom editorial só em texto corrido.**
4. **Sem valores em R$ em texto editorial corrido.** Só em caps técnicos de cards.
5. **`files/**` é histórico imutável.** Hooks bloqueiam edição.
6. **Confirmar URL antes de "investigar dado errado".** Produção (main) ≠ preview do branch.
7. **Não draftar editorial de mês futuro sem dado.** Esperar 1ª semana com Motion.

## ferramentas conectadas (resumo)

- **Motion MCP** — workspace `69e17b791615e8ee9b4174c8`. Protocolo SPEND-first obrigatório. Ver `reference_tools.md`.
- **Windsor.ai MCP** — escopo restrito a métricas criativas (ctr, frequency, video retention, thruplay, link clicks). Spend/CPC/ROAS bloqueados. Ver `pull-windsor.mjs#FORBIDDEN_FIELDS`.
- **Google Drive MCP** — pasta-pai `1lFADkpEqaCRT_PnAFD4hA-MfocKssjT3`; brandbook em `19D6L2GgHsq5QDVMl0tTjycERqDnRg-Tq`.
- **Vercel MCP** — projeto `zerezes-leitura-criativa`, team `team_ukUV2qneP1XPtoI1FMlTyKuG`. Production deploys via merge em `main`.
- **GitHub MCP** — repo `jpdealmeidaalves/zerezes-leitura-criativa`. PR #5 aberta.

## se a próxima sessão for sobre a edição de maio

1. Ler este arquivo.
2. Ler `project_ativacoes.md` — plano de maio confirmado.
3. Ler `howto_n8n_monthly.md` — sequência do pipeline.
4. Rodar `pull-motion --edition 2026-05` quando dados existirem (semana 1 de maio).
5. Editar `content/2026-05.json` à mão (humano + agente em conjunto).
6. `build.mjs --as-root` quando estiver pronto. PR #5 deve ser mergeada antes (ou mantém-se em branch separado).
