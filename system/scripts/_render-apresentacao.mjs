// _render-apresentacao.mjs
// renderers para a apresentação institucional (formato Book Digital).
// 5 sub-secoes fixas: KPIs, Destaques Positivos, Destaques Negativos, Benchmarks, Oportunidades & Testes.
//
// padrao: cada sub-secao gera 1 slide cover + N slides de conteudo.
// numeracao das paginas eh feita aqui (state com counter compartilhado).

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function makePager(start = 3) {
  let n = start;
  return () => String(n++).padStart(2, '0');
}

function slideHead(num, tag, page, clientName, period) {
  return `<div class="s-head"><span class="s-num">${esc(num)}</span><span class="s-tag">${esc(tag)}</span><span class="s-page">${esc(clientName)} · mídia · ${esc(period)}</span></div>`;
}

function slideFoot(clientName, page) {
  return `<div class="s-foot"><span class="s-foot-tag">${esc(clientName)} mkt growth</span><span>${esc(page)}</span></div>`;
}

function sectionCover(num, kicker, title) {
  return `<div class="slide section-cover">
  <div class="sc-num">${esc(num)}</div>
  <div class="sc-kicker">${esc(kicker)}</div>
  <div class="sc-title">${esc(title)}</div>
</div>`;
}

export function renderKPIs(s, ctx) {
  if (!s) return '';
  const { pager, clientName, period } = ctx;
  const num = '01';
  const cover = sectionCover(num, s.kicker || 'kpis', s.title || 'os números do mês');
  const cards = (s.metrics || []).map((m) => `
<div class="kpi-card">
  <div class="kpi-label">${esc(m.label)}</div>
  <div class="kpi-value">${esc(m.value)}</div>
  <div class="kpi-note">${esc(m.note || '')}</div>
</div>`).join('');
  const conteudo = `<div class="slide">
  ${slideHead(num, 'kpis', pager(), clientName, period)}
  <div class="s-kicker">${esc(s.kicker || 'kpis')}</div>
  <h2 class="s-title sm">${esc(s.title || 'os números do mês')}</h2>
  ${s.lead_html ? `<p class="s-lead">${s.lead_html}</p>` : ''}
  <div class="kpi-grid">${cards}</div>
  ${slideFoot(clientName, pager.peek ? pager.peek() : '')}
</div>`;
  return cover + '\n' + conteudo;
}

function renderGrupos(grupos, kind /* 'pos' | 'neg' */, num, tag, ctx) {
  const { pager, clientName, period } = ctx;
  const negClass = kind === 'neg' ? ' neg' : '';
  const pontosLabel = kind === 'neg' ? 'pontos de atenção' : 'pontos de destaque';
  // Cada grupo vira 1 slide
  return (grupos || []).map((g) => {
    const pecas = (g.pecas || []).map((p) => `
<div class="peca${negClass}">
  <div class="p-nome">${esc(p.nome)}</div>
  <div class="p-cap">${esc(p.cap || '')}</div>
  <div class="p-pontos">
    <span class="p-pontos-label">${esc(pontosLabel)}:</span>
    <ul>${(p.pontos || []).map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>
  </div>
</div>`).join('');
    return `<div class="slide">
  ${slideHead(num, tag, '', clientName, period)}
  <div class="s-kicker">${esc(tag)} · ${esc(g.linha)}</div>
  <h2 class="s-title sm">${esc(g.linha)}</h2>
  <div class="grupo">
    <div class="peca-list">${pecas}</div>
  </div>
  ${slideFoot(clientName, pager())}
</div>`;
  }).join('\n');
}

export function renderDestaquesPositivos(s, ctx) {
  if (!s) return '';
  const num = '02';
  const cover = sectionCover(num, s.kicker || 'destaques positivos', s.title || 'o que funcionou');
  const slides = renderGrupos(s.grupos, 'pos', num, 'destaques positivos', ctx);
  return cover + '\n' + slides;
}

export function renderDestaquesNegativos(s, ctx) {
  if (!s) return '';
  const num = '03';
  const cover = sectionCover(num, s.kicker || 'destaques negativos', s.title || 'o que não funcionou');
  const slides = renderGrupos(s.grupos, 'neg', num, 'destaques negativos', ctx);
  return cover + '\n' + slides;
}

export function renderBenchmarks(s, ctx) {
  if (!s) return '';
  const { pager, clientName, period } = ctx;
  const num = '04';
  const cover = sectionCover(num, s.kicker || 'benchmarks', s.title || 'o que o mercado fez');
  const items = s.items || [];
  // ate 6 cards por slide; se passar, divide em mais slides
  const chunks = [];
  for (let i = 0; i < items.length; i += 6) chunks.push(items.slice(i, i + 6));
  const slides = chunks.map((chunk, idx) => {
    const cards = chunk.map((it) => `
<div class="bench-card">
  <div class="b-tag">[${esc(it.tag)}]</div>
  <div class="b-tese">${esc(it.tese)}</div>
</div>`).join('');
    return `<div class="slide">
  ${slideHead(num, 'benchmarks', '', clientName, period)}
  <div class="s-kicker">benchmarks ${chunks.length > 1 ? `· parte ${idx + 1}/${chunks.length}` : ''}</div>
  <h2 class="s-title sm">${esc(s.title || 'o que o mercado fez')}</h2>
  <div class="bench-grid">${cards}</div>
  ${slideFoot(clientName, pager())}
</div>`;
  }).join('\n');
  return cover + '\n' + slides;
}

export function renderOportunidadesTestes(s, ctx) {
  if (!s) return '';
  const { pager, clientName, period } = ctx;
  const num = '05';
  const cover = sectionCover(num, s.kicker || 'oportunidades & testes', s.title || 'as apostas para o próximo mês');
  const items = s.hipoteses || [];
  // ate 5 por slide
  const chunks = [];
  for (let i = 0; i < items.length; i += 5) chunks.push(items.slice(i, i + 5));
  const slides = chunks.map((chunk, idx) => {
    const lis = chunk.map((h) => `
<div class="opo-item">
  <div class="o-tag">${esc(h.tag)}</div>
  <div>
    <div class="o-titulo">${esc(h.titulo)}</div>
    <div class="o-descricao">${esc(h.descricao)}</div>
  </div>
</div>`).join('');
    return `<div class="slide">
  ${slideHead(num, 'oportunidades & testes', '', clientName, period)}
  <div class="s-kicker">oportunidades & testes ${chunks.length > 1 ? `· parte ${idx + 1}/${chunks.length}` : ''}</div>
  <h2 class="s-title sm">${esc(s.title || 'as apostas para o próximo mês')}</h2>
  <div class="opo-list">${lis}</div>
  ${slideFoot(clientName, pager())}
</div>`;
  }).join('\n');
  return cover + '\n' + slides;
}

export function renderApresentacao(content, opts = {}) {
  const s = content.sections || {};
  const pager = makePager(3);
  const ctx = {
    pager,
    clientName: opts.clientName || 'zerezes',
    period: opts.period || content.period || '',
  };
  return {
    section_kpis: renderKPIs(s.kpis, ctx),
    section_destaques_positivos: renderDestaquesPositivos(s.destaques_positivos, ctx),
    section_destaques_negativos: renderDestaquesNegativos(s.destaques_negativos, ctx),
    section_benchmarks: renderBenchmarks(s.benchmarks, ctx),
    section_oportunidades_testes: renderOportunidadesTestes(s.oportunidades_testes, ctx),
  };
}
