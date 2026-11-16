// PRESEME · série "Na UBS, e agora?" · desenho 1/3 · o molde (igual em toda peça da série; o chat não mexe aqui)
// Cores, letras, texto que se quebra sozinho, o trilho do protocolo (a cara da série), a conta do gesto,
// os cartões (pergunta, 192, alerta, cuidado) e as pessoas da visita (a ACS e o estudante).
// Todo texto da tela vem do textos.js. O que é de uma peça só (o paciente, os gestos, os destaques) está em film-2-peca.js.
// O estilo (lápis, giz, chapado...) vem do kit de estilos (ferramentas/estilos.js), pelo ESTILO do score.js: a cor e a
// letra do molde saem do kit (E.cor, E.letra). Sem o kit, o molde desenha em lápis, como antes.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const E = globalThis.ESTILOS;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  // a paleta do perfil e as cores de gente (pele, cabelo): nomes fixos, que não mudam com o estilo
  const C = { floresta: '#17402C', papel: '#F4EDDF', marca: '#E4EB6C', coral: '#F16D4D', salvia: '#B5D8C0', folha: '#30724E', noite: '#072618', branco: '#FFFDF6', pele: '#C98A62', peleClara: '#DBA27E', peleEscura: '#A86E4B', miolo: '#C9A063', cabelo: '#2B211E', grisalho: '#B9B2A6', madeira: '#B8875A' };
  // as cores do molde por papel: mudam com o estilo (na lousa, o fundo é Floresta e a tinta é Papel).
  // Desenho novo da peça pede a cor pelo papel (B.COR.tinta, B.COR.cartao...) ou B.sobre(fundo), e não pelo nome:
  // na lousa, uma linha Floresta some no fundo.
  const k = (papel, fixo) => (E ? E.cor(papel) : fixo);
  const COR = {
    fundo: k('fundo', C.papel), // o fundo da cena
    tinta: k('tinta', C.floresta), // contorno e linha sobre o fundo
    texto: k('texto', C.floresta), // a letra sobre o fundo
    cartao: k('superficie', C.branco), // cartão, balão, bolinha vazia
    chao: k('chao', C.salvia),
    destaque: k('destaque', C.marca), // o marca-texto, o passo da vez
    alerta: k('alerta', C.coral), // o X, a borda do alerta, a bolinha cheia da conta
    escura: C.floresta, // a letra e o traço por cima de cor clara (marca-texto, Sálvia, papel, branco), em todo estilo
    clara: C.papel, // a letra e o traço sobre o cartão escuro (a pergunta, o 192), em todo estilo
  };
  // o claro que se destaca do fundo (a janela, o passo feito): Sálvia, e no chapado (fundo Sálvia) o cartão
  COR.apoio = E && E.cor('apoio') === COR.fundo ? COR.cartao : k('apoio', C.salvia);
  const INK = COR.tinta;
  // a letra do estilo (Inter no lápis, Kalam na lousa...) e a de anotação à mão (Caveat no lápis)
  const [FAM, PESO] = E ? E.letra('corpo') : ['Inter', 800];
  const [FAM_MAO, PESO_MAO] = E ? E.letra('mao') : ['Caveat', 700];
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2; // 60, 940, 221, 1498, 500
  const GY = 1400, BASE = 690, TRILHO_Y = 800; // o chão; a base da última linha do texto; o trilho do protocolo
  const NB = ' '; // espaço que não quebra: o trecho marcado fica numa linha só
  const D = (k) => TX[k] || '';
  const P = () => globalThis.PECA || {}; // o que é da peça (film-2-peca.js)

  // a cor que se lê por cima de um preenchimento: escura sobre cor clara, Papel sobre cor escura; sobre Coral, Noite
  const lum = (hex) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex));
    if (!m) return 1;
    const v = parseInt(m[1], 16), c = [v >> 16, (v >> 8) & 255, v & 255].map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  // (0,23 é onde Floresta e Papel dão o mesmo contraste; acima, a escura se lê melhor)
  const sobre = (fill) => (String(fill).toUpperCase() === C.coral ? C.noite : lum(fill) > 0.23 ? COR.escura : COR.clara);
  const rgba = (hex, a) => { const v = parseInt(String(hex).replace('#', ''), 16); return `rgba(${v >> 16},${(v >> 8) & 255},${v & 255},${a})`; };
  // a roupa de quem aparece, ajustada ao estilo: na lousa, o sapato escuro some no chão (como no E.personagem do kit)
  const vestir = (o) => (E && E.escuro() ? Object.assign({}, o, { shoes: C.papel }) : o);

  const txt = (ctx, s, x, y, o = {}) => G.text(ctx, s, x, y, Object.assign({ fam: FAM, weight: PESO, color: COR.texto, boil: 0, size: 56, preseme_k: true }, o));
  const hand = (ctx, s, x, y, o = {}) => G.text(ctx, s, x, y, Object.assign({ fam: FAM_MAO, weight: PESO_MAO, color: COR.texto, size: 60, preseme_k: true }, o));
  const wid = (ctx, s, size, fam = FAM, weight = PESO) => G.measure(ctx, s, size, fam, weight);

  function mark(ctx, x, y, w, size, seed = 5, color = COR.destaque) {
    G.poly(ctx, [[x - 10, y - size * 0.82], [x + w + 12, y - size * 0.9], [x + w + 8, y + size * 0.2], [x - 14, y + size * 0.26]], { fill: color, stroke: null, lw: 0, seed, amp: 2.2 });
  }
  function quebrar(ctx, s, size, maxW, fam = FAM, weight = PESO) {
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
  function equilibrar(ctx, s, size, maxW, fam = FAM, weight = PESO) {
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
  // cor = a cor da letra fora do marca-texto; dentro dele a letra é sempre escura (COR.escura)
  function desenhaLinhas(ctx, ls, n, size, yDe, cor = COR.texto, cx = CX) {
    const d = (P().DESTAQUE || {})[n];
    ls.forEach((l, i) => {
      const s = l.split(NB).join(' '), y = yDe(i), x = cx - wid(ctx, s, size) / 2, k = d ? s.indexOf(d) : -1;
      if (k < 0) { txt(ctx, s, x, y, { size, color: cor }); return; }
      const a = s.slice(0, k), b = s.slice(k + d.length), xa = x + wid(ctx, a, size), wd = wid(ctx, d, size);
      mark(ctx, xa, y, wd, size, 7 + n * 3 + i);
      if (cor === COR.escura) { txt(ctx, s, x, y, { size, color: cor }); return; }
      const p = (b.match(/^[.,;:!?]+/) || [''])[0], wp = wid(ctx, p, size);
      if (p) mark(ctx, xa + wd, y, wp, size, 9 + n * 3 + i);
      txt(ctx, a, x, y, { size, color: cor }); txt(ctx, d + p, xa, y, { size, color: COR.escura }); txt(ctx, b.slice(p.length), xa + wd + wp, y, { size, color: cor });
    });
  }
  // a frase da vez, centrada; a última linha fica em baseY
  function bloco(ctx, n, { baseY = BASE, sizes = [58, 54, 50, 46], maxLinhas = [2, 3, 3, 4], maxW = R - L, alpha = 1, dy = 0, cor = COR.texto, cx = CX } = {}) {
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

  function chip(ctx, label, x, y, bg, fg = sobre(bg), size = 34) {
    const w = wid(ctx, label, size) + 44;
    G.rrect(ctx, x, y - size * 1.3, w, size * 1.82, size * 0.91, { fill: bg, stroke: INK, lw: 3.5, seed: 3 });
    txt(ctx, label, x + 22, y, { size, color: fg });
    return w;
  }
  function chao(ctx, gy = GY, cor = COR.chao) {
    G.poly(ctx, [[-700, gy], [W + 700, gy], [W + 700, H + 400], [-700, H + 400]], { fill: cor, stroke: null, lw: 0, seed: 6, hatch: { color: rgba(sobre(cor), 0.13), gap: 13 } });
    G.line(ctx, [[-700, gy], [W + 700, gy]], { color: INK, lw: 8, seed: 5 });
  }
  function balao(ctx, linhas, x, y, tx, ty, size = 46) {
    const pb = Math.min(PESO, 700);
    const w = Math.max(...linhas.map((s) => wid(ctx, s, size, FAM, pb))) + 64, h = linhas.length * size * 1.3 + 44;
    G.poly(ctx, [[x + 60, y + h - 6], [tx, ty], [x + 150, y + h - 6]], { fill: COR.cartao, stroke: INK, lw: 5, seed: 41 });
    G.rrect(ctx, x, y, w, h, 34, { fill: COR.cartao, stroke: INK, lw: 5, seed: 42 });
    G.poly(ctx, [[x + 66, y + h - 8], [tx + 6, ty - 14], [x + 144, y + h - 8]], { fill: COR.cartao, stroke: null, lw: 0, seed: 43, amp: 0 });
    linhas.forEach((s, i) => txt(ctx, s, x + 32, y + 30 + size * (i + 0.85) * 1.3 - size * 0.25, { size, weight: pb, color: sobre(COR.cartao) }));
  }
  function seta(ctx, x0, y0, x1, y1, { cor = COR.alerta, lw = 12, ponta = 34, seed = 70 } = {}) {
    G.line(ctx, [[x0, y0], [x1, y1]], { color: cor, lw, seed });
    const a = Math.atan2(y1 - y0, x1 - x0);
    G.poly(ctx, [[x1 + Math.cos(a) * ponta * 0.5, y1 + Math.sin(a) * ponta * 0.5], [x1 + Math.cos(a + 2.4) * ponta, y1 + Math.sin(a + 2.4) * ponta], [x1 + Math.cos(a - 2.4) * ponta, y1 + Math.sin(a - 2.4) * ponta]], { fill: cor, stroke: INK, lw: 4, seed: seed + 1 });
  }
  function xis(ctx, cx, cy, r, k = 1, seed = 90) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
    G.line(ctx, [[-r, -r], [r, r]], { color: COR.alerta, lw: 26, seed }); G.line(ctx, [[r, -r], [-r, r]], { color: COR.alerta, lw: 26, seed: seed + 1 });
    ctx.restore();
  }

  // ---------- o trilho do protocolo: a cara da série. Um círculo por passo, ligados por uma linha;
  // o passo da vez fica no marca-texto, o que já passou ganha um visto. Fica no alto do palco nas cenas de passo.
  // tinta = a cor da linha e do contorno (no cartão escuro da pergunta, Papel)
  function trilho(ctx, atual, total, { y = TRILHO_Y, alpha = 1, tudoFeito = false, t = 0, tAcende = -1, tinta = INK } = {}) {
    if (!total) return;
    const x0 = L + 70, x1 = R - 70, passo = total > 1 ? (x1 - x0) / (total - 1) : 0, r = 40;
    ctx.save(); ctx.globalAlpha *= alpha;
    G.line(ctx, [[x0, y], [x1, y]], { color: tinta, lw: 7, seed: 12 });
    for (let i = 1; i <= total; i++) {
      const x = x0 + passo * (i - 1), feito = tudoFeito || i < atual, vez = !tudoFeito && i === atual;
      const z = vez ? 1 + 0.25 * U.pulse(t, tAcende, 8) : 1, fill = vez ? COR.destaque : feito ? COR.apoio : COR.cartao;
      G.ellipse(ctx, x, y, r * z, r * z, { fill, stroke: tinta, lw: 6, seed: 20 + i });
      if (feito) G.line(ctx, [[x - 17, y + 2], [x - 4, y + 15], [x + 19, y - 14]], { color: sobre(fill), lw: 8, seed: 30 + i });
      else txt(ctx, String(i), x, y + 17, { size: 46, align: 'center', color: sobre(fill) });
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
      G.ellipse(ctx, x0 + gap * k, y, 22 * z, 22 * z, { fill: cheio ? COR.alerta : COR.cartao, stroke: INK, lw: 5, seed: 50 + k });
      if (cheio) txt(ctx, String(k + 1), x0 + gap * k, y + 11, { size: 30, color: sobre(COR.alerta), align: 'center' });
    });
  }
  // quanto o gesto "bate" agora (1 no instante do golpe, caindo depois); serve para mexer a mão e o corpo
  function batida(c, t) {
    if (!c.tConta) return 0;
    let v = 0;
    for (const tc of c.tConta) { const d = t - tc; if (d >= -0.12 && d < 0.4) v = Math.max(v, d < 0 ? 1 + d / 0.12 : Math.exp(-d * 9)); }
    return v;
  }

  // ---------- os fundos ----------
  // o fundo do estilo (papel no lápis, lousa no giz, Sálvia no chapado)
  function fundo(ctx) { if (E) E.fundo(ctx); else G.bg(ctx, C.papel); }
  // o cartão escuro (a pergunta, o 192): Floresta em todo estilo; na lousa, a própria lousa
  function fundoEscuro(ctx) { if (E) E.fundo(ctx, { tipo: 'escuro' }); else { ctx.fillStyle = C.floresta; ctx.fillRect(0, 0, W, H); } }

  // ---------- os cartões do molde ----------
  // a pergunta: tela cheia, o cartão escuro, a frase em letra enorme e o trilho vazio embaixo (o protocolo que vem)
  function cartaoPergunta(ctx, st) {
    fundoEscuro(ctx);
    const k = U.ease.outBack(U.clamp((st.t - st.it.t0) / 0.35, 0, 1));
    ctx.save(); ctx.translate(CX, 760); ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); ctx.translate(-CX, -760);
    bloco(ctx, st.it.n, { baseY: 800, sizes: [150, 130, 110], maxLinhas: [1, 2, 2], cor: COR.clara });
    ctx.restore();
    trilho(ctx, 0, st.c.passos, { y: 1110, alpha: U.clamp((st.t - st.it.t0 - 0.6) / 0.4, 0, 1), tinta: COR.clara });
  }
  // o 192: o número enorme num telefone e, embaixo, a frase da vez
  function cartao192(ctx, st, extra) {
    fundoEscuro(ctx);
    const t = st.t, c = st.c, u = t - c.t0;
    const k = U.ease.outBack(U.clamp(u / 0.4, 0, 1));
    ctx.save(); ctx.translate(CX, 640); ctx.scale(k, k); ctx.translate(-CX, -640);
    G.rrect(ctx, CX - 250, 330, 500, 640, 70, { fill: C.papel, stroke: C.papel, lw: 6, seed: 81 });
    G.rrect(ctx, CX - 205, 410, 410, 450, 26, { fill: COR.destaque, stroke: COR.escura, lw: 6, seed: 82 });
    txt(ctx, D('D02'), CX, 700, { size: 200, align: 'center', color: sobre(COR.destaque) });
    G.ellipse(ctx, CX, 915, 30, 30, { fill: C.salvia, stroke: COR.escura, lw: 5, seed: 83 });
    ctx.restore();
    if (extra) extra(ctx, st);
    bloco(ctx, st.it.n, { baseY: 1300, sizes: [62, 56, 50, 46], maxLinhas: [2, 3, 3, 4], cor: COR.clara, alpha: st.aTexto });
  }
  // o alerta: a borda Coral pisca na entrada (a cena muda de rumo)
  function bordaAlerta(ctx, st) {
    const a = 0.55 + 0.45 * U.pulse(st.t, st.c.t0, 3);
    ctx.save(); ctx.globalAlpha *= a;
    G.rrect(ctx, 18, 18, W - 36, H - 36, 40, { stroke: COR.alerta, lw: 22, seed: 95 });
    ctx.restore();
  }

  // a mão de uma pessoa num ponto da tela: o Ch.person quer o alvo da mão em coordenadas do corpo dela
  // (origem nos pés, antes da escala e da rotação); handR é o braço do lado direito da tela, handL o do esquerdo
  function mao(p, ax, ay) {
    const s = p.s || 1, r = -(p.rot || 0), dx = ax - p.x, dy = ay - p.y;
    return [(dx * Math.cos(r) - dy * Math.sin(r)) / (s * (p.sx || 1)), (dx * Math.sin(r) + dy * Math.cos(r)) / (s * (p.sy || 1))];
  }
  // ---------- as pessoas da visita (as mesmas em toda peça da série) ----------
  // A peça pode trocar a aparência delas (pele, cabelo, roupa) em PECA.ACS e PECA.ESTUDANTE, no film-2-peca.js; a cena não muda.
  const ACS = vestir({ skin: C.peleEscura, hair: C.cabelo, hairStyle: 'ponytail', outfit: 'shirt', shirt: C.folha, trim: C.marca, collar: C.folha, bottoms: 'pants', shorts: C.floresta, build: 'regular', shoes: C.noite, headwear: 'cap', headwearColor: C.folha });
  const ESTUDANTE = vestir({ skin: C.peleClara, hair: C.cabelo, hairStyle: 'short', outfit: 'shirt', shirt: C.branco, trim: C.salvia, collar: C.branco, sleeves: 'long', bottoms: 'pants', shorts: C.floresta, shoes: C.papel, build: 'slim' });

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

  globalThis.UBS = { C, COR, INK, E, L, R, TOP, BOT, CX, GY, BASE, TRILHO_Y, D, txt, hand, wid, mark, quebrar, bloco, chip, chao, balao, seta, xis, trilho, conta, batida, fundo, fundoEscuro, cartaoPergunta, cartao192, bordaAlerta, mao, sobre, rgba, vestir, ACS, ESTUDANTE, estado, CENA: {} };
})();
