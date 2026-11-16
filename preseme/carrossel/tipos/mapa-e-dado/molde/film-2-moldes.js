// PRESEME · carrossel · tipo MAPA E DADO · os moldes de lâmina e o kit do mapa (FIXO: não muda de peça para peça).
// Uma doença ou um número de Roraima no mapa: o número oficial ao lado do resto, por que é daqui (o vetor e o lugar,
// nunca as pessoas), como se previne, quem notifica e o cartão-resumo. Um molde por tipo de lâmina (o score.js diz qual
// lâmina usa qual): PRESEME.MOLDE[tipo]. O desenho de cada lâmina é PRESEME.DESENHO[lam.desenho](ctx, caixa, lam, ...):
// o mapa (DESENHO.mapa) fica aqui e se ajusta pelo SCORE.MAPA da peça (o recorte, os rótulos, o alfinete e os
// municípios marcados); os desenhos do assunto ficam na peça, em film-3-desenhos.js, que carrega depois e pode trocar
// qualquer desenho daqui. Em toda lâmina, lam.palavras[0] é a etiqueta. Desenho parado; estilo padrão: infográfico
// chapado. Assinatura do tipo: a etiqueta em pílula Floresta com letra Papel, o conteúdo em cartões de canto redondo e
// o número grande no cartão escuro.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, DS = P.DESENHO, SC = globalThis.SCORE, G = globalThis.G;
  const { L, R, TOP, BOT } = P;
  const LW = R - L;
  const RAD = Math.PI / 180;
  const liso = { hachura: false, sombra: false };
  // nas cores do estilo escuro (lousa), a pílula inverte: fundo Papel e letra Floresta
  const corPilula = (fundo, cor) => (E.escuro() && fundo === 'floresta' ? ['papel', 'floresta'] : [fundo, cor]);

  // ---------- o kit do mapa (PRESEME.KIT) ----------
  // o mapa: SCORE.MAPA = { caixa: { lon0, lon1, lat0, lat1 }, rotulos: [{ tipo, lon, lat, align }], alvo: { lon, lat },
  // destaques: ['nome do município', ...] }. tipo do rótulo: area (pílula escura em cima da área), pais e estado (letra
  // no lugar), cidade (bolinha e nome). Os rótulos seguem a ordem das palavras D da lâmina, depois da etiqueta.
  const CFG = () => Object.assign({ caixa: { lon0: -65, lon1: -58.5, lat0: -1.8, lat1: 5.5 }, rotulos: [], alvo: null, destaques: [] }, SC.MAPA || {});
  function projetor(cx, caixa) {
    const dl = caixa.lon1 - caixa.lon0, dt = caixa.lat1 - caixa.lat0, k = Math.min(cx.w / dl, cx.h / dt);
    const ox = cx.x + (cx.w - dl * k) / 2, oy = cx.y + (cx.h - dt * k) / 2;
    return ([lon, lat]) => [ox + (lon - caixa.lon0) * k, oy + (caixa.lat1 - lat) * k];
  }
  function pilulaEm(ctx, s, x, y, { size = 28, fundo = 'floresta', cor = 'papel' } = {}) {
    [fundo, cor] = corPilula(fundo, cor);
    const t = s.toUpperCase(), w = E.medir(ctx, t, { papel: 'titulo', size }) + 44, h = size + 26;
    E.ret(ctx, x - w / 2, y - h / 2, w, h, Object.assign({ papel: fundo, r: h / 2, contorno: false, seed: 505 }, liso));
    E.texto(ctx, t, x, y + size * 0.36, { papel: 'titulo', size, align: 'center', cor });
  }
  function alfinete(ctx, x, y, s = 1) { // a ponta em (x, y)
    const c = E.escuro() ? 'papel' : 'floresta', miolo = E.escuro() ? 'floresta' : 'papel';
    E.poligono(ctx, [[x, y], [x - 30 * s, y - 52 * s], [x + 30 * s, y - 52 * s]], Object.assign({ papel: c, contorno: false, seed: 506 }, liso));
    E.circulo(ctx, x, y - 70 * s, 38 * s, Object.assign({ papel: c, contorno: false, seed: 507 }, liso));
    E.circulo(ctx, x, y - 70 * s, 16 * s, Object.assign({ papel: miolo, contorno: false, seed: 508 }, liso));
  }
  P.KIT = { RAD, liso, projetor, pilulaEm, alfinete };

  // ---------- os desenhos prontos do tipo (a peça pode trocar qualquer um com o mesmo nome em film-3-desenhos.js) ----------
  // mapa: a base (os municípios) em Papel, a área marcada em Coral, os municípios de SCORE.MAPA.destaques em Coral; sem
  // rótulos (capa), o alfinete no alvo. marcas: as palavras D dos rótulos
  DS.mapa = (ctx, cx, lam, marcas = []) => {
    const MP = P.MAPAS || {}, base = MP.base, area = MP.area, cfg = CFG();
    if (!base) { console.log('PRESEME-MAPA: o mapa de base não carregou (assets/)'); return; }
    const pr = projetor(cx, cfg.caixa);
    for (const [nome, aneis] of Object.entries(base)) for (const r of aneis) E.poligono(ctx, r.map(pr), Object.assign({ papel: cfg.destaques.includes(nome) ? 'alerta' : 'superficie', contorno: false, seed: 500 }, liso));
    for (const r of Object.values(base).flat()) E.linha(ctx, r.map(pr), { papel: 'apoio', lw: 3, seed: 501 });
    if (Array.isArray(area)) for (const r of area) E.poligono(ctx, r.map(pr), Object.assign({ papel: 'alerta', contorno: false, seed: 502, alpha: 0.92 }, liso));
    if (!marcas.length) { if (cfg.alvo) { const [ax, ay] = pr([cfg.alvo.lon, cfg.alvo.lat]); alfinete(ctx, ax, ay, 1.1); } return; }
    marcas.forEach((k, i) => {
      const r = cfg.rotulos[i], s = TX[k];
      if (!r || !s) return;
      const [x, y] = pr([r.lon, r.lat]);
      if (r.tipo === 'cidade') {
        E.circulo(ctx, x, y, 11, Object.assign({ papel: 'tinta', contorno: false, seed: 510 }, liso));
        E.texto(ctx, s, x + 20, y + 11, { papel: 'corpo', size: 30 });
      } else if (r.tipo === 'area') pilulaEm(ctx, s, x, y);
      else E.texto(ctx, s, x, y, { papel: 'titulo', size: r.tipo === 'estado' ? 38 : 32, align: r.align || 'center' });
    });
  };
  // troque: o lugar do desenho que a peça ainda não fez (aparece tracejado, com o aviso; nunca vai para o ar)
  DS.troque = (ctx, cx) => {
    E.ret(ctx, cx.x + 10, cx.y + 10, cx.w - 20, cx.h - 20, Object.assign({ papel: null, r: 24, lw: 4, seed: 700 }, liso));
    E.linha(ctx, [[cx.x + 40, cx.y + 40], [cx.x + cx.w - 40, cx.y + cx.h - 40]], { lw: 3, tracejado: true, seed: 701 });
    E.linha(ctx, [[cx.x + cx.w - 40, cx.y + 40], [cx.x + 40, cx.y + cx.h - 40]], { lw: 3, tracejado: true, seed: 702 });
    const aviso = cx.w >= 420 ? 'TROQUE · desenho da peça' : 'TROQUE', z = Math.min(34, (cx.w - 40) / (aviso.length * 0.62));
    G.decor(() => E.texto(ctx, aviso, cx.x + cx.w / 2, cx.y + cx.h / 2 + z * 0.36, { papel: 'numero', size: z, align: 'center' }));
  };

  // ---------- os moldes de lâmina ----------
  // a pílula: o texto k em maiúscula, fundo Floresta e letra Papel. Devolve onde o conteúdo pode começar (y)
  function pilula(ctx, k, x, y, { size = 30, fundo = 'floresta', cor = 'papel', centro = false } = {}) {
    if (!TX[k]) return y;
    [fundo, cor] = corPilula(fundo, cor);
    const s = TX[k].toUpperCase(), w = E.medir(ctx, s, { papel: 'titulo', size }) + 52, h = size + 30;
    const x0 = centro ? x - w / 2 : x;
    E.ret(ctx, x0, y, w, h, Object.assign({ papel: fundo, r: h / 2, contorno: false, seed: 7 }, liso));
    E.texto(ctx, s, x0 + w / 2, y + h / 2 + size * 0.36, { papel: 'titulo', size, align: 'center', cor });
    return y + h + 26;
  }
  P.pilula = pilula;
  const cartao = (ctx, x, y, w, h, papel = 'superficie', seed = 11) => E.ret(ctx, x, y, w, h, { papel, r: 30, contorno: false, seed });
  const desenho = (ctx, lam, cx, ...mais) => { const f = lam.desenho && DS[lam.desenho]; if (f && cx.w > 40 && cx.h > 40) f(ctx, cx, lam, ...mais); };
  // o detalhe, com o fio Folha à esquerda
  function nota(ctx, k, cx, o = {}) {
    if (!TX[k]) return { y1: cx.y };
    const r = P.bloco(ctx, k, { x: cx.x + 34, y: cx.y, w: cx.w - 34, h: cx.h }, Object.assign({ sizes: [50, 46, 42, 40, 38, 36] }, o));
    E.linha(ctx, [[cx.x + 6, r.y0 + 4], [cx.x + 6, r.y1 + 4]], { papel: 'apoioEscuro', lw: 8, seed: 9 });
    return r;
  }
  const certo = (ctx, x, y, s, papel) => E.linha(ctx, [[x - 14 * s, y], [x - 4 * s, y + 11 * s], [x + 16 * s, y - 13 * s]], { papel, lw: 7 * s, seed: 240 });
  const num = (s) => parseFloat(String(s || '').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;

  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx);
    const [t1, t2] = lam.linhas;
    const y0 = pilula(ctx, lam.palavras[0], L, TOP - 16);
    const a = P.titulo(ctx, t1, { x: L, y: y0 + 30, w: LW, h: 470 }, { sizes: [92, 86, 80, 74, 68, 62], lh: 1.06 });
    const b = P.bloco(ctx, t2, { x: L, y: a.y1 + 28, w: LW, h: 140 }, { sizes: [50, 46, 42, 40] });
    const yd = Math.max(b.y1 + 30, 640);
    desenho(ctx, lam, { x: L, y: yd, w: LW, h: BOT - yd });
  };

  // o número: dois cartões, o que já aconteceu (claro) e o que falta (escuro)
  P.MOLDE.numero = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [et, n1, r1, n2, r2] = lam.palavras;
    const y0 = pilula(ctx, et, L, TOP - 16);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 30, w: LW, h: 300 }, { sizes: [72, 66, 60, 56, 52], lh: 1.1 });
    const gap = 30, cw = (LW - gap) / 2, yc = a.y1 + 50, ch = Math.min(470, BOT - yc - 190);
    [[n1, r1, 'superficie'], [n2, r2, 'floresta']].forEach(([n, r, papel], i) => {
      if (!TX[n]) return;
      const x = L + i * (cw + gap), escuro = papel === 'floresta';
      cartao(ctx, x, yc, cw, ch, papel, 12 + i);
      P.bloco(ctx, n, { x: x + 30, y: yc + 24, w: cw - 60, h: ch * 0.6 }, { papel: 'numero', sizes: [260, 230, 200, 170, 140], align: 'center', valign: 'middle', cor: escuro ? 'marca' : 'texto', destaque: null });
      P.bloco(ctx, r, { x: x + 30, y: yc + ch * 0.64, w: cw - 60, h: ch * 0.32 }, { sizes: [46, 42, 38, 34], align: 'center', valign: 'middle', cor: escuro ? 'papel' : 'texto', destaque: null });
    });
    nota(ctx, f2, { x: L, y: yc + ch + 40, w: LW, h: BOT - (yc + ch + 40) });
  };

  P.MOLDE.mapa = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas;
    const y0 = pilula(ctx, lam.palavras[0], L, TOP - 16);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 26, w: LW, h: 250 }, { sizes: [64, 60, 56, 52, 48], lh: 1.1 });
    const hd = BOT - a.y1 - 24 - 200;
    desenho(ctx, lam, { x: L, y: a.y1 + 24, w: LW, h: hd }, lam.palavras.slice(1));
    nota(ctx, f2, { x: L, y: a.y1 + 54 + hd, w: LW, h: BOT - (a.y1 + 54 + hd) }, { sizes: [46, 42, 40, 38, 36] });
  };

  // por que é daqui: o vetor e o lugar (nunca as pessoas)
  P.MOLDE.porque = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas;
    const y0 = pilula(ctx, lam.palavras[0], L, TOP - 16);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 26, w: LW, h: 300 }, { sizes: [72, 66, 60, 56], lh: 1.1 });
    const b = nota(ctx, f2, { x: L, y: a.y1 + 30, w: LW, h: 150 });
    desenho(ctx, lam, { x: L, y: b.y1 + 30, w: LW, h: BOT - b.y1 - 30 }, lam.palavras.slice(1));
  };

  // sinais: dois cartões, um embaixo do outro, cada um com o nome, o desenho à esquerda e a frase à direita
  P.MOLDE.sinais = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [et, k1, k2] = lam.palavras;
    const y0 = pilula(ctx, et, L, TOP - 16);
    const gap = 30, yc0 = y0 + 20, ch = (BOT - yc0 - gap) / 2, dw = 380;
    [[f1, k1], [f2, k2]].forEach(([f, k], i) => {
      if (!TX[f]) return;
      const yc = yc0 + i * (ch + gap);
      cartao(ctx, L, yc, LW, ch, 'superficie', 14 + i);
      const yp = pilula(ctx, k, L + 30, yc + 28, { size: 28 });
      desenho(ctx, lam, { x: L + 30, y: yp - 6, w: dw, h: yc + ch - yp - 40 }, i);
      P.bloco(ctx, f, { x: L + dw + 70, y: yc + 40, w: LW - dw - 100, h: ch - 80 }, { sizes: [56, 52, 50, 48, 46, 44, 42, 40], lh: 1.18, valign: 'middle' });
    });
  };

  // prevenção: até três cartões, cada um com o desenho e o nome, e o detalhe embaixo
  P.MOLDE.prevencao = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, itens = lam.palavras.slice(1, 4);
    const y0 = pilula(ctx, lam.palavras[0], L, TOP - 16);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 26, w: LW, h: 260 }, { sizes: [80, 74, 68, 62, 56], lh: 1.08 });
    const n = Math.max(1, itens.length), gap = 24, cw = (LW - gap * (n - 1)) / n, yc = a.y1 + 40, ch = Math.min(380, BOT - yc - 240);
    itens.forEach((k, i) => {
      const x = L + i * (cw + gap);
      cartao(ctx, x, yc, cw, ch, 'superficie', 20 + i);
      desenho(ctx, lam, { x: x + 20, y: yc + 20, w: cw - 40, h: ch - 150 }, i);
      P.bloco(ctx, k, { x: x + 16, y: yc + ch - 124, w: cw - 32, h: 104 }, { sizes: [40, 36, 34, 32, 30], align: 'center', valign: 'middle', lh: 1.1, destaque: null });
    });
    nota(ctx, f2, { x: L, y: yc + ch + 40, w: LW, h: BOT - (yc + ch + 40) });
  };

  // gráfico: as barras saem dos valores escritos (pares D: rótulo, valor); a última barra é a de agora, no escuro
  P.MOLDE.grafico = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [et, ...pares] = lam.palavras;
    const y0 = pilula(ctx, et, L, TOP - 16);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 26, w: LW, h: 300 }, { sizes: [72, 66, 60, 56, 52], lh: 1.1 });
    const yc = a.y1 + 40, ch = Math.min(560, BOT - yc - 150);
    cartao(ctx, L, yc, LW, ch, 'superficie', 30);
    const n = Math.floor(pares.length / 2), vals = [];
    for (let i = 0; i < n; i++) vals.push(num(TX[pares[2 * i + 1]]));
    const max = Math.max(...vals, 1e-9), base = yc + ch - 96, topo = yc + 110, passo = (LW - 120) / Math.max(1, n), bw = Math.min(150, passo * 0.58);
    E.linha(ctx, [[L + 40, base], [L + LW - 40, base]], { lw: 4, seed: 31 });
    for (let i = 0; i < n; i++) {
      const x = L + 60 + passo * (i + 0.5), h = Math.max(8, (vals[i] / max) * (base - topo)), ultima = i === n - 1;
      E.ret(ctx, x - bw / 2, base - h, bw, h, Object.assign({ papel: ultima ? 'apoioEscuro' : 'apoio', r: 14, contorno: false, seed: 32 + i }, liso));
      if (TX[pares[2 * i + 1]]) E.texto(ctx, TX[pares[2 * i + 1]], x, base - h - 22, { papel: 'numero', size: 52, align: 'center' });
      if (TX[pares[2 * i]]) E.texto(ctx, TX[pares[2 * i]], x, base + 58, { papel: 'corpo', size: 40, align: 'center' });
    }
    nota(ctx, f2, { x: L, y: yc + ch + 40, w: LW, h: BOT - (yc + ch + 40) });
  };

  // quem notifica: a ficha de notificação e até três linhas (quem, quando, onde)
  P.MOLDE.notifica = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [et, ...itens] = lam.palavras;
    const y0 = pilula(ctx, et, L, TOP - 16);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 26, w: LW, h: 300 }, { sizes: [76, 70, 64, 58, 52], lh: 1.1 });
    const yc = a.y1 + 40, ch = Math.min(520, BOT - yc - 200);
    cartao(ctx, L, yc, LW, ch, 'superficie', 40);
    const fx = L + 40, fy = yc + 40, fw = 220, fh = ch - 80;
    E.ret(ctx, fx, fy, fw, fh, Object.assign({ papel: 'apoio', r: 16, seed: 41 }, liso));
    for (let i = 0; i < 5; i++) {
      const ly = fy + 50 + i * ((fh - 80) / 4);
      E.ret(ctx, fx + 24, ly - 14, 28, 28, Object.assign({ papel: 'superficie', r: 6, seed: 42 + i }, liso));
      if (i < 2) certo(ctx, fx + 38, ly, 1, 'apoioEscuro');
      E.linha(ctx, [[fx + 70, ly], [fx + fw - 24, ly]], { lw: 5, papel: 'apoioEscuro', seed: 48 + i });
    }
    const vivos = itens.filter((k) => TX[k]).slice(0, 3), hh = (ch - 80) / Math.max(1, vivos.length);
    vivos.forEach((k, i) => P.bloco(ctx, k, { x: L + 300, y: yc + 40 + i * hh, w: LW - 340, h: hh - 10 }, { sizes: [44, 40, 36, 32], valign: 'middle', destaque: null }));
    nota(ctx, f2, { x: L, y: yc + ch + 40, w: LW, h: BOT - (yc + ch + 40) });
  };

  // a fase: o caminho da de agora até a meta, com a pílula do "agora" em cima da primeira
  P.MOLDE.fase = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, ps = lam.palavras.filter((k) => TX[k]);
    const et = ps[0], fases = ps.slice(1, -1), agora = ps[ps.length - 1];
    const y0 = pilula(ctx, et, L, TOP - 16);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 26, w: LW, h: 300 }, { sizes: [84, 78, 72, 66, 60, 54], lh: 1.1 });
    const yc = a.y1 + 50, ch = Math.min(520, BOT - yc - 230);
    cartao(ctx, L, yc, LW, ch, 'superficie', 50);
    const yl = yc + ch * 0.5, x0 = L + 170, x1 = R - 170, n = Math.max(1, fases.length);
    const X = (i) => (n > 1 ? x0 + ((x1 - x0) * i) / (n - 1) : (x0 + x1) / 2);
    E.linha(ctx, [[x0, yl], [x1, yl]], { lw: 12, papel: 'apoio', seed: 51 });
    fases.forEach((k, i) => {
      const x = X(i), aqui = i === 0, meta = i === n - 1 && n > 1;
      if (meta) { E.linha(ctx, [[x, yl], [x, yl - 120]], { lw: 6, seed: 52 }); E.poligono(ctx, [[x, yl - 120], [x + 70, yl - 98], [x, yl - 76]], Object.assign({ papel: 'destaque', contorno: false, seed: 53 }, liso)); }
      E.circulo(ctx, x, yl, aqui ? 30 : 22, Object.assign({ papel: aqui ? 'floresta' : 'apoioEscuro', contorno: false, seed: 54 + i }, liso));
      P.bloco(ctx, k, { x: x - 150, y: yl + 52, w: 300, h: ch * 0.5 - 74 }, { sizes: [48, 44, 40, 36, 32], align: 'center', destaque: null, maxLinhas: 2 });
    });
    if (agora && fases.length) pilula(ctx, agora, X(0), yl - 130, { size: 30, centro: true });
    nota(ctx, f2, { x: L, y: yc + ch + 40, w: LW, h: BOT - (yc + ch + 40) }, { sizes: [54, 50, 46, 42, 40] });
  };

  // o cartão-resumo para print: um cartão claro, uma frase por faixa, com o certo na bolinha escura
  P.MOLDE.resumo = (ctx, lam) => {
    E.fundo(ctx);
    const fr = lam.linhas, [et, fontes] = lam.palavras;
    const y0 = pilula(ctx, et, L, TOP - 16);
    const yc = y0 + 20, ch = BOT - 120 - yc;
    cartao(ctx, L, yc, LW, ch, 'superficie', 60);
    const passo = (ch - 40) / Math.max(1, fr.length);
    fr.forEach((k, i) => {
      const y = yc + 20 + i * passo;
      if (i) E.linha(ctx, [[L + 40, y], [L + LW - 40, y]], { lw: 3, papel: 'apoio', seed: 61 + i });
      E.circulo(ctx, L + 76, y + passo / 2, 30, Object.assign({ papel: 'floresta', contorno: false, seed: 65 + i }, liso));
      certo(ctx, L + 76, y + passo / 2, 1.2, 'papel');
      P.bloco(ctx, k, { x: L + 136, y: y + 16, w: LW - 176, h: passo - 32 }, { papel: 'titulo', sizes: [54, 50, 46, 42, 38], lh: 1.1, valign: 'middle' });
    });
    P.fonte(ctx, fontes, { x: L, y: BOT - 84, w: LW, h: 84 }, { valign: 'bottom' });
  };

  // texto: a lâmina sem tipo próprio (a ideia grande e o detalhe)
  P.MOLDE.texto = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas;
    const y0 = pilula(ctx, lam.palavras[0], L, TOP - 16);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 40, w: LW, h: 420 }, { sizes: [84, 78, 72, 66, 60], lh: 1.1 });
    nota(ctx, f2, { x: L, y: a.y1 + 50, w: LW, h: BOT - a.y1 - 50 });
  };
})();
