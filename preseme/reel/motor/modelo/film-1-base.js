// PRESEME · desenho 1 · a base (modelo do motor): cores da paleta, letras, o texto que se quebra sozinho, o marca-texto
// e o estado do filme no instante t (a cena, a frase da vez e a entrada dela). Veio do sus-hoje, sem o que era só dele.
// Todo texto da tela vem do textos.js. Fixos no desenho, só os dizeres impressos nos objetos (pacote, caixa), com G.decor.
(function () {
  const U = globalThis.U, G = globalThis.G, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  // a paleta do perfil (ficha, seção 1, Arte): Floresta em toda peça; Coral nunca em texto pequeno
  const C = { floresta: '#17402C', papel: '#F4EDDF', marca: '#E4EB6C', coral: '#F16D4D', salvia: '#B5D8C0', folha: '#30724E', noite: '#072618', branco: '#FFFDF6' };
  const INK = C.floresta;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2;
  const BASE = 706; // a linha de base da última linha da frase da vez
  const NB = ' ';
  const D = (k) => TX[k] || '';

  const txt = (ctx, s, x, y, o = {}) => G.text(ctx, s, x, y, Object.assign({ fam: 'Inter', weight: 800, color: INK, boil: 0, size: 56 }, o));
  const hand = (ctx, s, x, y, o = {}) => G.text(ctx, s, x, y, Object.assign({ fam: 'Caveat', weight: 700, color: INK, size: 60 }, o));
  const wid = (ctx, s, size, fam = 'Inter', weight = 800) => G.measure(ctx, s, size, fam, weight);

  // marca-texto atrás de um trecho
  function mark(ctx, x, y, w, size, seed = 5, color = C.marca) {
    G.poly(ctx, [[x - 10, y - size * 0.82], [x + w + 12, y - size * 0.9], [x + w + 8, y + size * 0.2], [x - 14, y + size * 0.26]], { fill: color, stroke: null, lw: 0, seed, amp: 2.2 });
  }
  // o trecho que leva marca-texto em cada frase (a peça preenche: PRESEME.DESTAQUE[3] = 'vigilância'); sumiu da frase, sai sem marca
  const DESTAQUE = {};
  // quebra de linha fixa de um título (a peça preenche, só vale enquanto a frase não mudar)
  const QUEBRA = {};

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
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'às', 'ao', 'para', 'por', 'com', 'se', 'seu', 'sua', 'esta', 'este', 'essa', 'esse']);
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
      let s = TX[n] || ''; const d = DESTAQUE[n];
      if (d && s.includes(d)) s = s.replace(d, d.split(' ').join(NB)); // o trecho marcado não se parte em duas linhas
      memo.set(key, equilibrar(ctx, s, size, maxW));
    }
    return memo.get(key);
  }
  // cor = a letra fora do marca-texto (no fundo escuro, papel); dentro dele a letra é sempre escura
  function desenhaLinhas(ctx, ls, n, size, yDe, cor = INK) {
    const d = DESTAQUE[n];
    ls.forEach((l, i) => {
      const s = l.split(NB).join(' '), y = yDe(i), x = CX - wid(ctx, s, size) / 2, k = d ? s.indexOf(d) : -1;
      if (k < 0) { txt(ctx, s, x, y, { size, color: cor }); return; }
      const a = s.slice(0, k), b = s.slice(k + d.length), xa = x + wid(ctx, a, size), wd = wid(ctx, d, size);
      mark(ctx, xa, y, wd, size, 7 + n * 3 + i);
      if (cor === INK) { txt(ctx, s, x, y, { size }); return; }
      const p = (b.match(/^[.,;:!?]+/) || [''])[0], wp = wid(ctx, p, size);
      if (p) mark(ctx, xa + wd, y, wp, size, 9 + n * 3 + i);
      txt(ctx, a, x, y, { size, color: cor }); txt(ctx, d + p, xa, y, { size }); txt(ctx, b.slice(p.length), xa + wd + wp, y, { size, color: cor });
    });
  }
  // a frase da vez, centrada; a última linha fica em baseY. Letra 58 até 2 linhas; 54, 50 ou 46 até 3 linhas
  function bloco(ctx, n, { baseY = BASE, sizes = [58, 54, 50, 46], maxLinhas = [2, 3, 3, 3], maxW = R - L, alpha = 1, dy = 0, cor = INK } = {}) {
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
    desenhaLinhas(ctx, ls, n, size, (i) => baseY - (ls.length - 1 - i) * lh + dy, cor);
    ctx.restore();
  }
  // o título grande (abertura, fecho)
  function titulo(ctx, n, { alpha = 1, cor = INK } = {}) {
    if (!TX[n]) return;
    const q = QUEBRA[n];
    let size = 104, ls = q && q.join(' ') === TX[n] ? q : null;
    if (!ls) for (const z of [104, 92, 80, 70]) { size = z; ls = linhasDe(ctx, n, z, R - L); if (ls.length <= 3) break; }
    ctx.save(); ctx.globalAlpha *= alpha;
    desenhaLinhas(ctx, ls, n, size, (i) => TOP + 150 + i * size * 1.25, cor);
    ctx.restore();
  }
  // o estado do filme no instante t: a cena (c), a frase da vez (it), u = 0..1 dentro da cena, e a entrada da frase:
  // começo de cena = a frase entra junto com a imagem (corte); dentro da cena, ela surge em 0,2 s. Toda frase some 0,12 s antes da seguinte
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], ultima = i === c.itens.length - 1;
    const corte = i === 0;
    return {
      t, c, it, i, u: (t - c.t0) / Math.max(1e-6, c.t1 - c.t0),
      aTexto: Math.min(corte ? 1 : U.clamp((t - it.t0) / 0.2, 0, 1), ultima ? 1 : U.clamp((it.t1 - t) / 0.12, 0, 1)),
      dyTexto: corte ? 0 : (1 - U.ease.outCubic(U.clamp((t - it.t0) / 0.25, 0, 1))) * 16,
    };
  }
  // cena ainda sem desenho: fundo papel e a frase da vez (o vídeo roda inteiro desde o primeiro dia)
  function padrao(ctx, st) {
    ctx.fillStyle = C.papel; ctx.fillRect(0, 0, W, H);
    bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto, baseY: (TOP + BOT) / 2 });
  }

  globalThis.PRESEME = { C, INK, W, H, L, R, TOP, BOT, CX, BASE, D, DESTAQUE, QUEBRA, txt, hand, wid, mark, quebrar, bloco, titulo, estado, padrao, CENA: {} };
})();
