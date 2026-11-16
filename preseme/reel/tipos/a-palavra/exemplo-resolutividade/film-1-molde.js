// PRESEME · motor "a palavra" · desenho 1 · o MOLDE (igual em toda peça do tipo; não mude).
// Cinco partes, nesta ordem: palavra (a pergunta no alto e o verbete, o cartão de dicionário com a palavra grande, as
// sílabas escritas à mão e a sílaba forte no destaque), significa e exemplo (a frase no alto e o desenho da peça embaixo;
// a cada frase nova a câmera pula para o foco dela), pegadinha (dois cartões, o que confunde e o que é, com o sinal no
// meio e o carimbo) e fecho (o verbete inteiro de novo, agora com a definição, para o print).
// O que é de cada palavra mora no film-2-peca.js (PRESEME_PALAVRA.PECA): os trechos em destaque, o desenho do que a
// palavra quer dizer e do exemplo, os focos da câmera, o sinal da pegadinha. Todo desenho sai do kit de estilos
// (globalThis.ESTILOS) e da biblioteca (globalThis.BIB): a mesma peça sai nos seis estilos trocando ESTILO no score.js.
// Todo texto da tela vem do textos.js ([NN] as frases, [DNN] as palavras do desenho).
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2;
  const p = (t, t0, d) => U.clamp((t - t0) / d, 0, 1);
  const D = (k) => TX[k] || '';
  const NB = ' ';
  const tira = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  // ---------- o estado do filme no instante t ----------
  // c = a parte (cena), it = a frase da vez, i = o número dela na parte, dt = segundos desde o corte, di = desde a frase
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], ultima = i === c.itens.length - 1, corte = i === 0;
    return {
      t, c, it, i, dt: t - c.t0, di: t - it.t0, u: (t - c.t0) / Math.max(1e-6, c.t1 - c.t0),
      ki: U.clamp((t - it.t0) / Math.max(1e-6, it.t1 - it.t0), 0, 1),
      // a frase entra com o corte (primeira da parte) ou em 0,2 s; some 0,12 s antes da seguinte
      aTexto: Math.min(corte ? 1 : p(t, it.t0, 0.2), ultima ? 1 : U.clamp((it.t1 - t) / 0.12, 0, 1)),
      dyTexto: corte ? 0 : (1 - U.ease.outCubic(p(t, it.t0, 0.25))) * 18,
    };
  }

  // ---------- texto: quebra na letra do estilo, linhas equilibradas, trecho destacado que não se parte ----------
  function quebrar(ctx, s, papel, size, maxW) {
    const out = []; let cur = '';
    for (const w of s.split(' ')) {
      const x = cur ? cur + ' ' + w : w;
      if (cur && E.medir(ctx, x.split(NB).join(' '), { papel, size }) > maxW) { out.push(cur); cur = w; } else cur = x;
    }
    if (cur) out.push(cur);
    return out;
  }
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'ao', 'para', 'por', 'com', 'se']);
  const memo = new Map();
  function linhas(ctx, s, papel, size, maxW, trecho) {
    const key = [s, papel, size, maxW, trecho, E.nome].join('|');
    if (memo.has(key)) return memo.get(key);
    const t = trecho && s.includes(trecho) ? s.replace(trecho, trecho.split(' ').join(NB)) : s;
    const base = quebrar(ctx, t, papel, size, maxW);
    let melhor = base, nota = Infinity;
    if (base.length > 1) {
      for (let w = maxW; w > maxW * 0.45; w -= 20) {
        const ls = quebrar(ctx, t, papel, size, w);
        if (ls.length !== base.length) break;
        const ws = ls.map((l) => E.medir(ctx, l.split(NB).join(' '), { papel, size }));
        const fracas = ls.slice(0, -1).filter((l) => FRACA.has(l.split(' ').pop().toLowerCase())).length;
        const n = Math.max(...ws) - Math.min(...ws) + 400 * fracas;
        if (n < nota) { nota = n; melhor = ls; }
      }
    }
    const out = melhor.map((l) => l.split(NB).join(' '));
    memo.set(key, out);
    return out;
  }
  // uma linha centrada em x (ou à esquerda, align: 'left'), com o trecho no destaque
  function linhaComDestaque(ctx, l, trecho, x, y, { papel, size, k = 1, alpha = 1, seed = 7, align = 'center' }) {
    const i = trecho ? l.indexOf(trecho) : -1;
    if (align === 'center') { E.textoComDestaque(ctx, l, i >= 0 ? trecho : '', x, y, { papel, size, align: 'center', k, seed, alpha }); return; }
    ctx.save(); ctx.globalAlpha *= alpha;
    if (i < 0) { E.texto(ctx, l, x, y, { papel, size }); ctx.restore(); return; }
    const a = l.slice(0, i), xa = x + E.medir(ctx, a, { papel, size }), wd = E.medir(ctx, trecho, { papel, size });
    E.destaque(ctx, xa, y, wd, Math.round(size * E.letra(papel)[2]), { k, seed });
    E.texto(ctx, l, x, y, { papel, size });
    ctx.restore();
  }
  // a frase inteira, em até maxLinhas linhas, da maior letra que cabe; devolve onde ela acabou
  function frase(ctx, s, { trecho = '', papel = 'titulo', sizes = [76, 70, 64, 58, 52], maxLinhas = 3, maxW = R - L, x = CX, yTopo = TOP + 20, alpha = 1, k = 1, seed = 7, dy = 0, align = 'center' } = {}) {
    if (!s) return { yFim: yTopo };
    let size = sizes[sizes.length - 1], ls = null;
    for (const z of sizes) {
      const t = linhas(ctx, s, papel, z, maxW, trecho);
      if (t.length <= maxLinhas && t.every((l) => E.medir(ctx, l, { papel, size: z }) <= maxW)) { size = z; ls = t; break; }
    }
    if (!ls) ls = linhas(ctx, s, papel, size, maxW, trecho);
    const zk = Math.round(size * E.letra(papel)[2]), lh = zk * 1.22;
    ls.forEach((l, j) => linhaComDestaque(ctx, l, trecho, x, yTopo + zk + j * lh + dy, { papel, size, k, alpha, seed: seed + j, align }));
    return { yFim: yTopo + zk + (ls.length - 1) * lh + zk * 0.35, size, linhas: ls.length };
  }
  // o trecho de uma frase que é a palavra (sem ligar para maiúscula), para o destaque
  function trechoDaPalavra(s) {
    const pal = String(D('D02')).trim(); if (!pal || !s) return '';
    const i = tira(s).indexOf(tira(pal));
    return i >= 0 ? s.slice(i, i + pal.length) : '';
  }
  const PECA = () => (globalThis.PRESEME_PALAVRA && globalThis.PRESEME_PALAVRA.PECA) || {};
  const DESTAQUE = (n) => (PECA().DESTAQUE || {})[n] || '';

  // ---------- peças do molde ----------
  // etiqueta (a palavra, no alto das partes do meio; a etiqueta do exemplo): fundo escuro, letra clara
  function etiqueta(ctx, s, x, y, { size = 34, alpha = 1, papel = 'apoioEscuro' } = {}) {
    if (!s) return { w: 0, h: 0 };
    const w = E.medir(ctx, s, { papel: 'corpo', size }) + 44, h = Math.round(size * 1.55);
    ctx.save(); ctx.globalAlpha *= alpha;
    E.ret(ctx, x, y, w, h, { papel, r: h / 2, contorno: false, sombra: false, hachura: false, seed: 501 + s.length });
    E.texto(ctx, s, x + 22, y + h * 0.68, { papel: 'corpo', size, cor: 'papel' });
    ctx.restore();
    return { w, h };
  }
  // as sílabas do [D03] ("ads·CRI·ta"): a forte é a que vem em maiúsculas
  function silabas() {
    const s = String(D('D03')).trim();
    if (!s || /^\(.*\)$/.test(s)) return [];
    return s.split(/[·.\-\s]+/).filter(Boolean).map((x) => ({ s: x.toLowerCase(), forte: x === x.toUpperCase() && x !== x.toLowerCase() }));
  }
  // o alto-falante pequeno (a pronúncia): x, y é o centro
  function altoFalante(ctx, x, y, { k = 1, seed = 560 } = {}) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    E.poligono(ctx, [[-26, -12], [-10, -12], [10, -30], [10, 30], [-10, 12], [-26, 12]], { papel: 'tinta', sombra: false, hachura: false, seed });
    for (const [r, sd] of [[22, 1], [38, 2]]) {
      const pts = []; for (let a = -0.8; a <= 0.8001; a += 0.2) pts.push([14 + Math.cos(a) * r, Math.sin(a) * r]);
      E.linha(ctx, pts, { lw: 5, seed: seed + sd });
    }
    ctx.restore();
  }
  // o verbete: o cartão de dicionário. caixa = { x, y, w, h }. definicao: a frase que define (no fecho); k: a entrada
  // (0 a 1); kSil: as sílabas se escrevendo (0 a 1); kForte: o destaque da sílaba forte (0 a 1). Devolve onde cada
  // coisa ficou.
  function verbete(ctx, cx0, { definicao = '', k = 1, kSil = 1, kForte = 1, seed = 300, trechoDef = '' } = {}) {
    const { x, y, w, h } = cx0, pad = 46;
    if (k <= 0) return null;
    ctx.save();
    const sc = 0.82 + 0.18 * U.ease.outBack(k);
    ctx.translate(x + w / 2, y + h / 2 + (1 - U.ease.outCubic(k)) * 260); ctx.scale(sc, sc); ctx.translate(-(x + w / 2), -(y + h / 2));
    ctx.globalAlpha *= U.clamp(k * 3, 0, 1);
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 34, sombra: true, seed });
    // a faixa de cima, com a etiqueta do tipo ([D01])
    const fh = 82;
    E.ret(ctx, x, y, w, fh, { papel: 'apoioEscuro', r: 34, contorno: false, sombra: false, hachura: false, seed: seed + 1 });
    E.ret(ctx, x, y + fh - 34, w, 34, { papel: 'apoioEscuro', r: 0, contorno: false, sombra: false, hachura: false, seed: seed + 2 });
    E.texto(ctx, D('D01'), x + pad, y + fh * 0.66, { papel: 'corpo', size: 36, cor: 'papel' });
    // a palavra, da maior letra que cabe
    const pal = String(D('D02')).trim();
    let size = 84;
    for (const z of [184, 168, 152, 138, 124, 112, 100, 92, 84]) if (E.medir(ctx, pal, { papel: 'titulo', size: z }) <= w - 2 * pad) { size = z; break; }
    const zk = Math.round(size * E.letra('titulo')[2]);
    const yPal = y + fh + 44 + zk;
    E.texto(ctx, pal, x + w / 2, yPal, { papel: 'titulo', size, align: 'center' });
    let yFim = yPal + zk * 0.32;
    // as sílabas, escritas à mão, com o alto-falante; a forte no destaque, com o acento em cima
    const sl = silabas();
    if (sl.length) {
      const papel = 'mao', sep = sl.length > 4 ? ' • ' : '  •  ';
      // a maior letra em que as sílabas, o alto-falante e os separadores cabem no cartão (no pixel a letra é larga)
      let zs = 34, ws = [], wsep = 0, tot = 0;
      for (const z of [74, 68, 62, 56, 50, 46, 42, 38, 34]) {
        ws = sl.map((q) => E.medir(ctx, q.s, { papel, size: z })); wsep = E.medir(ctx, sep, { papel, size: z });
        tot = ws.reduce((a, b) => a + b, 0) + wsep * (sl.length - 1) + 100; zs = z;
        if (tot <= w - 2 * pad) break;
      }
      const zks = Math.round(zs * E.letra(papel)[2]);
      let xs = x + w / 2 - tot / 2;
      const ys = yFim + 46 + zks;
      altoFalante(ctx, xs + 26, ys - zks * 0.4, { k: U.clamp(kSil * 3, 0, 1), seed: seed + 10 });
      xs += 100;
      const nVer = Math.ceil(U.clamp(kSil, 0, 1) * sl.length);
      sl.forEach((q, i) => {
        if (i < nVer) {
          if (q.forte && kForte > 0) {
            E.destaque(ctx, xs, ys, ws[i], zks, { k: kForte, seed: seed + 20 });
            E.linha(ctx, [[xs + ws[i] * 0.38, ys - zks * 1.3], [xs + ws[i] * 0.66, ys - zks * 1.75]], { papel: 'alerta', lw: 10, k: kForte, seed: seed + 21 });
          }
          E.texto(ctx, q.s, xs, ys, { papel, size: zs });
          if (i < sl.length - 1) E.texto(ctx, sep, xs + ws[i], ys, { papel, size: zs, alpha: 0.55 });
        }
        xs += ws[i] + wsep;
      });
      yFim = ys + zks * 0.4;
    }
    // a definição (no fecho), com a linha que separa
    if (definicao) {
      E.linha(ctx, [[x + pad, yFim + 34], [x + w - pad, yFim + 34]], { lw: 4, seed: seed + 30 });
      const r = frase(ctx, definicao, { trecho: trechoDef, papel: 'titulo', sizes: [58, 54, 50, 46, 42], maxLinhas: 5, maxW: w - 2 * pad, x: x + w / 2, yTopo: yFim + 64, seed: seed + 31 });
      yFim = r.yFim;
    }
    // a fonte, embaixo, pequena
    const fonte = String(D('D04')).trim();
    if (fonte) E.texto(ctx, fonte, x + pad, y + h - 34, { papel: 'corpo', size: 30, alpha: 0.85 });
    ctx.restore();
    return { yPal, yFim, size };
  }

  // o cartão de um lado da pegadinha: o texto no meio, o desenho opcional em cima
  function cartaoLado(ctx, caixa, s, { k = 1, dx = 0, papel = 'superficie', seed = 640 } = {}) {
    if (k <= 0) return;
    const { x, y, w, h } = caixa;
    ctx.save(); ctx.translate(dx * (1 - U.ease.outCubic(k)), 0); ctx.globalAlpha *= U.clamp(k * 2, 0, 1);
    E.ret(ctx, x, y, w, h, { papel, r: 30, sombra: true, seed });
    let size = 64;
    for (const z of [76, 68, 62, 56, 50, 46, 42]) { const ls = linhas(ctx, s, 'titulo', z, w - 60, ''); if (ls.length <= 3 && ls.every((l) => E.medir(ctx, l, { papel: 'titulo', size: z }) <= w - 60)) { size = z; break; } }
    const ls = linhas(ctx, s, 'titulo', size, w - 60, '');
    const zk = Math.round(size * E.letra('titulo')[2]), lh = zk * 1.22, y0 = y + h * 0.62 - ((ls.length - 1) * lh) / 2;
    ls.forEach((l, j) => E.texto(ctx, l, x + w / 2, y0 + j * lh, { papel: 'titulo', size, align: 'center' }));
    ctx.restore();
  }

  // ---------- as cinco partes ----------
  const VERBETE = { x: L, y: 0, w: R - L, h: 0 }; // y e h saem da frase de cima (palavra) ou do quadro (fecho)

  // 1. palavra: a pergunta no alto; o verbete sobe (pop), as sílabas se escrevem (lápis) e a forte ganha o destaque (baque)
  function palavra(ctx, st) {
    E.fundo(ctx);
    const GA = SC.GANCHO || {}, t = st.t, n = st.it.n;
    const z = 1 + 0.035 * U.ease.inOutQuad(st.u);
    const r = frase(ctx, TX[n], { trecho: DESTAQUE(n) || trechoDaPalavra(TX[n]), alpha: st.aTexto, k: U.ease.inOutCubic(p(t, st.c.t0 + 0.2, 0.5)), seed: 10 + n * 3 });
    const livre = BOT - 20 - (r.yFim + 50), h = Math.min(720, livre), y = r.yFim + 50 + Math.max(0, (livre - h) * 0.42);
    ctx.save(); ctx.translate(CX, y + h / 2); ctx.scale(z, z); ctx.translate(-CX, -(y + h / 2));
    verbete(ctx, Object.assign({}, VERBETE, { y, h }), {
      k: p(t, st.c.t0 + (GA.entrada ?? 0.25) - 0.05, 0.4),
      kSil: p(t, st.c.t0 + (GA.silabas ?? 1.4), 0.5),
      kForte: U.ease.inOutCubic(p(t, st.c.t0 + (GA.forte ?? 1.9), 0.35)),
    });
    if (PECA().palavra) PECA().palavra(ctx, st, M, { x: L, y, w: R - L, h });
    ctx.restore();
  }

  // 2 e 3. significa e exemplo: a palavra (e a etiqueta do exemplo) no alto, a frase, e o desenho da peça embaixo,
  // recortado abaixo da frase. focos: um ponto por frase, [x, y] ou null; com foco, a câmera pula para ele (corte) e
  // chega perto devagar; o ponto fica parado na tela. A peça desenha no quadro inteiro (1080 × 1920), chão em torno de 1450.
  function explica(ctx, st, qual) {
    E.fundo(ctx);
    const P = PECA(), t = st.t, n = st.it.n;
    const e1 = etiqueta(ctx, String(D('D02')).trim(), L, TOP);
    if (qual === 'exemplo') etiqueta(ctx, D('D08'), L + e1.w + 16, TOP, { papel: 'alerta' });
    const r = frase(ctx, TX[n], { trecho: DESTAQUE(n), yTopo: TOP + e1.h + 26, sizes: [66, 62, 58, 54, 50], alpha: st.aTexto, dy: st.dyTexto, k: U.ease.inOutCubic(p(t, st.it.t0 + 0.2, 0.45)), seed: 40 + n * 3 });
    const yClip = Math.max(r.yFim + 30, TOP + 260);
    const focos = (qual === 'exemplo' ? P.focoExemplo : P.focoSignifica) || [];
    const fi = focos[Math.min(st.i, focos.length - 1)] || null;
    const foco = fi || [540, 1180];
    const zz = (fi ? 1.28 : 1) * (1 + 0.04 * U.ease.inOutQuad(st.ki));
    ctx.save(); ctx.beginPath(); ctx.rect(0, yClip, W, H - yClip); ctx.clip();
    ctx.translate(foco[0], foco[1]); ctx.scale(zz, zz); ctx.translate(-foco[0], -foco[1]);
    const fn = P[qual];
    if (fn) fn(ctx, st, M, st.ki);
    ctx.restore();
  }
  const significa = (ctx, st) => explica(ctx, st, 'significa');
  const exemplo = (ctx, st) => explica(ctx, st, 'exemplo');

  // 4. pegadinha: a frase no alto; o que confunde ([D05]) entra pela esquerda, o que é ([D06]) pela direita, com o sinal
  // no meio (PECA.sinal: '≠' ou '='); o carimbo [D07] bate no cartão da esquerda aos 0,9 s (com o baque do score)
  function pegadinha(ctx, st) {
    E.fundo(ctx);
    const P = PECA(), t = st.t, n = st.it.n;
    const e1 = etiqueta(ctx, String(D('D02')).trim(), L, TOP);
    const r = frase(ctx, TX[n], { trecho: DESTAQUE(n), yTopo: TOP + e1.h + 26, sizes: [66, 62, 58, 54, 50], maxLinhas: 4, alpha: st.aTexto, k: U.ease.inOutCubic(p(t, st.c.t0 + 0.3, 0.45)), seed: 70 + n * 3 });
    const y = Math.max(r.yFim + 90, 860), cw = 380, ch = 420, gap = (R - L) - 2 * cw;
    const esq = { x: L, y, w: cw, h: ch }, dir = { x: R - cw, y, w: cw, h: ch };
    cartaoLado(ctx, esq, D('D05'), { k: p(t, st.c.t0 + 0.1, 0.35), dx: -300, papel: 'superficie', seed: 650 });
    cartaoLado(ctx, dir, D('D06'), { k: p(t, st.c.t0 + 0.35, 0.35), dx: 300, papel: 'superficie', seed: 660 });
    if (P.pegadinha) P.pegadinha(ctx, st, M, { esq, dir });
    const ks = U.ease.outBack(p(t, st.c.t0 + 0.55, 0.3));
    if (ks > 0) {
      const sx = L + cw + gap / 2, sy = y + ch * 0.52;
      ctx.save(); ctx.translate(sx, sy); ctx.scale(ks, ks);
      E.texto(ctx, P.sinal || '≠', 0, 34, { papel: 'titulo', size: 120, align: 'center' });
      ctx.restore();
    }
    if (P.carimbo !== false && t >= st.c.t0 + 0.9) E.carimbo(ctx, D('D07'), esq.x + cw / 2, y + ch * 0.13, { k: p(t, st.c.t0 + 0.9, 0.16), rot: -0.14, size: 46, seed: 700 });
  }

  // 5. fecho: o verbete inteiro de novo, com a frase do fecho como definição; o visto bate no canto (o certo do score)
  function fecho(ctx, st) {
    E.fundo(ctx);
    const t = st.t, n = st.it.n, h = Math.min(BOT - TOP - 40, 1000), y = TOP + (BOT - TOP - h) * 0.4;
    verbete(ctx, Object.assign({}, VERBETE, { y, h }), { definicao: TX[n], trechoDef: DESTAQUE(n), k: 0.55 + 0.45 * p(t, st.c.t0, 0.3), kSil: 1, kForte: 1 });
    const kv = p(t, st.c.t0 + 0.35, 0.25);
    if (kv > 0) {
      const B = globalThis.BIB;
      if (B) B.visto(ctx, { x: R - 50, y: y + 140, k: U.ease.outBack(kv), s: 1.5, papel: 'apoioEscuro' });
    }
    if (PECA().fecho) PECA().fecho(ctx, st, M, { x: L, y, w: R - L, h });
  }

  const M = { W, H, L, R, TOP, BOT, CX, p, D, frase, etiqueta, verbete, silabas, altoFalante, trechoDaPalavra };
  const PARTE = { palavra, significa, exemplo, pegadinha, fecho };
  globalThis.PRESEME_PALAVRA = Object.assign(globalThis.PRESEME_PALAVRA || {}, { M, estado, PARTE });
})();
