// PRESEME · motor "Quiz relâmpago" · desenho 1/3 · o molde (igual em toda peça deste tipo; o chat não mexe aqui)
// A cara do tipo: o rótulo no alto (D01) e o placar no canto (uma casa por pergunta: a da vez pisca, a respondida ganha a
// resposta certa, V ou F, para quem assiste contar os acertos); a pergunta grande; os dois cartões (Verdadeiro e Falso, D02
// e D03, ou A e B com as opções da pergunta); o relógio de 3 s; na resposta, o cartão certo acende e o outro apaga, e o
// painel da resposta sobe com o selo (a palavra do veredito), o desenho pequeno da peça (PECA.DESENHO[k]) e o porquê; no
// fim, a régua do placar (D04 a D06) e o que estudar, com a fonte na tela (D07).
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
  const AB = SC.MODO === 'ab';
  const QS = SC.PERGUNTAS || [];
  const PAINEL_BAIXO = 1478; // o pé do painel da resposta (acima dos botões e da legenda do Instagram)

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
    const key = [n, size, maxW, papel, texto != null ? 't' + texto : ''].join(':');
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
  // uma frase centrada, com a última linha em baseY
  function bloco(ctx, n, { baseY = 1420, sizes = [54, 50, 46, 42], maxLinhas = [3, 3, 4, 4], maxW = R - L, alpha = 1, dy = 0, papel = 'corpo', cx = CX, kDestaque = 1 } = {}) {
    if (!TX[n]) return null;
    const { size, ls } = caber(ctx, n, { sizes, maxLinhas, maxW, papel });
    return desenhar(ctx, n, ls, size, { cx, baseY, papel, alpha, dy, kDestaque });
  }
  // o título grande, a partir do topo
  function titulo(ctx, n, { y0 = TOP + 100, alpha = 1, kDestaque = 1, dy = 0, sizes = [74, 68, 62, 56], maxLinhas = [3, 3, 4, 4] } = {}) {
    if (!TX[n]) return null;
    const { size, ls } = caber(ctx, n, { sizes, maxLinhas, papel: 'titulo' });
    return desenhar(ctx, n, ls, size, { y0: y0 + size * 0.8, papel: 'titulo', alpha, kDestaque, dy });
  }

  // ---------- as respostas ----------
  // a letra de cada cartão no placar: V e F (a primeira letra de D02 e D03) ou A e B
  const LETRA = () => (AB ? ['A', 'B'] : [(D('D02')[0] || 'V').toUpperCase(), (D('D03')[0] || 'F').toUpperCase()]);
  const certa = (q) => (AB ? (String(q.r).toUpperCase() === 'B' ? 1 : 0) : (String(q.r).toUpperCase() === 'F' ? 1 : 0));
  // a palavra do selo: o veredito (VERDADEIRO ou FALSO) ou, no modo A ou B, a palavra D08 (CERTA) sobre a letra
  const palavraSelo = (q) => (AB ? `${D('D08') || 'Certa'} · ${LETRA()[certa(q)]}` : (certa(q) ? D('D03') : D('D02'))).toUpperCase();
  const papelSelo = (q) => (!AB && certa(q) === 1 ? 'coral' : E.escuro() ? 'destaque' : 'folha');
  // a cor do painel da resposta: a superfície do estilo; quando ela quase não se separa do fundo, a Sálvia
  const cinza = (h) => { const n = parseInt(String(h).slice(1, 7), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255); };
  const PAINEL = () => (Math.abs(cinza(cor('superficie')) - cinza(cor('fundo'))) >= 25 ? 'superficie' : 'apoio');

  // ---------- a cara do tipo ----------
  // o rótulo fixo no alto, à esquerda (D01, "Quiz relâmpago"), à mão, com o risco embaixo
  function rotulo(ctx, { alpha = 1 } = {}) {
    if (!D('D01')) return;
    escrever(ctx, D('D01'), L + 4, TOP + 46, { size: 48, papel: 'mao', cor: 'destaque', alpha });
    const w = wid(ctx, D('D01'), 48, 'mao');
    ctx.save(); ctx.globalAlpha *= alpha;
    E.linha(ctx, [[L, TOP + 64], [L + w + 8, TOP + 62]], { papel: 'destaque', lw: 5, seed: 31 });
    ctx.restore();
  }
  // a marca: ✓ ou ✗, que entra desenhando (k de 0 a 1)
  function marca(ctx, ok, x, y, s = 1, k = 1, papel = null) {
    if (k <= 0) return;
    const pp = papel || (ok ? (E.escuro() ? 'destaque' : 'folha') : 'coral');
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (ok) E.linha(ctx, [[-30, 2], [-8, 26], [34, -30]], { papel: pp, lw: 13, k, seed: 51 });
    else {
      E.linha(ctx, [[-26, -26], [26, 26]], { papel: pp, lw: 12, k: U.clamp(k * 2, 0, 1), seed: 52 });
      E.linha(ctx, [[26, -26], [-26, 26]], { papel: pp, lw: 12, k: U.clamp(k * 2 - 1, 0, 1), seed: 53 });
    }
    ctx.restore();
  }
  // a casa do placar: o número da pergunta; respondida, a letra da resposta certa sobre o destaque
  function casa(ctx, i, x, y, r, { vez = false, resposta = null, kResp = 1, pulso = 0 } = {}) {
    const q = QS[i];
    if (resposta != null && kResp > 0) {
      const z = 0.75 + 0.25 * U.ease.outBack(kResp);
      ctx.save(); ctx.translate(x, y); ctx.scale(z, z);
      E.circulo(ctx, 0, 0, r, { papel: 'destaque', seed: 700 + i, lw: 4, sombra: false, hachura: false });
      escrever(ctx, resposta, 0, r * 0.4, { size: Math.round(r * 1.15), papel: 'numero', align: 'center', cor: E.escuro() ? 'fundo' : 'texto' });
      ctx.restore();
      return;
    }
    E.circulo(ctx, x, y, r * (1 + 0.12 * pulso), { papel: 'superficie', seed: 700 + i, lw: vez ? 6 : 4, sombra: false, hachura: false });
    if (vez) E.circulo(ctx, x, y, r * (1.32 + 0.1 * pulso), { papel: null, seed: 720 + i, lw: 5, sombra: false, hachura: false });
    escrever(ctx, String(q ? q.k : i + 1), x, y + r * 0.4, { size: Math.round(r * 1.05), papel: 'numero', align: 'center' });
  }
  // o placar: uma casa por pergunta. No canto (r pequeno) nas perguntas; grande na abertura e na régua.
  // A casa da pergunta da vez pisca; a casa de cada pergunta já respondida mostra a resposta certa (V ou F, A ou B).
  function placar(ctx, t, { cx = null, y = TOP + 40, r = 26, gap = 64, atual = 0, kEntra = null, todas = false } = {}) {
    const n = QS.length, larg = (n - 1) * gap;
    const x0 = cx != null ? cx - larg / 2 : R - r - larg - 4;
    for (let i = 0; i < n; i++) {
      const q = QS[i], x = x0 + i * gap;
      const k = kEntra ? kEntra(i) : 1;
      if (k <= 0) continue;
      const tr = SC.REVELA[q.k];
      const kResp = todas ? 1 : p01(t, tr + 0.45, 0.25);
      const resp = todas || t >= tr + 0.45 ? LETRA()[certa(q)] : null;
      const vez = !resp && atual === q.k;
      const pulso = vez ? Math.max(0, Math.sin(t * Math.PI * 2 * (SC.BPM / 60) / 2)) : 0;
      ctx.save();
      if (k < 1) { const z = U.ease.outBack(k); ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y); }
      casa(ctx, i, x, y, r, { vez, resposta: resp, kResp, pulso });
      ctx.restore();
    }
  }
  // um cartão de resposta: Verdadeiro ou Falso (lado a lado) ou A e B com a opção (um embaixo do outro).
  // estado: 0 antes da resposta; depois, o certo acende (destaque) e o outro apaga, cada um com a marca
  function cartao(ctx, t, c, j, x, y, w, h, { k = 1, kRev = 0 } = {}) {
    if (k <= 0) return;
    const q = c.q, ok = certa(q) === j;
    const aceso = kRev > 0 && ok, ct = aceso && E.escuro() ? 'fundo' : 'texto', tm = E.escuro() ? 'fundo' : 'tinta'; // texto e marca sobre o destaque
    const z = 0.7 + 0.3 * U.ease.outBack(Math.min(1, k)) + (ok ? 0.04 * Math.sin(Math.PI * U.clamp(kRev * 1.4, 0, 1)) : 0);
    ctx.save();
    ctx.globalAlpha *= Math.min(1, k * 2) * (kRev > 0 && !ok ? 1 - 0.6 * kRev : 1);
    ctx.translate(x + w / 2, y + h / 2); ctx.scale(z, z); ctx.translate(-(x + w / 2), -(y + h / 2));
    E.ret(ctx, x, y, w, h, { papel: kRev > 0 && ok ? 'destaque' : 'superficie', r: 26, seed: 620 + j });
    if (AB) {
      const n = (q.ops || [])[j];
      E.circulo(ctx, x + 64, y + h / 2, 36, { papel: null, seed: 640 + j, lw: 4, sombra: false, hachura: false });
      escrever(ctx, LETRA()[j], x + 64, y + h / 2 + 14, { size: 40, papel: 'numero', align: 'center', cor: ct });
      if (TX[n]) {
        const { size, ls } = caber(ctx, n, { sizes: [54, 48, 44, 40], maxLinhas: [1, 2, 2, 2], maxW: w - 230, papel: 'corpo' });
        const lh = size * fonte('corpo')[2] * 1.27;
        desenhar(ctx, n, ls, size, { align: 'left', x: x + 124, y0: y + h / 2 - ((ls.length - 1) * lh) / 2 + size * 0.36, cor: ct });
      }
      if (kRev > 0) marca(ctx, ok, x + w - 64, y + h / 2, 0.9, kRev, ok ? tm : null);
    } else {
      const s = j === 0 ? D('D02') : D('D03');
      let z2 = 52;
      while (z2 > 30 && wid(ctx, s, z2, 'titulo') > w - 60) z2 -= 2;
      escrever(ctx, s, x + w / 2, y + h / 2 + z2 * 0.36 - (kRev > 0 ? 14 : 0), { size: z2, papel: 'titulo', align: 'center', cor: ct });
      if (kRev > 0) marca(ctx, ok, x + w / 2, y + h - 34, 0.62, kRev, ok ? tm : null);
    }
    ctx.restore();
  }
  // os dois cartões: devolve o pé deles
  function cartoes(ctx, t, c, y) {
    const kRev = p01(t, c.revela, 0.2);
    if (AB) {
      const h = 124, gap = 18;
      for (let j = 0; j < 2; j++) cartao(ctx, t, c, j, L, y + j * (h + gap), R - L, h, { k: p01(t, c.t0 + 0.3 + 0.15 * j, 0.22), kRev });
      return y + 2 * h + gap;
    }
    const gap = 30, w = (R - L - gap) / 2, h = 150;
    for (let j = 0; j < 2; j++) cartao(ctx, t, c, j, L + j * (w + gap), y, w, h, { k: p01(t, c.t0 + 0.3 + 0.15 * j, 0.22), kRev });
    return y + h;
  }
  // o relógio: o anel que esvazia em 3 s e o número (3, 2, 1)
  function relogio(ctx, t, c, cx, cy, r = 104) {
    const C = c.relogio;
    const kIn = U.ease.outBack(p01(t, C.t0 - 0.3, 0.28)), kOut = 1 - p01(t, c.revela, 0.12);
    if (kIn <= 0 || kOut <= 0) return;
    const u = U.clamp((t - C.t0) / (C.t1 - C.t0), 0, 1);
    const resta = Math.max(0, Math.ceil(SC.CONTA - (t - C.t0) - 1e-6));
    ctx.save(); ctx.translate(cx, cy); ctx.scale(kIn * kOut, kIn * kOut);
    E.circulo(ctx, 0, 0, r, { papel: 'superficie', seed: 660, sombra: false });
    const fim = -Math.PI / 2 + 2 * Math.PI * (1 - u), pts = [];
    for (let a = -Math.PI / 2; a <= fim + 1e-6 && u < 1; a += 0.12) pts.push([Math.cos(a) * (r - 16), Math.sin(a) * (r - 16)]);
    if (pts.length > 1) E.linha(ctx, pts, { papel: E.escuro() ? 'destaque' : 'alerta', lw: 14, seed: 661 });
    if (t >= C.t0 && resta > 0) {
      const pulso = 1 + 0.18 * Math.exp(-((t - C.t0) % 1) * 7);
      ctx.scale(pulso, pulso);
      escrever(ctx, String(resta), 0, r * 0.36, { size: Math.round(r * 1.05), papel: 'numero', align: 'center' });
    }
    ctx.restore();
  }
  // o tremor da batida do selo
  function tremor(ctx, t, t0, a0 = 9) {
    if (!(t >= t0)) return;
    const a = a0 * Math.exp(-(t - t0) * 12);
    ctx.translate(a * Math.sin(t * 95), a * Math.cos(t * 70));
  }
  // o painel da resposta: sobe do pé da tela na resposta. Em cima, à esquerda, o selo; à direita, o desenho da peça
  // (PECA.DESENHO[k], recortado na caixa); embaixo, o porquê
  function painel(ctx, st, y) {
    const t = st.t, c = st.c, q = c.q, k = p01(t, c.revela, 0.16);
    if (k <= 0) return;
    const yy = U.lerp(PAINEL_BAIXO + 40, y, U.ease.outCubic(k));
    E.ret(ctx, L - 14, yy, R - L + 28, PAINEL_BAIXO - yy + 30, { papel: PAINEL(), r: 34, seed: 690 + c.k, sombra: false, hachura: false });
    // o porquê fica no pé do painel; a caixa do desenho vai do selo até 30 px acima da primeira linha dele
    const PQ = { baseY: 1430, sizes: [50, 46, 42, 40], maxLinhas: [3, 3, 3, 4] };
    const pqL = TX[q.porque] ? caber(ctx, q.porque, { sizes: PQ.sizes, maxLinhas: PQ.maxLinhas }) : { size: 46, ls: [''] };
    const topoPq = PQ.baseY - (pqL.ls.length - 1) * pqL.size * fonte('corpo')[2] * 1.27 - pqL.size * fonte('corpo')[2] * 0.85;
    // a caixa do desenho: a largura inteira do painel, entre o selo e o porquê
    const caixa = { x: L + 16, y: yy + 96, w: R - L - 32, h: Math.max(150, topoPq - 30 - (yy + 96)) };
    // o selo: o veredito, carimbado no canto de cima do painel, meio para fora (como carimbo batido na folha)
    const ws = palavraSelo(q);
    let zs = 64;
    while (zs > 34 && wid(ctx, ws, zs, 'titulo') + 60 > 440) zs -= 2;
    E.carimbo(ctx, ws, L + 40 + (wid(ctx, ws, zs, 'titulo') + 60) / 2, yy + 30, { k: p01(t, c.revela + 0.04, 0.16), rot: -0.07, papel: papelSelo(q), size: zs, seed: 41 + c.k * 7 });
    // o desenho da peça
    const desenho = (P().DESENHO || {})[c.k];
    if (desenho) {
      ctx.save(); ctx.beginPath(); ctx.rect(caixa.x - 6, caixa.y - 6, caixa.w + 12, caixa.h + 12); ctx.clip();
      desenho(ctx, st, globalThis.MV, caixa);
      ctx.restore();
    }
    // o porquê, embaixo
    const aT = p01(t, c.revela + SC.ENTRA, 0.2);
    bloco(ctx, q.porque, { baseY: PQ.baseY + (1 - k) * 200, sizes: PQ.sizes, maxLinhas: PQ.maxLinhas, alpha: aT, dy: (1 - U.ease.outCubic(aT)) * 14 });
  }

  // ---------- o estado do filme no instante t ----------
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i] || { n: 0, t0: c.t0, t1: c.t1 };
    const st = { t, c, it, i, u: t - c.t0 };
    st.aTexto = U.clamp((t - it.t0) / 0.2, 0, 1);
    st.dyTexto = (1 - U.ease.outCubic(U.clamp((t - it.t0) / 0.25, 0, 1))) * 16;
    st.desde = {}; c.itens.forEach((x) => { st.desde[x.n] = t - x.t0; });
    if (c.tipo === 'pergunta') st.desde.resposta = t - c.revela; // o relógio do desenho da resposta
    return st;
  }

  // ---------- as cenas do tipo ----------
  const CENA = {};
  CENA.abertura = (ctx, st) => {
    const t = st.t, c = st.c;
    const B = globalThis.BIB, Pe = P().PESSOA;
    if (B && Pe) {
      // quem joga entra andando no primeiro segundo e fica olhando o placar
      const u = p01(t, c.t0 + 0.05, 0.8);
      B.pessoa(ctx, Object.assign({ quem: 'calouro' }, Pe, { x: U.lerp(-160, CX, U.ease.outCubic(u)), y: 1460, s: 0.7, pose: u < 1 ? 'walk' : 'stand', walk: u < 1 ? t * 1.8 : 0, look: -0.2, gesture: u < 1 ? null : 'think', seed: 901 }));
    }
    const tt = titulo(ctx, c.itens[0].n, { y0: TOP + 110, sizes: [84, 76, 68, 62] });
    const yP = Math.max(680, (tt ? tt.bottom : 600) + 130);
    placar(ctx, t, { cx: CX, y: yP, r: 50, gap: Math.min(130, (R - L - 120) / Math.max(1, QS.length - 1)), kEntra: (i) => p01(t, c.t0 + 0.15 + 0.12 * i, 0.22) });
    if (c.itens[1]) bloco(ctx, c.itens[1].n, { baseY: yP + 235, alpha: U.clamp((t - c.itens[1].t0) / 0.2, 0, 1), sizes: [52, 48, 44, 40], maxLinhas: [2, 2, 3, 3] });
    rotulo(ctx);
  };
  CENA.pergunta = (ctx, st) => {
    const t = st.t, c = st.c;
    ctx.save(); tremor(ctx, t, c.revela, 8);
    const tt = titulo(ctx, c.q.p, { y0: TOP + 100, sizes: [70, 64, 58, 52], alpha: U.clamp((t - c.t0) / 0.12, 0, 1) });
    const yC = Math.max(650, (tt ? tt.bottom : 560) + 72);
    const fim = cartoes(ctx, t, c, yC);
    ctx.restore();
    relogio(ctx, t, c, CX, fim + 250, 132);
    painel(ctx, st, fim + 60);
    placar(ctx, t, { atual: c.k });
    rotulo(ctx);
  };
  // as três faixas da régua: "5 · pronto para a prova" (o placar antes do ponto, grande; o resto, o que fazer)
  function faixa(ctx, dk, i, x, y, w, h, k) {
    if (!D(dk) || k <= 0) return;
    const [nota, ...resto] = D(dk).split('·');
    const txt = resto.join('·').trim();
    ctx.save(); ctx.globalAlpha *= Math.min(1, k * 2);
    const z = 0.8 + 0.2 * U.ease.outBack(k); ctx.translate(x + w / 2, y + h / 2); ctx.scale(z, z); ctx.translate(-(x + w / 2), -(y + h / 2));
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 24, seed: 760 + i });
    const wb = 230;
    E.ret(ctx, x + 14, y + 14, wb, h - 28, { papel: ['destaque', 'apoio', 'coral'][i], r: 18, seed: 770 + i, sombra: false, hachura: false });
    let zn = 54;
    while (zn > 26 && wid(ctx, nota.trim(), zn, 'titulo') > wb - 24) zn -= 2;
    escrever(ctx, nota.trim(), x + 14 + wb / 2, y + h / 2 + zn * 0.36, { size: zn, papel: 'titulo', align: 'center', cor: E.escuro() ? 'fundo' : 'texto' });
    if (txt) {
      const { size, ls } = caber(ctx, `F${dk}`, { sizes: [46, 42, 38, 34], maxLinhas: [1, 2, 2, 2], maxW: w - wb - 70, papel: 'corpo', texto: txt });
      const lh = size * fonte('corpo')[2] * 1.27;
      desenhar(ctx, `F${dk}`, ls, size, { align: 'left', x: x + wb + 44, y0: y + h / 2 - ((ls.length - 1) * lh) / 2 + size * 0.36 });
    }
    ctx.restore();
  }
  // a fonte, pequena, no pé (na cena do que estudar; sem ela, na régua)
  function fonteNaTela(ctx, t, c) {
    if (!D('D07')) return;
    const { size, ls } = caber(ctx, 'D07', { sizes: [32, 30, 28, 28], maxLinhas: [2, 3, 3, 4], papel: 'corpo', texto: D('D07') });
    ctx.save(); ctx.globalAlpha *= 0.85 * p01(t, c.t0 + 0.6, 0.3);
    desenhar(ctx, 'D07', ls, size, { align: 'left', x: L, baseY: 1455, papel: 'corpo' });
    ctx.restore();
  }
  CENA.regua = (ctx, st) => {
    const t = st.t, c = st.c;
    const tt = titulo(ctx, c.itens[0].n, { y0: TOP + 100, sizes: [74, 68, 62, 56] });
    const yP = (tt ? tt.bottom : 420) + 120;
    placar(ctx, t, { cx: CX, y: yP, r: 40, gap: Math.min(104, (R - L - 100) / Math.max(1, QS.length - 1)), todas: true });
    const h = 148, gap = 24, y0 = yP + 100;
    ['D04', 'D05', 'D06'].forEach((dk, i) => faixa(ctx, dk, i, L, y0 + i * (h + gap), R - L, h, p01(t, c.t0 + 0.8 + 0.45 * i, 0.25)));
    if (!SC.cenas.some((x) => x.tipo === 'estudar')) fonteNaTela(ctx, t, c);
    rotulo(ctx);
  };
  CENA.estudar = (ctx, st) => {
    const t = st.t, c = st.c;
    const tt = titulo(ctx, c.itens[0].n, { y0: TOP + 100, sizes: [64, 58, 54, 50], maxLinhas: [4, 4, 5, 5], alpha: U.clamp((t - c.t0) / 0.2, 0, 1) });
    const yD = (tt ? tt.bottom : 600) + 60;
    const caixa = { x: L + 20, y: yD, w: R - L - 40, h: Math.max(160, 1250 - yD) };
    if (P().ESTUDAR) { ctx.save(); ctx.beginPath(); ctx.rect(caixa.x - 6, caixa.y - 6, caixa.w + 12, caixa.h + 12); ctx.clip(); P().ESTUDAR(ctx, st, globalThis.MV, caixa); ctx.restore(); }
    if (c.itens[1]) bloco(ctx, c.itens[1].n, { baseY: 1340, alpha: U.clamp((t - c.itens[1].t0) / 0.2, 0, 1), sizes: [48, 44, 40, 38] });
    fonteNaTela(ctx, t, c);
    placar(ctx, t, { todas: true });
    rotulo(ctx);
  };

  // o que a peça usa para desenhar (film-2-peca.js): MV.escrever, MV.p01, MV.marca...
  globalThis.MV = { L, R, TOP, BOT, CX, D, cor, wid, escrever, quebrar, caber, desenhar, bloco, titulo, rotulo, marca, placar, cartao, relogio, tremor, p01, estado, CENA, certa, LETRA };
})();
