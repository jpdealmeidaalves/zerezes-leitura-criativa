---
name: feedback_dates
description: sempre tratar datas como absolutas e confirmar o ano antes de puxar dados históricos — ano corrente é 2026
type: feedback
originSessionId: 8b9dedd7-288a-4aff-aa99-b49105cdff31
---
Quando o usuário diz "abril", "março", etc., é **sempre do ano corrente** (2026 no contexto desta conta). Nunca assumir 2025 nem anos anteriores.

**Why:** no histórico da conversa, a pergunta "abril 2025 ou 2026?" gerou retrabalho duas vezes — uma na construção inicial do report (Claude puxou dados de 2025) e outra confirmada pelo usuário "lembre os dados de abril deste ano 2026".

**How to apply:**
- Ao filtrar data em Motion/Windsor/Meta, usar `startDate`/`endDate` absolutos (ex.: `2026-04-01`/`2026-04-15`).
- Converter qualquer referência relativa ("abril", "mês passado", "primeira quinzena") em data absoluta ao salvar em memória ou no relatório.
- Confirmar o recorte exato (ex.: "1–15 abril" não é "1–30 abril") antes de afirmar coisas como "o mês inteiro" — no histórico, o usuário corrigiu "mês completo" porque a leitura era só da primeira quinzena.
