// PRESEME · Na UBS, e agora? · exemplo 2: aferir a pressão na visita · desenho 2/3 · o que é só desta peça
// Feito no mesmo molde do engasgo (film-1-molde.js e film-3-filme.js iguais), com outro lugar (a varanda), outra pessoa
// (Dona Francisca), outro estilo (infográfico chapado, STYLE 'flat' no score.js) e o desenho do que é deste assunto.
// Regras do molde: todo desenho é função do tempo (nada de Math.random); palavra escrita no desenho vem do textos.txt por D('Dnn').
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, B = globalThis.UBS;
  const { C, INK, L, CX, GY, D, txt, hand } = B;
  const WD = G.W;

  // o trecho de cada frase que leva marca-texto (se a frase mudar e o trecho sumir, ela sai sem marca)
  const DESTAQUE = { 1: 'medir a pressão', 2: 'cafezinho', 3: 'agora', 4: '30 minutos', 5: 'Exercício físico, 90', 6: '5 minutos', 7: 'sem falar', 8: 'pés no chão', 9: 'altura do coração', 10: 'sem folga', 11: 'erra menos', 12: '3 vezes', 13: 'duas últimas', 14: 'dor no peito', 15: 'emergência', 16: 'dois braços', 17: 'sobe a pressão', 18: '3 números', 19: 'duas ocasiões', 20: 'Grátis', 21: 'ponto de referência', 22: 'não', 23: 'braço nu', 24: '3 medidas' };

  // a paciente desta peça
  const FRANCISCA = B.vestir({ skin: C.pele, hair: C.grisalho, hairStyle: 'bun', outfit: 'dress', shirt: C.marca, trim: C.coral, collar: C.marca, bottoms: 'skirt', shorts: C.marca, build: 'regular', shoes: C.noite }); // B.vestir: na lousa, o sapato vem claro
  const PX = 600, PY = GY - 150; // onde ela senta
  const MX = 820, MESA = GY - 262; // a mesinha: o centro e o tampo (na altura do coração dela sentada)
  const NA_MESA = [770, MESA - 8]; // onde a mão dela fica, apoiada na mesa
  const CORACAO = [624, MESA - 6]; // o coração dela, no peito: na mesma altura do tampo

  // ---------- o lugar: a varanda da casa visitada ----------
  function rede(ctx) { // a rede armada no canto da varanda
    const x0 = 760, x1 = 1022, y0 = 942, sag = 66, n = 14;
    const top = [], bot = [];
    for (let k = 0; k <= n; k++) { const u = k / n; top.push([U.lerp(x0, x1, u), y0 + Math.sin(Math.PI * u) * sag]); }
    for (let k = n; k >= 0; k--) { const u = k / n; bot.push([U.lerp(x0, x1, u), y0 + 40 + Math.sin(Math.PI * u) * sag * 0.86]); }
    G.poly(ctx, top.concat(bot), { fill: C.coral, stroke: INK, lw: 5, seed: 411, step: 60 });
    for (const [dy, s] of [[13, 412], [26, 413]]) {
      const pts = []; for (let k = 1; k < n; k++) { const u = k / n; pts.push([U.lerp(x0, x1, u), y0 + dy + Math.sin(Math.PI * u) * sag * (1 - dy / 300)]); }
      G.line(ctx, pts, { color: C.marca, lw: 5, seed: s });
    }
    G.line(ctx, [[x0 - 34, y0 - 24], [x0, y0 + 14]], { color: INK, lw: 4, seed: 414 });
    G.line(ctx, [[x1 + 26, y0 - 30], [x1, y0 + 14]], { color: INK, lw: 4, seed: 415 });
  }
  function varanda(ctx, { comRede = true } = {}) {
    G.rrect(ctx, -20, GY - 210, WD + 40, 210, 0, { fill: C.salvia, stroke: INK, lw: 6, seed: 401 }); // a mureta
    for (const [x, s] of [[26, 402], [1054, 403]]) G.rrect(ctx, x - 30, 900, 60, GY - 900, 6, { fill: C.folha, stroke: INK, lw: 6, seed: s }); // os pilares
    if (comRede) rede(ctx); // sai nas cenas que põem algo no canto de cima, à direita
    B.chao(ctx, GY, C.folha);
  }
  function cadeira(ctx, x = PX) { // a cadeira de plástico, com encosto: é ele que deixa as costas apoiadas
    G.rrect(ctx, x - 94, GY - 484, 188, 306, 44, { fill: C.coral, stroke: INK, lw: 6, seed: 421 });
    G.rrect(ctx, x - 104, GY - 170, 208, 30, 12, { fill: C.coral, stroke: INK, lw: 6, seed: 422 });
    for (const [dx, s] of [[-84, 423], [84, 424]]) G.line(ctx, [[x + dx, GY - 142], [x + dx * 1.08, GY]], { color: INK, lw: 10, seed: s });
  }
  function mesinha(ctx) {
    G.rrect(ctx, MX - 100, MESA, 200, 26, 6, { fill: C.madeira, stroke: INK, lw: 6, seed: 431 }); // madeira: no chapado não há contorno, e papel some na parede
    for (const [dx, s] of [[-80, 432], [80, 433]]) G.line(ctx, [[MX + dx, MESA + 26], [MX + dx, GY]], { color: INK, lw: 9, seed: s });
  }

  // ---------- as coisas do assunto ----------
  function xicara(ctx, x, y, s = 1, seed = 440) { // o cafezinho
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.ellipse(ctx, 0, 6, 38, 8, { fill: C.branco, stroke: INK, lw: 4, seed: seed + 3 });
    G.rrect(ctx, -24, -30, 48, 36, 10, { fill: C.branco, stroke: INK, lw: 5, seed });
    G.ellipse(ctx, 0, -30, 24, 7, { fill: C.noite, stroke: INK, lw: 4, seed: seed + 1 });
    G.ellipse(ctx, 32, -14, 11, 11, { fill: null, stroke: INK, lw: 5, seed: seed + 2 });
    ctx.restore();
  }
  function estojo(ctx, x, y, seed = 450) { // o estojo do aparelho, que o estudante põe na mesa
    G.rrect(ctx, x - 62, y, 124, 50, 12, { fill: C.floresta, stroke: INK, lw: 5, seed });
    G.line(ctx, [[x - 48, y + 14], [x + 48, y + 14]], { color: C.salvia, lw: 4, seed: seed + 1 });
    G.rrect(ctx, x - 22, y - 16, 44, 20, 8, { fill: null, stroke: INK, lw: 5, seed: seed + 2 });
  }
  function prato(ctx, x, y, seed = 455) {
    G.ellipse(ctx, x, y, 46, 14, { fill: C.branco, stroke: INK, lw: 4, seed });
    G.ellipse(ctx, x - 8, y - 9, 20, 9, { fill: C.miolo, stroke: INK, lw: 3, seed: seed + 1 });
    G.ellipse(ctx, x + 16, y - 7, 10, 6, { fill: C.folha, stroke: INK, lw: 3, seed: seed + 2 });
  }
  function cigarro(ctx, x, y, seed = 460) {
    G.rrect(ctx, x - 42, y - 8, 84, 16, 6, { fill: C.branco, stroke: INK, lw: 4, seed });
    G.rrect(ctx, x + 22, y - 8, 20, 16, 4, { fill: C.coral, stroke: INK, lw: 3, seed: seed + 1 });
  }
  function tenis(ctx, x, y, seed = 465) { // exercício físico
    G.poly(ctx, [[x - 52, y], [x - 48, y - 36], [x - 12, y - 42], [x + 18, y - 20], [x + 52, y - 12], [x + 56, y]], { fill: C.coral, stroke: INK, lw: 5, seed });
    G.rrect(ctx, x - 56, y - 4, 114, 14, 6, { fill: C.branco, stroke: INK, lw: 4, seed: seed + 1 });
    for (const dx of [-30, -18, -6]) G.line(ctx, [[x + dx, y - 34], [x + dx + 8, y - 26]], { color: C.branco, lw: 3, seed: seed + 10 + dx });
  }
  // o relógio: a fatia do tempo que já passou enche no marca-texto
  function relogio(ctx, x, y, r, frac, label, seed = 470) {
    frac = U.clamp(frac, 0, 1);
    G.ellipse(ctx, x, y, r, r, { fill: C.branco, stroke: INK, lw: 7, seed });
    if (frac > 0.002) {
      const pts = [[x, y]], n = Math.max(3, Math.ceil(48 * frac));
      for (let k = 0; k <= n; k++) { const a = -Math.PI / 2 + 2 * Math.PI * frac * (k / n); pts.push([x + Math.cos(a) * (r - 11), y + Math.sin(a) * (r - 11)]); }
      G.poly(ctx, pts, { fill: C.marca, stroke: null, lw: 0, seed: seed + 1, amp: 0, step: 400 });
    }
    for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; G.line(ctx, [[x + Math.cos(a) * (r - 18), y + Math.sin(a) * (r - 18)], [x + Math.cos(a) * (r - 5), y + Math.sin(a) * (r - 5)]], { color: INK, lw: 4, seed: seed + 2 + k }); }
    const a = -Math.PI / 2 + 2 * Math.PI * frac;
    G.line(ctx, [[x, y], [x + Math.cos(a) * (r - 26), y + Math.sin(a) * (r - 26)]], { color: INK, lw: 8, seed: seed + 20 });
    G.ellipse(ctx, x, y, 9, 9, { fill: INK, stroke: INK, lw: 2, seed: seed + 21 });
    if (label) hand(ctx, label, x, y + r + 56, { size: 54, align: 'center' });
  }
  // o aparelho automático de braço; leitura = o texto do visor
  function aparelho(ctx, x, y, s = 1, leitura = '', o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.rrect(ctx, -70, -50, 140, 100, 18, { fill: C.branco, stroke: INK, lw: 5, seed: 510 });
    G.rrect(ctx, -58, -40, 116, 54, 8, { fill: o.alerta ? C.coral : C.salvia, stroke: INK, lw: 4, seed: 511 });
    if (leitura) txt(ctx, leitura, 0, -3, { size: o.size || 24, align: 'center', color: o.alerta ? C.noite : INK });
    if (o.unidade) txt(ctx, D('D14'), 36, 38, { size: 15, align: 'center', color: INK });
    G.ellipse(ctx, -36, 30, 9, 9, { fill: C.coral, stroke: INK, lw: 3, seed: 512 });
    G.ellipse(ctx, -10, 30, 9, 9, { fill: C.folha, stroke: INK, lw: 3, seed: 513 });
    ctx.restore();
  }
  function coracao(ctx, x, y, k = 1, seed = 480) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    G.poly(ctx, [[0, 24], [-28, -2], [-28, -14], [-15, -25], [0, -15], [15, -25], [28, -14], [28, -2]], { fill: C.coral, stroke: INK, lw: 4, seed, step: 60 });
    ctx.restore();
  }
  function tracejado(ctx, x0, y0, x1, y1, k = 1, seed = 490) { // a linha da mesma altura
    const n = 7;
    for (let i = 0; i < n; i++) {
      const a = i / n, b = Math.min((i + 0.55) / n, k);
      if (a >= k) break;
      G.line(ctx, [[U.lerp(x0, x1, a), U.lerp(y0, y1, a)], [U.lerp(x0, x1, b), U.lerp(y0, y1, b)]], { color: C.coral, lw: 7, seed: seed + i });
    }
  }
  function visto(ctx, x, y, k = 1, seed = 500) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    G.ellipse(ctx, 0, 0, 28, 28, { fill: C.folha, stroke: INK, lw: 4, seed });
    G.line(ctx, [[-12, 1], [-3, 11], [14, -10]], { color: C.branco, lw: 6, seed: seed + 1 });
    ctx.restore();
  }
  function semFalar(ctx, x, y, k, seed = 530) { // o balão com a conversa riscada
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    G.poly(ctx, [[30, 32], [58, 66], [62, 32]], { fill: C.salvia, stroke: INK, lw: 4, seed, step: 60 }); // sálvia: branco some na parede, no chapado
    G.rrect(ctx, -72, -42, 144, 82, 32, { fill: C.salvia, stroke: INK, lw: 4, seed: seed + 1 });
    for (const dx of [-32, 0, 32]) G.ellipse(ctx, dx, 0, 9, 9, { fill: INK, stroke: INK, lw: 2, seed: seed + 3 + dx });
    ctx.restore();
    B.xis(ctx, x, y, 40, k, seed + 10);
  }
  function prancheta(ctx, x, y, linhas, seed = 540) { // a anotação do estudante: uma linha por medida
    G.rrect(ctx, x - 72, y - 92, 144, 184, 10, { fill: C.branco, stroke: INK, lw: 5, seed });
    G.rrect(ctx, x - 30, y - 104, 60, 24, 6, { fill: C.folha, stroke: INK, lw: 4, seed: seed + 1 });
    for (let k = 0; k < 3; k++) if (linhas > k) G.line(ctx, [[x - 50, y - 40 + k * 46], [x - 50 + 100 * Math.min(1, linhas - k), y - 40 + k * 46]], { color: INK, lw: 7, seed: seed + 2 + k });
  }
  function calendario(ctx, x, y, k, seed = 560) { // duas ocasiões diferentes, marcadas
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    G.rrect(ctx, -96, -84, 192, 168, 14, { fill: C.branco, stroke: INK, lw: 5, seed });
    G.rrect(ctx, -96, -84, 192, 42, 14, { fill: C.coral, stroke: INK, lw: 5, seed: seed + 1 });
    const marcadas = [[0, 1], [2, 2]];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const m = marcadas.some(([a, b]) => a === r && b === c);
      G.rrect(ctx, -78 + c * 40, -30 + r * 36, 30, 26, 4, { fill: m ? C.marca : C.papel, stroke: INK, lw: 2.5, seed: seed + 10 + r * 4 + c });
      if (m) G.line(ctx, [[-71 + c * 40, -17 + r * 36], [-65 + c * 40, -10 + r * 36], [-55 + c * 40, -24 + r * 36]], { color: INK, lw: 4, seed: seed + 40 + r });
    }
    ctx.restore();
  }
  function ubs(ctx, x, y, k = 1, seed = 580) { // a unidade, onde fica a equipe
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    G.poly(ctx, [[-74, -40], [0, -100], [74, -40]], { fill: C.folha, stroke: INK, lw: 5, seed, step: 60 });
    G.rrect(ctx, -62, -42, 124, 100, 6, { fill: C.branco, stroke: INK, lw: 5, seed: seed + 1 });
    G.rrect(ctx, -9, -30, 18, 46, 3, { fill: C.coral, stroke: null, lw: 0, seed: seed + 2 });
    G.rrect(ctx, -23, -16, 46, 18, 3, { fill: C.coral, stroke: null, lw: 0, seed: seed + 3 });
    ctx.restore();
  }
  function zigue(ctx, x, y, a, seed) { // a dor: o risco em zigue-zague
    G.line(ctx, [[x, y], [x + Math.cos(a) * 18 - Math.sin(a) * 10, y + Math.sin(a) * 18 + Math.cos(a) * 10], [x + Math.cos(a) * 36 + Math.sin(a) * 10, y + Math.sin(a) * 36 - Math.cos(a) * 10], [x + Math.cos(a) * 54, y + Math.sin(a) * 54]], { color: C.coral, lw: 7, seed });
  }

  // o braço direito da tela de uma pessoa sentada: ombro, cotovelo e mão em coordenadas da tela (o mesmo cálculo do motor)
  function bracoR(p, ax, ay) {
    const s = p.s || 1, sh = -172, S = [70, sh + 16], H = B.mao(p, ax, ay);
    const a = Ch.ik(S, H, 82, 80, H[1] < sh ? 1 : -1);
    const tela = ([x, y]) => [p.x + x * s, p.y + y * s];
    return { S: tela(S), E: tela(a.E), H: tela(a.H) };
  }
  // o manguito no braço (entre o ombro e o cotovelo, perto do cotovelo); manga: a manga por baixo, o erro
  function manguitoNoBraco(ctx, br, { infla = 0, manga = false, seed = 600 } = {}) {
    const [sx, sy] = br.S, [ex, ey] = br.E;
    const ang = Math.atan2(ey - sy, ex - sx), len = Math.hypot(ex - sx, ey - sy);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang);
    if (manga) G.rrect(ctx, len * 0.05, -25, len * 0.95, 50, 14, { fill: FRANCISCA.shirt, stroke: INK, lw: 4, seed: seed + 5 });
    const h = 46 * (1 + 0.16 * infla);
    G.rrect(ctx, len * 0.44, -h / 2, len * 0.46, h, 10, { fill: C.floresta, stroke: INK, lw: 4, seed });
    G.line(ctx, [[len * 0.5, -h / 2 + 12], [len * 0.84, -h / 2 + 12]], { color: C.salvia, lw: 4, seed: seed + 1 });
    ctx.restore();
    return [sx + Math.cos(ang) * len * 0.67, sy + Math.sin(ang) * len * 0.67];
  }
  function tubo(ctx, de, ate, seed = 620) {
    const mx = (de[0] + ate[0]) / 2, my = Math.max(de[1], ate[1]) + 60;
    const pts = []; for (let k = 0; k <= 10; k++) { const u = k / 10; pts.push([(1 - u) * (1 - u) * de[0] + 2 * (1 - u) * u * mx + u * u * ate[0], (1 - u) * (1 - u) * de[1] + 2 * (1 - u) * u * my + u * u * ate[1]]); }
    G.line(ctx, pts, { color: INK, lw: 5, seed });
  }
  function alerta(ctx, x, y, k, seed = 152) { // o "!" (o mesmo do molde)
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    G.ellipse(ctx, 0, 0, 54, 54, { fill: C.coral, stroke: INK, lw: 6, seed });
    txt(ctx, '!', 0, 30, { size: 84, align: 'center', color: C.noite });
    ctx.restore();
  }
  // Dona Francisca sentada na cadeira (o padrão de todas as cenas; o que muda vem em o)
  const sentada = (ctx, o = {}) => Ch.person(ctx, Object.assign({ x: PX, y: PY, pose: 'sit', s: 1.0, eyes: 'normal', mouth: 'smile', look: -0.5, style: FRANCISCA }, o));

  // ---------- as cenas desta peça ----------
  const GESTO = {};
  // a situação: o primeiro quadro já é o problema. A xícara desce da boca à mesa; o estojo do aparelho cai na mesa em
  // ABERTURA.queda (o "baque"); o "!" salta em cima do café em ABERTURA.alerta. Na [02], o close fecha no café.
  B.CENA.situacao = (ctx, st) => {
    const u = st.u, AB = globalThis.SCORE.ABERTURA;
    varanda(ctx); cadeira(ctx); mesinha(ctx);
    const entra = (1 - U.ease.outCubic(U.clamp(u / 0.7, 0, 1))) * 380;
    Ch.person(ctx, { x: L + 90 - entra, y: GY, pose: 'stand', s: 1.0, eyes: 'normal', mouth: 'smile', look: 0.8, style: B.ACS });
    Ch.person(ctx, { x: L + 300 - entra, y: GY, pose: 'stand', s: 1.02, eyes: 'normal', mouth: 'open', look: 0.8, style: B.ESTUDANTE });
    const desce = U.ease.inOutCubic(U.clamp((u - 0.15) / 0.6, 0, 1));
    const xic = [U.lerp(668, 780, desce), U.lerp(1012, MESA, desce)];
    sentada(ctx, { eyes: 'happy', mouth: 'smile', handR: B.mao({ x: PX, y: PY, s: 1 }, xic[0] - 18, xic[1] - 8) });
    xicara(ctx, xic[0], xic[1], 1, 441);
    const k = Math.min(1, (Math.max(0, u) / AB.queda) ** 2); // cai e para no tampo em AB.queda
    estojo(ctx, 878, U.lerp(870, MESA - 50, k), 451);
    if (st.i === 0 && u >= AB.alerta) alerta(ctx, 790, 1010, U.ease.outBack(U.clamp((u - AB.alerta) / 0.3, 0, 1)));
  };

  // passo 1 · espere 30 minutos depois do café (e 90 depois de exercício)
  GESTO.cafe = (ctx, st) => {
    varanda(ctx); cadeira(ctx); mesinha(ctx);
    sentada(ctx, { eyes: 'normal', mouth: 'smile' });
    xicara(ctx, 780, MESA, 1, 441);
    estojo(ctx, 878, MESA - 50, 451);
    const it0 = st.c.itens[0], it1 = st.c.itens[1];
    relogio(ctx, 230, 1010, 104, (st.t - it0.t0) / (it0.t1 - it0.t0), D('D06'), 470);
    xicara(ctx, 150, 1250, 0.9, 701); prato(ctx, 240, 1252, 702); cigarro(ctx, 336, 1246, 703);
    if (it1 && st.t >= it1.t0) {
      const k = U.ease.outBack(U.clamp((st.t - it1.t0) / 0.35, 0, 1));
      ctx.save(); ctx.translate(430, 1060); ctx.scale(k, k); ctx.translate(-430, -1060);
      relogio(ctx, 430, 1030, 68, (st.t - it1.t0 - 0.3) / (it1.t1 - it1.t0 - 0.3), D('D07'), 720);
      tenis(ctx, 430, 1250, 721);
      ctx.restore();
    }
  };

  // passo 2 · pelo menos 5 minutos de repouso, sentada, sem falar
  GESTO.repouso = (ctx, st) => {
    varanda(ctx); cadeira(ctx); mesinha(ctx);
    estojo(ctx, 878, MESA - 50, 451);
    const respira = Math.sin(st.t * 2.2) * 0.012;
    sentada(ctx, { eyes: 'closed', mouth: 'smile', sy: 1 + respira, handR: B.mao({ x: PX, y: PY, s: 1 }, 650, 1238) });
    relogio(ctx, 230, 1020, 110, st.u / (st.c.t1 - st.c.t0), D('D08'), 730);
    const it1 = st.c.itens[1];
    if (it1 && st.t >= it1.t0) semFalar(ctx, 440, 940, U.ease.outBack(U.clamp((st.t - it1.t0) / 0.35, 0, 1)), 531);
  };

  // passo 3 · costas apoiadas, pernas descruzadas, pés no chão; depois, o braço nu na mesa, na altura do coração
  GESTO.posicao = (ctx, st) => {
    varanda(ctx); cadeira(ctx); mesinha(ctx);
    aparelho(ctx, 872, MESA - 48, 0.9, '');
    const it0 = st.c.itens[0], it1 = st.c.itens[1], BEAT = globalThis.SCORE.BEAT;
    const vai = it1 ? U.ease.inOutCubic(U.clamp((st.t - it1.t0) / 0.5, 0, 1)) : 0;
    const p = { x: PX, y: PY, s: 1 };
    const mao = [U.lerp(662, NA_MESA[0], vai), U.lerp(1244, NA_MESA[1], vai)];
    sentada(ctx, { eyes: 'normal', mouth: 'smile', look: 0.2, handR: B.mao(p, mao[0], mao[1]) });
    // os três vistos da posição, um por batida
    [[500, 1000], [600, 1296], [600, 1384]].forEach(([x, y], i) => visto(ctx, x - (i ? 110 : 0), y, U.ease.outBack(U.clamp((st.t - it0.t0 - BEAT * (1 + i)) / 0.3, 0, 1)), 740 + i * 3));
    if (vai > 0) {
      coracao(ctx, CORACAO[0], CORACAO[1], vai, 481);
      tracejado(ctx, CORACAO[0] + 34, CORACAO[1], NA_MESA[0] - 26, NA_MESA[1], U.clamp((st.t - it1.t0 - 0.5) / 0.6, 0, 1), 491);
    }
  };

  // passo 4 · o manguito, de perto: o braço deitado na mesa, a palma para cima, o manguito 2 a 3 cm acima da dobra
  GESTO.manguito = (ctx, st) => {
    G.rrect(ctx, -20, 1010, WD + 40, 390, 0, { fill: C.branco, stroke: INK, lw: 6, seed: 801 }); // o tampo, visto de cima (a toalha)
    G.line(ctx, [[-20, 1010], [WD + 20, 1010]], { color: INK, lw: 5, seed: 819 }); // a beira do fundo: no chapado, a linha é o que separa a mesa da parede
    G.rrect(ctx, -20, 1400, WD + 40, 30, 0, { fill: C.madeira, stroke: INK, lw: 6, seed: 820 }); // a beira da frente, de madeira
    G.rrect(ctx, -20, 1430, WD + 40, 520, 0, { fill: C.folha, stroke: INK, lw: 6, seed: 802 });
    ctx.save(); ctx.translate(-40, 0); // o braço todo 40 mais para a esquerda: no close, os dedos não encostam na borda
    const y = 1210, cot = 520; // a linha do braço e a dobra do cotovelo
    G.rrect(ctx, -60, y - 56, cot + 70, 112, 50, { fill: C.pele, stroke: INK, lw: 5, seed: 803 }); // o braço
    G.rrect(ctx, cot - 20, y - 46, 280, 92, 44, { fill: C.pele, stroke: INK, lw: 5, seed: 804 }); // o antebraço (curto: no close de 1,22 a mão não encosta na borda)
    // a palma para cima, com os dedos
    G.ellipse(ctx, 810, y, 62, 54, { fill: C.peleClara, stroke: INK, lw: 5, seed: 805 });
    for (let k = 0; k < 4; k++) G.rrect(ctx, 856, y - 44 + k * 26, 74, 20, 10, { fill: C.peleClara, stroke: INK, lw: 4, seed: 806 + k });
    G.rrect(ctx, 780, y - 82, 22, 52, 10, { fill: C.peleClara, stroke: INK, lw: 4, seed: 811 });
    G.line(ctx, [[cot - 4, y - 30], [cot + 10, y], [cot - 4, y + 30]], { color: INK, lw: 5, seed: 812 }); // a dobra do cotovelo
    // o manguito: sem folga, e infla na 2.ª frase (o "sopro")
    const it1 = st.c.itens[1], BEAT = globalThis.SCORE.BEAT;
    const infla = it1 ? Math.sin(Math.PI * U.clamp((st.t - it1.t0 - BEAT * 0.5) / 1.6, 0, 1)) : 0;
    const h = 150 * (1 + 0.14 * infla), cx0 = 170, cx1 = 432;
    G.rrect(ctx, cx0, y - h / 2, cx1 - cx0, h, 16, { fill: C.floresta, stroke: INK, lw: 5, seed: 813 });
    G.rrect(ctx, cx0 + 18, y - h / 2 + 14, cx1 - cx0 - 36, 24, 8, { fill: C.salvia, stroke: null, lw: 0, seed: 814 });
    // 2 a 3 cm: a chave entre a beira do manguito e a dobra
    const yk = y + h / 2 + 40;
    G.line(ctx, [[cx1, yk - 16], [cx1, yk + 16]], { color: C.coral, lw: 6, seed: 815 });
    G.line(ctx, [[cot, yk - 16], [cot, yk + 16]], { color: C.coral, lw: 6, seed: 816 });
    G.line(ctx, [[cx1, yk], [cot, yk]], { color: C.coral, lw: 6, seed: 817 });
    hand(ctx, D('D09'), (cx1 + cot) / 2, yk + 66, { size: 54, align: 'center' });
    ctx.restore();
    // o tubo até o aparelho
    aparelho(ctx, 790, 960, 1.3, infla > 0.05 ? '...' : '');
    tubo(ctx, [(cx0 + cx1) / 2 - 40, y - h / 2], [790 - 91, 980], 818);
  };

  // passo 5 · 3 medidas, 1 minuto entre elas; vale a média das duas últimas (a 1.ª fica de fora)
  GESTO.medidas = (ctx, st) => {
    varanda(ctx, { comRede: false }); // sem a rede: o bloco de notas ocupa o canto
    const c = st.c, t = st.t;
    const feitas = c.tConta ? c.tConta.filter((tc) => t >= tc + 0.18).length : 0;
    aparelho(ctx, 270, 1080, 2.2, feitas ? D('D' + (9 + feitas)) : '- - -', { size: 25, unidade: true });
    tubo(ctx, [270, 1190], [150, 1420], 901);
    const it1 = c.itens[1], kM = it1 ? U.clamp((t - it1.t0) / 0.45, 0, 1) : 0;
    const x0 = 530, x1 = 930, y0 = 935;
    G.rrect(ctx, x0, y0, x1 - x0, 350, 14, { fill: C.branco, stroke: INK, lw: 5, seed: 902 });
    for (let k = 0; k < 3; k++) {
      const yy = y0 + 76 + k * 66;
      G.ellipse(ctx, x0 + 34, yy - 15, 9, 9, { fill: k === 0 && kM > 0 ? C.coral : C.folha, stroke: INK, lw: 3, seed: 903 + k });
      if (feitas > k) txt(ctx, D('D' + (10 + k)), x0 + 62, yy, { size: 46, color: INK });
      if (k === 0 && kM > 0) G.line(ctx, [[x0 + 54, yy - 16], [x0 + 54 + 176 * kM, yy - 16]], { color: C.coral, lw: 8, seed: 906 });
    }
    if (kM > 0) {
      const yy = y0 + 76 + 3 * 66 + 18, s = D('D13'), w = B.wid(ctx, s, 42);
      ctx.save(); ctx.globalAlpha *= kM;
      B.mark(ctx, x0 + 40, yy, w, 42, 907);
      txt(ctx, s, x0 + 40, yy, { size: 42, color: INK });
      ctx.restore();
    }
  };

  // alerta · pressão alta com dor no peito, falta de ar ou fraqueza de repente: emergência, 192 na hora
  GESTO.emergencia = (ctx, st) => {
    varanda(ctx); cadeira(ctx); mesinha(ctx);
    aparelho(ctx, 872, MESA - 48, 0.9, '!', { alerta: true, size: 34 });
    const tre = Math.sin(st.t * 30) * 3, p = { x: PX + tre, y: PY, s: 1 };
    Ch.person(ctx, Object.assign({}, p, { pose: 'sit', eyes: 'worried', mouth: 'o', brows: 'worried', sweat: 1, look: -0.3, handR: B.mao(p, 628, 1118), style: FRANCISCA }));
    const pulso = 0.5 + 0.5 * Math.sin(st.t * 9);
    ctx.save(); ctx.globalAlpha *= 0.6 + 0.4 * pulso;
    zigue(ctx, 690, 1090, -0.5, 951); zigue(ctx, 540, 1100, Math.PI + 0.5, 952);
    ctx.restore();
    const it1 = st.c.itens[1], liga = it1 && st.t >= it1.t0;
    Ch.person(ctx, { x: 330, y: GY, pose: 'stand', s: 1.02, eyes: 'wide', mouth: liga ? 'open' : 'o', brows: 'worried', look: 0.6, gesture: liga ? 'phone' : null, style: B.ESTUDANTE });
    Ch.person(ctx, { x: L + 70, y: GY, pose: 'stand', s: 1.0, eyes: 'wide', mouth: 'o', brows: 'worried', look: 0.8, style: B.ACS });
  };

  // os casos especiais: um cartão por frase. Na troca, o cartão novo empurra o velho para fora (0,35 s) e tem outra cor
  const CASOS = ['D04', 'D05'], FUNDO = [C.branco, C.salvia];
  function doisBracos(ctx) { // primeira vez: mede nos dois braços e segue no mais alto
    [[400, 0.5, 610], [600, 0.86, 620]].forEach(([x, alto, seed]) => {
      G.rrect(ctx, x - 30, 1000, 60, 300, 28, { fill: C.pele, stroke: INK, lw: 5, seed });
      G.rrect(ctx, x - 44, 1070, 88, 92, 12, { fill: C.floresta, stroke: INK, lw: 4, seed: seed + 1 });
      const gx = x + 66, hh = 210 * alto;
      G.rrect(ctx, gx - 13, 1310 - 210, 26, 210, 12, { fill: C.branco, stroke: INK, lw: 4, seed: seed + 2 });
      G.rrect(ctx, gx - 13, 1310 - hh, 26, hh, 12, { fill: alto > 0.7 ? C.coral : C.salvia, stroke: INK, lw: 4, seed: seed + 3 });
    });
    visto(ctx, 666, 1310 - 210 * 0.86 - 46, 1, 630);
  }
  function comDor(ctx, st) { // com dor: a dor também sobe a pressão
    const p = { x: CX - 40, y: 1400, s: 0.8 }; // pequena o bastante para o coque não cobrir o nome do cartão
    Ch.person(ctx, Object.assign({}, p, { pose: 'stand', eyes: 'worried', mouth: 'wavy', brows: 'worried', look: 0.2, handR: B.mao(p, CX + 10, 1010), style: FRANCISCA }));
    const pulso = 0.6 + 0.4 * Math.sin(st.t * 8);
    ctx.save(); ctx.globalAlpha *= pulso;
    zigue(ctx, CX - 130, 1000, Math.PI + 0.6, 641); zigue(ctx, CX + 30, 1000, -0.4, 642);
    ctx.restore();
    const gx = CX + 150, sobe = U.clamp(0.4 + 0.5 * U.clamp((st.t - st.it.t0) / 1.2, 0, 1), 0, 1);
    G.rrect(ctx, gx - 14, 1300 - 230, 28, 230, 12, { fill: C.branco, stroke: INK, lw: 4, seed: 643 });
    G.rrect(ctx, gx - 14, 1300 - 230 * sobe, 28, 230 * sobe, 12, { fill: C.coral, stroke: INK, lw: 4, seed: 644 });
    B.seta(ctx, gx + 52, 1240, gx + 52, 1060, { seed: 645 });
  }
  GESTO.especiais = (ctx, st) => {
    const it1 = st.c.itens[1], k = it1 ? U.ease.inOutCubic(U.clamp((st.t - it1.t0) / 0.35, 0, 1)) : 0, desliza = 1150;
    const caso = (i, dx) => {
      ctx.save(); ctx.translate(CX + dx, 1150); ctx.scale(1.25, 1.25); ctx.translate(-CX, -1150);
      G.rrect(ctx, CX - 210, 870, 420, 560, 30, { fill: FUNDO[i % 2], stroke: INK, lw: 6, seed: 211 + i });
      hand(ctx, D(CASOS[i]), CX, 935, { size: 50, align: 'center' });
      if (i === 0) doisBracos(ctx); else comDor(ctx, st);
      ctx.restore();
    };
    if (k < 1) caso(0, -k * desliza);
    if (it1 && st.t >= it1.t0) caso(1, (1 - k) * desliza);
  };

  // equipe · anote os 3 números e conte à agente e à equipe; quem confirma é a equipe, em duas ocasiões
  GESTO.anotar = (ctx, st) => {
    varanda(ctx, { comRede: false }); cadeira(ctx); mesinha(ctx);
    aparelho(ctx, 872, MESA - 48, 0.9, '');
    sentada(ctx, { eyes: 'happy', mouth: 'smile', look: -0.4 });
    const BEAT = globalThis.SCORE.BEAT, it0 = st.c.itens[0], it1 = st.c.itens[1];
    const linhas = U.clamp((st.t - it0.t0 - BEAT) / (BEAT * 3), 0, 3);
    const pe = { x: 330, y: GY, s: 1.02 }, pr = [420, 1110];
    Ch.person(ctx, Object.assign({}, pe, { pose: 'stand', eyes: 'focus', mouth: 'flat', look: 0.4, handL: B.mao(pe, pr[0] - 56, pr[1] + 60), handR: B.mao(pe, pr[0] + 30, pr[1] - 10 + Math.sin(st.t * 14) * 6), style: B.ESTUDANTE }));
    prancheta(ctx, pr[0], pr[1], linhas, 541);
    Ch.person(ctx, { x: L + 70, y: GY, pose: 'stand', s: 1.0, eyes: 'normal', mouth: 'smile', look: 0.8, style: B.ACS });
    if (it1 && st.t >= it1.t0) {
      const k = U.ease.outBack(U.clamp((st.t - it1.t0) / 0.35, 0, 1));
      ubs(ctx, 690, 990, k, 581);
      calendario(ctx, 860, 960, k, 561);
    }
  };

  // o 192 (fixo da série): na 2.ª frase, o pino no mapa e um ponto de referência
  GESTO.ligue = (ctx, st) => {
    if (st.i < 1) return;
    const k = U.ease.outBack(U.clamp((st.t - st.it.t0) / 0.35, 0, 1));
    ctx.save(); ctx.translate(B.R - 120, 470); ctx.scale(k, k);
    G.ellipse(ctx, 0, 0, 92, 92, { fill: C.papel, stroke: C.papel, lw: 6, seed: 241 });
    G.line(ctx, [[-70, 30], [70, 30]], { color: INK, lw: 6, seed: 242 }); G.line(ctx, [[0, -70], [0, 70]], { color: INK, lw: 6, seed: 243 });
    G.ellipse(ctx, -36, -10, 26, 26, { fill: C.folha, stroke: INK, lw: 4, seed: 244 });
    G.poly(ctx, [[34, -12], [56, -50], [78, -12]], { fill: C.coral, stroke: INK, lw: 4, seed: 245 });
    ctx.restore();
  };

  // o erro · por cima da manga e com o braço pendurado; o certo · braço nu, apoiado na altura do coração
  GESTO.manga = (ctx, st) => {
    varanda(ctx); cadeira(ctx); mesinha(ctx);
    const BEAT = globalThis.SCORE.BEAT, it0 = st.c.itens[0], it1 = st.c.itens[1];
    const certo = it1 && st.t >= it1.t0;
    const ap = [872, MESA - 48];
    aparelho(ctx, ap[0], ap[1], 0.9, '');
    const p = { x: PX, y: PY, s: 1 };
    const alvo = certo ? NA_MESA : [690, 1300];
    sentada(ctx, { eyes: 'normal', mouth: certo ? 'smile' : 'flat', look: 0.3, handR: B.mao(p, alvo[0], alvo[1]) });
    const br = bracoR(p, alvo[0], alvo[1]);
    const meio = manguitoNoBraco(ctx, br, { manga: !certo, seed: 960 });
    tubo(ctx, meio, [ap[0] - 63, ap[1] + 10], 961);
    if (!certo) B.xis(ctx, meio[0], meio[1], 56, U.ease.outBack(U.clamp((st.t - it0.t0 - BEAT * 2) / 0.3, 0, 1)), 962);
    else {
      coracao(ctx, CORACAO[0], CORACAO[1], 1, 482);
      tracejado(ctx, CORACAO[0] + 34, CORACAO[1], NA_MESA[0] - 26, NA_MESA[1], 1, 492);
      visto(ctx, 700, 1000, U.ease.outBack(U.clamp((st.t - it1.t0 - 0.3) / 0.3, 0, 1)), 963);
    }
  };

  // o fecho (fixo da série): os três juntos; o aparelho na mesa, a medida feita
  GESTO.fecho = (ctx, st) => {
    varanda(ctx); cadeira(ctx); mesinha(ctx);
    aparelho(ctx, 872, MESA - 48, 0.9, '');
    visto(ctx, 872, MESA - 140, 1, 971);
    Ch.person(ctx, { x: L + 90, y: GY, pose: 'stand', s: 1.0, eyes: 'happy', mouth: 'smile', gesture: 'wave', style: B.ACS });
    Ch.person(ctx, { x: 360, y: GY, pose: 'stand', s: 1.02, eyes: 'happy', mouth: 'smile', gesture: 'thumbsUp', look: 0.6, style: B.ESTUDANTE });
    sentada(ctx, { eyes: 'happy', mouth: 'smile', handR: B.mao({ x: PX, y: PY, s: 1 }, NA_MESA[0], NA_MESA[1]) });
  };

  // o close da 2.ª frase de cada cena: [x, y, zoom] do detalhe que a frase explica
  const FOCO = { situacao: [760, 1080, 1.35], passo1: [380, 1090, 1.18], passo2: [560, 1010, 1.3], passo3: [700, 1140, 1.35], passo4: [374, 1110, 1.22], passo5: [600, 1150, 1.22], emergencia: [740, 1080, 1.3], equipe: [800, 1010, 1.3], erro: [690, 1170, 1.3] };

  globalThis.PECA = { DESTAQUE, PACIENTE: FRANCISCA, GESTO, FOCO };
})();
