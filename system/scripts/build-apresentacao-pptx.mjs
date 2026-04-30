// build-apresentacao-pptx.mjs
// gera o "Book Digital — Fechamento Mensal · Mídia" como arquivo .pptx editável.
// usa PptxGenJS; requer `npm install pptxgenjs` na raiz do repo.
//
// uso:
//   node system/scripts/build-apresentacao-pptx.mjs --client zerezes --edition 2026-04
//   node system/scripts/build-apresentacao-pptx.mjs --client zerezes --edition 2026-04 --janela maio
//
// saida: apresentacoes/<edicao>/midia-fechamento-mensal.pptx

import PptxGenJS from 'pptxgenjs';
import { parseArgs, loadClientConfig, requireArg, readJson, log, SYSTEM_ROOT, REPO_ROOT } from './_shared.mjs';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = parseArgs(process.argv);
const slug = requireArg(args, 'client');
const edition = requireArg(args, 'edition');
const janela = args.janela || 'maio';

const cfg = loadClientConfig(slug);
const contentPath = join(SYSTEM_ROOT, 'clients', slug, 'content', `${edition}.json`);
if (!existsSync(contentPath)) {
  console.error(`content not found: ${contentPath}`);
  console.error('rode extract-april.mjs (abril) ou draft-content.mjs (edicoes futuras)');
  process.exit(1);
}

const content = readJson(contentPath);
const s = content.sections || {};
const period = content.period || edition;
const clientName = cfg.name || 'zerezes';

// ─── Dimensões A4 landscape (polegadas) ──────────────────────────────────────

const SLIDE_W  = 11.69;
const SLIDE_H  = 8.27;
const SIDEBAR_W = 0.79;   // 20mm
const CONTENT_X = SIDEBAR_W + 0.63;
const CONTENT_Y = 0.55;
const CONTENT_W = SLIDE_W - CONTENT_X - 0.79;
const CONTENT_H = SLIDE_H - CONTENT_Y - 0.43;

// ─── Paleta brandbook ────────────────────────────────────────────────────────

const C = {
  verde:  '80AA9D',
  azul:   '5F8DB5',
  cinza:  'C1C6BF',
  cinzaEscuro: '888888',
  branco: 'FFFFFF',
  preto:  '000000',
  preto2: '1a1a1a',
  linha:  'E5E5E5',
  card:   'FAFAFA',
  sidebarYear:  '666666',
  sidebarBrand: '444444',
};

const FONT = 'Plus Jakarta Sans';

// ─── Instância PptxGenJS ─────────────────────────────────────────────────────

const pres = new PptxGenJS();
pres.defineLayout({ name: 'A4L', width: SLIDE_W, height: SLIDE_H });
pres.layout = 'A4L';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rect(slide, x, y, w, h, fillColor, lineColor = null) {
  const opts = { x, y, w, h, fill: { color: fillColor } };
  if (lineColor) opts.line = { color: lineColor, width: 0.5 };
  else opts.line = { type: 'none' };
  slide.addShape('rect', opts);
}

function hLine(slide, x, y, w) {
  rect(slide, x, y, w, 0.012, C.linha);
}

function txt(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, { x, y, w, h, fontFace: FONT, ...opts });
}

function sidebarMeta() {
  return `${clientName} · mídia · ${period}`;
}

// Sidebar escura com texto vertical (padrão Book Digital)
function addSidebar(slide, barColor = C.preto) {
  rect(slide, 0, 0, SIDEBAR_W, SLIDE_H, barColor);

  // Texto vertical: rotacionado 270° para ler de baixo pra cima
  // O text box não-rotacionado precisa ter: w = SLIDE_H, h = SIDEBAR_W
  // Centro visual: (SIDEBAR_W/2, SLIDE_H/2) = (0.395, 4.135)
  // x antes de rotacionar = 0.395 - SLIDE_H/2 = -3.74 (fora do slide, mas o PPT aceita)
  const txW = SLIDE_H;
  const txH = SIDEBAR_W;
  const txX = SIDEBAR_W / 2 - txW / 2;
  const txY = SLIDE_H / 2 - txH / 2;

  const textColor  = barColor === C.preto ? C.verde       : C.preto;
  const yearColor  = barColor === C.preto ? C.sidebarYear : '555555';
  const brandColor = barColor === C.preto ? C.sidebarBrand : '777777';

  slide.addText([
    { text: 'mkt growth    ', options: { fontSize: 7,   color: brandColor, bold: false } },
    { text: '2026    ',       options: { fontSize: 8,   color: yearColor,  bold: false } },
    { text: 'mídia',          options: { fontSize: 9.5, color: textColor,  bold: true  } },
  ], {
    x: txX, y: txY, w: txW, h: txH,
    rotate: 270,
    align: 'center', valign: 'middle',
    fontFace: FONT,
  });
}

// Header do slide: num · label · meta
function addSlideHdr(slide, numStr) {
  hLine(slide, CONTENT_X, CONTENT_Y + 0.31, CONTENT_W);
  txt(slide, numStr,        CONTENT_X,          CONTENT_Y, 0.45, 0.3, { fontSize: 8.5, color: C.verde,       bold: true,  charSpacing: 2 });
  txt(slide, 'mídia',       CONTENT_X + 0.5,    CONTENT_Y, 1.0,  0.3, { fontSize: 7.5, color: C.cinzaEscuro, bold: true,  charSpacing: 3 });
  txt(slide, sidebarMeta(), CONTENT_X + 1.55,   CONTENT_Y, CONTENT_W - 1.55, 0.3, { fontSize: 7.5, color: C.cinza, align: 'right' });
}

// Kicker + Title abaixo do header
function addKickerTitle(slide, kicker, title) {
  txt(slide, kicker, CONTENT_X, CONTENT_Y + 0.45, CONTENT_W, 0.28, { fontSize: 8.5, color: C.azul, bold: true, charSpacing: 1 });
  txt(slide, title,  CONTENT_X, CONTENT_Y + 0.75, CONTENT_W, 0.6,  { fontSize: 17,  color: C.preto, bold: true, lineSpacingMultiple: 1.1 });
}

// ─── COVER ───────────────────────────────────────────────────────────────────

(function addCover() {
  const slide = pres.addSlide();

  rect(slide, 0, 0, SLIDE_W, SLIDE_H, C.preto);
  addSidebar(slide, C.verde);

  const cx = SIDEBAR_W + 0.79;
  const cw = SLIDE_W - cx - 0.79;

  txt(slide, '[ Book Digital ]  ·  Fechamento mensal', cx, 1.0, cw, 0.4,
    { fontSize: 8.5, color: C.verde, bold: true, charSpacing: 3 });

  const coverTitle = content.title || `fechamento mensal · ${edition}`;
  txt(slide, coverTitle, cx, 1.6, cw, 2.0,
    { fontSize: 30, color: C.branco, bold: true, lineSpacingMultiple: 1.1 });

  // Badge "MÍDIA"
  slide.addShape('rect', { x: cx, y: 3.85, w: 1.4, h: 0.4, fill: { type: 'none' }, line: { color: 'FFFFFF', width: 0.5, transparency: 70 } });
  txt(slide, 'MÍDIA', cx, 3.85, 1.4, 0.4,
    { fontSize: 8.5, color: C.branco, bold: true, align: 'center', valign: 'middle', charSpacing: 3 });

  // Linha separadora footer
  hLine(slide, cx, SLIDE_H - 0.72, cw);
  txt(slide, `${clientName} · mkt growth`, cx, SLIDE_H - 0.58, cw / 2, 0.3,
    { fontSize: 7.5, color: C.sidebarYear, charSpacing: 2 });
  txt(slide, period, cx + cw / 2, SLIDE_H - 0.58, cw / 2, 0.3,
    { fontSize: 7.5, color: C.sidebarYear, align: 'right', charSpacing: 2 });
})();

// ─── AGENDA ──────────────────────────────────────────────────────────────────

(function addAgenda() {
  const slide = pres.addSlide();
  addSidebar(slide);
  addSlideHdr(slide, '02');

  txt(slide, 'agenda', CONTENT_X, CONTENT_Y + 0.45, CONTENT_W, 0.75,
    { fontSize: 22, color: C.preto, bold: true });

  const items = [
    { letter: 'a.', name: 'KPIs',                    desc: 'números-chave do mês na disciplina',            alt: false },
    { letter: 'b.', name: 'Destaques Positivos',      desc: 'peças que funcionaram, por linha',              alt: true  },
    { letter: 'c.', name: 'Destaques Negativos',      desc: 'o que não performou + buracos de cobertura',    alt: true  },
    { letter: 'd.', name: 'Benchmarks',               desc: `leitura do mercado em ${period}`,               alt: false },
    { letter: 'e.', name: 'Oportunidades & Testes',   desc: `apostas para ${janela}`,                        alt: false },
  ];

  const gridY = CONTENT_Y + 1.28;
  const colW  = CONTENT_W / 3 - 0.12;
  const itemH = (SLIDE_H - gridY - 0.4) / 2 - 0.08;

  items.forEach((item, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const ix  = CONTENT_X + col * (colW + 0.18);
    const iy  = gridY + row * (itemH + 0.1);
    const acc = item.alt ? C.azul : C.verde;

    rect(slide, ix,          iy, 0.05, itemH, acc);
    rect(slide, ix + 0.05,   iy, colW - 0.05, itemH, C.card);

    txt(slide, item.letter, ix + 0.15, iy + 0.1,  colW - 0.25, 0.27, { fontSize: 8,    color: acc,    bold: true, charSpacing: 1 });
    txt(slide, item.name,   ix + 0.15, iy + 0.38, colW - 0.25, 0.55, { fontSize: 10,   color: C.preto, bold: true, lineSpacingMultiple: 1.2 });
    txt(slide, item.desc,   ix + 0.15, iy + 0.95, colW - 0.25, 0.55, { fontSize: 8,    color: C.cinzaEscuro, lineSpacingMultiple: 1.3 });
  });
})();

// ─── KPIs ────────────────────────────────────────────────────────────────────

(function addKpis() {
  const kd = s.kpis;
  if (!kd) return;

  const slide = pres.addSlide();
  addSidebar(slide);
  addSlideHdr(slide, '01');
  addKickerTitle(slide, kd.kicker || 'kpis', kd.title || 'os números do mês');

  const leadY = CONTENT_Y + 1.42;
  let cardY = leadY;

  if (kd.lead_html) {
    const leadTxt = kd.lead_html.replace(/<[^>]+>/g, '');
    txt(slide, leadTxt, CONTENT_X, leadY, CONTENT_W, 0.6,
      { fontSize: 8.5, color: C.preto2, lineSpacingMultiple: 1.45, wrap: true });
    cardY = leadY + 0.68;
  }

  const metrics = kd.metrics || [];
  const cols    = Math.min(metrics.length, 5);
  const cardW   = (CONTENT_W - (cols - 1) * 0.14) / cols;
  const cardH   = SLIDE_H - cardY - 0.38;

  metrics.forEach((m, i) => {
    const cx = CONTENT_X + i * (cardW + 0.14);
    rect(slide, cx,         cardY,            cardW, 0.055, C.verde);
    rect(slide, cx,         cardY + 0.055,    cardW, cardH - 0.055, C.card, C.linha);
    txt(slide, m.label,  cx + 0.12, cardY + 0.2,   cardW - 0.24, 0.32, { fontSize: 7.5, color: C.azul, bold: true, charSpacing: 1 });
    txt(slide, m.value,  cx + 0.12, cardY + 0.54,  cardW - 0.24, 0.7,  { fontSize: 17,  color: C.preto, bold: true, shrinkText: true });
    txt(slide, m.note || '', cx + 0.12, cardY + 1.28, cardW - 0.24, cardH - 1.45, { fontSize: 8, color: C.cinzaEscuro, lineSpacingMultiple: 1.3, wrap: true });
  });
})();

// ─── DESTAQUES (helper) ───────────────────────────────────────────────────────

function addDestaquesSlides(sec, kind) {
  if (!sec || !sec.grupos) return;
  const isNeg  = kind === 'neg';
  const acc    = isNeg ? C.azul : C.verde;
  const ptLbl  = isNeg ? 'pontos de atenção:' : 'pontos de destaque:';

  sec.grupos.forEach((g, idx) => {
    const slide = pres.addSlide();
    addSidebar(slide);
    addSlideHdr(slide, String(idx + 1).padStart(2, '0'));
    addKickerTitle(slide, sec.kicker || (isNeg ? 'destaques negativos' : 'destaques positivos'), g.linha);

    const pecas  = g.pecas || [];
    const cols   = Math.min(pecas.length, 2);
    const cardW  = cols > 0 ? (CONTENT_W - (cols - 1) * 0.16) / cols : CONTENT_W;
    const cardY  = CONTENT_Y + 1.42;
    const cardH  = SLIDE_H - cardY - 0.38;

    pecas.forEach((p, pi) => {
      const cx = CONTENT_X + pi * (cardW + 0.16);
      rect(slide, cx, cardY,         cardW, 0.055, acc);
      rect(slide, cx, cardY + 0.055, cardW, cardH - 0.055, C.card, C.linha);

      txt(slide, p.nome,      cx + 0.14, cardY + 0.15, cardW - 0.28, 0.42, { fontSize: 9.5, color: C.preto, bold: true, lineSpacingMultiple: 1.2, wrap: true });
      txt(slide, p.cap || '', cx + 0.14, cardY + 0.6,  cardW - 0.28, 0.38, { fontSize: 8,   color: C.cinzaEscuro, italic: true, lineSpacingMultiple: 1.2, wrap: true });
      txt(slide, ptLbl,       cx + 0.14, cardY + 1.02, cardW - 0.28, 0.22, { fontSize: 7.5, color: acc, bold: true, charSpacing: 0.5 });
      txt(slide,
        (p.pontos || []).map(pt => `· ${pt}`).join('\n'),
        cx + 0.14, cardY + 1.26, cardW - 0.28, cardH - 1.42,
        { fontSize: 8, color: C.preto2, lineSpacingMultiple: 1.4, wrap: true }
      );
    });
  });
}

addDestaquesSlides(s.destaques_positivos, 'pos');
addDestaquesSlides(s.destaques_negativos, 'neg');

// ─── BENCHMARKS ──────────────────────────────────────────────────────────────

(function addBenchmarks() {
  const bd = s.benchmarks;
  if (!bd) return;

  const items     = bd.items || [];
  const chunkSize = 6;
  const chunks    = [];
  for (let i = 0; i < items.length; i += chunkSize) chunks.push(items.slice(i, i + chunkSize));

  chunks.forEach((chunk, ci) => {
    const slide = pres.addSlide();
    addSidebar(slide);
    addSlideHdr(slide, String(ci + 1).padStart(2, '0'));

    const kicker = chunks.length > 1
      ? `${bd.kicker || 'benchmarks'} · parte ${ci + 1}/${chunks.length}`
      : (bd.kicker || 'benchmarks');

    addKickerTitle(slide, kicker, bd.title || 'o que o mercado fez');

    const cols   = Math.min(chunk.length, 3);
    const rows   = Math.ceil(chunk.length / cols);
    const cardW  = (CONTENT_W - (cols - 1) * 0.14) / cols;
    const cardY  = CONTENT_Y + 1.42;
    const totalH = SLIDE_H - cardY - 0.38;
    const cardH  = (totalH - (rows - 1) * 0.1) / rows;

    chunk.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx  = CONTENT_X + col * (cardW + 0.14);
      const cy  = cardY + row * (cardH + 0.1);

      rect(slide, cx,         cy, 0.055, cardH, C.azul);
      rect(slide, cx + 0.055, cy, cardW - 0.055, cardH, C.card, C.linha);

      txt(slide, `[${item.tag}]`, cx + 0.2, cy + 0.1,  cardW - 0.35, 0.3,          { fontSize: 8.5, color: C.azul, bold: true, charSpacing: 0.5 });
      txt(slide, item.tese,       cx + 0.2, cy + 0.42, cardW - 0.35, cardH - 0.58, { fontSize: 8.5, color: C.preto2, lineSpacingMultiple: 1.4, wrap: true });
    });
  });
})();

// ─── OPORTUNIDADES & TESTES ───────────────────────────────────────────────────

(function addOportunidades() {
  const od = s.oportunidades_testes;
  if (!od) return;

  const items     = od.hipoteses || [];
  const chunkSize = 5;
  const chunks    = [];
  for (let i = 0; i < items.length; i += chunkSize) chunks.push(items.slice(i, i + chunkSize));

  chunks.forEach((chunk, ci) => {
    const slide = pres.addSlide();
    addSidebar(slide);
    addSlideHdr(slide, String(ci + 1).padStart(2, '0'));

    const kicker = chunks.length > 1
      ? `${od.kicker || 'oportunidades & testes'} · parte ${ci + 1}/${chunks.length}`
      : (od.kicker || 'oportunidades & testes');

    addKickerTitle(slide, kicker, od.title || 'as apostas para o próximo mês');

    const listY  = CONTENT_Y + 1.42;
    const listH  = SLIDE_H - listY - 0.38;
    const itemH  = (listH - (chunk.length - 1) * 0.08) / chunk.length;

    chunk.forEach((h, i) => {
      const iy = listY + i * (itemH + 0.08);

      rect(slide, CONTENT_X, iy, CONTENT_W, itemH, C.card, C.linha);

      // Tag
      txt(slide, h.tag, CONTENT_X + 0.12, iy + 0.08, 1.0, itemH - 0.16,
        { fontSize: 8, color: C.verde, bold: true, valign: 'middle' });

      // Divisor vertical
      rect(slide, CONTENT_X + 1.18, iy + 0.1, 0.012, itemH - 0.2, C.linha);

      // Título + Descrição
      txt(slide, h.titulo,    CONTENT_X + 1.3, iy + 0.08, CONTENT_W - 1.44, 0.3,  { fontSize: 10, color: C.preto, bold: true, lineSpacingMultiple: 1.2 });
      txt(slide, h.descricao, CONTENT_X + 1.3, iy + 0.4,  CONTENT_W - 1.44, itemH - 0.55, { fontSize: 8.5, color: C.preto2, lineSpacingMultiple: 1.35, wrap: true });
    });
  });
})();

// ─── CLOSING ─────────────────────────────────────────────────────────────────

(function addClosing() {
  const slide = pres.addSlide();
  rect(slide, 0, 0, SLIDE_W, SLIDE_H, C.preto);
  addSidebar(slide, C.verde);

  const cx = SIDEBAR_W + 0.79;
  const cw = SLIDE_W - cx - 0.79;

  txt(slide, `próximas leituras em ${janela}`, cx, 2.3, cw, 0.38,
    { fontSize: 8.5, color: C.verde, bold: true, charSpacing: 3 });
  txt(slide, ';;)', cx, 2.85, cw, 1.9,
    { fontSize: 50, color: C.branco, bold: true, italic: true });
  txt(slide, `${clientName} · mkt growth`, cx, 5.0, cw, 0.3,
    { fontSize: 8, color: C.sidebarYear, charSpacing: 2 });
})();

// ─── WRITE ───────────────────────────────────────────────────────────────────

const outDir  = join(REPO_ROOT, 'apresentacoes', edition);
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `midia-fechamento-mensal.pptx`);

await pres.writeFile({ fileName: outPath });
log('apresentacao-pptx', `wrote ${outPath}`);
log('apresentacao-pptx', `abrir no PowerPoint/Google Slides para ajustes finais`);
