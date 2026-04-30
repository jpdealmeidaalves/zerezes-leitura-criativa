// _render.mjs
// renderers de secao para a leitura criativa.
// cada funcao recebe a sub-arvore correspondente de content.sections.* e devolve uma string HTML
// que sera injetada via placeholder {{section_<nome>}} no template.
//
// principios:
//   - input rico (content.json) -> output cru (HTML pronto). zero logica fora desta camada.
//   - nada de framework. template strings + escapes manuais.
//   - HTML embutido em campos `*_html` ou `body_html` eh CONFIAVEL (vem do autor humano), nao escapamos.
//   - campos simples (label, title, n) sao texto literal — escapamos.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function tags(arr = []) {
  if (!arr.length) return '';
  return `<div class="tags">${arr.map((t) => `<span class="tag angle">${esc(t)}</span>`).join('')}</div>`;
}

function sectionHeader(num, kicker, title, theme) {
  const t = theme ? `<span class="tema">${esc(theme)}</span>` : '';
  return `<div class="sh"><div><div class="sk">${esc(kicker)}</div><h2>${esc(title)}${t}</h2></div><div class="sn">${esc(num)} ::</div></div>`;
}

export function renderResumo(s) {
  if (!s) return '';
  const cards = (s.cards || []).map((c) => `
<div class="rc${c.kind === 'highlight' ? ' hl' : ''}">
  <div class="rl">${esc(c.label)}</div>
  <h4>${esc(c.title)}</h4>
  <p>${esc(c.body)}</p>
</div>`).join('');
  const pq = s.pullquote_html ? `<div class="pq">${s.pullquote_html}</div>` : '';
  return `<section id="resumo">
${sectionHeader('00', s.kicker, s.title)}
<div class="pr"><p class="ld">${s.lead_html || ''}</p></div>
<div class="rg">${cards}</div>
${pq}
</section>`;
}

export function renderTese(s) {
  if (!s) return '';
  const ec = s.editorial_html ? `<div class="ec"><div class="ey">tese editorial</div><p class="bq">${s.editorial_html}</p></div>` : '';
  const body = s.body_html ? `<div class="pr">${s.body_html}</div>` : '';
  return `<section id="tese">
${sectionHeader('01', s.kicker, s.title)}
${ec}
${body}
</section>`;
}

export function renderFunil(s) {
  if (!s) return '';
  const blocks = (s.blocks || []).map((b) => `
<div class="cb-block">
  <div class="cbh"><div class="cbn">${esc(b.label)}</div><div><h3>${esc(b.title)} <span class="mu">${esc(b.subtitle || '')}</span></h3></div></div>
  <div class="pr">${b.body_html || ''}</div>
  ${tags(b.tags)}
</div>`).join('');
  const sn = s.sidenote ? `<div class="sn-box">${s.sidenote}</div>` : '';
  return `<section id="funil">
${sectionHeader('02', s.kicker, s.title)}
<div class="pr">${s.lead_html || ''}</div>
${blocks}
${sn}
</section>`;
}

export function renderConsideracao(s) {
  if (!s) return '';
  return `<section id="consideracao">
${sectionHeader('03', s.kicker, s.title)}
<div class="pr">${s.lead_html || ''}</div>
<div class="pr">${s.body_html || ''}</div>
${tags(s.tags)}
</section>`;
}

export function renderMercado(s) {
  if (!s) return '';
  const cards = (s.competitors || []).map((c) => `
<div class="rc">
  <div class="rl">${esc(c.name)}</div>
  <p>${esc(c.thesis)}</p>
</div>`).join('');
  return `<section id="mercado">
${sectionHeader('05', s.kicker, s.title)}
<div class="pr">${s.lead_html || ''}</div>
<div class="rg">${cards}</div>
</section>`;
}

export function renderApostas(s) {
  if (!s) return '';
  const items = (s.items || []).map((i) => `
<div class="it">
  <div class="itn">${esc(i.n)}</div>
  <div class="itb">
    <h4>${esc(i.title)}</h4>
    <p>${esc(i.body)}</p>
  </div>
</div>`).join('');
  return `<section id="apostas">
${sectionHeader('08', s.kicker, s.title)}
<div class="pr">${s.lead_html || ''}</div>
<div class="el">${items}</div>
</section>`;
}

export function renderOutrasFrentes(s) {
  if (!s) return '';
  const items = (s.items || []).map((i) => `
<div class="rc">
  <div class="rl">${esc(i.label)}</div>
  <p>${esc(i.body)}</p>
</div>`).join('');
  return `<section id="outras-frentes">
${sectionHeader('10', s.kicker, s.title)}
<div class="pr">${s.lead_html || ''}</div>
<div class="rg">${items}</div>
</section>`;
}

export function renderAllSections(content) {
  const s = content.sections || {};
  return {
    section_resumo: renderResumo(s.resumo),
    section_tese: renderTese(s.tese),
    section_funil: renderFunil(s.funil),
    section_consideracao: renderConsideracao(s.consideracao),
    section_mercado: renderMercado(s.mercado),
    section_apostas: renderApostas(s.apostas),
    section_outras_frentes: renderOutrasFrentes(s.outras_frentes),
  };
}
