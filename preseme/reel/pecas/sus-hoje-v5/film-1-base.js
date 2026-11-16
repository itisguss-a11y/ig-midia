// versão 5, só para testar o motor; a peça de verdade está no chat dela
// PRESEME · "Quantas vezes você usou o SUS hoje?" · desenho 1/5 · base
// Cores, letras, texto que se quebra sozinho, contador, lente, selos e a faixa da vigilância.
// Todo texto da tela vem do textos.js. Fixos aqui só os dizeres impressos nos objetos (pacote, caixa).
(function () {
  const U = globalThis.U, G = globalThis.G, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const C = { floresta: '#17402C', papel: '#F4EDDF', marca: '#E4EB6C', coral: '#F16D4D', salvia: '#B5D8C0', folha: '#30724E', noite: '#072618', branco: '#FFFDF6', pele: '#C98A62', peleClara: '#DBA27E', peleEscura: '#A86E4B', miolo: '#C9A063', cabelo: '#2B211E' };
  const INK = C.floresta;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2; // 60, 940, 221, 1498, 500
  const GY = 1400, BASE = 706, CHIPY = 786; // o chão; a linha de base da última linha do texto; a faixa da vigilância
  const NB = ' ';
  const D = (k) => TX[k] || '';
  const HAT = { color: 'rgba(23,64,44,0.15)', gap: 12 };

  const txt = (ctx, s, x, y, o = {}) => G.text(ctx, s, x, y, Object.assign({ fam: 'Inter', weight: 800, color: INK, boil: 0, size: 56 }, o));
  const hand = (ctx, s, x, y, o = {}) => G.text(ctx, s, x, y, Object.assign({ fam: 'Caveat', weight: 700, color: INK, size: 60 }, o));
  const wid = (ctx, s, size, fam = 'Inter', weight = 800) => G.measure(ctx, s, size, fam, weight);

  // marca-texto atrás de um trecho
  function mark(ctx, x, y, w, size, seed = 5, color = C.marca) {
    G.poly(ctx, [[x - 10, y - size * 0.82], [x + w + 12, y - size * 0.9], [x + w + 8, y + size * 0.2], [x - 14, y + size * 0.26]], { fill: color, stroke: null, lw: 0, seed, amp: 2.2 });
  }
  // o trecho que leva marca-texto em cada frase (se ele mudar a frase e o trecho sumir, a frase sai sem marca)
  const DESTAQUE = { 1: 'SUS', 3: 'não aparece', 4: 'conferiu', 5: 'vigilância ambiental', 7: 'ferro e ácido fólico', 9: 'Reg. MS', 10: 'Ministério da Saúde', 11: 'vigilância sanitária', 13: 'vacina BCG', 15: 'gotinha', 16: '1989', 17: 'de casa em casa', 19: 'vigilância epidemiológica', 21: 'lupa preta', 22: 'vigilância sanitária', 23: 'iodo', 24: '1 em cada 70', 25: 'gordura trans', 26: 'proibida', 31: 'hospital', 32: 'não aparece' };
  // a quebra de linha do título, igual à dos quadros aprovados (só vale enquanto a frase não mudar)
  const QUEBRA = { 1: ['Quantas vezes', 'você usou o SUS', 'hoje?'], 3: ['Prevenção', 'que funciona', 'não aparece.'], 32: ['Prevenção', 'que funciona', 'não aparece.'] };

  function quebrar(ctx, s, size, maxW, fam = 'Inter', weight = 800) {
    const out = []; let cur = '';
    for (const w of s.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && wid(ctx, t, size, fam, weight) > maxW) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }
  // mesma quantidade de linhas, com as linhas de tamanho parecido e sem deixar palavrinha solta no fim da linha
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
  // cor = a cor da letra fora do marca-texto (no fundo escuro do cartão, papel); dentro dele a letra é sempre escura
  function desenhaLinhas(ctx, ls, n, size, yDe, cor = INK) {
    const d = DESTAQUE[n];
    ls.forEach((l, i) => {
      const s = l.split(NB).join(' '), y = yDe(i), x = CX - wid(ctx, s, size) / 2, k = d ? s.indexOf(d) : -1;
      if (k < 0) { txt(ctx, s, x, y, { size, color: cor }); return; }
      const a = s.slice(0, k), b = s.slice(k + d.length), xa = x + wid(ctx, a, size), wd = wid(ctx, d, size);
      mark(ctx, xa, y, wd, size, 7 + n * 3 + i);
      if (cor === INK) { txt(ctx, s, x, y, { size }); return; }
      // no fundo escuro, a pontuação colada ao trecho marcado entra no marca-texto (letra clara em cima do amarelo não se lê)
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
      const cabe = t.every((l) => wid(ctx, l.split(NB).join(' '), sizes[i]) <= maxW); // o trecho marcado não se parte: ele pode passar da largura sozinho
      if (t.length <= maxLinhas[i] && cabe) { size = sizes[i]; ls = t; break; }
    }
    if (!ls) ls = linhasDe(ctx, n, size, maxW);
    const lh = size * 1.27;
    ctx.save(); ctx.globalAlpha *= alpha;
    desenhaLinhas(ctx, ls, n, size, (i) => baseY - (ls.length - 1 - i) * lh + dy, cor);
    ctx.restore();
  }
  // o título grande da abertura e do fecho
  function titulo(ctx, n, alpha = 1) {
    if (!TX[n]) return;
    const q = QUEBRA[n];
    let size = 104, ls = q && q.join(' ') === TX[n] ? q : null;
    if (!ls) for (const z of [104, 92, 80, 70]) { size = z; ls = linhasDe(ctx, n, z, R - L); if (ls.length <= 3) break; }
    ctx.save(); ctx.globalAlpha *= alpha;
    desenhaLinhas(ctx, ls, n, size, (i) => TOP + 150 + i * size * 1.25);
    ctx.restore();
  }

  function chip(ctx, label, x, y, bg, fg) {
    const size = 34, w = wid(ctx, label, size) + 44;
    G.rrect(ctx, x, y - 44, w, 62, 31, { fill: bg, stroke: INK, lw: 3.5, seed: 3 });
    txt(ctx, label, x + 22, y, { size, color: fg });
    return w;
  }
  function hora(ctx, h) {
    if (!h) return;
    const size = 40, w = wid(ctx, h, size) + 40;
    G.rrect(ctx, L, TOP + 8, w, 68, 16, { fill: C.papel, stroke: INK, lw: 4, seed: 4 });
    txt(ctx, h, L + 20, TOP + 56, { size });
  }
  // o contador "SUS hoje"; pop (de 1 a 0) faz ele dar um pulo quando o número muda
  function contador(ctx, n, cx, cy, k = 1, pop = 0) {
    const w = 250 * k, h = 250 * k, z = 1 + 0.2 * pop;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
    hand(ctx, D('D01'), cx, cy - h / 2 - 16 * k, { size: 50 * k, align: 'center' });
    G.rrect(ctx, cx - w / 2 + 10, cy - h / 2 + 12, w, h, 26 * k, { fill: C.folha, stroke: null, lw: 0, seed: 8 });
    G.rrect(ctx, cx - w / 2, cy - h / 2, w, h, 26 * k, { fill: INK, stroke: INK, lw: 4, seed: 9 });
    G.line(ctx, [[cx - w / 2 + 6, cy], [cx + w / 2 - 6, cy]], { color: C.folha, lw: 4, seed: 2, amp: 0.4 });
    txt(ctx, String(n), cx, cy + 62 * k, { size: 176 * k, color: C.marca, align: 'center' });
    ctx.restore();
  }
  // a lente: por fora, o dia comum; por dentro, o que ninguém vê.
  // k vai de 0 (fora da tela) a 1 (no lugar); lado 1 = cabo para a direita, -1 = cabo para a esquerda
  function lente(ctx, cx, cy, r, dentro, { k = 1, lado = 1 } = {}) {
    if (k <= 0) return;
    const off = (1 - k) * 780;
    ctx.save(); ctx.translate(lado * off, off);
    G.line(ctx, [[cx + lado * r * 0.72, cy + r * 0.72], [cx + lado * r * 1.42, cy + r * 1.42]], { color: INK, lw: 54, seed: 31, amp: 0.6 });
    G.line(ctx, [[cx + lado * r * 0.78, cy + r * 0.78], [cx + lado * r * 1.38, cy + r * 1.38]], { color: C.folha, lw: 22, seed: 32, amp: 0.6 });
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = INK; ctx.fillRect(cx - r - 4, cy - r - 4, 2 * r + 8, 2 * r + 8);
    dentro(ctx);
    ctx.restore();
    G.ellipse(ctx, cx, cy, r, r, { stroke: C.marca, lw: 10, seed: 33 });
    G.ellipse(ctx, cx, cy, r + 14, r + 14, { stroke: INK, lw: 22, seed: 34 });
    ctx.restore();
  }
  function balao(ctx, linhas, x, y, tx, ty, size = 46) {
    const w = Math.max(...linhas.map((s) => wid(ctx, s, size, 'Inter', 700))) + 64, h = linhas.length * size * 1.3 + 44;
    G.poly(ctx, [[x + 60, y + h - 6], [tx, ty], [x + 150, y + h - 6]], { fill: C.branco, stroke: INK, lw: 5, seed: 41 });
    G.rrect(ctx, x, y, w, h, 34, { fill: C.branco, stroke: INK, lw: 5, seed: 42 });
    G.poly(ctx, [[x + 66, y + h - 8], [tx + 6, ty - 14], [x + 144, y + h - 8]], { fill: C.branco, stroke: null, lw: 0, seed: 43, amp: 0 });
    linhas.forEach((s, i) => txt(ctx, s, x + 32, y + 30 + size * (i + 0.85) * 1.3 - size * 0.25, { size, weight: 700 }));
  }
  function chao(ctx, gy = GY) {
    // mais largo que a tela, para cobrir a tela também quando o desenho é visto de perto
    G.poly(ctx, [[-700, gy], [W + 700, gy], [W + 700, H + 400], [-700, H + 400]], { fill: C.salvia, stroke: null, lw: 0, seed: 6, hatch: { color: 'rgba(23,64,44,0.13)', gap: 13 } });
    G.line(ctx, [[-700, gy], [W + 700, gy]], { color: INK, lw: 8, seed: 5 });
  }

  // as pessoas (sempre as mesmas): o calouro, a criança que ele foi e o agente
  const CALOURO = { skin: C.pele, hair: C.cabelo, hairStyle: 'short', outfit: 'tee', shirt: C.salvia, trim: C.folha, bottoms: 'pants', shorts: C.floresta, shoes: C.papel, build: 'slim' };
  const CRIANCA = Object.assign({}, CALOURO, { shirt: C.marca, trim: C.folha, bottoms: 'shorts', shorts: C.folha });
  const AGENTE = { skin: C.peleEscura, hair: C.cabelo, hairStyle: 'short', outfit: 'shirt', shirt: C.folha, trim: C.marca, collar: C.folha, bottoms: 'pants', shorts: '#5C6B55', build: 'regular', headwear: 'cap', headwearColor: C.folha, shoes: C.noite };

  // os selos: um por uso do SUS. Aparecem ao lado da etiqueta da vigilância e na recontagem
  function selo(ctx, x, y, kind, seed, k = 1.14) {
    const q = (v) => v * k;
    G.ellipse(ctx, x, y, q(44), q(44), { fill: C.branco, stroke: INK, lw: 5, seed });
    if (kind === 'gota') G.poly(ctx, [[x, y - q(26)], [x + q(18), y + q(6)], [x, y + q(24)], [x - q(18), y + q(6)]], { fill: C.salvia, stroke: INK, lw: 4, seed: seed + 1 });
    if (kind === 'pao') G.rrect(ctx, x - q(24), y - q(14), q(48), q(30), q(14), { fill: C.miolo, stroke: INK, lw: 4, seed: seed + 1 });
    if (kind === 'remedio') { G.rrect(ctx, x - q(26), y - q(11), q(52), q(22), q(11), { fill: C.coral, stroke: INK, lw: 4, seed: seed + 1 }); G.line(ctx, [[x, y - q(10)], [x, y + q(10)]], { color: INK, lw: 4, seed: seed + 2 }); }
    if (kind === 'sal') { G.poly(ctx, [[x - q(15), y - q(8)], [x + q(15), y - q(8)], [x + q(20), y + q(24)], [x - q(20), y + q(24)]], { fill: C.papel, stroke: INK, lw: 4, seed: seed + 1 }); G.rrect(ctx, x - q(17), y - q(26), q(34), q(18), q(8), { fill: C.salvia, stroke: INK, lw: 4, seed: seed + 2 }); }
    if (kind === 'salgadinho') { G.rrect(ctx, x - q(20), y - q(26), q(40), q(52), 6, { fill: C.marca, stroke: INK, lw: 4, seed: seed + 1 }); G.line(ctx, [[x - q(20), y - q(16)], [x + q(20), y - q(16)]], { color: INK, lw: 3, seed: seed + 2 }); G.line(ctx, [[x - q(20), y + q(16)], [x + q(20), y + q(16)]], { color: INK, lw: 3, seed: seed + 3 }); }
    if (kind === 'gotinha') { G.rrect(ctx, x - q(11), y - q(28), q(22), q(26), q(8), { fill: C.papel, stroke: INK, lw: 4, seed: seed + 1 }); G.poly(ctx, [[x - q(6), y - q(2)], [x + q(6), y - q(2)], [x + q(2), y + q(8)], [x - q(2), y + q(8)]], { fill: C.papel, stroke: INK, lw: 3, seed: seed + 2 }); G.ellipse(ctx, x, y + q(20), q(7), q(9), { fill: C.coral, stroke: INK, lw: 3, seed: seed + 3 }); }
    if (kind === 'vacina') { G.line(ctx, [[x - q(22), y + q(20)], [x + q(20), y - q(22)]], { color: INK, lw: 9, seed: seed + 1 }); G.line(ctx, [[x + q(10), y - q(30)], [x + q(28), y - q(12)]], { color: INK, lw: 6, seed: seed + 2 }); }
    if (kind === 'mapa') { for (const [dx, dy] of [[-12, -8], [8, -14], [0, 8], [16, 10]]) G.ellipse(ctx, x + q(dx), y + q(dy), q(6), q(6), { fill: C.coral, stroke: null, lw: 0, seed: seed + dx }); G.ellipse(ctx, x + 2, y - 2, q(30), q(28), { stroke: INK, lw: 3, seed: seed + 5 }); }
    if (kind === 'rotulo') { G.rrect(ctx, x - q(26), y - q(15), q(52), q(30), 5, { fill: C.noite, stroke: null, lw: 0, seed: seed + 1, amp: 0.4 }); G.ellipse(ctx, x - q(10), y - q(2), q(7), q(7), { stroke: C.branco, lw: 3, seed: seed + 2, amp: 0.3 }); G.line(ctx, [[x - q(5), y + q(4)], [x + q(2), y + q(10)]], { color: C.branco, lw: 3, seed: seed + 3, amp: 0.2 }); }
  }

  // a faixa da vigilância: a etiqueta com o nome e, ao lado, um selo por uso já contado daquela vigilância
  const VIG = { amb: { nome: 'D11', bg: C.folha, fg: C.papel }, san: { nome: 'D12', bg: C.salvia, fg: INK }, epi: { nome: 'D13', bg: C.marca, fg: INK } };
  function faixaVig(ctx, st) {
    const c = st.c;
    if (!c.vig || st.t < c.tChip || !D(VIG[c.vig].nome)) return;
    const v = VIG[c.vig];
    ctx.save(); ctx.globalAlpha *= U.clamp((st.t - c.tChip) / 0.18, 0, 1);
    const w = chip(ctx, D(v.nome), L, CHIPY, v.bg, v.fg);
    ctx.restore();
    const x0 = L + w + 14, passo = Math.min(84, (R - x0) / c.selos.length);
    c.selos.forEach((kind, i) => {
      const t0 = c.tChip + 0.1 * (i + 1);
      if (st.t < t0) return;
      selo(ctx, x0 + passo * (i + 0.5), CHIPY - 13, kind, 400 + i * 7, ((passo - 8) / 88) * (1 + 0.35 * U.pulse(st.t, t0, 9)));
    });
  }
  // o que toda cena de uso tem em volta do desenho: a hora, o contador, a frase da vez e a faixa da vigilância
  function moldura(ctx, st) {
    hora(ctx, D(st.c.hora));
    contador(ctx, st.n, R - 125, TOP + 176, 0.8, st.pop);
    bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
    faixaVig(ctx, st);
  }
  // o palco: o desenho da cena. De longe, como foi desenhado. De perto, a lente vai para o meio da tela, 1,3 vez maior
  const LENTE = {}; // o centro da lente de cada cena (cada arquivo de cena registra o seu)
  function palco(ctx, st, desenha) {
    if (!st.perto) { desenha(); return; }
    const [lx, ly] = LENTE[st.c.id];
    ctx.save();
    ctx.beginPath(); ctx.rect(-40, 824, W + 80, H); ctx.clip(); // de perto, o desenho não sobe para cima do texto
    ctx.translate(CX, 1150); ctx.scale(1.3, 1.3); ctx.translate(-lx, -ly);
    desenha();
    ctx.restore();
    const g = ctx.createLinearGradient(0, 824, 0, 840); // a borda de cima do recorte some no papel (sem chegar na lente)
    g.addColorStop(0, C.papel); g.addColorStop(1, 'rgba(244,237,223,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 822, W, 18);
  }
  // o cartão do nome: tela cheia, fundo escuro, a frase que dá o nome da vigilância e os selos dela
  function cartaoNome(ctx, st) {
    const c = st.c, t = st.t, t0 = st.it.t0;
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    bloco(ctx, st.it.n, { baseY: 900, sizes: [76, 68, 60, 54], maxLinhas: [2, 2, 2, 3], cor: C.papel });
    const n = c.selos.length, passo = 190, x0 = CX - (passo * (n - 1)) / 2;
    c.selos.forEach((kind, i) => { const ts = t0 + 0.25 + 0.18 * i; if (t >= ts) selo(ctx, x0 + passo * i, 1090, kind, 430 + i * 7, 1.7 * (1 + 0.3 * U.pulse(t, ts, 9))); });
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
      st.cartao = !!c.nome && it.n === c.nome; // a frase que dá o nome da vigilância vira um cartão de tela cheia
      st.perto = i > 0 && !st.cartao && (!c.nome || it.n < c.nome); // a frase que explica a lente é vista de perto
    }
    // quando há corte antes da frase (começo de cena, vista de perto, cartão, volta do cartão), ela entra junto com a imagem;
    // sem corte, ela surge em 0,2 s. Toda frase some 0,12 s antes da seguinte
    const corte = i === 0 || st.cartao || st.perto || (!!c.nome && c.itens[i - 1].n === c.nome);
    st.aTexto = Math.min(corte ? 1 : U.clamp((t - it.t0) / 0.2, 0, 1), ultima ? 1 : U.clamp((it.t1 - t) / 0.12, 0, 1));
    st.dyTexto = corte ? 0 : (1 - U.ease.outCubic(U.clamp((t - it.t0) / 0.25, 0, 1))) * 16;
    return st;
  }

  globalThis.SUS = { C, INK, L, R, TOP, BOT, CX, GY, BASE, CHIPY, HAT, D, txt, hand, wid, mark, quebrar, bloco, titulo, chip, hora, contador, lente, balao, chao, selo, faixaVig, moldura, palco, cartaoNome, LENTE, estado, CALOURO, CRIANCA, AGENTE, CENA: {} };
})();
