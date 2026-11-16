// PRESEME · série "Na UBS, e agora?" · desenho 1/3 · o molde (igual em toda peça da série; o chat não mexe aqui)
// Cores, letras, texto que se quebra sozinho, o trilho do protocolo (a cara da série), a conta do gesto,
// os cartões (pergunta, 192, alerta, cuidado) e as pessoas da visita (a ACS e o estudante).
// Todo texto da tela vem do textos.js. O que é de uma peça só (o paciente, os gestos, os destaques) está em film-2-peca.js.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const C = { floresta: '#17402C', papel: '#F4EDDF', marca: '#E4EB6C', coral: '#F16D4D', salvia: '#B5D8C0', folha: '#30724E', noite: '#072618', branco: '#FFFDF6', pele: '#C98A62', peleClara: '#DBA27E', peleEscura: '#A86E4B', miolo: '#C9A063', cabelo: '#2B211E', grisalho: '#B9B2A6', madeira: '#B8875A' };
  const INK = C.floresta;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2; // 60, 940, 221, 1498, 500
  const GY = 1400, BASE = 690, TRILHO_Y = 800; // o chão; a base da última linha do texto; o trilho do protocolo
  const NB = '\u00A0'; // espaço que não quebra: o trecho marcado fica numa linha só
  const D = (k) => TX[k] || '';
  const P = () => globalThis.PECA || {}; // o que é da peça (film-2-peca.js)

  const txt = (ctx, s, x, y, o = {}) => G.text(ctx, s, x, y, Object.assign({ fam: 'Inter', weight: 800, color: INK, boil: 0, size: 56 }, o));
  const hand = (ctx, s, x, y, o = {}) => G.text(ctx, s, x, y, Object.assign({ fam: 'Caveat', weight: 700, color: INK, size: 60 }, o));
  const wid = (ctx, s, size, fam = 'Inter', weight = 800) => G.measure(ctx, s, size, fam, weight);

  function mark(ctx, x, y, w, size, seed = 5, color = C.marca) {
    G.poly(ctx, [[x - 10, y - size * 0.82], [x + w + 12, y - size * 0.9], [x + w + 8, y + size * 0.2], [x - 14, y + size * 0.26]], { fill: color, stroke: null, lw: 0, seed, amp: 2.2 });
  }
  function quebrar(ctx, s, size, maxW, fam = 'Inter', weight = 800) {
    const out = []; let cur = '';
    for (const w of s.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && wid(ctx, t, size, fam, weight) > maxW) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }
  // mesma quantidade de linhas, com as linhas de tamanho parecido e sem palavrinha solta no fim da linha
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'às', 'ao', 'para', 'por', 'com', 'se', 'seu', 'sua', 'esta', 'este', 'essa', 'esse', 'não', 'ou']);
  function equilibrar(ctx, s, size, maxW, fam, weight) {
    const base = quebrar(ctx, s, size, maxW, fam, weight), k = base.length;
    if (k < 2) return base;
    let melhor = base, nota = Infinity;
    for (let w = maxW; w > maxW * 0.45; w -= 20) {
      const ls = quebrar(ctx, s, size, w, fam, weight);
      if (ls.length !== k) break;
      const ws = ls.map((l) => wid(ctx, l, size, fam, weight));
      const fracas = ls.slice(0, -1).filter((l) => FRACA.has(l.split(' ').pop().toLowerCase().replace(/[.,;:!?]/g, ''))).length;
      const n = Math.max(...ws) - Math.min(...ws) + 400 * fracas;
      if (n < nota) { nota = n; melhor = ls; }
    }
    return melhor;
  }
  const memo = new Map();
  function linhasDe(ctx, n, size, maxW) {
    const key = n + ':' + size + ':' + maxW;
    if (!memo.has(key)) {
      let s = TX[n] || ''; const d = (P().DESTAQUE || {})[n];
      if (d && s.includes(d)) s = s.replace(d, d.split(' ').join(NB)); // o trecho marcado não se parte em duas linhas
      memo.set(key, equilibrar(ctx, s, size, maxW));
    }
    return memo.get(key);
  }
  // cor = a cor da letra fora do marca-texto; dentro dele a letra é sempre escura
  function desenhaLinhas(ctx, ls, n, size, yDe, cor = INK, cx = CX) {
    const d = (P().DESTAQUE || {})[n];
    ls.forEach((l, i) => {
      const s = l.split(NB).join(' '), y = yDe(i), x = cx - wid(ctx, s, size) / 2, k = d ? s.indexOf(d) : -1;
      if (k < 0) { txt(ctx, s, x, y, { size, color: cor }); return; }
      const a = s.slice(0, k), b = s.slice(k + d.length), xa = x + wid(ctx, a, size), wd = wid(ctx, d, size);
      mark(ctx, xa, y, wd, size, 7 + n * 3 + i);
      if (cor === INK) { txt(ctx, s, x, y, { size }); return; }
      const p = (b.match(/^[.,;:!?]+/) || [''])[0], wp = wid(ctx, p, size);
      if (p) mark(ctx, xa + wd, y, wp, size, 9 + n * 3 + i);
      txt(ctx, a, x, y, { size, color: cor }); txt(ctx, d + p, xa, y, { size }); txt(ctx, b.slice(p.length), xa + wd + wp, y, { size, color: cor });
    });
  }
  // a frase da vez, centrada; a última linha fica em baseY
  function bloco(ctx, n, { baseY = BASE, sizes = [58, 54, 50, 46], maxLinhas = [2, 3, 3, 4], maxW = R - L, alpha = 1, dy = 0, cor = INK, cx = CX } = {}) {
    if (!TX[n]) return;
    let size = sizes[sizes.length - 1], ls = null;
    for (let i = 0; i < sizes.length; i++) {
      const t = linhasDe(ctx, n, sizes[i], maxW);
      const cabe = t.every((l) => wid(ctx, l.split(NB).join(' '), sizes[i]) <= maxW);
      if (t.length <= maxLinhas[i] && cabe) { size = sizes[i]; ls = t; break; }
    }
    if (!ls) ls = linhasDe(ctx, n, size, maxW);
    const lh = size * 1.27;
    ctx.save(); ctx.globalAlpha *= alpha;
    desenhaLinhas(ctx, ls, n, size, (i) => baseY - (ls.length - 1 - i) * lh + dy, cor, cx);
    ctx.restore();
  }

  function chip(ctx, label, x, y, bg, fg, size = 34) {
    const w = wid(ctx, label, size) + 44;
    G.rrect(ctx, x, y - size * 1.3, w, size * 1.82, size * 0.91, { fill: bg, stroke: INK, lw: 3.5, seed: 3 });
    txt(ctx, label, x + 22, y, { size, color: fg });
    return w;
  }
  function chao(ctx, gy = GY, cor = C.salvia) {
    G.poly(ctx, [[-700, gy], [W + 700, gy], [W + 700, H + 400], [-700, H + 400]], { fill: cor, stroke: null, lw: 0, seed: 6, hatch: { color: 'rgba(23,64,44,0.13)', gap: 13 } });
    G.line(ctx, [[-700, gy], [W + 700, gy]], { color: INK, lw: 8, seed: 5 });
  }
  function balao(ctx, linhas, x, y, tx, ty, size = 46) {
    const w = Math.max(...linhas.map((s) => wid(ctx, s, size, 'Inter', 700))) + 64, h = linhas.length * size * 1.3 + 44;
    G.poly(ctx, [[x + 60, y + h - 6], [tx, ty], [x + 150, y + h - 6]], { fill: C.branco, stroke: INK, lw: 5, seed: 41 });
    G.rrect(ctx, x, y, w, h, 34, { fill: C.branco, stroke: INK, lw: 5, seed: 42 });
    G.poly(ctx, [[x + 66, y + h - 8], [tx + 6, ty - 14], [x + 144, y + h - 8]], { fill: C.branco, stroke: null, lw: 0, seed: 43, amp: 0 });
    linhas.forEach((s, i) => txt(ctx, s, x + 32, y + 30 + size * (i + 0.85) * 1.3 - size * 0.25, { size, weight: 700 }));
  }
  function seta(ctx, x0, y0, x1, y1, { cor = C.coral, lw = 12, ponta = 34, seed = 70 } = {}) {
    G.line(ctx, [[x0, y0], [x1, y1]], { color: cor, lw, seed });
    const a = Math.atan2(y1 - y0, x1 - x0);
    G.poly(ctx, [[x1 + Math.cos(a) * ponta * 0.5, y1 + Math.sin(a) * ponta * 0.5], [x1 + Math.cos(a + 2.4) * ponta, y1 + Math.sin(a + 2.4) * ponta], [x1 + Math.cos(a - 2.4) * ponta, y1 + Math.sin(a - 2.4) * ponta]], { fill: cor, stroke: INK, lw: 4, seed: seed + 1 });
  }
  function xis(ctx, cx, cy, r, k = 1, seed = 90) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
    G.line(ctx, [[-r, -r], [r, r]], { color: C.coral, lw: 26, seed }); G.line(ctx, [[r, -r], [-r, r]], { color: C.coral, lw: 26, seed: seed + 1 });
    ctx.restore();
  }

  // ---------- o trilho do protocolo: a cara da série. Um círculo por passo, ligados por uma linha;
  // o passo da vez fica no marca-texto, o que já passou ganha um visto. Fica no alto do palco nas cenas de passo.
  function trilho(ctx, atual, total, { y = TRILHO_Y, alpha = 1, tudoFeito = false, t = 0, tAcende = -1 } = {}) {
    if (!total) return;
    const x0 = L + 70, x1 = R - 70, passo = total > 1 ? (x1 - x0) / (total - 1) : 0, r = 40;
    ctx.save(); ctx.globalAlpha *= alpha;
    G.line(ctx, [[x0, y], [x1, y]], { color: INK, lw: 7, seed: 12 });
    for (let i = 1; i <= total; i++) {
      const x = x0 + passo * (i - 1), feito = tudoFeito || i < atual, vez = !tudoFeito && i === atual;
      const z = vez ? 1 + 0.25 * U.pulse(t, tAcende, 8) : 1;
      G.ellipse(ctx, x, y, r * z, r * z, { fill: vez ? C.marca : feito ? C.salvia : C.papel, stroke: INK, lw: 6, seed: 20 + i });
      if (feito) G.line(ctx, [[x - 17, y + 2], [x - 4, y + 15], [x + 19, y - 14]], { color: INK, lw: 8, seed: 30 + i });
      else txt(ctx, String(i), x, y + 17, { size: 46, align: 'center' });
    }
    ctx.restore();
  }
  // a conta do gesto: uma bolinha por golpe ou compressão, que enche na batida certa; em cima, o nome do gesto
  function conta(ctx, c, t, { x = R - 34, y = 884, rot = null } = {}) {
    if (!c.tConta) return;
    const n = c.tConta.length, gap = 58, x0 = x - gap * (n - 1);
    if (rot) hand(ctx, D(rot), x0 - 40, y + 14, { size: 44, align: 'right' });
    c.tConta.forEach((tc, k) => {
      const cheio = t >= tc, z = cheio ? 1 + 0.35 * U.pulse(t, tc, 10) : 1;
      G.ellipse(ctx, x0 + gap * k, y, 22 * z, 22 * z, { fill: cheio ? C.coral : C.papel, stroke: INK, lw: 5, seed: 50 + k });
      if (cheio) txt(ctx, String(k + 1), x0 + gap * k, y + 11, { size: 30, color: C.noite, align: 'center' });
    });
  }
  // quanto o gesto "bate" agora (1 no instante do golpe, caindo depois); serve para mexer a mão e o corpo
  function batida(c, t) {
    if (!c.tConta) return 0;
    let v = 0;
    for (const tc of c.tConta) { const d = t - tc; if (d >= -0.12 && d < 0.4) v = Math.max(v, d < 0 ? 1 + d / 0.12 : Math.exp(-d * 9)); }
    return v;
  }

  // ---------- os cartões do molde ----------
  // a pergunta: tela cheia, fundo Floresta, a frase em letra enorme e o trilho vazio embaixo (o protocolo que vem)
  function cartaoPergunta(ctx, st) {
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    const k = U.ease.outBack(U.clamp((st.t - st.it.t0) / 0.35, 0, 1));
    ctx.save(); ctx.translate(CX, 760); ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); ctx.translate(-CX, -760);
    bloco(ctx, st.it.n, { baseY: 800, sizes: [150, 130, 110], maxLinhas: [1, 2, 2], cor: C.papel });
    ctx.restore();
    trilho(ctx, 0, st.c.passos, { y: 1110, alpha: U.clamp((st.t - st.it.t0 - 0.6) / 0.4, 0, 1) });
  }
  // o 192: o número enorme num telefone e, embaixo, a frase da vez
  function cartao192(ctx, st, extra) {
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    const t = st.t, c = st.c, u = t - c.t0;
    const k = U.ease.outBack(U.clamp(u / 0.4, 0, 1));
    ctx.save(); ctx.translate(CX, 640); ctx.scale(k, k); ctx.translate(-CX, -640);
    G.rrect(ctx, CX - 250, 330, 500, 640, 70, { fill: C.papel, stroke: C.papel, lw: 6, seed: 81 });
    G.rrect(ctx, CX - 205, 410, 410, 450, 26, { fill: C.marca, stroke: INK, lw: 6, seed: 82 });
    txt(ctx, D('D02'), CX, 700, { size: 200, align: 'center', color: INK });
    G.ellipse(ctx, CX, 915, 30, 30, { fill: C.salvia, stroke: INK, lw: 5, seed: 83 });
    ctx.restore();
    if (extra) extra(ctx, st);
    bloco(ctx, st.it.n, { baseY: 1300, sizes: [62, 56, 50, 46], maxLinhas: [2, 3, 3, 4], cor: C.papel, alpha: st.aTexto });
  }
  // o alerta: a borda Coral pisca na entrada (a cena muda de rumo)
  function bordaAlerta(ctx, st) {
    const a = 0.55 + 0.45 * U.pulse(st.t, st.c.t0, 3);
    ctx.save(); ctx.globalAlpha *= a;
    G.rrect(ctx, 18, 18, W - 36, H - 36, 40, { stroke: C.coral, lw: 22, seed: 95 });
    ctx.restore();
  }

  // a mão de uma pessoa num ponto da tela: o Ch.person quer o alvo da mão em coordenadas do corpo dela
  // (origem nos pés, antes da escala e da rotação); handR é o braço do lado direito da tela, handL o do esquerdo
  function mao(p, ax, ay) {
    const s = p.s || 1, r = -(p.rot || 0), dx = ax - p.x, dy = ay - p.y;
    return [(dx * Math.cos(r) - dy * Math.sin(r)) / (s * (p.sx || 1)), (dx * Math.sin(r) + dy * Math.cos(r)) / (s * (p.sy || 1))];
  }
  // ---------- as pessoas da visita (as mesmas em toda peça da série) ----------
  const ACS = { skin: C.peleEscura, hair: C.cabelo, hairStyle: 'ponytail', outfit: 'shirt', shirt: C.folha, trim: C.marca, collar: C.folha, bottoms: 'pants', shorts: '#4B5A48', build: 'regular', shoes: C.noite, headwear: 'cap', headwearColor: C.folha };
  const ESTUDANTE = { skin: C.peleClara, hair: C.cabelo, hairStyle: 'short', outfit: 'shirt', shirt: C.branco, trim: C.salvia, collar: C.branco, sleeves: 'long', bottoms: 'pants', shorts: C.floresta, shoes: C.papel, build: 'slim' };

  // ---------- o estado do filme no instante t: a cena, a frase da vez e a entrada do texto ----------
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], ultima = i === c.itens.length - 1;
    const st = { t, c, it, i, u: t - c.t0 };
    // a primeira frase da cena entra junto com a imagem (corte); as outras surgem em 0,2 s e somem 0,12 s antes da seguinte
    const corte = i === 0;
    st.aTexto = Math.min(corte ? 1 : U.clamp((t - it.t0) / 0.2, 0, 1), ultima ? 1 : U.clamp((it.t1 - t) / 0.12, 0, 1));
    st.dyTexto = corte ? 0 : (1 - U.ease.outCubic(U.clamp((t - it.t0) / 0.25, 0, 1))) * 16;
    return st;
  }

  globalThis.UBS = { C, INK, L, R, TOP, BOT, CX, GY, BASE, TRILHO_Y, D, txt, hand, wid, mark, quebrar, bloco, chip, chao, balao, seta, xis, trilho, conta, batida, cartaoPergunta, cartao192, bordaAlerta, mao, ACS, ESTUDANTE, estado, CENA: {} };
})();
