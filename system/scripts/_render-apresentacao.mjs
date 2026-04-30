// _render-apresentacao.mjs
// renderers para a apresentação institucional (formato Book Digital).
// 5 sub-secoes fixas: KPIs, Destaques Positivos, Destaques Negativos, Benchmarks, Oportunidades & Testes.
//
// layout baseado no gabarito PPT "[ Book Digital] Fechamento mensal":
//   - sidebar esquerda escura (preto) com texto vertical: discipline / year / "mkt growth"
//   - header do slide: num local + label + meta
//   - sem section-cover slides — vai direto do agenda para o conteudo

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const DISCIPLINE = 'mídia';
const YEAR = '2026';

function slideBar() {
  return `<div class="slide-bar">
  <span class="bar-discipline">${esc(DISCIPLINE)}</span>
  <span class="bar-year">${esc(YEAR)}</span>
  <span class="bar-brand">mkt growth</span>
</div>`;
}

function slideHdr(num, meta = '') {
  return `<div class="slide-hdr">
  <span class="sh-num">${String(num).padStart(2, '0')}</span>
  <span class="sh-label">${esc(DISCIPLINE)}</span>
  ${meta ? `<span class="sh-meta">${esc(meta)}</span>` : ''}
</div>`;
}

function meta(clientName, period) {
  return `${clientName} · ${DISCIPLINE} · ${period}`;
}

// ─── KPIs ───────────────────────────────────────────────────────────────────

export function renderKPIs(s, ctx) {
  if (!s) return '';
  const { clientName, period } = ctx;

  const cards = (s.metrics || []).map((m) => `
<div class="kpi-card">
  <div class="kpi-label">${esc(m.label)}</div>
  <div class="kpi-value">${esc(m.value)}</div>
  <div class="kpi-note">${esc(m.note || '')}</div>
</div>`).join('');

  return `<div class="slide">
  ${slideBar()}
  <div class="slide-body">
    ${slideHdr(1, meta(clientName, period))}
    <div class="slide-kicker">${esc(s.kicker || 'kpis')}</div>
    <h2 class="slide-title">${esc(s.title || 'os números do mês')}</h2>
    ${s.lead_html ? `<p class="slide-lead">${s.lead_html}</p>` : ''}
    <div class="kpi-grid">${cards}</div>
  </div>
</div>`;
}

// ─── Destaques (shared renderer) ─────────────────────────────────────────────

function renderGrupos(grupos, kind /* 'pos' | 'neg' */, kicker, ctx) {
  const { clientName, period } = ctx;
  const negClass = kind === 'neg' ? ' neg' : '';
  const pontosLabel = kind === 'neg' ? 'pontos de atenção:' : 'pontos de destaque:';

  return (grupos || []).map((g, idx) => {
    const pecas = (g.pecas || []).map((p) => `
<div class="peca${negClass}">
  <div class="p-nome">${esc(p.nome)}</div>
  <div class="p-cap">${esc(p.cap || '')}</div>
  <div class="p-pontos">
    <span class="p-pontos-label">${esc(pontosLabel)}</span>
    <ul>${(p.pontos || []).map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>
  </div>
</div>`).join('');

    return `<div class="slide">
  ${slideBar()}
  <div class="slide-body">
    ${slideHdr(idx + 1, meta(clientName, period))}
    <div class="slide-kicker">${esc(kicker)}</div>
    <h2 class="slide-title">${esc(g.linha)}</h2>
    <div class="peca-list">${pecas}</div>
  </div>
</div>`;
  }).join('\n');
}

export function renderDestaquesPositivos(s, ctx) {
  if (!s) return '';
  return renderGrupos(s.grupos, 'pos', s.kicker || 'destaques positivos', ctx);
}

export function renderDestaquesNegativos(s, ctx) {
  if (!s) return '';
  return renderGrupos(s.grupos, 'neg', s.kicker || 'destaques negativos', ctx);
}

// ─── Benchmarks ──────────────────────────────────────────────────────────────

export function renderBenchmarks(s, ctx) {
  if (!s) return '';
  const { clientName, period } = ctx;
  const items = s.items || [];
  // ate 6 cards por slide
  const chunks = [];
  for (let i = 0; i < items.length; i += 6) chunks.push(items.slice(i, i + 6));

  return chunks.map((chunk, idx) => {
    const cards = chunk.map((it) => `
<div class="bench-card">
  <div class="b-tag">[${esc(it.tag)}]</div>
  <div class="b-tese">${esc(it.tese)}</div>
</div>`).join('');

    const kicker = chunks.length > 1
      ? `${esc(s.kicker || 'benchmarks')} · parte ${idx + 1}/${chunks.length}`
      : esc(s.kicker || 'benchmarks');

    return `<div class="slide">
  ${slideBar()}
  <div class="slide-body">
    ${slideHdr(idx + 1, meta(clientName, period))}
    <div class="slide-kicker">${kicker}</div>
    <h2 class="slide-title">${esc(s.title || 'o que o mercado fez')}</h2>
    <div class="bench-grid">${cards}</div>
  </div>
</div>`;
  }).join('\n');
}

// ─── Oportunidades & Testes ───────────────────────────────────────────────────

export function renderOportunidadesTestes(s, ctx) {
  if (!s) return '';
  const { clientName, period } = ctx;
  const items = s.hipoteses || [];
  // ate 5 por slide
  const chunks = [];
  for (let i = 0; i < items.length; i += 5) chunks.push(items.slice(i, i + 5));

  return chunks.map((chunk, idx) => {
    const lis = chunk.map((h) => `
<div class="opo-item">
  <div class="o-tag">${esc(h.tag)}</div>
  <div>
    <div class="o-titulo">${esc(h.titulo)}</div>
    <div class="o-descricao">${esc(h.descricao)}</div>
  </div>
</div>`).join('');

    const kicker = chunks.length > 1
      ? `${esc(s.kicker || 'oportunidades & testes')} · parte ${idx + 1}/${chunks.length}`
      : esc(s.kicker || 'oportunidades & testes');

    return `<div class="slide">
  ${slideBar()}
  <div class="slide-body">
    ${slideHdr(idx + 1, meta(clientName, period))}
    <div class="slide-kicker">${kicker}</div>
    <h2 class="slide-title">${esc(s.title || 'as apostas para o próximo mês')}</h2>
    <div class="opo-list">${lis}</div>
  </div>
</div>`;
  }).join('\n');
}

// ─── Consolidado ─────────────────────────────────────────────────────────────

export function renderApresentacao(content, opts = {}) {
  const s = content.sections || {};
  const ctx = {
    clientName: opts.clientName || 'zerezes',
    period: opts.period || content.period || '',
  };
  return {
    section_kpis:                 renderKPIs(s.kpis, ctx),
    section_destaques_positivos:  renderDestaquesPositivos(s.destaques_positivos, ctx),
    section_destaques_negativos:  renderDestaquesNegativos(s.destaques_negativos, ctx),
    section_benchmarks:           renderBenchmarks(s.benchmarks, ctx),
    section_oportunidades_testes: renderOportunidadesTestes(s.oportunidades_testes, ctx),
  };
}
