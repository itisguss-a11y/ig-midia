// PRESEME · motor "história natural" · desenho 1/3 · o molde (igual em toda peça deste motor; o chat não mexe aqui)
// A doença contada na vida de uma pessoa, numa régua de tempo que atravessa a tela: a câmera anda de fase em fase (antes de
// pegar, o contágio, a incubação, os sinais, o exame, o fim). De perto: o cartão da fase em cima (o desenho da peça), o tempo
// grande em cima da régua ("3 a 8 dias"), o nome embaixo e, se um nível de prevenção age ali, a faixa do nível com o que se
// faz. Na fase do primeiro sintoma, a régua ganha a linha tracejada: antes dela, a doença está lá e nada aparece. De longe
// (a régua inteira), os nomes das fases e, no fecho, os trechos da prevenção e a placa de onde dava para parar a doença.
// Cores e letras vêm do kit de estilos (ferramentas/estilos.js): a mesma peça sai em lápis, pixel, giz... trocando o ESTILO.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2; // 60, 940, 221, 1498, 500
  // de perto: o cartão (780 × 540, ampliado 1,1 vezes: 858 × 594) de 240 a 834; o tempo em cima da régua; a régua em 968;
  // o nome da fase embaixo dela; a faixa do nível de prevenção; o que se faz; a frase com a última linha em 1404.
  // De longe, a régua sobe para 640: em cima dela, os nomes das fases; embaixo, os trechos da prevenção, com folga.
  const LINHA_Y = 968, DIAS_Y = 922, NOME_Y = 1008, FAIXA_Y = 1084, FAIXA_H = 54, ACAO_Y = 1152, FRASE_Y = 1262, LINHA_V = 780, TEXTO_Y = 1404;
  const CARTAO = { y: 240, w: 780, h: 540, escala: 1.1 };
  // o cartão de perto (2ª frase da fase): um pouco maior e mais embaixo, no lugar da régua (o texto de dentro do cartão
  // continua na área segura: com 1,22 o texto da borda passava dela)
  const PERTO = { z: 1.06, dy: 150 };
  const NB = ' ';
  const D = (k) => TX[k] || '';
  const P = () => globalThis.PECA || {};
  const cor = (p) => E.cor(p);
  const { FASES, MX, GAP, TRECHOS, NIVEIS } = SC;
  const PONTOS = FASES.map((f, i) => Object.assign({ x: MX[i], i }, f));
  // a cor de cada nível na faixa, e a do texto em cima dela (lê também na lousa do giz)
  const COR_NIVEL = { primaria: 'destaque', secundaria: 'apoio', terciaria: 'alerta' };
  const TXT_NIVEL = { primaria: 'floresta', secundaria: 'floresta', terciaria: 'papel' };
  // onde fica a linha do primeiro sintoma: entre a fase anterior e a fase marcada com horizonte (em pixels de mundo)
  const IH = FASES.findIndex((f) => f.horizonte);
  const HORIZ_X = IH > 0 ? (MX[IH - 1] + MX[IH]) / 2 : null;

  // ---------- texto (o mesmo jeito dos outros motores: quebra equilibrada e o destaque do kit) ----------
  const fonte = (papel = 'corpo') => E.letra(papel);
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
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'ao', 'para', 'por', 'com', 'se', 'não', 'ou', 'pela', 'pelo']);
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
  function linhasDe(ctx, chave, s0, size, maxW, papel, d) {
    const key = [chave, size, maxW, papel].join(':');
    if (!memo.has(key)) {
      let s = s0;
      if (d && s.includes(d)) s = s.replace(d, d.split(' ').join(NB));
      memo.set(key, equilibrar(ctx, s, size, maxW, papel));
    }
    return memo.get(key);
  }
  // um texto em várias linhas, centrado em cx; a última linha em baseY (ou a primeira em topY); d: o trecho em destaque
  function paragrafo(ctx, chave, s, { baseY = TEXTO_Y, topY = null, sizes = [56, 52, 48, 44], maxLinhas = [2, 3, 3, 4], maxW = R - L, alpha = 1, dy = 0, papel = 'corpo', cx = CX, d = null, c = 'texto', seed = 7 } = {}) {
    if (!s || alpha <= 0) return 0;
    let size = sizes[sizes.length - 1], ls = null;
    for (let i = 0; i < sizes.length; i++) {
      const t = linhasDe(ctx, chave, s, sizes[i], maxW, papel, d);
      if (t.length <= maxLinhas[i] && t.every((l) => wid(ctx, l.split(NB).join(' '), sizes[i], papel) <= maxW)) { size = sizes[i]; ls = t; break; }
    }
    if (!ls) ls = linhasDe(ctx, chave, s, size, maxW, papel, d);
    const lh = size * fonte(papel)[2] * 1.27;
    const y0 = topY !== null ? topY + size * fonte(papel)[2] * 0.8 : baseY - (ls.length - 1) * lh;
    ctx.save(); ctx.globalAlpha *= alpha;
    ls.forEach((l, i) => {
      const s1 = l.split(NB).join(' '), y = y0 + i * lh + dy, w = wid(ctx, s1, size, papel), x = cx - w / 2;
      const k = d ? s1.indexOf(d) : -1; // o destaque só entra com o texto já meio visível
      if (k >= 0 && ctx.globalAlpha > 0.5) E.destaque(ctx, x + wid(ctx, s1.slice(0, k), size, papel), y, wid(ctx, d, size, papel), size * fonte(papel)[2], { seed: seed + i });
      escrever(ctx, s1, x, y, { size, papel, cor: c });
    });
    ctx.restore();
    return ls.length * lh;
  }
  // a frase n do textos.txt, com o destaque que a peça marcou (PECA.DESTAQUE)
  const bloco = (ctx, n, o = {}) => paragrafo(ctx, 'f' + n, TX[n] || '', Object.assign({ d: (P().DESTAQUE || {})[n] || null, seed: 7 + n * 3 }, o));
  // o maior tamanho (da lista) em que o texto cabe em uma linha de largura maxW
  const caber = (ctx, s, sizes, maxW, papel) => { for (const z of sizes) if (wid(ctx, s, z, papel) <= maxW) return z; return sizes[sizes.length - 1]; };

  // ---------- câmera e mundo ----------
  const sx = (wx, cam) => CX + (wx - cam.x) * cam.z;
  const perto = (cam) => U.clamp((cam.z - 0.55) / 0.45, 0, 1); // 1: de perto (uma fase); 0: a régua inteira
  const yLinha = (cam) => U.lerp(LINHA_V, LINHA_Y, U.ease.inOutCubic(perto(cam)));
  // de perto, só a fase que está no meio da tela aparece; a vizinha some antes de chegar à borda (nada cortado)
  const noMeio = (x, r = 360, p = 2) => Math.pow(U.clamp(1 - Math.abs(x - CX) / r, 0, 1), p);
  const longeDe = (cam) => Math.pow(U.clamp((0.55 - cam.z) / (0.55 - SC.VISAO_Z), 0, 1), 1.5); // os textos de longe

  // a régua: a linha, os pontos das fases e a linha tracejada do primeiro sintoma
  function regua(ctx, cam, ativo, cobre = 1) {
    const y = yLinha(cam), xFim = U.lerp(-40, W + 40, cobre);
    if (cobre <= 0) return;
    E.linha(ctx, [[-40, y], [xFim, y]], { lw: 7, seed: 401 });
    // os tiques dos dias entre duas fases (a régua): três por vão, de perto e de longe
    for (let i = 0; i < PONTOS.length - 1; i++) for (let j = 1; j <= 3; j++) {
      const x = sx(MX[i] + (j * GAP) / 4, cam);
      if (x < -20 || x > W + 20 || x > xFim) continue;
      E.linha(ctx, [[x, y - 12], [x, y + 12]], { lw: 4, seed: 411 + i * 3 + j });
    }
    if (HORIZ_X !== null) {
      const x = sx(HORIZ_X, cam), k = perto(cam);
      if (x > -20 && x < W + 20 && x <= xFim) E.linha(ctx, [[x, y - U.lerp(300, 150, k)], [x, y + U.lerp(40, 60, k)]], { lw: 5, seed: 419, tracejado: true, papel: 'alerta' });
    }
    for (const p of PONTOS) {
      const x = sx(p.x, cam);
      if (x < -60 || x > W + 60 || x > xFim) continue;
      const on = p.i === ativo;
      E.circulo(ctx, x, y, on ? 24 : 15, { papel: on ? 'destaque' : 'superficie', seed: 420 + p.i, sombra: false });
    }
  }
  // de perto: o tempo grande em cima da régua e o nome embaixo
  function diasENome(ctx, cam, p, alpha) {
    if (alpha <= 0) return;
    const x = sx(p.x, cam), y = yLinha(cam), kN = fonte('numero')[2], kM = fonte('mao')[2];
    if (p.dias && D(p.dias)) {
      const s = D(p.dias), z = caber(ctx, s, [88 / kN, 76 / kN, 64 / kN, 54 / kN], 760, 'numero');
      escrever(ctx, s, x, y - (LINHA_Y - DIAS_Y), { size: z, papel: 'numero', align: 'center', alpha });
    }
    const n = D(p.nome), zn = caber(ctx, n, [46 / kM, 42 / kM, 38 / kM, 34 / kM], 760, 'mao');
    escrever(ctx, n, x, y + (NOME_Y - LINHA_Y) + zn * kM * 0.8, { size: zn, papel: 'mao', align: 'center', alpha });
  }
  // de perto: a faixa do nível de prevenção que age na fase (de meio vão a meio vão: fases do mesmo trecho emendam), com o
  // nome do nível dentro e o que se faz embaixo
  function faixa(ctx, cam, p, alpha) {
    const tr = SC.trechoDa(p.i);
    if (!tr || alpha <= 0) return;
    const y = yLinha(cam) + (FAIXA_Y - LINHA_Y), x = sx(p.x, cam), a = sx(p.x - GAP / 2, cam), b = sx(p.x + GAP / 2, cam);
    ctx.save(); ctx.globalAlpha *= alpha;
    E.ret(ctx, a, y, b - a, FAIXA_H, { papel: COR_NIVEL[tr.nivel], r: 0, seed: 440 + p.i, sombra: false, contorno: false });
    E.linha(ctx, [[a, y], [b, y]], { lw: 4, seed: 441 + p.i }); E.linha(ctx, [[a, y + FAIXA_H], [b, y + FAIXA_H]], { lw: 4, seed: 442 + p.i });
    const nv = D(NIVEIS[tr.nivel]), kT = fonte('titulo')[2], z = caber(ctx, nv, [34 / kT, 30 / kT, 26 / kT], 700, 'titulo');
    escrever(ctx, nv, x, y + FAIXA_H / 2 + z * kT * 0.36, { size: z, papel: 'titulo', align: 'center', cor: TXT_NIVEL[tr.nivel] });
    if (tr.acao && D(tr.acao)) paragrafo(ctx, 'acao' + p.i, D(tr.acao), { topY: y + (ACAO_Y - FAIXA_Y), sizes: [38, 34, 30], maxLinhas: [1, 2, 2], maxW: 780, papel: 'mao', cx: x });
    ctx.restore();
  }

  // ---------- de longe: a régua inteira ----------
  // os nomes das fases em cima da régua, em andares (dois até 4 fases, três de 5 em diante: o vizinho do mesmo andar fica
  // a 2 ou 3 vãos), para não encostar; o nome fica centrado na fase e só anda para dentro da tela o quanto a largura dele pede
  function nomesDeLonge(ctx, cam, t, alpha, aparece) {
    if (alpha <= 0) return;
    const ANDARES = PONTOS.length >= 5 ? 3 : 2, PASSO = ANDARES === 3 ? 96 : 120;
    const y = yLinha(cam), vao = GAP * cam.z, maxW = Math.min(440, Math.max(200, ANDARES * vao - 40));
    for (const p of PONTOS) {
      const x = sx(p.x, cam), andar = p.i % ANDARES;
      const a = alpha * (aparece !== null ? U.ease.outCubic(U.clamp((t - (aparece + 0.24 * p.i)) / 0.25, 0, 1)) : 1);
      if (a <= 0) continue;
      const nome = D(p.nome), z1 = caber(ctx, nome, [50, 46, 42], maxW, 'mao'), w = Math.min(maxW, wid(ctx, nome, z1, 'mao'));
      const cx = U.clamp(x, L + w / 2 + 4, R - w / 2 - 4), base = y - 56 - andar * PASSO;
      paragrafo(ctx, 'ln' + p.i, nome, { baseY: base, sizes: [50, 46, 42, 38], maxLinhas: [1, 1, 1, 2], maxW, papel: 'mao', cx, alpha: a });
      if (andar > 0) { ctx.save(); ctx.globalAlpha *= a; E.linha(ctx, [[x, y - 20], [x, base + 14]], { lw: 3, seed: 430 + p.i, tracejado: true }); ctx.restore(); }
    }
  }
  // o rótulo da linha do primeiro sintoma (de longe)
  function horizonteDeLonge(ctx, cam, alpha) {
    if (HORIZ_X === null || alpha <= 0 || !D(SC.HORIZONTE)) return;
    const x = sx(HORIZ_X, cam), y = yLinha(cam), s = D(SC.HORIZONTE), z = caber(ctx, s, [44, 40, 36], 460, 'mao');
    const w = wid(ctx, s, z, 'mao'), cx = U.clamp(x, L + w / 2, R - w / 2);
    escrever(ctx, s, cx, y - 318, { size: z, papel: 'mao', align: 'center', cor: 'alerta', alpha });
  }
  // no fecho: os trechos da prevenção embaixo da régua (um por nível), o que se faz em cada um e a placa de onde dava para
  // parar a doença (no fim do trecho marcado com para: true, em cima da régua)
  function trechosDeLonge(ctx, cam, t, alpha, t0) {
    if (alpha <= 0) return;
    const y = yLinha(cam) + 56, FH = 64;
    // as colunas de texto embaixo das faixas: mesma largura, perto da faixa de cada uma, sem encostar uma na outra
    const vis = TRECHOS.filter((tr) => tr.i0 >= 0 && tr.i1 >= 0), n = Math.max(1, vis.length), GC = 24;
    const WC = Math.min(440, (R - L - GC * (n - 1)) / n), COL = new Map();
    let fim = L - GC;
    vis.forEach((tr) => {
      const i0 = Math.min(tr.i0, tr.i1), i1 = Math.max(tr.i0, tr.i1);
      const meio = (sx(MX[i0] - GAP / 2, cam) + sx(MX[i1] + GAP / 2, cam)) / 2;
      const c = Math.max(U.clamp(meio, L + WC / 2, R - WC / 2), fim + GC + WC / 2);
      COL.set(tr, c); fim = c + WC / 2;
    });
    const sobra = Math.max(0, fim - R);
    if (sobra) for (const [tr, c] of COL) COL.set(tr, c - sobra);
    TRECHOS.forEach((tr, j) => {
      if (tr.i0 < 0 || tr.i1 < 0) return;
      const i0 = Math.min(tr.i0, tr.i1), i1 = Math.max(tr.i0, tr.i1);
      const k = t0 === null ? 1 : U.ease.outCubic(U.clamp((t - (t0 + 0.45 * j)) / 0.4, 0, 1));
      if (k <= 0) return;
      const a = sx(MX[i0] - GAP / 2 + 6 / cam.z, cam), b = sx(MX[i1] + GAP / 2 - 6 / cam.z, cam), w = (b - a) * k;
      ctx.save(); ctx.globalAlpha *= alpha;
      E.ret(ctx, a, y, w, FH, { papel: COR_NIVEL[tr.nivel], r: 8, seed: 460 + j, sombra: false });
      const cxT = (a + b) / 2, nv = D(NIVEIS[tr.nivel]), kT = fonte('titulo')[2];
      const z = caber(ctx, nv, [36 / kT, 33 / kT, 30 / kT], Math.max(120, b - a - 16), 'titulo');
      const cabe = wid(ctx, nv, z, 'titulo') <= b - a - 10;
      ctx.globalAlpha *= U.clamp((k - 0.6) / 0.4, 0, 1);
      const largo = WC, cx = COL.has(tr) ? COL.get(tr) : U.clamp(cxT, L + largo / 2, R - largo / 2);
      let yy = y + FH + 18;
      if (cabe) escrever(ctx, nv, cxT, y + FH / 2 + z * kT * 0.36, { size: z, papel: 'titulo', align: 'center', cor: TXT_NIVEL[tr.nivel] });
      else yy += paragrafo(ctx, 'tn' + j, nv, { topY: yy, sizes: [38, 34, 32], maxLinhas: [2, 2, 2], maxW: largo, papel: 'titulo', cx }) + 8;
      if (tr.para && D(SC.PARA)) yy += paragrafo(ctx, 'tp' + j, D(SC.PARA), { topY: yy, sizes: [46, 42, 38], maxLinhas: [1, 2, 2], maxW: largo, papel: 'mao', cx, c: 'alerta' }) + 6;
      if (tr.acao && D(tr.acao)) paragrafo(ctx, 'ta' + j, D(tr.acao), { topY: yy, sizes: [42, 38, 34], maxLinhas: [2, 3, 3], maxW: largo, papel: 'mao', cx });
      ctx.restore();
      // a placa de parar: um octógono na régua, no fim do trecho (o ponto em que a doença ainda não tinha começado)
      if (tr.para) {
        const px = sx(MX[i1] + GAP / 2, cam), py = yLinha(cam), kp = U.ease.outBack(U.clamp((k - 0.5) / 0.5, 0, 1));
        if (kp > 0) placaParar(ctx, px, py, 34 * kp, 470 + j);
      }
    });
  }
  // o octógono de parar (sem palavra dentro: a palavra vem do textos.txt, ao lado)
  function placaParar(ctx, x, y, r, seed) {
    const pts = [];
    for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + (i * Math.PI) / 4; pts.push([x + r * Math.cos(a), y + r * Math.sin(a)]); }
    E.poligono(ctx, pts, { papel: 'alerta', seed, sombra: false });
    E.ret(ctx, x - r * 0.55, y - r * 0.14, r * 1.1, r * 0.28, { papel: 'papel', r: 2, seed: seed + 1, sombra: false, contorno: false });
  }

  // o cartão de uma fase: a moldura do molde e, dentro, o desenho da peça (PECA.CARTAO[id]), em unidades de 780 × 540
  function cartao(ctx, cam, p, st, alpha, pz = 1, dy = 0) {
    const desenho = (P().CARTAO || {})[p.id];
    const x = sx(p.x, cam), s = CARTAO.escala * pz;
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.translate(x - (CARTAO.w * s) / 2, CARTAO.y + dy); ctx.scale(s, s);
    E.ret(ctx, 0, 0, CARTAO.w, CARTAO.h, { papel: 'superficie', r: 18, seed: 500 + p.i, sombra: true });
    if (desenho) {
      ctx.save(); ctx.beginPath(); ctx.rect(6, 6, CARTAO.w - 12, CARTAO.h - 12); ctx.clip();
      desenho(ctx, { w: CARTAO.w, h: CARTAO.h }, st, cartaoInfo(p, st));
      ctx.restore();
    }
    ctx.restore();
  }
  // o que o desenho do cartão recebe: em que frase da cena ele está (fase) e há quanto tempo ela apareceu (kf, em segundos).
  // Cartão de fase já passada sai no estado final (fase alta); de fase que ainda vem, no estado inicial (fase -1).
  function cartaoInfo(p, st) {
    const c = st.c;
    if (c.id === p.id) return { ativo: true, fase: st.tv <= st.t ? st.i : st.i - 1, kf: st.t - st.tv, cena: c.id, t: st.t };
    const cp = SC.cenas.find((x) => x.id === p.id);
    const passou = cp ? st.t >= cp.t1 : false;
    return { ativo: false, fase: passou ? 99 : -1, kf: 99, cena: c.id, t: st.t };
  }

  // ---------- o kit do cartão: o que todo desenho de fase usa (a peça pega com const { ap, ... } = HIST.KIT) ----------
  // ap(info, f, dur, atraso): o quanto um elemento ligado à frase f já entrou (0 a 1): frase passada, 1; da vez, pelo tempo
  const ap = (info, f, dur = 0.5, atraso = 0) => (info.fase > f ? 1 : info.fase === f ? U.ease.outCubic(U.clamp((info.kf - atraso) / dur, 0, 1)) : 0);
  // tf(info, f): o tempo dentro da frase f (para animar): frase passada, muito; frase da vez, kf; frase que vem, 0
  const tf = (info, f) => (info.fase > f ? 99 : info.fase === f ? info.kf : 0);
  // texto dentro do cartão: se passaria da borda, anda para dentro (nada cortado). Letra: 36 ou mais
  const textoCartao = (ctx, s, x, y, o = {}) => {
    const q = Object.assign({ papel: 'mao', size: 40, align: 'center' }, o), wl = E.medir(ctx, s, q);
    const x0 = q.align === 'center' ? x - wl / 2 : q.align === 'right' ? x - wl : x, d = U.clamp(x0, 16, CARTAO.w - 16 - wl) - x0;
    E.texto(ctx, s, x + d, y, q);
  };
  // o chão dentro do cartão (uma faixa e a linha; some junto com o cartão)
  const chao = (ctx, y, w = CARTAO.w) => { E.ret(ctx, -20, y, w + 40, 120, { papel: 'chao', r: 0, seed: 609, sombra: false, contorno: false }); E.linha(ctx, [[-20, y], [w + 20, y]], { lw: 6, seed: 608 }); };
  // o vírus (ou a bactéria, o parasita: o "bicho" de dentro), redondo e com espinhos; k: 0 a 1 (entra crescendo)
  function virus(ctx, x, y, r = 22, { k = 1, papel = 'alerta', seed = 900, giro = 0 } = {}) {
    if (k <= 0) return;
    const rr = r * U.ease.outBack(U.clamp(k, 0, 1));
    for (let i = 0; i < 8; i++) {
      const a = giro + (i * Math.PI) / 4, c = Math.cos(a), s = Math.sin(a);
      E.linha(ctx, [[x + c * rr * 0.9, y + s * rr * 0.9], [x + c * rr * 1.45, y + s * rr * 1.45]], { lw: Math.max(2, rr * 0.14), seed: seed + i });
      E.circulo(ctx, x + c * rr * 1.5, y + s * rr * 1.5, Math.max(2, rr * 0.16), { papel, seed: seed + 10 + i, sombra: false });
    }
    E.circulo(ctx, x, y, rr, { papel, seed: seed + 20, sombra: false });
  }
  // um documento (ficha, pedido de exame, notificação): a folha, o título e as linhas em traço; devolve as alturas das linhas
  function documento(ctx, x, y, w, h, titulo, { seed = 800, linhas = 6, tam = 44 } = {}) {
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 6, seed, sombra: true });
    textoCartao(ctx, titulo, x + w / 2, y + 22 + tam, { papel: 'titulo', size: tam });
    const ys = [], y0 = y + 52 + tam;
    for (let i = 0; i < linhas; i++) {
      const ly = y0 + (i + 0.5) * ((y + h - 24 - y0) / linhas), lw = (i % 3 === 2 ? 0.62 : 0.86) * (w - 60);
      E.linha(ctx, [[x + 30, ly], [x + 30 + lw, ly]], { papel: 'apoioEscuro', lw: 7, seed: seed + 10 + i });
      ys.push(ly);
    }
    return ys;
  }
  const KIT = { ap, tf, texto: textoCartao, chao, virus, documento };

  // ---------- o estado do filme no instante t ----------
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], tv = it.tv;
    const primeira = c === SC.cenas[0] && i === 0;
    const st = { t, c, it, i, tv, u: t - c.t0, cam: SC.camera(t) };
    const entra = primeira ? 1 : U.clamp((t - tv) / 0.25, 0, 1);
    const sai = U.clamp((it.t1 - t) / 0.15, 0, 1);
    st.aTexto = t < tv && !primeira ? 0 : Math.min(entra, sai);
    st.dyTexto = primeira ? 0 : (1 - U.ease.outCubic(U.clamp((t - tv) / 0.3, 0, 1))) * 18;
    st.ativo = c.tipo === 'fase' ? c.fase : c.tipo === 'pergunta' ? 0 : -1;
    return st;
  }

  // ---------- um quadro inteiro ----------
  function quadro(ctx, t) {
    const st = estado(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
    const cam = st.cam, k = perto(cam), c = st.c;
    E.fundo(ctx);
    // a abertura se mexe no primeiro segundo: o cartão sobe entrando e a régua se desenha da esquerda para a direita
    const abre = c.tipo === 'pergunta' && st.i === 0;
    const ent = abre ? U.ease.outCubic(U.clamp((t - 0.05) / 0.7, 0, 1)) : 1;
    const cobre = abre ? U.ease.inOutCubic(U.clamp((t - 0.15) / 0.8, 0, 1)) : 1;
    // da 2ª frase de uma fase (e da 4ª), corte seco para o cartão de perto: a régua sai da tela durante a frase (o desenho
    // daquela frase aparece maior, e o vídeo ganha um corte a cada frase)
    const close = c.tipo === 'fase' && st.i % 2 === 1;
    // de perto: o cartão, o tempo e o nome da fase que está no meio da tela (na viagem, uma sai e a outra entra)
    for (const p of PONTOS) cartao(ctx, cam, p, st, k * noMeio(sx(p.x, cam)) * ent, close ? PERTO.z : 1, close ? PERTO.dy : (1 - ent) * 220);
    if (!close) {
      regua(ctx, cam, st.ativo, cobre);
      for (const p of PONTOS) diasENome(ctx, cam, p, k * noMeio(sx(p.x, cam), 280, 2.5) * cobre);
      // a faixa do nível de prevenção nas cenas das fases e no fecho de perto (na abertura, o título grande ocupa o lugar)
      if (c.tipo === 'fase' || (c.tipo === 'fecho' && k > 0.5)) for (const p of PONTOS) faixa(ctx, cam, p, k * noMeio(sx(p.x, cam), 300, 2));
    }
    // de longe: os nomes das fases (na pergunta, aparecem um a um); no fecho, os trechos da prevenção e a placa de parar
    const longe = longeDe(cam);
    nomesDeLonge(ctx, cam, t, longe, c.tipo === 'pergunta' && c.itens[1] ? c.itens[1].t0 + 1.0 : null);
    horizonteDeLonge(ctx, cam, longe);
    if (c.tipo === 'fecho') trechosDeLonge(ctx, cam, t, longe, c.itens[0].tv + 0.3);
    // a cena pode pôr algo por cima, na tela (PECA.CENA[id]), antes da frase
    const extra = (P().CENA || {})[c.id];
    if (extra) extra(ctx, st);
    // a frase: na pergunta, grande (é a capa); nas fases, embaixo, até três linhas (a faixa e o que se faz ficam em cima)
    if (c.tipo === 'pergunta' && st.i === 0) bloco(ctx, st.it.n, { baseY: 1430, sizes: [80, 74, 68, 62], maxLinhas: [2, 3, 3, 3], papel: 'titulo', alpha: st.aTexto, dy: st.dyTexto });
    // (de cima para baixo, a partir de FRASE_Y: a letra larga do pixel não sobe em cima do que se faz)
    else if (c.tipo === 'fase') bloco(ctx, st.it.n, { topY: FRASE_Y, sizes: [52, 48, 44, 42], maxLinhas: [2, 2, 3, 3], alpha: st.aTexto, dy: st.dyTexto });
    // no fecho, a frase desce para o pé da área segura: a régua inteira e o que se faz em cada trecho ficam em cima
    else bloco(ctx, st.it.n, { baseY: BOT - 14, alpha: st.aTexto, dy: st.dyTexto });
  }

  globalThis.HIST = { L, R, TOP, BOT, CX, LINHA_Y, DIAS_Y, NOME_Y, FAIXA_Y, ACAO_Y, FRASE_Y, LINHA_V, CARTAO, TEXTO_Y, D, cor, wid, escrever, paragrafo, bloco, sx, perto, yLinha, estado, quadro, PONTOS, KIT, placaParar };
})();
