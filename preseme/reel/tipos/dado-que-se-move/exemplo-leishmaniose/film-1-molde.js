// PRESEME · motor "Dado que se move" · desenho 1/3 · o molde (igual em toda peça deste tipo; o chat não mexe aqui)
// A cara do tipo: o rótulo no alto (D01) e a frase da vez como título; embaixo de tudo, a fonte com o ano (D05), sempre
// que há número na tela. As cenas:
//   gancho     o número grande sobe de 0 até o valor (D02) e para com uma batida; o lugar e o ano (D04) num selo em cima,
//              a unidade (D03) embaixo
//   conta      o que o número quer dizer: a multidão de 100 mil (D06) com um ponto aceso por caso (D07), ou a grade de
//              100 pessoas com as do número acesas
//   compara    as barras crescem uma depois da outra (D08 a D15, nome e valor; a primeira é a da peça), todas na mesma
//              unidade; na 2ª frase, a régua: a última barra vira bloco e cabe tantas vezes na primeira
//   porque     por que é assim, desenhado pela peça (PECA.PORQUE)
//   prevencao  o que fazer, desenhado pela peça (PECA.PREVENCAO)
//   fecho      o número de novo, parado, e a fonte grande num cartão que carimba
// Cores e letras vêm do kit de estilos (ferramentas/estilos.js): a mesma peça sai em qualquer estilo trocando o ESTILO do score.js.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const SAFE = G.SAFE;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2;
  const NB = ' ';
  const D = (k) => TX[k] || '';
  const P = () => globalThis.PECA || {};
  const cor = (p) => E.cor(p);
  const p01 = (t, t0, d) => U.clamp((t - t0) / d, 0, 1);
  const DW = SC.DW;
  const AREA = { x: 0, y: 600, w: 1080, h: 850 }; // a área do desenho da peça (porquê e prevenção), abaixo do título
  // um número de 0 a 1 que é sempre o mesmo para o mesmo i (posição dos pontos, sem Math.random)
  const hash = (i, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
  // o número do jeito brasileiro: 3.218 e 43,38
  const fmt = (v, cs = 0) => {
    if (!Number.isFinite(v)) return '';
    const [i, d] = Math.abs(v).toFixed(cs).split('.');
    return (v < 0 ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (d ? ',' + d : '');
  };
  // a cor de apoio que não some no fundo do estilo (na lousa, Sálvia; no papel e no chapado, Folha)
  const apoio = () => (E.escuro() ? 'apoio' : 'apoioEscuro');

  // ---------- texto: quebra sozinha, linhas de tamanho parecido, sem palavrinha solta no fim da linha ----------
  const fonte = (papel = 'corpo') => E.letra(papel); // [família, peso, escala]
  const wid = (ctx, s, size, papel = 'corpo') => { const [fam, w, k] = fonte(papel); return G.measure(ctx, s, Math.round(size * k), fam, w); };
  const escrever = (ctx, s, x, y, { size = 56, papel = 'corpo', cor: c = 'texto', align = 'left', alpha = 1 } = {}) => E.texto(ctx, s, x, y, { papel, size, align, cor: c, alpha });

  function quebrar(ctx, s, size, maxW, papel) {
    const out = []; let cur = '';
    for (const w of s.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && wid(ctx, t, size, papel) > maxW) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'ao', 'para', 'por', 'com', 'se', 'não', 'ou', 'pela', 'pelo', 'mas']);
  function equilibrar(ctx, s, size, maxW, papel) {
    const base = quebrar(ctx, s, size, maxW, papel), k = base.length;
    if (k < 2) return base;
    let melhor = base, nota = Infinity;
    for (let w = maxW; w > maxW * 0.45; w -= 20) {
      const ls = quebrar(ctx, s, size, w, papel);
      if (ls.length !== k) break;
      const ws = ls.map((l) => wid(ctx, l, size, papel));
      const fracas = ls.slice(0, -1).filter((l) => FRACA.has(l.split(' ').pop().toLowerCase().replace(/[.,;:!?"”]/g, ''))).length;
      const n = Math.max(...ws) - Math.min(...ws) + 400 * fracas;
      if (n < nota) { nota = n; melhor = ls; }
    }
    return melhor;
  }
  const memo = new Map();
  function linhasDe(ctx, n, size, maxW, papel, texto) {
    const key = [n, size, maxW, papel, texto ? 't' + texto : '', E.nome].join(':');
    if (!memo.has(key)) {
      let s = texto != null ? texto : TX[n] || ''; const d = (P().DESTAQUE || {})[n];
      if (d && s.includes(d)) s = s.replace(d, d.split(' ').join(NB)); // o trecho destacado não se parte em duas linhas
      memo.set(key, equilibrar(ctx, s, size, maxW, papel));
    }
    return memo.get(key);
  }
  // escolhe o maior tamanho em que o texto cabe em maxW e em maxLinhas
  function caber(ctx, n, { sizes = [58, 54, 50, 46], maxLinhas = [2, 3, 3, 4], maxW = R - L, papel = 'corpo', texto } = {}) {
    for (let i = 0; i < sizes.length; i++) {
      const t = linhasDe(ctx, n, sizes[i], maxW, papel, texto);
      if (t.length <= maxLinhas[i] && t.every((l) => wid(ctx, l.split(NB).join(' '), sizes[i], papel) <= maxW)) return { size: sizes[i], ls: t };
    }
    const size = sizes[sizes.length - 1];
    return { size, ls: linhasDe(ctx, n, size, maxW, papel, texto) };
  }
  // desenha as linhas; a de y0 é a primeira (topo) ou, com base, a última (baseY); o trecho da peça (DESTAQUE) ganha o destaque
  function desenhar(ctx, n, ls, size, { cx = CX, y0 = null, baseY = null, papel = 'corpo', alpha = 1, dy = 0, kDestaque = 1, align = 'center', x = null, cor: c = 'texto' } = {}) {
    const lh = size * fonte(papel)[2] * 1.27, d = (P().DESTAQUE || {})[n];
    const top = y0 != null ? y0 : baseY - (ls.length - 1) * lh;
    ctx.save(); ctx.globalAlpha *= alpha;
    ls.forEach((l, i) => {
      const s = l.split(NB).join(' '), y = top + i * lh + dy, w = wid(ctx, s, size, papel);
      const xl = align === 'left' ? x : cx - w / 2;
      const k = d ? s.indexOf(d) : -1;
      if (k >= 0) E.destaque(ctx, xl + wid(ctx, s.slice(0, k), size, papel), y, wid(ctx, d, size, papel), size * fonte(papel)[2], { seed: 7 + n * 3 + i, k: kDestaque });
      escrever(ctx, s, xl, y, { size, papel, cor: c });
    });
    ctx.restore();
    return { top, bottom: top + (ls.length - 1) * lh, lh };
  }
  // a frase da vez, centrada, com a última linha em baseY
  function bloco(ctx, n, { baseY = 1405, sizes = [54, 50, 46, 42], maxLinhas = [3, 3, 4, 4], maxW = R - L, alpha = 1, dy = 0, papel = 'corpo', cx = CX, kDestaque = 1 } = {}) {
    if (!TX[n]) return null;
    const { size, ls } = caber(ctx, n, { sizes, maxLinhas, maxW, papel });
    return desenhar(ctx, n, ls, size, { cx, baseY, papel, alpha, dy, kDestaque });
  }
  // a frase da vez como título, a partir do topo (em todas as cenas: o olho lê em cima e vê o número no meio)
  function titulo(ctx, n, { y0 = TOP + 110, alpha = 1, kDestaque = 1, dy = 0, sizes = [68, 62, 56, 52] } = {}) {
    if (!TX[n]) return null;
    const { size, ls } = caber(ctx, n, { sizes, maxLinhas: [2, 3, 3, 3], papel: 'titulo' });
    return desenhar(ctx, n, ls, size, { y0: y0 + size * 0.8, papel: 'titulo', alpha, kDestaque, dy });
  }

  // ---------- a cara do tipo ----------
  // o rótulo fixo no alto, à esquerda (D01, "Dado de Roraima"), à mão, com o risco embaixo
  function rotulo(ctx, { alpha = 1 } = {}) {
    if (!D(DW.rotulo)) return;
    escrever(ctx, D(DW.rotulo), L + 4, TOP + 46, { size: 50, papel: 'mao', cor: 'destaque', alpha });
    const w = wid(ctx, D(DW.rotulo), 50, 'mao');
    ctx.save(); ctx.globalAlpha *= alpha;
    E.linha(ctx, [[L, TOP + 66], [L + w + 8, TOP + 64]], { papel: 'destaque', lw: 5, seed: 31 });
    ctx.restore();
  }
  // a fonte com o ano, embaixo, sempre que há número na tela (a regra do tipo: número sem fonte não vai ao ar)
  function rodape(ctx, { alpha = 1, y = BOT - 24, size = 38 } = {}) {
    const s = D(DW.fonte); if (!s) return;
    let z = size; while (z > 30 && wid(ctx, s, z, 'corpo') > R - L) z -= 2;
    ctx.save(); ctx.globalAlpha *= alpha * 0.92;
    E.linha(ctx, [[L, y - z - 14], [L + 120, y - z - 15]], { papel: 'tinta', lw: 3, seed: 41 });
    escrever(ctx, s, L, y, { size: z, papel: 'corpo' });
    ctx.restore();
  }
  // o selo do lugar e do ano (D04), em cima do número
  function selo(ctx, { cx = CX, y = 640, k = 1, size = 50, carimba = false } = {}) {
    const s = D(DW.lugar); if (!s || k <= 0) return;
    // carimba: cai de grande para o tamanho certo, de uma vez (a batida); senão, cresce com um pulinho
    const w = wid(ctx, s, size, 'corpo') + 56, h = size * 1.5, z = carimba ? 1 + 0.9 * (1 - U.ease.outCubic(k)) : U.ease.outBack(k);
    ctx.save(); ctx.translate(cx, y); ctx.scale(z, z);
    E.ret(ctx, -w / 2, -h / 2, w, h, { papel: 'destaque', r: h / 2, seed: 61, sombra: false, hachura: false });
    escrever(ctx, s, 0, size * 0.36, { size, papel: 'corpo', align: 'center', cor: E.escuro() ? 'fundo' : 'texto' });
    ctx.restore();
  }
  // o número grande: sobe de 0 até o valor em SOBE segundos (começa em t0) e para com uma batida e o risco embaixo
  function numeroGrande(ctx, t, t0, { cx = CX, y = 980, size = 300, alpha = 1, parado = false } = {}) {
    const N = SC.NUMERO; if (!N.texto) return;
    const e = parado ? 1 : U.ease.outCubic(p01(t, t0, SC.SOBE));
    const s = e >= 1 || !Number.isFinite(N.valor) ? N.texto : fmt(N.valor * e, N.casas);
    let z = size; while (z > 110 && wid(ctx, N.texto, z, 'numero') > R - L - 40) z -= 10;
    const w = wid(ctx, N.texto, z, 'numero');
    const pulo = parado ? 1 : 1 + 0.07 * Math.sin(Math.PI * p01(t, t0 + SC.SOBE, 0.22));
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, y); ctx.scale(pulo, pulo);
    const kr = parado ? 1 : p01(t, t0 + SC.SOBE, 0.3);
    if (kr > 0) E.linha(ctx, [[-w / 2, z * 0.16], [-w / 2 + w * kr, z * 0.13]], { papel: 'destaque', lw: Math.max(10, z * 0.05), seed: 71 });
    escrever(ctx, s, 0, 0, { size: z, papel: 'numero', align: 'center' });
    ctx.restore();
  }
  // a unidade (D03), centrada, até duas linhas
  function unidade(ctx, { y = 1080, size = 52, alpha = 1 } = {}) {
    const s = D(DW.unidade); if (!s) return null;
    const { size: z, ls } = caber(ctx, DW.unidade, { sizes: [size, size - 4, size - 8], maxLinhas: [2, 2, 2], papel: 'corpo', texto: s, maxW: R - L - 80 });
    return desenhar(ctx, DW.unidade, ls, z, { y0: y, papel: 'corpo', alpha });
  }
  // a multidão de 100 mil (D06): pontinhos de gente, e um ponto aceso por caso (D07), acendendo em ACENDE segundos
  function multidao(ctx, t, t0, { box = { x: L + 10, y: 700, w: R - L - 20, h: 470 }, acesos = Math.round(SC.NUMERO.valor), legendas = true } = {}) {
    const cols = 48, rows = Math.round((cols * box.h) / box.w), dx = box.w / cols, dy = box.h / rows;
    const ent = p01(t, t0, 0.35); // a multidão entra varrendo da esquerda
    ctx.save();
    ctx.fillStyle = cor(globalThis.BIB ? globalThis.BIB.naoSome('apoio', 'apoioEscuro', 'tinta') : 'apoio');
    ctx.globalAlpha *= E.escuro() ? 0.5 : 0.72;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols * ent; c++) {
      const i = r * cols + c, x = box.x + (c + 0.5 + (hash(i, 2) - 0.5) * 0.5) * dx, y = box.y + (r + 0.5 + (hash(i, 3) - 0.5) * 0.5) * dy;
      ctx.beginPath(); ctx.arc(x, y, 3.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    const n = Math.max(0, Math.min(400, acesos | 0)), pts = [];
    for (let j = 0; j < n; j++) {
      const c = Math.floor(hash(j, 5) * cols), r = Math.floor(hash(j, 9) * rows);
      const x = box.x + (c + 0.5) * dx, y = box.y + (r + 0.5) * dy, tj = t0 + 0.2 + (SC.ACENDE * j) / Math.max(1, n);
      const z = U.ease.outBack(p01(t, tj, 0.22));
      if (z > 0) E.circulo(ctx, x, y, 11 * z, { papel: 'alerta', seed: 900 + j, lw: 2.5, sombra: false, hachura: false });
      pts.push([x, y]);
    }
    if (legendas) {
      if (D(DW.todo)) escrever(ctx, D(DW.todo), box.x, box.y - 34, { size: 48, papel: 'corpo' });
      if (D(DW.ponto)) {
        const y = box.y + box.h + 70, k = p01(t, t0 + 0.4, 0.3);
        E.circulo(ctx, box.x + 14, y - 15, 13 * U.ease.outBack(k), { papel: 'alerta', seed: 899, lw: 2.5, sombra: false, hachura: false });
        escrever(ctx, D(DW.ponto), box.x + 44, y, { size: 46, papel: 'mao', alpha: k });
      }
    }
    return pts;
  }
  // a grade de 100 pessoas: as do número acesas, na ordem de leitura
  function grade(ctx, t, t0, { box = { x: L + 20, y: 650, w: R - L - 40, h: 660 }, acesos = Math.round(SC.NUMERO.valor), legendas = true } = {}) {
    const cw = box.w / 10, ch = box.h / 10, n = Math.max(0, Math.min(100, acesos | 0));
    for (let i = 0; i < 100; i++) {
      const c = i % 10, r = Math.floor(i / 10), x = box.x + (c + 0.5) * cw, y = box.y + (r + 0.5) * ch;
      const z = U.ease.outBack(p01(t, t0 + 0.02 * c + 0.015 * r, 0.25));
      if (z <= 0) continue;
      const aceso = i < n && t >= t0 + 0.2 + (SC.ACENDE * i) / Math.max(1, n);
      const papel = aceso ? 'alerta' : apoio(), k = Math.min(cw, ch) * z;
      E.circulo(ctx, x, y - k * 0.2, k * 0.15, { papel, seed: 1000 + i, lw: 2, sombra: false, hachura: false });
      E.ret(ctx, x - k * 0.2, y - k * 0.02, k * 0.4, k * 0.32, { papel, r: k * 0.12, seed: 1200 + i, lw: 2, sombra: false, hachura: false });
    }
    if (legendas) {
      if (D(DW.todo)) escrever(ctx, D(DW.todo), box.x, box.y - 34, { size: 48, papel: 'corpo' });
      if (D(DW.ponto)) escrever(ctx, D(DW.ponto), box.x, box.y + box.h + 62, { size: 46, papel: 'mao', alpha: p01(t, t0 + 0.4, 0.3) });
    }
  }
  // as medidas das barras (as mesmas nas barras e na régua: a régua sai das barras sem pular)
  function medidas(y0) {
    const bs = SC.BARRAS, n = bs.length, max = Math.max(...bs.map((x) => x.valor)), x0 = L + 8, wMax = R - L - 250, hB = 76, gap = n > 3 ? 160 : 196;
    return { bs, n, max, x0, wMax, hB, gap, y: (i) => y0 + i * gap, w: (v) => (wMax * v) / max };
  }
  const corBarra = (i, n) => (i === 0 ? 'alerta' : i === n - 1 ? 'tinta' : apoio());
  // as barras: crescem uma depois da outra, com o nome em cima e o valor na ponta; a unidade é uma só, embaixo
  function barras(ctx, t, t0, { y0 = 700, alpha = 1 } = {}) {
    if (SC.BARRAS.length < 2) return;
    const m = medidas(y0);
    ctx.save(); ctx.globalAlpha *= alpha;
    m.bs.forEach((bb, i) => {
      const y = m.y(i), e = U.ease.outCubic(p01(t, t0 + 0.25 + i * 0.22, SC.CRESCE)), w = Math.max(10, m.w(bb.valor) * e);
      escrever(ctx, bb.nome, m.x0, y, { size: 48, papel: 'corpo' });
      if (e <= 0) return; // a barra (e o valor dela) só aparece quando começa a crescer: nada de "0,00" parado na tela
      E.ret(ctx, m.x0, y + 22, w, m.hB, { papel: corBarra(i, m.n), r: 12, seed: 700 + i, sombra: false });
      escrever(ctx, e >= 1 ? bb.texto : fmt(bb.valor * e, bb.casas), m.x0 + w + 20, y + 22 + m.hB * 0.76, { size: 58, papel: 'numero' });
    });
    escrever(ctx, D(DW.unidade), m.x0, m.y(m.n) + 6, { size: 44, papel: 'mao' });
    ctx.restore();
  }
  // a régua: a primeira e a última barra ficam; a última vira bloco e voa para baixo da primeira, uma vez depois da outra,
  // até cobrir a primeira; no fim, quantas vezes ela coube (a razão, com uma casa)
  function regua(ctx, t, t0, { y0 = 700 } = {}) {
    const R0 = SC.RAZAO; if (!R0 || SC.BARRAS.length < 2) return;
    const m = medidas(y0), a = m.bs[0], z = m.bs[m.n - 1];
    const ya = y0, yz = y0 + 430, yb = ya + 22 + m.hB + 22, lu = m.w(z.valor), nb = Math.ceil(R0 - 1e-9);
    // a primeira barra, inteira
    escrever(ctx, a.nome, m.x0, ya, { size: 48, papel: 'corpo' });
    E.ret(ctx, m.x0, ya + 22, m.w(a.valor), m.hB, { papel: corBarra(0, m.n), r: 12, seed: 700, sombra: false });
    escrever(ctx, a.texto, m.x0 + m.w(a.valor) + 20, ya + 22 + m.hB * 0.76, { size: 58, papel: 'numero' });
    // a última, embaixo, de onde saem os blocos
    escrever(ctx, z.nome, m.x0, yz, { size: 48, papel: 'corpo' });
    E.ret(ctx, m.x0, yz + 22, lu, m.hB, { papel: corBarra(m.n - 1, m.n), r: 12, seed: 700 + m.n - 1, sombra: false });
    escrever(ctx, z.texto, m.x0 + lu + 20, yz + 22 + m.hB * 0.76, { size: 58, papel: 'numero' });
    for (let j = 0; j < nb; j++) {
      const tj = t0 + 0.3 + j * 0.2, u = U.ease.outCubic(p01(t, tj, 0.28));
      if (u <= 0) continue;
      const frac = Math.min(1, R0 - j), x = U.lerp(m.x0, m.x0 + j * lu, u), y = U.lerp(yz + 22, yb, u), w = Math.max(6, lu * frac - 6);
      E.ret(ctx, x + 3, y, w, m.hB * 0.8, { papel: corBarra(m.n - 1, m.n), r: 9, seed: 760 + j, sombra: false, hachura: false });
      if (frac > 0.55 && u >= 1) escrever(ctx, String(j + 1), x + 3 + w / 2, y + m.hB * 0.62, { size: 40, papel: 'numero', align: 'center', cor: E.escuro() ? 'fundo' : 'papel' });
    }
    // quantas vezes: a razão com uma casa (a frase da tela diz "quase 7", o peca.js confere)
    const kf = U.ease.outBack(p01(t, t0 + 0.3 + nb * 0.2 + 0.1, 0.3));
    if (kf > 0) {
      ctx.save(); ctx.translate(CX + 120, yb + m.hB * 0.8 + 190); ctx.scale(kf, kf);
      escrever(ctx, fmt(R0, 1) + '×', 0, 0, { size: 120, papel: 'numero', align: 'center' });
      ctx.restore();
    }
  }

  // ---------- o estado do filme no instante t ----------
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], ultima = i === c.itens.length - 1;
    const st = { t, c, it, i, u: t - c.t0 };
    const corte = i === 0;
    // nas cenas desenhadas pela peça, a frase troca seca; nas outras, esmaece
    const seca = ['porque', 'prevencao'].includes(c.tipo);
    st.aTexto = seca ? 1 : Math.min(corte ? 1 : U.clamp((t - it.t0) / 0.2, 0, 1), ultima ? 1 : U.clamp((it.t1 - t) / 0.12, 0, 1));
    st.dyTexto = corte || seca ? 0 : (1 - U.ease.outCubic(U.clamp((t - it.t0) / 0.25, 0, 1))) * 16;
    st.desde = {}; c.itens.forEach((x) => { st.desde[x.n] = t - x.t0; });
    return st;
  }
  // o enquadramento de cada frase desenhada (PECA.PLANOS: { n: { x, y, z } }): corte seco de câmera
  function plano(ctx, n) {
    const pl = (P().PLANOS || {})[n];
    if (!pl || !(pl.z > 0)) return;
    const cy = AREA.y + AREA.h / 2;
    ctx.translate(CX, cy); ctx.scale(pl.z, pl.z); ctx.translate(-(pl.x != null ? pl.x : CX), -(pl.y != null ? pl.y : cy));
  }
  function area(ctx, st, desenho) {
    if (!desenho) return;
    ctx.save(); ctx.beginPath(); ctx.rect(AREA.x, AREA.y, AREA.w, AREA.h); ctx.clip();
    plano(ctx, st.it.n);
    desenho(ctx, st, globalThis.MV);
    ctx.restore();
  }

  // ---------- as cenas do tipo ----------
  const CENA = {};
  CENA.gancho = (ctx, st) => {
    const { t, c } = st;
    rotulo(ctx);
    titulo(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
    // o número sobe e para (1,25 s); a unidade aparece; o selo do lugar e do ano carimba em cima (1,85 s): duas batidas no começo
    numeroGrande(ctx, t, c.t0 + 0.15, { y: 1010 });
    unidade(ctx, { y: 1115, alpha: p01(t, c.t0 + 1.3, 0.3) });
    selo(ctx, { y: 590, k: p01(t, c.t0 + 1.85, 0.18), carimba: true });
    rodape(ctx);
  };
  CENA.conta = (ctx, st) => {
    const { t, c } = st;
    rotulo(ctx);
    titulo(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
    if (SC.GRAFICO === 'multidao') multidao(ctx, t, c.t0);
    else if (SC.GRAFICO === 'grade') grade(ctx, t, c.t0);
    else { numeroGrande(ctx, t, c.t0, { y: 1000, parado: true }); unidade(ctx, { y: 1105 }); }
    rodape(ctx);
  };
  CENA.compara = (ctx, st) => {
    const { t, c } = st;
    rotulo(ctx);
    titulo(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
    if (st.i === 0 || !SC.RAZAO) barras(ctx, t, c.t0, { y0: 690 });
    else regua(ctx, t, st.it.t0, { y0: 690 });
    rodape(ctx);
  };
  CENA.porque = (ctx, st) => {
    area(ctx, st, P().PORQUE);
    rotulo(ctx);
    titulo(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  };
  CENA.prevencao = (ctx, st) => {
    area(ctx, st, P().PREVENCAO);
    rotulo(ctx);
    titulo(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  };
  CENA.fecho = (ctx, st) => {
    const { t, c } = st;
    rotulo(ctx);
    titulo(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
    // o número volta, já parado, com o lugar e o ano
    const kv = U.ease.outBack(p01(t, c.t0 + 0.05, 0.35));
    selo(ctx, { y: 600, k: kv, size: 46 });
    ctx.save(); ctx.translate(CX, 930); ctx.scale(kv, kv); ctx.translate(-CX, -930);
    numeroGrande(ctx, t, c.t0, { y: 930, size: 230, parado: true });
    ctx.restore();
    unidade(ctx, { y: 1020, size: 46, alpha: p01(t, c.t0 + 0.2, 0.3) });
    // a fonte, grande, num cartão que carimba
    const s = D(DW.fonte), kf = p01(t, c.t0 + 0.6, 0.25);
    if (s && kf > 0) {
      const z = 1 + 0.5 * (1 - U.ease.outCubic(kf)), y = 1205, h = 220;
      ctx.save(); ctx.globalAlpha *= kf; ctx.translate(CX, y + h / 2); ctx.scale(z, z); ctx.rotate(-0.025); ctx.translate(-CX, -(y + h / 2));
      E.ret(ctx, L + 10, y, R - L - 20, h, { papel: 'superficie', r: 22, seed: 820 });
      const { size, ls } = caber(ctx, DW.fonte, { sizes: [52, 48, 44, 40], maxLinhas: [2, 2, 3, 3], papel: 'corpo', texto: s, maxW: R - L - 100 });
      desenhar(ctx, DW.fonte, ls, size, { y0: y + h / 2 - ((ls.length - 1) * size * 1.27) / 2 + size * 0.36, papel: 'corpo' });
      ctx.restore();
    }
  };

  globalThis.MV = { L, R, TOP, BOT, CX, D, cor, wid, escrever, quebrar, caber, desenhar, bloco, titulo, rotulo, rodape, selo, numeroGrande, unidade,
    multidao, grade, barras, regua, fmt, hash, apoio, p01, estado, CENA, area: AREA };
})();
