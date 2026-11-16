// PRESEME · carrossel · tipo GUIA DE BOLSO · os moldes de lâmina e o kit do guia (FIXO: não muda de peça para peça).
// O guia de bolso é o carrossel para salvar e consultar na hora: um procedimento da visita, passo a passo, o erro comum,
// o que é da equipe, quando chamar o 192 e o cartão-resumo para print. Um molde por tipo de lâmina (o score.js diz qual
// lâmina usa qual): PRESEME.MOLDE[tipo]. O desenho de cada lâmina é PRESEME.DESENHO[lam.desenho](ctx, caixa, lam, ...):
// as cenas prontas do guia ficam aqui (visita, espera, equipe, telefone, troque), e os desenhos do assunto ficam na peça,
// em film-3-desenhos.js, que carrega depois e pode trocar qualquer cena daqui. As peças pequenas (copo, relógio, cadeira,
// rosto, gota, lupa...) ficam em PRESEME.KIT para a peça usar. Em toda lâmina, lam.palavras[0] é a etiqueta.
// Desenho parado; estilo padrão: planta técnica. Assinatura do tipo: a etiqueta em quadro de planta (o "carimbo" do
// desenho técnico, em cima à esquerda), a trilha dos passos embaixo das lâminas de passo e o cartão de recortar.
// Gente: o calouro (quem lê, na visita), a moradora e a agente (ACS). Nunca desenhe alguém desacordado recebendo comida
// ou bebida.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, DS = P.DESENHO, SC = globalThis.SCORE, G = globalThis.G;
  const { L, R, TOP, BOT } = P;
  const LW = R - L;
  const RAD = Math.PI / 180;
  const decor = (fn) => G.decor(fn);
  const liso = { hachura: false, sombra: false };
  const arco = (x, y, r, a0, a1, n = 24) => { const p = []; for (let i = 0; i <= n; i++) { const a = (a0 + ((a1 - a0) * i) / n) * RAD; p.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return p; };

  // ---------- o kit: peças pequenas que servem a qualquer guia (PRESEME.KIT) ----------
  // um ícone desenhado num quadrado de D × D em volta de (0, 0), posto no meio da caixa
  function icone(ctx, cx, fn, D = 200) {
    const s = Math.min(cx.w, cx.h) / D;
    ctx.save(); ctx.translate(cx.x + cx.w / 2, cx.y + cx.h / 2); ctx.scale(s, s); fn(); ctx.restore();
  }

  // ---------- peças pequenas (servem a várias lâminas) ----------
  // a gota (de sangue, Coral; de suor, em outra cor): x, y é o centro da parte redonda, a ponta para cima
  function gota(ctx, x, y, r, o = {}) {
    const pts = [[x, y - r * 2.1]];
    for (let a = -28; a <= 208; a += 11.8) pts.push([x + Math.cos(a * RAD) * r, y + Math.sin(a * RAD) * r]);
    E.poligono(ctx, pts, Object.assign({ papel: 'alerta', seed: 61 }, liso, o));
  }
  // o copo: x é o centro, y é o fundo. liquido: a cor do que tem dentro; nivel: até onde vai; colher: a colher de açúcar
  // em cima; bolhas: o refrigerante; laranja: a rodela na borda
  function copo(ctx, x, y, s, o = {}) {
    const wt = 66 * s, wb = 52 * s, h = 170 * s, nv = o.nivel ?? 0.72;
    const corpo = [[x - wt, y - h], [x + wt, y - h], [x + wb, y], [x - wb, y]];
    E.poligono(ctx, corpo, Object.assign({ papel: 'superficie', contorno: false, seed: 70 }, liso));
    const yl = y - h * nv, wl = wb + (wt - wb) * nv;
    E.poligono(ctx, [[x - wl, yl], [x + wl, yl], [x + wb, y], [x - wb, y]], Object.assign({ papel: o.liquido || 'apoio', contorno: false, seed: 71 }, liso));
    if (o.bolhas) for (let i = 0; i < 7; i++) E.circulo(ctx, x - wb * 0.55 + (i % 3) * wb * 0.55, y - 20 * s - i * 15 * s, (5 + (i % 2) * 3) * s, Object.assign({ papel: 'superficie', lw: 2, seed: 72 + i }, liso));
    E.poligono(ctx, corpo, Object.assign({ papel: null, seed: 73 }, liso));
    if (o.laranja) {
      const lx = x + wt - 8 * s, ly = y - h - 2 * s, lr = 38 * s;
      E.circulo(ctx, lx, ly, lr, Object.assign({ papel: 'alerta', seed: 75 }, liso));
      for (let i = 0; i < 6; i++) { const a = i * 60 * RAD; E.linha(ctx, [[lx, ly], [lx + Math.cos(a) * lr * 0.78, ly + Math.sin(a) * lr * 0.78]], { papel: 'superficie', lw: 3, seed: 76 + i }); }
    }
    if (o.colher) {
      const bx = x - 6 * s, by = y - h - 46 * s;
      E.linha(ctx, [[bx + 24 * s, by - 2 * s], [bx + 120 * s, by - 52 * s]], { lw: 9 * s + 2, seed: 80 });
      E.circulo(ctx, bx, by, 34 * s, Object.assign({ ry: 15 * s, papel: 'superficie', seed: 81 }, liso));
      E.poligono(ctx, [[bx - 30 * s, by - 2 * s], [bx - 4 * s, by - 30 * s], [bx + 24 * s, by - 2 * s]], Object.assign({ papel: 'superficie', lw: 3, seed: 82 }, liso));
      for (let i = 0; i < 3; i++) E.ret(ctx, bx - 8 * s + i * 9 * s, by + 24 * s + i * 15 * s, 7 * s, 7 * s, Object.assign({ papel: 'tinta', r: 1, contorno: false, seed: 83 + i }, liso));
    }
  }
  // o relógio: x, y é o centro. de/ate: os minutos da fatia marcada; hora: o ponteiro pequeno; ponteiro: o grande
  function relogio(ctx, x, y, r, o = {}) {
    E.circulo(ctx, x, y, r, { papel: 'superficie', seed: 180 });
    if (o.ate) E.poligono(ctx, [[x, y], ...arco(x, y, r - 10, -90 + (o.de || 0) * 6, -90 + o.ate * 6, 18)], Object.assign({ papel: 'destaque', contorno: false, seed: 181 }, liso));
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 - 90) * RAD, r0 = i % 3 ? r * 0.86 : r * 0.76;
      E.linha(ctx, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95]], { lw: i % 3 ? 3 : 6, seed: 182 + i });
    }
    const am = (-90 + (o.ponteiro ?? o.ate ?? 0) * 6) * RAD, ah = (-90 + (o.hora ?? 0) * 30) * RAD;
    E.linha(ctx, [[x, y], [x + Math.cos(ah) * r * 0.5, y + Math.sin(ah) * r * 0.5]], { lw: 11, seed: 195 });
    E.linha(ctx, [[x, y], [x + Math.cos(am) * r * 0.8, y + Math.sin(am) * r * 0.8]], { lw: 6, seed: 196 });
    E.circulo(ctx, x, y, 9, Object.assign({ papel: 'tinta', contorno: false, seed: 197 }, liso));
  }
  // a volta (seta em arco em volta de um ponto), de a0 a a1 graus
  function volta(ctx, x, y, r, a0, a1) {
    const pts = arco(x, y, r, a0, a1, 40);
    E.linha(ctx, pts.slice(0, -3), { lw: 6, seed: 200 });
    E.seta(ctx, pts[pts.length - 4], pts[pts.length - 1], { curva: 0, lw: 6, cabeca: 26, seed: 201 });
  }
  // a cadeira, de frente: x é o centro, hip é o assento, chao é o chão (vai antes da pessoa sentada)
  function cadeira(ctx, x, hip, chao, s) {
    E.ret(ctx, x - 92 * s, hip - 250 * s, 184 * s, 250 * s, { papel: 'apoio', r: 18 * s, seed: 210 });
    for (const sd of [-1, 1]) E.linha(ctx, [[x + sd * 92 * s, hip + 20 * s], [x + sd * 100 * s, chao]], { lw: 8, seed: 211 + sd });
    E.ret(ctx, x - 112 * s, hip - 6 * s, 224 * s, 34 * s, { papel: 'apoioEscuro', r: 10 * s, seed: 214 });
  }
  // o rosto dos ícones: pele (cor), boca 'reta' ou 'triste'
  function rosto(ctx, x, y, r, o = {}) {
    E.circulo(ctx, x, y, r, Object.assign({ papel: o.pele || 'pele', seed: o.seed || 100 }, liso));
    for (const sd of [-1, 1]) E.circulo(ctx, x + sd * r * 0.36, y - r * 0.1, r * 0.09, Object.assign({ papel: 'tinta', contorno: false, seed: 101 + sd }, liso));
    const yb = y + r * 0.42;
    if (o.boca === 'triste') E.linha(ctx, arco(x, yb + r * 0.3, r * 0.34, 220, 320, 10), { lw: 5, seed: 104 });
    else E.linha(ctx, [[x - r * 0.28, yb], [x + r * 0.28, yb]], { lw: 5, seed: 104 });
  }
  function lupa(ctx, x, y, r) {
    E.linha(ctx, [[x + r * 0.7, y + r * 0.7], [x + r * 1.7, y + r * 1.7]], { lw: 18, papel: 'apoioEscuro', seed: 250 });
    E.circulo(ctx, x, y, r, Object.assign({ papel: 'apoio', seed: 251, alpha: 0.8 }, liso));
  }
  P.KIT = { RAD, liso, arco, decor, icone, gota, copo, relogio, volta, cadeira, rosto, lupa };

  // ajudantes do cartão-resumo (o molde resumo chama): o certo e a tesoura do recorte
  DS.certo = (ctx, x, y, s = 1, papel = 'apoioEscuro') => E.linha(ctx, [[x - 22 * s, y], [x - 6 * s, y + 18 * s], [x + 26 * s, y - 22 * s]], { papel, lw: 9 * s, seed: 240 });
  DS.tesoura = (ctx, x, y, s = 1) => {
    ctx.save(); ctx.fillStyle = E.cor('fundo'); ctx.fillRect(x - 50 * s, y - 32 * s, 100 * s, 64 * s); ctx.restore();
    for (const sd of [-1, 1]) {
      E.linha(ctx, [[x - 30 * s, y + sd * 16 * s], [x + 44 * s, y - sd * 8 * s]], { lw: 6 * s, seed: 241 + sd });
      E.circulo(ctx, x - 38 * s, y + sd * 18 * s, 13 * s, Object.assign({ papel: 'superficie', lw: 3, seed: 243 + sd }, liso));
    }
  };

  // ---------- as cenas prontas do guia (desenhos de lâmina que servem a qualquer guia; a peça pode trocar qualquer
  // uma, dando o mesmo nome em film-3-desenhos.js, que carrega depois deste) ----------
  // visita: o calouro (quem lê) oferece o copo à moradora, sentada, acordada e engolindo
  DS.visita = (ctx, cx) => {
    const s = Math.min(0.82, (cx.h - 10) / 520), chao = cx.y + cx.h - 6;
    E.linha(ctx, [[cx.x, chao], [cx.x + cx.w, chao]], { lw: 4, seed: 270 });
    const mx = cx.x + cx.w * 0.7, hip = chao - 176 * s;
    cadeira(ctx, mx, hip, chao, s);
    E.personagem(ctx, { quem: 'moradora', x: mx, y: hip, s, pose: 'sit', look: -1, mouth: 'flat', sweat: 0.8, handL: [-128, -80], seed: 271 });
    const px = cx.x + cx.w * 0.27, mao = [158, -218];
    E.personagem(ctx, { quem: 'calouro', x: px, y: chao, s, pose: 'stand', look: 1, mouth: 'smile', handR: mao, seed: 272 });
    copo(ctx, px + (mao[0] + 18) * s, chao + (mao[1] + 52) * s, 0.62, {});
  };

  // espera: a moradora em repouso e o relógio com a fatia dos minutos. marcas: [o tempo escrito embaixo do relógio;
  // o número dele vira a fatia, em minutos]
  DS.espera = (ctx, cx, lam, marcas = []) => {
    const s = Math.min(0.82, (cx.h - 10) / 520), chao = cx.y + cx.h - 6;
    E.linha(ctx, [[cx.x, chao], [cx.x + cx.w * 0.48, chao]], { lw: 4, seed: 280 });
    const mx = cx.x + cx.w * 0.24, hip = chao - 176 * s;
    cadeira(ctx, mx, hip, chao, s);
    E.personagem(ctx, { quem: 'moradora', x: mx, y: hip, s, pose: 'sit', look: 1, mouth: 'flat', seed: 281 });
    const lbl = marcas[0] && TX[marcas[0]], r = Math.min(160, (cx.h - (lbl ? 110 : 20)) / 2), rx = cx.x + cx.w * 0.72, ry = cx.y + r + 10;
    const min = Math.min(60, parseFloat(String(lbl || '').replace(',', '.')) || 0);
    relogio(ctx, rx, ry, r, { de: 0, ate: min, hora: 12 });
    if (lbl) E.texto(ctx, lbl, rx, ry + r + 76, { papel: 'numero', size: 60, align: 'center' });
  };

  // equipe: o calouro conta à agente (ACS), que anota na prancheta; a folha e a lupa de quem investiga
  DS.equipe = (ctx, cx) => {
    const s = Math.min(0.85, (cx.h - 10) / 520), chao = cx.y + cx.h - 6;
    E.linha(ctx, [[cx.x, chao], [cx.x + cx.w * 0.6, chao]], { lw: 4, seed: 260 });
    const ax = cx.x + cx.w * 0.15, bx = cx.x + cx.w * 0.43, mao = [-100, -222];
    E.personagem(ctx, { quem: 'calouro', x: ax, y: chao, s, pose: 'stand', look: 1, mouth: 'smile', handR: [110, -202], seed: 261 });
    E.personagem(ctx, { quem: 'agente', x: bx, y: chao, s, pose: 'stand', look: -1, mouth: 'smile', handL: mao, seed: 262 });
    E.objeto(ctx, 'prancheta', { x: bx + mao[0] * s, y: chao + mao[1] * s, s: s * 1.1, rot: 0.12 });
    const fx = cx.x + cx.w * 0.66, fy = cx.y + 30, fw = 240, fh = Math.min(320, cx.h - 60);
    E.ret(ctx, fx, fy, fw, fh, { papel: 'superficie', r: 10, seed: 263 });
    for (let i = 0; i < 6; i++) E.linha(ctx, [[fx + 30, fy + 50 + i * 42], [fx + fw - (i % 2 ? 70 : 30), fy + 50 + i * 42]], { lw: 4, seed: 264 + i });
    lupa(ctx, fx + fw * 0.6, fy + fh * 0.55, 66);
  };

  // telefone (lâmina urgência, escura): o celular com o número na tela e o sinal da chamada. marcas: [o número]
  DS.telefone = (ctx, cx, lam, marcas = []) => {
    const h = Math.min(cx.h - 20, 450), w = h * 0.56, x = cx.x + cx.w / 2 - w / 2, y = cx.y + (cx.h - h) / 2;
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
      const ox = sd > 0 ? x + w + 10 : x - 10;
      E.linha(ctx, arco(ox, y + 90, 60 + i * 46, sd > 0 ? -60 : 190, sd > 0 ? -10 : 240, 14), { papel: 'marca', lw: 7, seed: 400 + i + (sd > 0 ? 10 : 0) });
    }
    E.ret(ctx, x, y, w, h, { papel: 'noite', tinta: 'papel', r: 46, lw: 6, hachura: false, seed: 410 });
    const sx = x + 24, sy = y + 64, sw = w - 48, sh = h - 180;
    E.ret(ctx, sx, sy, sw, sh, Object.assign({ papel: 'folha', tinta: 'papel', r: 18, lw: 3, seed: 411 }, liso));
    if (marcas[0] && TX[marcas[0]]) E.texto(ctx, TX[marcas[0]], x + w / 2, sy + sh / 2 + 38, { papel: 'numero', size: 108, align: 'center', cor: 'marca' });
    E.circulo(ctx, x + w / 2, y + h - 62, 36, Object.assign({ papel: 'salvia', tinta: 'papel', seed: 412 }, liso));
    E.ret(ctx, x + w / 2 - 34, y + 24, 68, 12, Object.assign({ papel: 'papel', r: 6, contorno: false, seed: 413 }, liso));
  };

  // troque: o lugar do desenho que a peça ainda não fez (aparece tracejado, com o aviso; nunca vai para o ar)
  DS.troque = (ctx, cx) => {
    E.ret(ctx, cx.x + 10, cx.y + 10, cx.w - 20, cx.h - 20, Object.assign({ papel: null, r: 24, lw: 4, seed: 700 }, liso));
    E.linha(ctx, [[cx.x + 40, cx.y + 40], [cx.x + cx.w - 40, cx.y + cx.h - 40]], { lw: 3, tracejado: true, seed: 701 });
    E.linha(ctx, [[cx.x + cx.w - 40, cx.y + 40], [cx.x + 40, cx.y + cx.h - 40]], { lw: 3, tracejado: true, seed: 702 });
    const aviso = cx.w >= 420 ? 'TROQUE · desenho da peça' : 'TROQUE', z = Math.min(34, (cx.w - 40) / (aviso.length * 0.62));
    decor(() => E.texto(ctx, aviso, cx.x + cx.w / 2, cx.y + cx.h / 2 + z * 0.36, { papel: 'numero', size: z, align: 'center' }));
  };

  // ---------- os moldes de lâmina ----------
  // a etiqueta: um quadro fino com o nome da lâmina em letra de prancheta (longe do contador do Instagram)
  function etiqueta(ctx, k, { x = L, y = TOP - 16, cor = 'texto', tinta = 'tinta' } = {}) {
    if (!TX[k]) return y;
    const s = TX[k].toUpperCase(), z = 30, w = E.medir(ctx, s, { papel: 'numero', size: z }) + 44, hh = z + 30;
    E.ret(ctx, x, y, w, hh, { papel: null, tinta, r: 4, lw: 3, hachura: false, sombra: false, seed: 5 });
    E.linha(ctx, [[x + 16, y + hh], [x + 16, y + hh + 18]], { papel: tinta, lw: 3, seed: 6 });
    E.texto(ctx, s, x + 22, y + hh / 2 + z * 0.36, { papel: 'numero', size: z, cor });
    return y + hh + 18;
  }
  // o desenho da peça na caixa dela (sem desenho, nada)
  function desenho(ctx, lam, cx, ...mais) {
    const f = lam.desenho && DS[lam.desenho];
    if (f && cx.w > 40 && cx.h > 40) f(ctx, cx, lam, ...mais);
  }
  // o porquê: nota de margem, com o fio à esquerda
  function nota(ctx, k, cx, o = {}) {
    if (!TX[k]) return { y1: cx.y };
    const r = P.bloco(ctx, k, { x: cx.x + 34, y: cx.y, w: cx.w - 34, h: cx.h }, Object.assign({ sizes: [50, 46, 42, 40, 38, 36] }, o));
    E.linha(ctx, [[cx.x + 6, r.y0 + 4], [cx.x + 6, r.y1 + 4]], { papel: o.fio || 'alerta', lw: 6, seed: 9 });
    return r;
  }
  // a trilha dos passos: um ponto por lâmina de passo, o da vez no destaque, os já feitos cheios
  function trilha(ctx, lam, y = BOT - 24) {
    const passos = SC.LAMINAS.filter((l) => l.tipo === 'passo');
    const i = passos.findIndex((l) => l.n === lam.n);
    if (i < 0 || passos.length < 2) return;
    const passo = Math.min(120, (LW - 80) / (passos.length - 1)), x0 = L + 30;
    E.linha(ctx, [[x0, y], [x0 + passo * (passos.length - 1), y]], { lw: 4, seed: 12 });
    passos.forEach((_, j) => {
      const papel = j === i ? 'destaque' : j < i ? 'apoioEscuro' : 'superficie';
      E.circulo(ctx, x0 + j * passo, y, j === i ? 24 : 16, { papel, hachura: false, sombra: false, seed: 13 + j });
    });
  }

  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx);
    const [t1, t2] = lam.linhas;
    const y0 = etiqueta(ctx, lam.palavras[0]);
    const a = P.titulo(ctx, t1, { x: L, y: y0 + 40, w: LW, h: 480 }, { sizes: [100, 92, 86, 80, 74, 68, 62], lh: 1.08 });
    const b = P.bloco(ctx, t2, { x: L, y: a.y1 + 34, w: LW, h: 150 }, { sizes: [52, 48, 44, 40] });
    const yd = Math.max(b.y1 + 40, 700);
    desenho(ctx, lam, { x: L, y: yd, w: LW, h: BOT - yd });
  };

  P.MOLDE.conceito = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas;
    const y0 = etiqueta(ctx, lam.palavras[0]);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 34, w: LW, h: 300 }, { sizes: [84, 78, 72, 66, 60], lh: 1.1 });
    const hd = Math.max(380, Math.min(520, BOT - a.y1 - 80 - 250));
    desenho(ctx, lam, { x: L, y: a.y1 + 40, w: LW, h: hd }, lam.palavras.slice(1));
    nota(ctx, f2, { x: L, y: a.y1 + 80 + hd, w: LW, h: BOT - (a.y1 + 80 + hd) }, { sizes: [54, 50, 46, 42, 40, 38] });
  };

  P.MOLDE.sinais = (ctx, lam) => {
    E.fundo(ctx);
    const [f1] = lam.linhas, itens = lam.palavras.slice(1, 7);
    const y0 = etiqueta(ctx, lam.palavras[0]);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 30, w: LW, h: 190 }, { sizes: [68, 62, 58, 54, 50], lh: 1.1 });
    const lin = Math.ceil(itens.length / 2), gap = 26, cw = (LW - gap) / 2, y1 = a.y1 + 46;
    const ch = Math.min(260, (BOT - y1 - gap * (lin - 1)) / Math.max(1, lin));
    itens.forEach((k, i) => {
      const x = L + (i % 2) * (cw + gap), y = y1 + Math.floor(i / 2) * (ch + gap);
      E.ret(ctx, x, y, cw, ch, { papel: 'superficie', r: 22, hachura: false, seed: 20 + i });
      desenho(ctx, lam, { x: x + 14, y: y + 14, w: 170, h: ch - 28 }, i);
      P.bloco(ctx, k, { x: x + 196, y: y + 18, w: cw - 214, h: ch - 36 }, { sizes: [48, 44, 40, 36, 32], valign: 'middle', lh: 1.12 });
    });
  };

  P.MOLDE.passo = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas;
    const y0 = etiqueta(ctx, lam.palavras[0]);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 34, w: LW, h: 300 }, { sizes: [80, 74, 68, 62, 58, 54], lh: 1.1 });
    const b = nota(ctx, f2, { x: L, y: a.y1 + 34, w: LW, h: 170 });
    const yd = b.y1 + 40;
    desenho(ctx, lam, { x: L, y: yd, w: LW, h: BOT - 90 - yd }, lam.palavras.slice(1));
    trilha(ctx, lam);
  };

  // texto: a lâmina sem tipo próprio (a ideia grande e o detalhe), para o que não couber nos outros tipos
  P.MOLDE.texto = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas;
    const y0 = etiqueta(ctx, lam.palavras[0]);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 40, w: LW, h: 420 }, { sizes: [84, 78, 72, 66, 60], lh: 1.1 });
    nota(ctx, f2, { x: L, y: a.y1 + 50, w: LW, h: BOT - a.y1 - 50 });
  };

  P.MOLDE.opcoes = (ctx, lam) => {
    E.fundo(ctx);
    const [f1] = lam.linhas, itens = lam.palavras.slice(1, 5);
    const y0 = etiqueta(ctx, lam.palavras[0]);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 30, w: LW, h: 190 }, { sizes: [66, 60, 56, 52, 48], lh: 1.1 });
    const gap = 26, cw = (LW - gap) / 2, y1 = a.y1 + 40, ch = (BOT - y1 - gap) / 2;
    itens.forEach((k, i) => {
      const x = L + (i % 2) * (cw + gap), y = y1 + Math.floor(i / 2) * (ch + gap);
      E.ret(ctx, x, y, cw, ch, { papel: 'superficie', r: 22, hachura: false, seed: 30 + i });
      desenho(ctx, lam, { x: x + 20, y: y + 16, w: cw - 40, h: ch * 0.56 }, i);
      P.bloco(ctx, k, { x: x + 24, y: y + ch * 0.6, w: cw - 48, h: ch * 0.36 }, { sizes: [40, 36, 34, 32, 30], align: 'center', valign: 'middle', lh: 1.12, maxLinhas: 3 });
    });
  };

  P.MOLDE.erro = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas;
    const y0 = etiqueta(ctx, lam.palavras[0]);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 34, w: LW, h: 250 }, { sizes: [80, 74, 68, 62, 58], lh: 1.1 });
    const hd = 440;
    desenho(ctx, lam, { x: L, y: a.y1 + 40, w: LW, h: hd });
    nota(ctx, f2, { x: L, y: a.y1 + 80 + hd, w: LW, h: BOT - (a.y1 + 80 + hd) });
  };

  P.MOLDE.equipe = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas;
    const y0 = etiqueta(ctx, lam.palavras[0]);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 34, w: LW, h: 220 }, { sizes: [92, 84, 76, 68, 60], lh: 1.08 });
    const hd = 470;
    desenho(ctx, lam, { x: L, y: a.y1 + 30, w: LW, h: hd });
    nota(ctx, f2, { x: L, y: a.y1 + 70 + hd, w: LW, h: BOT - (a.y1 + 70 + hd) }, { sizes: [56, 52, 48, 44, 40] });
  };

  // a urgência é a única lâmina escura do guia: o 192 tem de saltar quando a pessoa passa o dedo
  P.MOLDE.urgencia = (ctx, lam) => {
    E.fundo(ctx, { tipo: 'escuro' });
    const [f1, f2] = lam.linhas;
    const escuro = E.escuro() ? {} : { cor: 'papel', corTrecho: 'marca' };
    const y0 = etiqueta(ctx, lam.palavras[0], E.escuro() ? {} : { cor: 'papel', tinta: 'papel' });
    const hd = 470;
    desenho(ctx, lam, { x: L, y: y0 + 20, w: LW, h: hd }, lam.palavras.slice(1));
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 60 + hd, w: LW, h: 300 }, Object.assign({ sizes: [76, 70, 64, 58, 54], lh: 1.1 }, escuro));
    P.bloco(ctx, f2, { x: L, y: a.y1 + 34, w: LW, h: BOT - a.y1 - 34 }, Object.assign({ sizes: [48, 44, 40, 36] }, E.escuro() ? {} : { cor: 'salvia' }));
  };

  // o cartão-resumo para print: um cartão com o recorte tracejado em volta e a tesoura no canto
  P.MOLDE.resumo = (ctx, lam) => {
    E.fundo(ctx);
    const fr = lam.linhas, [et, fontes] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    const cx = { x: L + 20, y: y0 + 40, w: LW - 40, h: BOT - y0 - 170 };
    const corte = 22, pts = [[cx.x - corte, cx.y - corte], [cx.x + cx.w + corte, cx.y - corte], [cx.x + cx.w + corte, cx.y + cx.h + corte], [cx.x - corte, cx.y + cx.h + corte], [cx.x - corte, cx.y - corte]];
    E.linha(ctx, pts, { lw: 4, seed: 41, tracejado: true });
    DS.tesoura && DS.tesoura(ctx, cx.x + 90, cx.y - corte, 0.9);
    E.ret(ctx, cx.x, cx.y, cx.w, cx.h, { papel: 'superficie', r: 18, hachura: false, seed: 42 });
    const passo = (cx.h - 60) / Math.max(1, fr.length);
    fr.forEach((k, i) => {
      const y = cx.y + 30 + i * passo;
      if (i) E.linha(ctx, [[cx.x + 40, y - 6], [cx.x + cx.w - 40, y - 6]], { lw: 2.5, seed: 43 + i, tracejado: true });
      DS.certo && DS.certo(ctx, cx.x + 64, y + passo / 2 - 4, 1.1);
      P.bloco(ctx, k, { x: cx.x + 120, y: y + 10, w: cx.w - 160, h: passo - 20 }, { papel: 'titulo', sizes: [56, 52, 48, 44, 40, 36], lh: 1.1, valign: 'middle' });
    });
    P.fonte(ctx, fontes, { x: L, y: BOT - 80, w: LW, h: 84 }, { cor: 'apoioEscuro', valign: 'bottom' });
  };
})();
