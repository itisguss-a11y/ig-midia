// PRESEME · motor "meme em vídeo" · desenho 1 · o MOLDE (igual em todo meme; não mude).
// Quatro tempos, nesta ordem: preparacao (a situação), virada (a piada, com corte seco, clarão e raios), licao (um
// cartão por frase, com o desenho que explica; o que já passou vira ficha no alto) e fecho (a volta, com carimbo e seta).
// O que é de cada meme mora no film-2-peca.js (PRESEME_MEME.PECA): o desenho da situação, da virada e do fecho, o
// desenho de cada cartão e os trechos em destaque. Todo desenho sai do kit de estilos (globalThis.ESTILOS): o mesmo
// meme sai em qualquer dos seis estilos trocando ESTILO no score.js. Todo texto da tela vem do textos.js.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS, Ch = globalThis.Ch;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2;
  const p = (t, t0, d) => U.clamp((t - t0) / d, 0, 1);
  const D = (k) => TX[k] || '';
  const NB = ' ';

  // ---------- o estado do filme no instante t ----------
  // c = o tempo (cena), it = a frase da vez, i = o número dela no tempo, dt = segundos desde o corte, di = desde a frase
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], ultima = i === c.itens.length - 1;
    const corte = i === 0;
    return {
      t, c, it, i, dt: t - c.t0, di: t - it.t0, u: (t - c.t0) / Math.max(1e-6, c.t1 - c.t0),
      // a frase entra com o corte (primeira do tempo) ou em 0,2 s; some 0,12 s antes da seguinte
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
  // uma linha centrada em x, com o trecho no destaque; escuro = cartão escuro num estilo claro (letra Papel)
  function linhaComDestaque(ctx, l, trecho, x, y, { papel, size, k = 1, alpha = 1, escuro = false, seed = 7 }) {
    const i = trecho ? l.indexOf(trecho) : -1;
    if (!escuro || E.escuro()) {
      E.textoComDestaque(ctx, l, i >= 0 ? trecho : '', x, y, { papel, size, align: 'center', k, seed, alpha });
      return;
    }
    const total = E.medir(ctx, l, { papel, size }), x0 = x - total / 2;
    ctx.save(); ctx.globalAlpha *= alpha;
    if (i < 0) { E.texto(ctx, l, x0, y, { papel, size, cor: 'papel' }); ctx.restore(); return; }
    const a = l.slice(0, i), b = l.slice(i + trecho.length);
    const xa = x0 + E.medir(ctx, a, { papel, size }), wd = E.medir(ctx, trecho, { papel, size });
    E.destaque(ctx, xa, y, wd, Math.round(size * E.letra(papel)[2]), { k, seed });
    E.texto(ctx, a, x0, y, { papel, size, cor: 'papel' });
    E.texto(ctx, trecho, xa, y, { papel, size, cor: k >= 0.5 ? 'floresta' : 'papel' });
    E.texto(ctx, b, xa + wd, y, { papel, size, cor: 'papel' });
    ctx.restore();
  }
  // a frase inteira, em até maxLinhas linhas, da maior letra que cabe; devolve onde ela acabou
  function frase(ctx, s, { trecho = '', papel = 'titulo', sizes = [84, 76, 68, 60, 54], maxLinhas = 3, maxW = R - L, x = CX, yTopo = TOP + 40, alpha = 1, k = 1, escuro = false, seed = 7, dy = 0 } = {}) {
    if (!s) return { yFim: yTopo };
    let size = sizes[sizes.length - 1], ls = null;
    for (const z of sizes) {
      const t = linhas(ctx, s, papel, z, maxW, trecho);
      if (t.length <= maxLinhas && t.every((l) => E.medir(ctx, l, { papel, size: z }) <= maxW)) { size = z; ls = t; break; }
    }
    if (!ls) ls = linhas(ctx, s, papel, size, maxW, trecho);
    const zk = Math.round(size * E.letra(papel)[2]), lh = zk * 1.2;
    ls.forEach((l, j) => linhaComDestaque(ctx, l, trecho, x, yTopo + zk + j * lh + dy, { papel, size, k, alpha, escuro, seed: seed + j }));
    return { yFim: yTopo + zk + (ls.length - 1) * lh + zk * 0.35, size, linhas: ls.length };
  }
  // o termo de um cartão da lição: o que vem antes da primeira vírgula ("Universalidade, acesso..." → "Universalidade")
  const termo = (n) => { const s = TX[n] || ''; const i = s.indexOf(','); return i > 0 ? s.slice(0, i) : ''; };

  // ---------- peças do molde ----------
  // raios atrás da virada (o "revelou!" do meme), girando devagar
  function raios(ctx, cx, cy, t, { n = 14, alpha = 0.55, giro = 0.12 } = {}) {
    const r = 2400, a0 = t * giro;
    ctx.save(); ctx.globalAlpha *= alpha;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i * 2 * Math.PI) / n, b = a + Math.PI / n;
      E.poligono(ctx, [[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r], [cx + Math.cos(b) * r, cy + Math.sin(b) * r]], { papel: 'destaque', contorno: false, sombra: false, hachura: false, seed: 400 + i });
    }
    ctx.restore();
  }
  // etiqueta (a fonte, no alto da lição): fundo escuro, letra clara
  function etiqueta(ctx, s, x, y, { size = 34, alpha = 1 } = {}) {
    if (!s) return;
    const w = E.medir(ctx, s, { papel: 'corpo', size }) + 44, h = size * 1.55;
    ctx.save(); ctx.globalAlpha *= alpha;
    E.ret(ctx, x, y, w, h, { papel: 'apoioEscuro', r: h / 2, contorno: false, sombra: false, hachura: false, seed: 501 });
    E.texto(ctx, s, x + 22, y + h * 0.68, { papel: 'corpo', size, cor: 'papel' });
    ctx.restore();
    return { w, h };
  }
  // ficha de um cartão que já passou: o termo e o visto
  function ficha(ctx, s, x, y, { size = 34, k = 1 } = {}) {
    const w = E.medir(ctx, s, { papel: 'corpo', size }) + 92, h = size * 1.75;
    ctx.save(); ctx.globalAlpha *= k; ctx.translate(x, y + (1 - k) * 14);
    E.ret(ctx, 0, 0, w, h, { papel: 'superficie', r: h / 2, sombra: false, hachura: false, seed: 520 + s.length });
    E.linha(ctx, [[22, h * 0.52], [32, h * 0.68], [52, h * 0.32]], { lw: 6, seed: 530 + s.length });
    E.texto(ctx, s, 66, h * 0.68, { papel: 'corpo', size });
    ctx.restore();
    return { w, h };
  }
  // o clarão do corte seco da virada
  function clarao(ctx, t, t0, d = 0.16) {
    const a = 1 - p(t, t0, d);
    if (a <= 0 || t < t0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = E.PAL.papel; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  // ---------- os quatro tempos ----------
  const PECA = () => (globalThis.PRESEME_MEME && globalThis.PRESEME_MEME.PECA) || {};
  const DESTAQUE = (n) => (PECA().DESTAQUE || {})[n] || '';

  function textoDaVez(ctx, st, o = {}) {
    return frase(ctx, TX[st.it.n], Object.assign({ trecho: DESTAQUE(st.it.n), alpha: st.aTexto, dy: st.dyTexto, k: U.ease.inOutCubic(p(st.t, st.it.t0 + 0.15, 0.45)), seed: 10 + st.it.n * 3 }, o));
  }

  // 1. preparação: a situação entra subindo (com o pop do score), a câmera dá um zoom seco no foco da 1.ª frase (com o
  // baque) e, a cada frase nova, pula para o foco dela; entre os pulos, chega perto devagar. A frase fica no alto, fora
  // do zoom. focoPreparacao: um ponto por frase, [[x, y], null]; null volta ao quadro inteiro. O ponto fica parado na
  // tela e o resto se afasta dele: texto do desenho longe do foco sai da área segura (o conferir acusa).
  function preparacao(ctx, st) {
    E.fundo(ctx);
    const GA = SC.GANCHO || {}, t = st.t;
    const focos = PECA().focoPreparacao || [[240, 940], null];
    const lista = Array.isArray(focos[0]) || focos[0] === null ? focos : [focos];
    const fi = lista[Math.min(st.i, lista.length - 1)]; // null: a frase volta para o quadro inteiro (também é um corte)
    const foco = fi || [540, 1150];
    const sobe = 1 - U.ease.outBack(p(t, st.c.t0 + (GA.entrada ?? 0.25) - 0.05, 0.32));
    const seco = fi && (st.i > 0 || (GA.zoomEm != null && t >= GA.zoomEm)) ? GA.zoom || 1.2 : 1;
    const z = seco * (1 + 0.04 * U.ease.inOutQuad(st.u));
    ctx.save(); ctx.translate(0, sobe * 280);
    ctx.translate(foco[0], foco[1]); ctx.scale(z, z); ctx.translate(-foco[0], -foco[1]);
    if (PECA().preparacao) PECA().preparacao(ctx, st, M);
    ctx.restore();
    textoDaVez(ctx, st);
  }

  // 2. virada: corte seco, clarão, raios, um tranco na câmera; a frase entra grande
  function virada(ctx, st) {
    E.fundo(ctx);
    const centro = PECA().centroVirada || [540, 1180];
    raios(ctx, centro[0], centro[1], st.t, { alpha: E.escuro() ? 0.28 : 0.55 });
    const tranco = 14 * (1 - p(st.t, st.c.t0, 0.3)) * Math.sin(st.dt * 70);
    const z = 1 + 0.08 * (1 - U.ease.outCubic(p(st.t, st.c.t0, 0.35)));
    ctx.save(); ctx.translate(centro[0] + tranco, centro[1]); ctx.scale(z, z); ctx.translate(-centro[0], -centro[1]);
    if (PECA().virada) PECA().virada(ctx, st, M);
    ctx.restore();
    textoDaVez(ctx, st, { sizes: [84, 76, 68, 62], k: U.ease.inOutCubic(p(st.t, st.c.t0 + 0.35, 0.5)) });
    clarao(ctx, st.t, st.c.t0);
  }

  // 3. lição: um cartão por frase; o cartão novo empurra o velho para fora; o que passou vira ficha no alto
  const CARTAO = { x: L, y: TOP + 300, w: R - L, h: 860 };
  function cartao(ctx, st, j, dx, alpha) {
    const c = st.c, it = c.itens[j], n = it.n, K = CARTAO;
    ctx.save(); ctx.translate(dx, 0); ctx.globalAlpha *= alpha;
    E.ret(ctx, K.x, K.y, K.w, K.h, { papel: 'superficie', r: 40, sombra: true, seed: 600 + j });
    // o desenho que explica: a peça diz qual (nome da biblioteca do molde ou uma função)
    const icones = PECA().icones || [];
    const ic = icones[j];
    const ki = p(st.t, it.t0 + 0.1, 1.1);
    const cx = K.x + K.w / 2, cy = K.y + 300;
    // o painel do desenho, em Sálvia: parede, folha e cartão, que são da cor do cartão, aparecem nele
    E.ret(ctx, K.x + 28, K.y + 28, K.w - 56, 520, { papel: 'apoio', r: 28, contorno: false, sombra: false, hachura: false, seed: 610 + j });
    ctx.save(); ctx.beginPath(); ctx.rect(K.x + 28, K.y + 28, K.w - 56, 520); ctx.clip();
    if (typeof ic === 'function') ic(ctx, cx, cy, 1, ki, st.t, M);
    else if (ic && ICONE[ic]) ICONE[ic](ctx, cx, cy, 1, ki, st.t);
    ctx.restore();
    // a frase do cartão, com o termo no destaque
    frase(ctx, TX[n], { trecho: DESTAQUE(n) || termo(n), papel: 'titulo', sizes: [64, 58, 52, 48], maxLinhas: 3, maxW: K.w - 110, x: cx, yTopo: K.y + 585, k: U.ease.inOutCubic(p(st.t, it.t0 + 0.3, 0.45)), seed: 40 + n * 3 });
    // onde estamos: uma bolinha por cartão
    const N = c.itens.length, gap = 46, x0 = cx - ((N - 1) * gap) / 2;
    for (let q = 0; q < N; q++) E.circulo(ctx, x0 + q * gap, K.y + K.h + 56, q <= j ? 12 : 9, { papel: q <= j ? 'apoioEscuro' : 'superficie', sombra: false, hachura: false, seed: 640 + q });
    ctx.restore();
  }
  function licao(ctx, st) {
    E.fundo(ctx);
    const c = st.c, i = st.i, it = st.it;
    const tg = etiqueta(ctx, D(PECA().etiquetaLicao || 'D04'), L, TOP);
    // as fichas do que já passou
    let fx = L, fy = TOP + (tg ? tg.h + 26 : 0);
    for (let j = 0; j < i; j++) {
      const s = termo(c.itens[j].n); if (!s) continue;
      const k = p(st.t, c.itens[j + 1].t0 + 0.15, 0.3);
      const w = E.medir(ctx, s, { papel: 'corpo', size: 34 }) + 92;
      if (fx + w > R) { fx = L; fy += 78; }
      ficha(ctx, s, fx, fy, { k });
      fx += w + 16;
    }
    // o cartão da vez entra pela direita; o anterior sai pela esquerda
    const e = i === 0 ? 1 : U.ease.outCubic(p(st.t, it.t0, 0.32));
    if (i > 0 && e < 1) cartao(ctx, st, i - 1, -e * (W + 80), 1 - e * 0.6);
    cartao(ctx, st, i, (1 - e) * (W + 80), 1);
  }

  // 4. fecho: a volta (a peça desenha); o carimbo bate na primeira frase e a seta risca na segunda (o som está no score)
  function fecho(ctx, st) {
    E.fundo(ctx);
    const P = PECA(), its = st.c.itens;
    if (P.fecho) P.fecho(ctx, st, M);
    const ca = P.carimboFecho; // { texto: 'D05', x, y, rot, size }
    if (ca && st.t >= its[0].t0 + 0.45) E.carimbo(ctx, D(ca.texto), ca.x, ca.y, { k: p(st.t, its[0].t0 + 0.45, 0.16), rot: ca.rot ?? -0.12, size: ca.size || 58, seed: 700 });
    const se = P.setaFecho; // { de: [x, y], para: [x, y], curva }
    if (se && its[1]) E.seta(ctx, se.de, se.para, { k: U.ease.inOutCubic(p(st.t, its[1].t0 + 0.25, 0.55)), curva: se.curva ?? 0.25, seed: 710 });
    textoDaVez(ctx, st);
  }

  // ---------- biblioteca de desenhos para os cartões da lição (servem a qualquer meme) ----------
  // cada um: (ctx, cx, cy, s, k, t), centrado em (cx, cy), numa caixa de uns 640 × 440 px; k de 0 a 1 faz ele entrar
  const ent = (k, a, d = 0.35) => U.ease.outBack(U.clamp((k - a) / d, 0, 1));
  const pessoa = (ctx, quem, x, y, s, o = {}) => E.personagem(ctx, Object.assign({ quem, x, y, s, pose: 'stand', mouth: 'smile', seed: 800 + Math.round(x) }, o));
  const ICONE = {
    // todos entram: a unidade de porta aberta e gente diferente chegando
    todos(ctx, cx, cy, s, k, t) {
      const chao = cy + 190;
      E.chao(ctx, chao, { seed: 907 });
      ctx.save(); ctx.translate(cx + 150, chao); ctx.scale(0.62, 0.62);
      E.objeto(ctx, 'casa', { x: -180, y: 0, w: 360, h: 420, porta: 1, seed: 900 });
      // a cruz da unidade, na parede
      E.ret(ctx, -128, -330, 92, 28, { papel: 'alerta', r: 5, contorno: false, sombra: false, hachura: false, seed: 905 });
      E.ret(ctx, -96, -362, 28, 92, { papel: 'alerta', r: 5, contorno: false, sombra: false, hachura: false, seed: 906 });
      ctx.restore();
      const quem = ['moradora', 'calouro', 'agente'];
      quem.forEach((q, i) => { const a = ent(k, 0.1 + i * 0.18); if (a > 0) pessoa(ctx, q, cx - 250 + i * 100 + (1 - a) * -60, chao, 0.46, { look: 0.8, eyes: 'happy' }); });
    },
    // prevenir e tratar, juntos: o escudo e o curativo, ligados
    prevencaoCura(ctx, cx, cy, s, k, t) {
      const a1 = ent(k, 0), a2 = ent(k, 0.25), a3 = U.clamp((k - 0.5) / 0.3, 0, 1);
      if (a1 > 0) {
        ctx.save(); ctx.translate(cx - 170, cy); ctx.scale(a1, a1);
        E.poligono(ctx, [[-110, -130], [110, -130], [110, 10], [0, 140], [-110, 10]], { papel: 'apoioEscuro', seed: 910 });
        E.linha(ctx, [[-50, 0], [-12, 40], [56, -46]], { papel: 'papel', lw: 16, seed: 911 });
        ctx.restore();
      }
      if (a2 > 0) {
        ctx.save(); ctx.translate(cx + 170, cy); ctx.rotate(-0.6); ctx.scale(a2, a2);
        E.ret(ctx, -140, -46, 280, 92, { papel: 'destaque', r: 46, seed: 912 });
        E.ret(ctx, -44, -38, 88, 76, { papel: 'superficie', r: 12, sombra: false, seed: 913 });
        for (const [x, y] of [[-20, -14], [20, -14], [-20, 14], [20, 14]]) E.circulo(ctx, x, y, 5, { papel: 'tinta', sombra: false, hachura: false, contorno: false, seed: 914 });
        ctx.restore();
      }
      if (a3 > 0) { E.linha(ctx, [[cx - 40, cy], [cx + 40, cy]], { lw: 12, k: a3, seed: 915 }); E.linha(ctx, [[cx, cy - 40], [cx, cy + 40]], { lw: 12, k: a3, seed: 916 }); }
    },
    // ninguém fura a fila: a fila, e quem quer passar na frente leva o X
    semFurarFila(ctx, cx, cy, s, k, t) {
      const chao = cy + 170;
      E.ret(ctx, cx + 170, chao - 170, 150, 170, { papel: 'apoioEscuro', r: 10, seed: 920 });
      ['agente', 'moradora', 'calouro'].forEach((q, i) => pessoa(ctx, q, cx + 80 - i * 110, chao, 0.4, { look: 0.9, mouth: 'flat' }));
      const a = ent(k, 0.2, 0.4), x = cx + 20 + (1 - a) * 260, y = chao - 40;
      if (a > 0) {
        pessoa(ctx, 'calouro', x, y, 0.4, { look: -0.4, mouth: 'smirk', style: { shirt: E.PAL.coral, trim: E.PAL.marca }, seed: 930 });
        const hy = y - 404 * 0.4 - 66 * 0.4; // o alto da cabeça
        E.poligono(ctx, [[x - 30, hy + 4], [x - 34, hy - 30], [x - 14, hy - 12], [x, hy - 38], [x + 14, hy - 12], [x + 34, hy - 30], [x + 30, hy + 4]], { papel: 'destaque', seed: 931 });
      }
      const xk = U.clamp((k - 0.62) / 0.2, 0, 1);
      if (xk > 0) {
        E.linha(ctx, [[x - 80, y - 230], [x + 80, y - 10]], { papel: 'alerta', lw: 18, k: xk, seed: 932 });
        E.linha(ctx, [[x + 80, y - 230], [x - 80, y - 10]], { papel: 'alerta', lw: 18, k: U.clamp((k - 0.72) / 0.2, 0, 1), seed: 933 });
      }
      E.chao(ctx, chao, { seed: 934 });
    },
    // a comunidade decide junto: gente atrás da mesa, levantando a mão
    conselho(ctx, cx, cy, s, k, t) {
      const chao = cy + 170;
      ['moradora', 'agente', 'calouro', 'moradora'].forEach((q, i) => {
        const a = ent(k, 0.1 + i * 0.12);
        const g = a > 0.6 ? 'pointUp' : null;
        pessoa(ctx, q, cx - 210 + i * 140, chao + 40, 0.44, { gesture: g, eyes: 'happy', seed: 940 + i, style: i === 3 ? { skin: '#A86E4B', shirt: E.PAL.folha } : {} });
      });
      E.ret(ctx, cx - 300, chao - 110, 600, 70, { papel: 'apoioEscuro', r: 10, seed: 945 });
      E.ret(ctx, cx - 270, chao - 40, 26, 80, { papel: 'apoioEscuro', r: 4, sombra: false, seed: 946 });
      E.ret(ctx, cx + 244, chao - 40, 26, 80, { papel: 'apoioEscuro', r: 4, sombra: false, seed: 947 });
    },
    // sai do centro e chega perto: o prédio do meio manda o serviço para as casas
    descentralizar(ctx, cx, cy, s, k, t) {
      const topo = cy - 170;
      E.ret(ctx, cx - 90, topo - 40, 180, 150, { papel: 'apoioEscuro', r: 8, seed: 950 });
      for (let i = 0; i < 3; i++) E.ret(ctx, cx - 66 + i * 50, topo - 10, 32, 90, { papel: 'superficie', r: 4, sombra: false, seed: 951 + i });
      E.poligono(ctx, [[cx - 110, topo - 40], [cx, topo - 100], [cx + 110, topo - 40]], { papel: 'apoioEscuro', seed: 954 });
      const casas = [[cx - 270, cy + 190], [cx - 40, cy + 220], [cx + 190, cy + 190]];
      casas.forEach(([x, y], i) => {
        const a = ent(k, 0.35 + i * 0.12);
        if (a > 0) { ctx.save(); ctx.translate(x + 40, y); ctx.scale(0.3 * a, 0.3 * a); E.objeto(ctx, 'casa', { x: -180, y: 0, w: 360, h: 420, porta: 0.6, seed: 960 + i * 10 }); ctx.restore(); }
        E.seta(ctx, [cx + (i - 1) * 40, topo + 120], [x + 40, y - 175], { k: U.clamp((k - 0.15 - i * 0.1) / 0.35, 0, 1), curva: (i - 1) * -0.2, lw: 8, cabeca: 26, seed: 970 + i });
      });
    },
    // a lei: o livro aberto com as linhas do texto
    lei(ctx, cx, cy, s, k, t) {
      const a = ent(k, 0);
      ctx.save(); ctx.translate(cx, cy); ctx.scale(a, a);
      E.ret(ctx, -240, -150, 230, 300, { papel: 'superficie', r: 10, seed: 980 });
      E.ret(ctx, 10, -150, 230, 300, { papel: 'superficie', r: 10, seed: 981 });
      for (let i = 0; i < 6; i++) { E.linha(ctx, [[-210, -100 + i * 42], [-40, -100 + i * 42]], { lw: 5, seed: 982 + i }); E.linha(ctx, [[40, -100 + i * 42], [210 - (i % 2) * 40, -100 + i * 42]], { lw: 5, seed: 990 + i }); }
      ctx.restore();
    },
  };

  // ---------- adereços de situação (para a preparação e o fecho; servem a qualquer meme) ----------
  const OBJ = {
    // a folha de prova: x, y = canto de cima, à esquerda; titulo e questao são textos do textos.txt (D01, D02);
    // figura(ctx, x, y, w, h) desenha a figura da questão; respostas = textos escritos à mão nas linhas (ou vazio)
    folhaDeProva(ctx, { x, y, w = 560, h = 720, rot = -0.04, titulo = '', questao = '', legenda = '', figura = null, respostas = [], kResp = 1, seed = 1000 } = {}) {
      ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.translate(-w / 2, -h / 2);
      E.ret(ctx, 0, 0, w, h, { papel: 'superficie', r: 12, seed });
      if (titulo) E.texto(ctx, titulo, w / 2, 70, { papel: 'titulo', size: 34, align: 'center' });
      E.linha(ctx, [[36, 96], [w - 36, 96]], { lw: 4, seed: seed + 1 });
      if (questao) E.texto(ctx, questao, 40, 150, { papel: 'corpo', size: 32 });
      if (figura) figura(ctx, 40, 176, w - 80, 300);
      if (legenda) E.texto(ctx, legenda, w / 2, 500, { papel: 'mao', size: 30, align: 'center' });
      // as linhas de resposta ocupam o que sobra da folha; com muitas respostas, a letra diminui (até 30 px)
      const nl = Math.max(4, respostas.length);
      const esp = Math.min(52, (h - 36 - 568) / Math.max(1, nl - 1)), tam = Math.max(24, Math.min(30, Math.round(esp * 0.62)));
      for (let i = 0; i < nl; i++) E.linha(ctx, [[40, 568 + i * esp], [w - 40, 568 + i * esp]], { lw: 3, seed: seed + 2 + i, papel: 'apoioEscuro' });
      respostas.forEach((r, i) => { const a = U.clamp(kResp * respostas.length - i, 0, 1); if (a > 0) E.texto(ctx, r, 48, 561 + i * esp, { papel: 'mao', size: tam, alpha: a }); });
      ctx.restore();
    },
    // a mesa (do y até embaixo)
    mesa(ctx, y, { seed = 1100 } = {}) {
      E.ret(ctx, -60, y, W + 120, H - y + 80, { papel: 'apoioEscuro', r: 18, sombra: false, seed });
      E.linha(ctx, [[-60, y + 24], [W + 60, y + 24]], { papel: 'apoio', lw: 5, seed: seed + 1 });
    },
  };

  const M = { W, H, L, R, TOP, BOT, CX, p, D, termo, frase, etiqueta, ficha, raios, clarao, pessoa, ICONE, OBJ, CARTAO };
  const TEMPO = { preparacao, virada, licao, fecho };
  globalThis.PRESEME_MEME = Object.assign(globalThis.PRESEME_MEME || {}, { M, estado, TEMPO });
})();
