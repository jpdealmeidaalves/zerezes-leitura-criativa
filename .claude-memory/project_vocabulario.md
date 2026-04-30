---
name: project_vocabulario
description: vocabulário interno Zerezes — termos que devem aparecer tal qual no report, e termos comuns do mercado que precisam ser traduzidos
type: project
originSessionId: 8b9dedd7-288a-4aff-aa99-b49105cdff31
---
Termos a usar/evitar nos deliverables Zerezes:

- **clássicos** (NÃO "bestsellers") — o catálogo base da Zerezes. Vocabulário interno é *clássicos*. "Bestsellers" é termo de mercado, não da marca. Sempre usar *clássicos* em reports e comunicação com os times internos.
- **coleção Grau26** (não "grau 26 collection" ou "coleção 2026") — nome próprio, uma palavra.
- **"de volta à realidade"** — copy oficial vinda do ad de melhor CTR (1,23%). Big idea do KV registra como *"de volta à vida real"* — ambas formas circulam, mas *realidade* foi o que performou.
- **creators** — não "influenciadores" nem "criadores". Creators ativos em abril de 2026: Rafaela Amorim, Rodrigo Bez, Giorgia, Alice Fleury. **MouraJo foi removida do report** (irrelevante neste momento, sem thumbnail, volume baixo — não incluir em análises de april 2026 em diante até nova instrução).
- **clusters comportamentais** de retargeting: ClustieHPB (alta propensão), ClustieLTV (alto valor), ClustieSEED (semente). Nomes internos Zerezes.
- **entrantes** — marcação para ativações novas/em entrada no ar (fim de mês, virada). Vale destacar visualmente com tag/badge em reports.

**Why:** renomeações acontecem ao longo do trabalho. "Bestsellers" foi usado em v3/v4 até o usuário corrigir em 2026-04-17 — vocabulário consistente entre rodadas reduz fricção para os times consumidores.

- **The Simple Gym** (NÃO "The Simple Gyn") — nome da collab de AON Sports. Typo "Gyn" foi corrigido em abril de 2026 em `index.html` e `config.json`.
- **alavanca** — label para ativações sem material de mídia próprio que funcionam como impulsionadores do ad Zerezes (ex: collab The Simple Gym). NÃO usar "ativo" para esses casos.
- **previsão maio** — label para ativações anunciadas mas não veiculadas no período do report (ex: clássicos novas cores). NÃO usar "entrante" quando ainda não está no ar.
- **"espaço largo"** — expressão **proibida** (decisão usuário, 30/04/2026). É clichê genérico. Quando precisar dizer que o mercado está aberto, prefira algo direto e funcional: **"oportunidade de mercado"** foi a forma escolhida pelo usuário. Substitutos editoriais ("lugar editorial sem ocupante", "vaga em aberto") foram **rejeitados como abstratos demais**.
- **tom direto > tom editorial-abstrato** — regra reforçada em 30/04/2026: o usuário prefere labels diretos e funcionais a metáforas editoriais elaboradas. Ex: "oportunidade de mercado" ✓ vs "o lugar editorial sem ocupante" ✗. Mantém o tom editorial nas descrições corridas; mas **headlines e labels de cards devem ser diretas**.

## regra editorial sobre dados de orçamento

Esta é uma **leitura criativa**, não de mídia. Em narrativas (lead, descrições corridas, headlines), **NÃO citar valores em R$ de spend/investimento**. Manter apenas métricas que indicam interação criativa: impressões, CTR, frequência, retenção de vídeo, fase (testing/scaling/holding/declining).

- ❌ "abril fechou com R$162 mil investidos, 23,5M impressões..."
- ✓ "abril fechou com 23,5M impressões e CTR médio de 0,88%..."
- ❌ "Rodrigo Bez escalou forte — R$7,1K em alcance e 6,6M impressões"
- ✓ "Rodrigo Bez escalou forte — 6,6M impressões no mês todo"

Em tabelas de evidência granulares (ex: caps de cards de criativos individuais), valores em R$ podem aparecer como dado de contexto — mas só ali. **Nunca em texto editorial corrido**.

Esta regra está alinhada com `pull-windsor.mjs` (FORBIDDEN_FIELDS bloqueia spend/cpc/cpm/roas) e `voice.forbidden` em config (lint pega "espaço largo" e variações de bestseller).

**How to apply:** em cada nova leitura criativa, fazer um pass final de busca por "bestsellers", "The Simple Gyn", "MouraJo", "espaço largo", "R$\d" em parágrafos editoriais — substituir/remover antes de entregar. Marcar ativações que entram no recorte com tag "entrante" (estilo laranja sobre creme, discreto). Usar "alavanca" para collabs sem asset próprio e "previsão maio" para previstas.
