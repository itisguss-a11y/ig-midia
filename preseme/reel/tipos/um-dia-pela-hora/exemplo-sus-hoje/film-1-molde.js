// PRESEME · motor do tipo "um dia, contado pela hora" · desenho 1/3 · o molde (não muda de uma peça para outra)
// O que todo reel deste tipo tem: a hora, o contador, a lente que pousa, a frase da vez com marca-texto, a vista de perto,
// a faixa da categoria com os selos, o cartão escuro do nome e os selos. Letra, fundo, chão e destaque vêm do kit de
// estilos (globalThis.ESTILOS): a mesma peça sai em lápis, carimbo, chapado... trocando ESTILO no score.js.
// Todo texto da tela vem do textos.js. A peça (film-2-peca.js) desenha só o que é dela: o objeto de cada momento e o que a
// lente mostra, e registra em DIA.CENA, DIA.LENTE, DIA.DESTAQUE, DIA.QUEBRA e DIA.GENTE.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  if (!E) throw new Error('o tipo "um dia" desenha com o kit de estilos: falta ferramentas/estilos.js no index.html');
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const C = { floresta: '#17402C', papel: '#F4EDDF', marca: '#E4EB6C', coral: '#F16D4D', salvia: '#B5D8C0', folha: '#30724E', noite: '#072618', branco: '#FFFDF6', pele: '#C98A62', peleClara: '#DBA27E', peleEscura: '#A86E4B', miolo: '#C9A063', cabelo: '#2B211E' };
  // INK (Floresta) é o traço e a letra por cima de cor clara (papel, branco, marca-texto, Sálvia), em todo estilo.
  // TINTA é o traço sobre o fundo: sai do kit (E.cor('tinta')) e muda com o estilo; na lousa (giz) o fundo é Floresta e
  // ela vira Papel. O molde desenha o contorno sobre o fundo com TINTA: com INK, ele sumiria na lousa.
  const INK = C.floresta, TINTA = E.cor('tinta');
  // a letra que se lê por cima de uma cor: Floresta sobre cor clara, Papel sobre cor escura, Noite sobre Coral
  const lum = (hex) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex));
    if (!m) return 1;
    const v = parseInt(m[1], 16), c = [v >> 16, (v >> 8) & 255, v & 255].map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const sobre = (fill) => (String(fill).toUpperCase() === C.coral ? C.noite : lum(fill) > 0.23 ? INK : C.papel);
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2;
  const GY = 1400, BASE = 706, CHIPY = 786; // o chão; a base da última linha do texto; a faixa da categoria
  const NB = ' '; // espaço que não quebra: o trecho com marca-texto fica numa linha só
  const D = (k) => TX[k] || '';
  const HAT = { color: 'rgba(23,64,44,0.15)', gap: 12 };
  const DIA = { CENA: {}, LENTE: {}, DESTAQUE: {}, QUEBRA: {}, GENTE: {}, SELO: {}, OBJ: {}, DENTRO: {} };

  // ---------- letras: a família, o peso e a escala vêm do kit (papel: titulo, corpo, mao ou numero) ----------
  const F = (papel) => E.letra(papel);
  const zz = (size, papel = 'corpo') => Math.round(size * F(papel)[2]);
  const wid = (ctx, s, size, papel = 'corpo') => { const [fam, weight, k] = F(papel); return G.measure(ctx, s, Math.round(size * k), fam, weight); };
  function txt(ctx, s, x, y, o = {}) {
    const papel = o.papel || 'corpo', [fam, weight, k] = F(papel);
    const q = Object.assign({}, o, { fam, weight, size: Math.round((o.size || 56) * k), color: o.color || E.cor('texto'), boil: 0 });
    delete q.papel;
    G.text(ctx, s, x, y, q);
  }
  const hand = (ctx, s, x, y, o = {}) => txt(ctx, s, x, y, Object.assign({ papel: 'mao', size: 60 }, o));
  // o maior tamanho (até "size") em que o texto cabe em maxW, na letra do estilo: a letra de lápis é estreita, a de
  // carimbo e a de chapado são largas, e a palavra de dentro da lente tem de caber nas três
  const caber = (ctx, s, size, maxW, papel = 'mao') => { let z = size; while (z > 24 && wid(ctx, s, z, papel) > maxW) z -= 2; return z; };
  // o marca-texto atrás de um trecho (o desenho dele é do estilo: pincel no lápis, chapado arredondado...)
  const mark = (ctx, x, y, w, size, seed = 5) => E.destaque(ctx, x, y, w, size, { seed });

  function quebrar(ctx, s, size, maxW, papel = 'corpo') {
    const out = []; let cur = '';
    for (const w of s.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && wid(ctx, t, size, papel) > maxW) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }
  // mesma quantidade de linhas, com as linhas de tamanho parecido e sem palavrinha solta no fim da linha
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'às', 'ao', 'para', 'por', 'com', 'se', 'seu', 'sua', 'esta', 'este', 'essa', 'esse']);
  function equilibrar(ctx, s, size, maxW, papel) {
    const base = quebrar(ctx, s, size, maxW, papel), k = base.length;
    if (k < 2) return base;
    let melhor = base, nota = Infinity;
    for (let w = maxW; w > maxW * 0.45; w -= 20) {
      const ls = quebrar(ctx, s, size, w, papel);
      if (ls.length !== k) break;
      const ws = ls.map((l) => wid(ctx, l, size, papel));
      const fracas = ls.slice(0, -1).filter((l) => FRACA.has(l.split(' ').pop().toLowerCase().replace(/[.,;:!?]/g, ''))).length;
      const n = Math.max(...ws) - Math.min(...ws) + 400 * fracas;
      if (n < nota) { nota = n; melhor = ls; }
    }
    return melhor;
  }
  const memo = new Map();
  function linhasDe(ctx, n, size, maxW, papel) {
    const key = n + ':' + size + ':' + maxW + ':' + papel;
    if (!memo.has(key)) {
      let s = TX[n] || ''; const d = DIA.DESTAQUE[n];
      if (d && s.includes(d)) s = s.replace(d, d.split(' ').join(NB)); // o trecho marcado não se parte em duas linhas
      memo.set(key, equilibrar(ctx, s, size, maxW, papel));
    }
    return memo.get(key);
  }
  // cor = a cor da letra fora do marca-texto; dentro dele a letra é sempre a escura
  function desenhaLinhas(ctx, ls, n, size, yDe, cor, papel) {
    const d = DIA.DESTAQUE[n], z = zz(size, papel), corBase = cor || E.cor('texto');
    ls.forEach((l, i) => {
      const s = l.split(NB).join(' '), y = yDe(i), x = CX - wid(ctx, s, size, papel) / 2, k = d ? s.indexOf(d) : -1;
      if (k < 0) { txt(ctx, s, x, y, { size, color: corBase, papel }); return; }
      const a = s.slice(0, k), b = s.slice(k + d.length), xa = x + wid(ctx, a, size, papel), wd = wid(ctx, d, size, papel);
      mark(ctx, xa, y, wd, z, 7 + n * 3 + i);
      if (!cor) { txt(ctx, s, x, y, { size, papel }); return; }
      // no fundo escuro, a pontuação colada ao trecho marcado entra no marca-texto (letra clara em cima do amarelo não se lê)
      const p = (b.match(/^[.,;:!?]+/) || [''])[0], wp = wid(ctx, p, size, papel);
      if (p) mark(ctx, xa + wd, y, wp, z, 9 + n * 3 + i);
      txt(ctx, a, x, y, { size, color: cor, papel }); txt(ctx, d + p, xa, y, { size, color: INK, papel }); txt(ctx, b.slice(p.length), xa + wd + wp, y, { size, color: cor, papel });
    });
  }
  // a frase da vez, centrada; a última linha fica em baseY. Letra 58 até 2 linhas; 54, 50 ou 46 até 3 linhas
  function bloco(ctx, n, { baseY = BASE, sizes = [58, 54, 50, 46], maxLinhas = [2, 3, 3, 3], maxW = R - L, alpha = 1, dy = 0, cor = null, papel = 'corpo' } = {}) {
    if (!TX[n]) return;
    let size = sizes[sizes.length - 1], ls = null;
    for (let i = 0; i < sizes.length; i++) {
      const t = linhasDe(ctx, n, sizes[i], maxW, papel);
      const cabe = t.every((l) => wid(ctx, l.split(NB).join(' '), sizes[i], papel) <= maxW);
      if (t.length <= maxLinhas[i] && cabe) { size = sizes[i]; ls = t; break; }
    }
    if (!ls) ls = linhasDe(ctx, n, size, maxW, papel);
    const lh = zz(size, papel) * 1.27;
    ctx.save(); ctx.globalAlpha *= alpha;
    desenhaLinhas(ctx, ls, n, size, (i) => baseY - (ls.length - 1 - i) * lh + dy, cor, papel);
    ctx.restore();
  }
  // o título grande da abertura e do fecho (DIA.QUEBRA guarda a quebra de linha aprovada, se houver)
  function titulo(ctx, n, alpha = 1) {
    if (!TX[n]) return;
    const q = DIA.QUEBRA[n], papel = 'titulo';
    let size = 104, ls = q && q.join(' ') === TX[n] ? q : null;
    if (ls && ls.some((l) => wid(ctx, l, size, papel) > R - L)) ls = null; // a quebra aprovada não cabe nesta letra: refaz
    if (!ls) for (const s of [104, 92, 80, 70]) { size = s; ls = linhasDe(ctx, n, s, R - L, papel); if (ls.length <= 3) break; }
    ctx.save(); ctx.globalAlpha *= alpha;
    desenhaLinhas(ctx, ls, n, size, (i) => TOP + 150 + i * zz(size, papel) * 1.2, null, papel);
    ctx.restore();
  }

  function chip(ctx, label, x, y, bg, fg) {
    const size = 34, w = wid(ctx, label, size, 'titulo') + 44;
    G.rrect(ctx, x, y - 44, w, 62, 31, { fill: bg, stroke: TINTA, lw: 3.5, seed: 3 });
    txt(ctx, label, x + 22, y, { size, color: fg, papel: 'titulo' });
    return w;
  }
  function hora(ctx, h) {
    if (!h) return;
    const size = 40, w = wid(ctx, h, size, 'numero') + 40;
    G.rrect(ctx, L, TOP + 8, w, 68, 16, { fill: C.papel, stroke: TINTA, lw: 4, seed: 4 });
    txt(ctx, h, L + 20, TOP + 56, { size, papel: 'numero', color: INK });
  }
  // o contador; pop (de 1 a 0) faz ele dar um pulo quando o número muda
  function contador(ctx, n, cx, cy, k = 1, pop = 0) {
    const w = 250 * k, h = 250 * k, z = 1 + 0.2 * pop;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
    hand(ctx, D(SC.CONTADOR), cx, cy - h / 2 - 16 * k, { size: 50 * k, align: 'center' });
    G.rrect(ctx, cx - w / 2 + 10, cy - h / 2 + 12, w, h, 26 * k, { fill: C.folha, stroke: null, lw: 0, seed: 8 });
    G.rrect(ctx, cx - w / 2, cy - h / 2, w, h, 26 * k, { fill: C.floresta, stroke: TINTA, lw: 4, seed: 9 }); // o cartão escuro; na lousa, o contorno de giz
    G.line(ctx, [[cx - w / 2 + 6, cy], [cx + w / 2 - 6, cy]], { color: C.folha, lw: 4, seed: 2, amp: 0.4 });
    txt(ctx, String(n), cx, cy + 62 * k, { size: 176 * k, color: C.marca, align: 'center', papel: 'numero' });
    ctx.restore();
  }
  // a lente: por fora, o dia comum; por dentro, o que ninguém vê. k vai de 0 (fora da tela) a 1 (no lugar);
  // lado 1 = cabo para a direita, -1 = cabo para a esquerda
  function lente(ctx, cx, cy, r, dentro, { k = 1, lado = 1 } = {}) {
    if (k <= 0) return;
    const off = (1 - k) * 780;
    ctx.save(); ctx.translate(lado * off, off);
    G.line(ctx, [[cx + lado * r * 0.72, cy + r * 0.72], [cx + lado * r * 1.42, cy + r * 1.42]], { color: TINTA, lw: 54, seed: 31, amp: 0.6 });
    G.line(ctx, [[cx + lado * r * 0.78, cy + r * 0.78], [cx + lado * r * 1.38, cy + r * 1.38]], { color: C.folha, lw: 22, seed: 32, amp: 0.6 });
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = C.floresta; ctx.fillRect(cx - r - 4, cy - r - 4, 2 * r + 8, 2 * r + 8); // o vidro escuro, em todo estilo
    dentro(ctx);
    ctx.restore();
    G.ellipse(ctx, cx, cy, r, r, { stroke: C.marca, lw: 10, seed: 33 });
    G.ellipse(ctx, cx, cy, r + 14, r + 14, { stroke: TINTA, lw: 22, seed: 34 });
    ctx.restore();
  }
  function balao(ctx, linhas, x, y, tx, ty, size = 46) {
    const w = Math.max(...linhas.map((s) => wid(ctx, s, size))) + 64, h = linhas.length * zz(size) * 1.3 + 44;
    G.poly(ctx, [[x + 60, y + h - 6], [tx, ty], [x + 150, y + h - 6]], { fill: C.branco, stroke: TINTA, lw: 5, seed: 41 });
    G.rrect(ctx, x, y, w, h, 34, { fill: C.branco, stroke: TINTA, lw: 5, seed: 42 });
    G.poly(ctx, [[x + 66, y + h - 8], [tx + 6, ty - 14], [x + 144, y + h - 8]], { fill: C.branco, stroke: null, lw: 0, seed: 43, amp: 0 });
    linhas.forEach((s, i) => txt(ctx, s, x + 32, y + 30 + zz(size) * (i + 0.85) * 1.3 - zz(size) * 0.25, { size, color: INK }));
  }
  // o chão do estilo (mais largo que a tela, para cobrir também a vista de perto)
  const chao = (ctx, gy = GY) => E.chao(ctx, gy);

  // as pessoas: o protagonista (quem responde "nenhuma" na abertura) vem do kit; a peça troca em DIA.GENTE.protagonista
  DIA.GENTE.protagonista = Object.assign({}, E.ROUPA.calouro);

  // ---------- os selos: um por momento, ao lado da faixa da categoria e na recontagem ----------
  // DIA.SELO[nome] = (ctx, x, y, q, seed) => { ... }, com q(v) = v na escala do selo. A peça pode acrescentar os dela.
  const S1 = DIA.SELO;
  S1.gota = (ctx, x, y, q, seed) => G.poly(ctx, [[x, y - q(26)], [x + q(18), y + q(6)], [x, y + q(24)], [x - q(18), y + q(6)]], { fill: C.salvia, stroke: INK, lw: 4, seed: seed + 1 });
  S1.pao = (ctx, x, y, q, seed) => G.rrect(ctx, x - q(24), y - q(14), q(48), q(30), q(14), { fill: C.miolo, stroke: INK, lw: 4, seed: seed + 1 });
  S1.remedio = (ctx, x, y, q, seed) => { G.rrect(ctx, x - q(26), y - q(11), q(52), q(22), q(11), { fill: C.coral, stroke: INK, lw: 4, seed: seed + 1 }); G.line(ctx, [[x, y - q(10)], [x, y + q(10)]], { color: INK, lw: 4, seed: seed + 2 }); };
  S1.sal = (ctx, x, y, q, seed) => { G.poly(ctx, [[x - q(15), y - q(8)], [x + q(15), y - q(8)], [x + q(20), y + q(24)], [x - q(20), y + q(24)]], { fill: C.papel, stroke: INK, lw: 4, seed: seed + 1 }); G.rrect(ctx, x - q(17), y - q(26), q(34), q(18), q(8), { fill: C.salvia, stroke: INK, lw: 4, seed: seed + 2 }); };
  S1.salgadinho = (ctx, x, y, q, seed) => { G.rrect(ctx, x - q(20), y - q(26), q(40), q(52), 6, { fill: C.marca, stroke: INK, lw: 4, seed: seed + 1 }); G.line(ctx, [[x - q(20), y - q(16)], [x + q(20), y - q(16)]], { color: INK, lw: 3, seed: seed + 2 }); G.line(ctx, [[x - q(20), y + q(16)], [x + q(20), y + q(16)]], { color: INK, lw: 3, seed: seed + 3 }); };
  S1.gotinha = (ctx, x, y, q, seed) => { G.rrect(ctx, x - q(11), y - q(28), q(22), q(26), q(8), { fill: C.papel, stroke: INK, lw: 4, seed: seed + 1 }); G.poly(ctx, [[x - q(6), y - q(2)], [x + q(6), y - q(2)], [x + q(2), y + q(8)], [x - q(2), y + q(8)]], { fill: C.papel, stroke: INK, lw: 3, seed: seed + 2 }); G.ellipse(ctx, x, y + q(20), q(7), q(9), { fill: C.coral, stroke: INK, lw: 3, seed: seed + 3 }); };
  S1.vacina = (ctx, x, y, q, seed) => { G.line(ctx, [[x - q(22), y + q(20)], [x + q(20), y - q(22)]], { color: INK, lw: 9, seed: seed + 1 }); G.line(ctx, [[x + q(10), y - q(30)], [x + q(28), y - q(12)]], { color: INK, lw: 6, seed: seed + 2 }); };
  S1.mapa = (ctx, x, y, q, seed) => { for (const [dx, dy] of [[-12, -8], [8, -14], [0, 8], [16, 10]]) G.ellipse(ctx, x + q(dx), y + q(dy), q(6), q(6), { fill: C.coral, stroke: null, lw: 0, seed: seed + dx }); G.ellipse(ctx, x + 2, y - 2, q(30), q(28), { stroke: INK, lw: 3, seed: seed + 5 }); };
  S1.rotulo = (ctx, x, y, q, seed) => { G.rrect(ctx, x - q(26), y - q(15), q(52), q(30), 5, { fill: C.noite, stroke: null, lw: 0, seed: seed + 1, amp: 0.4 }); G.ellipse(ctx, x - q(10), y - q(2), q(7), q(7), { stroke: C.branco, lw: 3, seed: seed + 2, amp: 0.3 }); G.line(ctx, [[x - q(5), y + q(4)], [x + q(2), y + q(10)]], { color: C.branco, lw: 3, seed: seed + 3, amp: 0.2 }); };
  S1.casa = (ctx, x, y, q, seed) => { G.poly(ctx, [[x - q(26), y - q(4)], [x, y - q(28)], [x + q(26), y - q(4)]], { fill: C.folha, stroke: INK, lw: 4, seed: seed + 1 }); G.rrect(ctx, x - q(19), y - q(6), q(38), q(30), 3, { fill: C.papel, stroke: INK, lw: 4, seed: seed + 2 }); };
  S1.check = (ctx, x, y, q, seed) => G.line(ctx, [[x - q(20), y], [x - q(4), y + q(16)], [x + q(22), y - q(18)]], { color: C.folha, lw: 9, seed: seed + 1 });
  // sem desenho: o número do momento (serve a qualquer peça, sem desenhar nada)
  S1.numero = (ctx, x, y, q, seed, uso) => txt(ctx, String(uso || '?'), x, y + q(14), { size: q(40), color: INK, align: 'center', papel: 'numero' });
  function selo(ctx, x, y, kind, seed, k = 1.14, uso = 0) {
    const q = (v) => v * k;
    G.ellipse(ctx, x, y, q(44), q(44), { fill: C.branco, stroke: TINTA, lw: 5, seed });
    (S1[kind] || S1.numero)(ctx, x, y, q, seed, uso);
  }

  // ---------- a faixa da categoria: a etiqueta com o nome e um selo por momento já contado dela ----------
  const ESCURAS = new Set([C.floresta, C.folha, C.noite]);
  const corDe = (nome) => C[nome] || nome;
  const fgDe = (bg) => (ESCURAS.has(bg) ? C.papel : bg === C.coral ? C.noite : INK);
  function faixaVig(ctx, st) {
    const c = st.c, cat = SC.CATEGORIAS[c.vig];
    if (!cat || st.t < c.tChip || !D(cat.etiqueta)) return;
    const bg = corDe(cat.cor || 'salvia');
    ctx.save(); ctx.globalAlpha *= U.clamp((st.t - c.tChip) / 0.18, 0, 1);
    const w = chip(ctx, D(cat.etiqueta), L, CHIPY, bg, fgDe(bg));
    ctx.restore();
    const x0 = L + w + 14, passo = Math.min(84, (R - x0) / c.selos.length);
    c.selos.forEach((kind, i) => {
      const t0 = c.tChip + 0.1 * (i + 1);
      if (st.t < t0) return;
      selo(ctx, x0 + passo * (i + 0.5), CHIPY - 13, kind, 400 + i * 7, ((passo - 8) / 88) * (1 + 0.35 * U.pulse(st.t, t0, 9)), (c.selosUso || [])[i]);
    });
  }
  // o que todo momento tem em volta do desenho: a hora, o contador, a frase da vez e a faixa da categoria
  function moldura(ctx, st) {
    hora(ctx, D(st.c.hora));
    contador(ctx, st.n, R - 125, TOP + 176, 0.8, st.pop);
    bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
    faixaVig(ctx, st);
  }
  // o palco: o desenho do momento. De longe, como foi desenhado. De perto, a lente vai para o meio da tela, 1,3 vez maior
  const rgba = (hex, a) => { const n = parseInt(String(hex).slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  function palco(ctx, st, desenha) {
    if (!st.perto) { desenha(); return; }
    const [lx, ly] = DIA.LENTE[st.c.id] || [CX, 1100];
    ctx.save();
    ctx.beginPath(); ctx.rect(-40, 824, W + 80, H); ctx.clip(); // de perto, o desenho não sobe para cima do texto
    ctx.translate(CX, 1150); ctx.scale(1.3, 1.3); ctx.translate(-lx, -ly);
    desenha();
    ctx.restore();
    const fundo = E.cor('fundo'), g = ctx.createLinearGradient(0, 824, 0, 840); // a borda de cima do recorte some no fundo
    g.addColorStop(0, fundo); g.addColorStop(1, rgba(fundo, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 822, W, 18);
  }
  // o cartão do nome: tela cheia, fundo escuro, a frase que dá o nome da categoria e os selos dela
  function cartaoNome(ctx, st) {
    const c = st.c, t = st.t, t0 = st.it.t0;
    E.fundo(ctx, { tipo: 'escuro' });
    bloco(ctx, st.it.n, { baseY: 900, sizes: [76, 68, 60, 54], maxLinhas: [2, 2, 2, 3], cor: C.papel, papel: 'titulo' });
    const n = c.selos.length, passo = 190, x0 = CX - (passo * (n - 1)) / 2;
    c.selos.forEach((kind, i) => { const ts = t0 + 0.25 + 0.18 * i; if (t >= ts) selo(ctx, x0 + passo * i, 1090, kind, 430 + i * 7, 1.7 * (1 + 0.3 * U.pulse(t, ts, 9)), (c.selosUso || [])[i]); });
  }
  // o estado do filme no instante t: a cena, a frase da vez e o que já aconteceu nela
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], ultima = i === c.itens.length - 1;
    const st = { t, c, it };
    if (c.uso) {
      st.kLente = t < c.tLente - 0.42 ? 0 : U.tween(t, c.tLente - 0.42, c.tLente, 0, 1, U.ease.outBack); // a lente pousa em 0,42 s
      st.n = t < c.tLente ? c.uso - 1 : c.uso; // o contador vira quando a lente pousa
      st.pop = U.pulse(t, c.tLente, 7);
      st.cartao = !!c.nome && it.n === c.nome; // a frase que dá o nome da categoria vira um cartão de tela cheia
      st.perto = i > 0 && !st.cartao && (!c.nome || it.n < c.nome); // a frase que explica a lente é vista de perto
    }
    // com corte antes da frase (começo de cena, vista de perto, cartão, volta do cartão), ela entra junto com a imagem;
    // sem corte, ela surge em 0,2 s. Toda frase some 0,12 s antes da seguinte
    const corte = i === 0 || st.cartao || st.perto || (!!c.nome && c.itens[i - 1].n === c.nome);
    st.aTexto = Math.min(corte ? 1 : U.clamp((t - it.t0) / 0.2, 0, 1), ultima ? 1 : U.clamp((it.t1 - t) / 0.12, 0, 1));
    st.dyTexto = corte ? 0 : (1 - U.ease.outCubic(U.clamp((t - it.t0) / 0.25, 0, 1))) * 16;
    return st;
  }

  // ---------- objetos e "o que a lente mostra" prontos: um momento novo pode sair sem desenho próprio ----------
  // um pacote em pé no chão: x = esquerda; linhas = o que está impresso (o primeiro grande); cor = a cor do pacote
  DIA.OBJ.pacote = (ctx, { x = L + 40, w = 300, h = 420, cor = 'marca', linhas = [], miudo = '', seed = 900 } = {}) => {
    const y = GY - h, bg = corDe(cor), fg = fgDe(bg);
    G.rrect(ctx, x, y, w, h, 20, { fill: bg, stroke: TINTA, lw: 7, seed, hatch: HAT });
    G.line(ctx, [[x, y + 40], [x + w, y + 40]], { color: fg, lw: 4, seed: seed + 1 });
    G.line(ctx, [[x, y + h - 40], [x + w, y + h - 40]], { color: fg, lw: 4, seed: seed + 2 });
    G.decor(() => {
      linhas.forEach((s, i) => txt(ctx, s, x + w / 2, y + 150 + i * 56, { size: i ? 36 : 52, color: fg, align: 'center', papel: 'titulo' }));
      if (miudo) txt(ctx, miudo, x + w / 2, y + h - 66, { size: 22, color: fg, align: 'center' });
    });
    return { topo: y, meio: [x + w / 2, y + h / 2] };
  };
  // uma caixa (de remédio, de exame...) deitada no chão, com tampa e lateral
  DIA.OBJ.caixa = (ctx, { x = L + 10, w = 520, h = 330, cor = 'folha', linhas = [], seed = 600 } = {}) => {
    const y = GY - h - 6;
    G.poly(ctx, [[x + w, y], [x + w + 44, y - 32], [x + w + 44, y + h - 32], [x + w, y + h]], { fill: C.salvia, stroke: TINTA, lw: 6, seed: seed + 1 });
    G.poly(ctx, [[x, y], [x + 44, y - 32], [x + w + 44, y - 32], [x + w, y]], { fill: C.branco, stroke: TINTA, lw: 6, seed: seed + 2 });
    G.rrect(ctx, x, y, w, h, 6, { fill: C.branco, stroke: TINTA, lw: 7, seed: seed + 3 });
    G.rrect(ctx, x, y, w, 62, 4, { fill: corDe(cor), stroke: TINTA, lw: 5, seed: seed + 4 });
    G.decor(() => linhas.forEach((s, i) => txt(ctx, s, x + 26, y + 176 + i * 52, { size: i ? 34 : 56, color: INK, papel: 'titulo' })));
    return { topo: y, meio: [x + w / 2, y + h / 2] };
  };
  // dentro da lente: uma lista conferida (3 vistos) e a palavra embaixo
  DIA.DENTRO.lista = (c, lx, ly, { palavra = '' } = {}) => {
    G.rrect(c, lx - 110, ly - 140, 220, 220, 14, { fill: C.papel, stroke: null, lw: 0, seed: 60 });
    for (let i = 0; i < 3; i++) {
      const yy = ly - 80 + i * 56;
      G.line(c, [[lx - 80, yy], [lx - 64, yy + 14], [lx - 40, yy - 16]], { color: C.folha, lw: 8, seed: 66 + i });
      G.line(c, [[lx - 20, yy], [lx + 80, yy]], { color: INK, lw: 6, seed: 70 + i });
    }
    if (palavra) hand(c, palavra, lx, ly + 150, { size: 58, color: C.marca, align: 'center' });
  };
  // dentro da lente: uma coisa grande (número, sigla, ano) e a palavra embaixo
  DIA.DENTRO.palavra = (c, lx, ly, { grande = '', palavra = '' } = {}) => {
    if (grande) txt(c, grande, lx, ly + 20, { size: 92, color: C.papel, align: 'center', papel: 'numero' });
    if (palavra) hand(c, palavra, lx, ly + 130, { size: 58, color: C.marca, align: 'center' });
  };

  Object.assign(DIA, { C, INK, TINTA, sobre, L, R, TOP, BOT, CX, GY, BASE, CHIPY, HAT, NB, D, txt, hand, wid, zz, caber, mark, quebrar, bloco, titulo, chip, hora, contador, lente, balao, chao, selo, faixaVig, moldura, palco, cartaoNome, estado, corDe, fgDe });
  globalThis.DIA = DIA;
})();
