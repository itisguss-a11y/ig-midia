// PRESEME · motor "linha do tempo" · exemplo: como o SUS nasceu · desenho 2/3 · o que é só desta peça
// O chat 1 (Fable) escreve este arquivo para cada peça: os destaques do texto (DESTAQUE) e o desenho do cartão de cada marco
// (CARTAO[id]). O molde (film-1-molde.js) põe em volta a linha, os anos, os rótulos, a câmera e a frase.
// Cada CARTAO recebe (ctx, box, st, info): box é o cartão em unidades de desenho (780 × 540; o canto de cima à esquerda é
// 0, 0; o molde amplia 1,1 vezes); info.fase é a frase da cena que está na tela (0 é a primeira; -1, antes dela; 99, cartão
// de marco que já passou) e info.kf, há quantos segundos ela apareceu. Cores e letras vêm do kit (E.cor, E.texto...): o
// cartão sai em qualquer estilo. Letra dentro do cartão: 36 ou mais (no celular, menor que isso não se lê). Letra em cima de
// preenchimento claro (apoio, destaque) vai com cor: 'floresta', para se ler também na lousa (giz).
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, Ch = globalThis.Ch, M = globalThis.LINHA;
  const { D } = M;
  const cor = (p) => E.cor(p);
  const PEC = { DESTAQUE: {}, CARTAO: {}, CENA: {} };
  globalThis.PECA = PEC;

  PEC.DESTAQUE = { 1: 'qualquer pessoa', 3: 'mais de quatro mil pessoas', 4: 'sistema único de saúde', 5: 'proposta de saúde', 6: 'direito de todos e dever do Estado', 7: 'universal e igualitário', 8: 'prioridade à prevenção', 9: 'Roraima', 10: 'Lei 8.080', 11: 'vetado', 12: 'Lei 8.142', 13: 'a cada quatro anos', 14: 'até no dinheiro', 15: 'todos os outros juntos', 16: 'direito dele', 17: 'conselho de saúde', 19: 'participação e do repasse de dinheiro' };

  // as ajudas do molde (LINHA.KIT): ap e tf (o tempo de cada frase), texto (dentro do cartão), chao, pessoa, gente, documento, mapaRR
  const { ap, tf, texto, chao, PELE, CABELO, pessoa, gente, documento, mapaRR } = M.KIT;
  // Seu Antônio (o caso da peça): pele morena, cabelo branco, bigode, óculos redondos, camisa Sálvia
  const ANTONIO = { skin: '#A86E4B', hair: '#E8E4DA', hairStyle: 'short', facialHair: 'mustache', glasses: 'round', outfit: 'shirt', shirt: '#B5D8C0', trim: '#30724E', collar: '#B5D8C0', bottoms: 'pants', shorts: '#17402C', shoes: '#072618', build: 'regular' };
  const PROFISSIONAL = { skin: '#DBA27E', hair: CABELO, hairStyle: 'bun', outfit: 'shirt', shirt: '#FFFDF6', trim: '#30724E', collar: '#FFFDF6', bottoms: 'pants', shorts: '#30724E', shoes: '#072618', build: 'slim' };
  // gente pequena, em fileiras (a multidão da conferência), entrando de trás para a frente
  function multidao(ctx, x0, y0, w, filas, k, seed = 900) {
    for (let f = 0; f < filas; f++) {
      const n = 9 + f, y = y0 + f * 50, esc = 0.8 + 0.1 * f;
      for (let i = 0; i < n; i++) {
        const q = (f * 13 + i) / (filas * 13 + 12);
        if (q > k) continue;
        const x = x0 + ((i + 0.5 + (f % 2) * 0.4) / n) * w;
        G.ellipse(ctx, x, y + 28 * esc, 24 * esc, 17 * esc, { fill: cor(i % 3 ? 'apoio' : 'apoioEscuro'), stroke: cor('tinta'), lw: 2.5, seed: seed + f * 31 + i });
        G.ellipse(ctx, x, y, 14 * esc, 15 * esc, { fill: PELE[(i + f) % PELE.length], stroke: cor('tinta'), lw: 2.5, seed: seed + 500 + f * 31 + i });
      }
    }
  }
  // ---------- os cartões ----------
  const C = PEC.CARTAO;

  // hoje: na pergunta, Seu Antônio chega à UBS; no presente, é atendido ([16]) e o conselho de saúde ([17])
  C.hoje = (ctx, box, st, info) => {
    const { w, h } = box, piso = h - 64;
    if (info.cena !== 'hoje') {
      chao(ctx, piso, w);
      const ux = 330, uw = 400, uh = 320; // a UBS
      E.poligono(ctx, [[ux - 20, piso - uh + 4], [ux + uw / 2, piso - uh - 70], [ux + uw + 20, piso - uh + 4]], { papel: 'apoioEscuro', seed: 601, sombra: false });
      E.ret(ctx, ux, piso - uh, uw, uh, { papel: 'superficie', r: 6, seed: 602, sombra: false });
      E.ret(ctx, ux + 115, piso - uh + 22, 170, 76, { papel: 'destaque', r: 10, seed: 603, sombra: false });
      texto(ctx, D('D10'), ux + 200, piso - uh + 78, { papel: 'titulo', size: 54, cor: 'floresta' });
      E.ret(ctx, ux + 34, piso - 170, 100, 90, { papel: 'apoio', r: 4, seed: 604, sombra: false });
      E.ret(ctx, ux + 262, piso - 200, 100, 200, { papel: 'sombra', r: 4, seed: 605, sombra: false, hachura: false }); // a porta aberta
      E.ret(ctx, ux + 262, piso - 200, 28, 200, { papel: 'apoio', r: 4, seed: 606, sombra: false });
      const an = Ch.walk(st.t, { x0: -90, speed: 150, t0: 0.2, stride: 220, s: 0.66 }); // Seu Antônio chega andando
      const parou = an.x >= 230, x = parou ? 230 : an.x;
      pessoa(ctx, { x, y: piso, s: 0.66, style: ANTONIO, pose: parou ? 'stand' : 'walk', walk: an.walk, look: 0.6, mouth: 'flat', seed: 710 });
      return;
    }
    // no presente: dentro da UBS, na consulta
    const k17 = ap(info, 1, 0.6);
    ctx.save(); ctx.globalAlpha *= 1 - k17;
    chao(ctx, piso, w);
    E.ret(ctx, 270, 40, 260, 150, { papel: 'superficie', r: 6, seed: 620, sombra: true }); // o quadro na parede
    texto(ctx, D('D12'), 400, 110, { papel: 'titulo', size: 50 });
    texto(ctx, D('D07'), 400, 166, { size: 36 });
    E.ret(ctx, 250, piso - 160, 300, 24, { papel: 'apoioEscuro', r: 6, seed: 621, sombra: false }); // a mesa
    E.linha(ctx, [[280, piso - 136], [280, piso]], { lw: 6, seed: 622 }); E.linha(ctx, [[520, piso - 136], [520, piso]], { lw: 6, seed: 623 });
    for (const [x, s2] of [[170, 1], [630, -1]]) { E.ret(ctx, x - 60, piso - 96, 120, 18, { papel: 'apoio', r: 4, seed: 624 + s2, sombra: false }); E.linha(ctx, [[x - 50, piso - 78], [x - 50, piso]], { lw: 5, seed: 626 + s2 }); E.linha(ctx, [[x + 50, piso - 78], [x + 50, piso]], { lw: 5, seed: 628 + s2 }); } // as cadeiras
    pessoa(ctx, { x: 170, y: piso - 96, s: 0.62, style: ANTONIO, pose: 'sit', look: 0.7, mouth: 'smile', seed: 711 });
    pessoa(ctx, { x: 630, y: piso - 96, s: 0.62, style: PROFISSIONAL, pose: 'sit', look: -0.7, mouth: 'smile', seed: 712, gesture: tf(info, 0) > 1.2 ? 'thumbsUp' : null });
    ctx.restore();
    if (k17 > 0) conselho(ctx, box, k17);
  };
  // o conselho de saúde, visto de cima: metade dos lugares é dos usuários (destaque); a outra metade, dos outros três segmentos
  function conselho(ctx, box, k) {
    const { w, h } = box, mx = 250, my = h / 2 + 20;
    ctx.save(); ctx.globalAlpha *= k;
    texto(ctx, D('D30'), w / 2, 64, { papel: 'titulo', size: 46 });
    E.circulo(ctx, mx, my, 120, { papel: 'apoioEscuro', seed: 640, sombra: true, ry: 74 }); // a mesa
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 2 + ((i + 0.5) / 8) * Math.PI * 2, x = mx + Math.cos(a) * 190, y = my + Math.sin(a) * 136;
      const usuario = i < 4; // os quatro da esquerda
      E.circulo(ctx, x, y, 36, { papel: usuario ? 'destaque' : 'apoio', seed: 650 + i, sombra: false });
      G.ellipse(ctx, x, y - 6, 16, 17, { fill: i === 1 ? '#A86E4B' : PELE[i % PELE.length], stroke: cor('tinta'), lw: 2.5, seed: 670 + i });
    }
    texto(ctx, D('D15'), mx - 110, h - 26, { papel: 'titulo', size: 44 });
    [D('D16'), D('D17'), D('D18')].forEach((s, i) => texto(ctx, s, 476, my - 46 + i * 50, { size: 36, align: 'left' }));
    ctx.restore();
  }

  // 1986: a conferência (a multidão e a faixa, [03]); [04] o sistema único se separa da previdência;
  // [05] a comissão escreve a proposta, que sai voando para a direita, rumo à Constituição (o próximo marco)
  C.m1986 = (ctx, box, st, info) => {
    const { w, h } = box;
    const k4 = ap(info, 1, 0.6), k5 = ap(info, 2, 0.6);
    ctx.save(); ctx.globalAlpha *= 1 - Math.max(k4, k5);
    E.ret(ctx, 60, 36, w - 120, 100, { papel: 'apoio', r: 10, seed: 801, sombra: false }); // a faixa do palco
    texto(ctx, D('D06'), w / 2, 102, { papel: 'titulo', size: 38, cor: 'floresta' });
    E.ret(ctx, w / 2 - 22, 156, 44, 84, { papel: 'apoio', r: 6, seed: 802, sombra: false }); // o púlpito
    const kg = info.fase < 0 ? 0.35 : info.fase === 0 ? 0.35 + 0.65 * U.clamp(info.kf / 1.6, 0, 1) : 1;
    multidao(ctx, 40, 280, w - 80, 5, kg);
    const kb = ap(info, 0, 0.4, 1.4);
    if (kb > 0) { ctx.save(); ctx.translate(w - 170, 200); ctx.scale(kb, kb); E.ret(ctx, -140, -40, 280, 80, { papel: 'destaque', r: 34, seed: 803, sombra: true }); E.texto(ctx, D('D11'), 0, 14, { papel: 'numero', size: 42, align: 'center', cor: 'floresta' }); ctx.restore(); }
    ctx.restore();
    // [04] dois blocos que estavam grudados se separam: o sistema único (grande) e a previdência
    if (k4 > 0 && k5 < 1) {
      ctx.save(); ctx.globalAlpha *= k4 * (1 - k5);
      const sep = U.ease.inOutCubic(U.clamp((tf(info, 1) - 0.4) / 1.2, 0, 1));
      const cy = h / 2 + 10, xs = w / 2 - 70 - 80 * sep, xp = w / 2 + 170 + 80 * sep;
      E.circulo(ctx, xs, cy, 200, { papel: 'destaque', seed: 830, sombra: true });
      texto(ctx, D('D28'), xs, cy + 16, { papel: 'titulo', size: 50, cor: 'floresta' });
      E.ret(ctx, xp - 125, cy - 85, 250, 170, { papel: 'apoio', r: 12, seed: 831, sombra: false });
      texto(ctx, D('D34'), xp, cy + 14, { size: 40, cor: 'floresta' });
      if (sep > 0.15) E.linha(ctx, [[w / 2 + 45, cy - 170], [w / 2 + 45, cy + 170]], { lw: 5, seed: 832, tracejado: true, k: (sep - 0.15) / 0.85 });
      ctx.restore();
    }
    // [05] a comissão (três pessoas na mesa) escreve a proposta; a folha sai pela direita, rumo à Constituição
    if (k5 > 0) {
      ctx.save(); ctx.globalAlpha *= k5;
      const mesa = h - 170;
      for (let i = 0; i < 3; i++) pessoa(ctx, { x: 110 + i * 120, y: mesa + 34, s: 0.42, style: gente(i + 1, { outfit: 'shirt' }), pose: 'sit', seed: 840 + i, look: 0.5 });
      E.ret(ctx, 36, mesa, 430, 70, { papel: 'apoioEscuro', r: 6, seed: 845, sombra: false });
      texto(ctx, D('D32'), 250, h - 40, { papel: 'titulo', size: 46 });
      const kv = U.ease.inOutCubic(U.clamp((tf(info, 2) - 0.9) / 1.3, 0, 1));
      const x = U.lerp(250, w - 150, kv), y = U.lerp(mesa - 250, 110, kv);
      documento(ctx, x - 100, y - 70, 200, 150, D('D31'), { seed: 820, linhas: 2, tam: 36 });
      if (kv > 0) E.seta(ctx, [330, mesa - 190], [w - 60, 230], { curva: -0.2, k: kv });
      if (kv > 0.7) texto(ctx, D('D07'), w - 170, 300, { papel: 'titulo', size: 40, alpha: (kv - 0.7) / 0.3 });
      ctx.restore();
    }
  };

  // 1988: a Constituição ([06] art. 196); [07] qualquer pessoa, do mesmo jeito; [08] prevenção na frente; [09] Roraima vira estado
  C.m1988 = (ctx, box, st, info) => {
    const { w, h } = box;
    const k7 = ap(info, 1, 0.6), k8 = ap(info, 2, 0.6), k9 = ap(info, 3, 0.7);
    const lado = Math.max(k7, k8, k9); // o livro vai do centro para a esquerda quando as outras partes entram
    const bx = U.lerp(w / 2 - 160, 24, lado), by = U.lerp(56, 50, lado), bw = U.lerp(320, 190, lado), bh = U.lerp(430, 310, lado);
    E.ret(ctx, bx, by, bw, bh, { papel: 'apoioEscuro', r: 10, seed: 850, sombra: true });
    E.ret(ctx, bx + 16, by + 16, bw - 32, bh - 32, { papel: 'superficie', r: 6, seed: 851, sombra: false });
    if (lado < 0.5) { // o título na capa; com o livro pequeno, ele vira e sobe pela capa
      ctx.save(); ctx.globalAlpha *= 1 - 2 * lado;
      texto(ctx, D('D07'), bx + bw / 2, by + bh * 0.32, { papel: 'titulo', size: 46 });
      texto(ctx, '1988', bx + bw / 2, by + bh * 0.32 + 56, { papel: 'numero', size: 42 });
      ctx.restore();
    } else {
      ctx.save(); ctx.globalAlpha *= 2 * lado - 1; ctx.translate(bx + bw * 0.42, by + bh / 2); ctx.rotate(-Math.PI / 2);
      E.texto(ctx, D('D07'), 0, 0, { papel: 'titulo', size: 40, align: 'center' });
      E.texto(ctx, '1988', 0, 48, { papel: 'numero', size: 36, align: 'center' });
      ctx.restore();
    }
    const tab = (lbl, i, k) => { if (k <= 0) return; const ty = by + bh * (0.6 + 0.2 * i); ctx.save(); ctx.globalAlpha *= k; E.ret(ctx, bx + bw - 14, ty - 32, 170, 58, { papel: i ? 'apoio' : 'destaque', r: 8, seed: 860 + i, sombra: false }); texto(ctx, lbl, bx + bw + 71, ty + 10, { papel: 'numero', size: 36, cor: 'floresta' }); ctx.restore(); };
    tab(D('D12'), 0, ap(info, 0, 0.4, 0.6));
    tab(D('D13'), 1, k8);
    const px = 384, pw = w - px - 20;
    // [07] quatro pessoas diferentes, e cada uma ganha o mesmo visto
    if (k7 > 0 && k8 < 1) {
      ctx.save(); ctx.globalAlpha *= k7 * (1 - k8);
      for (let i = 0; i < 4; i++) {
        const x = px + 50 + (i * (pw - 100)) / 3;
        pessoa(ctx, { x, y: h - 60, s: 0.5, style: gente(i + 1, { outfit: 'tee' }), seed: 870 + i });
        const kv = U.ease.outBack(U.clamp((tf(info, 1) - 0.5 - 0.18 * i) / 0.35, 0, 1));
        if (kv > 0) { E.circulo(ctx, x, 150, 34 * kv, { papel: 'destaque', seed: 880 + i, sombra: false }); E.linha(ctx, [[x - 15, 150], [x - 3, 164], [x + 17, 136]], { lw: 7, seed: 890 + i }); }
      }
      ctx.restore();
    }
    // [08] a prevenção na frente (grande), o tratamento logo atrás (menor, mas presente)
    if (k8 > 0 && k9 < 1) {
      ctx.save(); ctx.globalAlpha *= k8 * (1 - k9);
      const cx1 = px + pw * 0.33, cx2 = px + pw * 0.84, cy = h / 2 - 10;
      E.poligono(ctx, [[cx1, cy - 140], [cx1 + 105, cy - 98], [cx1 + 92, cy + 46], [cx1, cy + 130], [cx1 - 92, cy + 46], [cx1 - 105, cy - 98]], { papel: 'destaque', seed: 900, sombra: true }); // o escudo
      E.linha(ctx, [[cx1 - 46, cy - 6], [cx1 - 10, cy + 34], [cx1 + 52, cy - 46]], { lw: 9, seed: 901 });
      texto(ctx, D('D26'), cx1, cy + 206, { papel: 'titulo', size: 44 });
      E.ret(ctx, cx2 - 24, cy - 70, 48, 140, { papel: 'apoio', r: 6, seed: 902, sombra: false }); E.ret(ctx, cx2 - 70, cy - 24, 140, 48, { papel: 'apoio', r: 6, seed: 903, sombra: false }); // a cruz
      texto(ctx, D('D27'), cx2, cy + 130, { size: 38 });
      texto(ctx, '1º', cx1, cy - 164, { papel: 'numero', size: 48 }); texto(ctx, '2º', cx2, cy - 96, { papel: 'numero', size: 40 });
      ctx.restore();
    }
    // [09] Roraima: de território federal a estado, na mesma Constituição
    if (k9 > 0) {
      ctx.save(); ctx.globalAlpha *= k9;
      mapaRR(ctx, { x: px + 10, y: 36, w: pw - 20, h: 330 });
      texto(ctx, D('D19'), px + pw / 2, 420, { papel: 'titulo', size: 48 });
      const [a, b] = D('D29').split(' → ');
      texto(ctx, b ? a : D('D29'), px + pw / 2, 466, { size: 36 });
      if (b) texto(ctx, '→ ' + b, px + pw / 2, 510, { size: 36 });
      ctx.restore();
    }
  };

  // 1990 (setembro): a Lei 8.080 ([10]: promove, protege, recupera); [11] o artigo da conferência e do conselho, vetado
  C.m1990a = (ctx, box, st, info) => {
    const { w, h } = box;
    const dx = 110, dy = 34, dw = w - 220, dh = h - 68;
    const ys = documento(ctx, dx, dy, dw, dh, D('D08'), { seed: 910, linhas: 5, tam: 50 });
    // três sinais: promover (o sol), proteger (o escudo), recuperar (a cruz)
    const k10 = ap(info, 0, 0.5, 0.8);
    if (k10 > 0 && info.fase < 1) {
      ctx.save(); ctx.globalAlpha *= k10;
      const yy = dy + dh - 110, xs = [dx + dw * 0.2, dx + dw * 0.5, dx + dw * 0.8];
      E.ret(ctx, dx + 20, yy - 80, dw - 40, 160, { papel: 'superficie', r: 10, seed: 919, sombra: false, contorno: false });
      E.objeto(ctx, 'sol', { x: xs[0], y: yy, r: 40, t: st.t });
      E.poligono(ctx, [[xs[1], yy - 64], [xs[1] + 56, yy - 42], [xs[1] + 48, yy + 22], [xs[1], yy + 62], [xs[1] - 48, yy + 22], [xs[1] - 56, yy - 42]], { papel: 'destaque', seed: 920, sombra: false });
      E.ret(ctx, xs[2] - 18, yy - 56, 36, 112, { papel: 'alerta', r: 4, seed: 921, sombra: false }); E.ret(ctx, xs[2] - 56, yy - 18, 112, 36, { papel: 'alerta', r: 4, seed: 922, sombra: false });
      ctx.restore();
    }
    // [11] o artigo da conferência e do conselho é riscado e carimbado
    const k11 = ap(info, 1, 0.3, 0.0);
    if (k11 > 0) {
      const ly = ys[2];
      E.ret(ctx, dx + 24, ly - 34, dw - 48, 68, { papel: 'apoio', r: 6, seed: 930, sombra: false });
      texto(ctx, D('D35'), dx + dw / 2, ly + 13, { size: 36, cor: 'floresta' });
      const kr = U.clamp((tf(info, 1) - 0.25) / 0.3, 0, 1);
      if (kr > 0) E.linha(ctx, [[dx + 30, ly], [dx + 30 + (dw - 60) * kr, ly - 4]], { papel: 'alerta', lw: 8, seed: 931 });
      E.carimbo(ctx, D('D14'), dx + dw * 0.62, ly + 120, { k: U.clamp((tf(info, 1) - 0.3) / 0.16, 0, 1), rot: -0.14, size: 64 });
    }
  };

  // 1990 (dezembro): a Lei 8.142 traz de volta a conferência e o conselho ([12]); [13] a cada 4 anos; [14] o conselho controla,
  // até o dinheiro; [15] os usuários valem tanto quanto os outros juntos (a balança)
  C.m1990b = (ctx, box, st, info) => {
    const { w, h } = box;
    const k13 = ap(info, 1, 0.5), k14 = ap(info, 2, 0.5), k15 = ap(info, 3, 0.6);
    const lado = Math.max(k13, k14, k15);
    const dw = U.lerp(w - 220, 300, lado), dx = U.lerp(110, -40, lado), dy = 34, dh = U.lerp(h - 68, 300, lado);
    ctx.save(); ctx.globalAlpha *= 1 - lado; // a lei sai de cena (o nome dela continua embaixo da linha)
    const ys = documento(ctx, dx, dy, dw, dh, D('D09'), { seed: 940, linhas: 5, tam: 50 });
    // [12] o artigo volta: entra pela esquerda (de onde vem a Lei 8.080) e assenta na folha
    const k12 = ap(info, 0, 0.9, 0.2);
    if (k12 > 0) {
      const ly = ys[2], x = U.lerp(-dw, dx + 20, k12);
      E.ret(ctx, x, ly - 32, dw - 40, 64, { papel: 'destaque', r: 6, seed: 950, sombra: false });
      texto(ctx, D('D35'), x + (dw - 40) / 2, ly + 12, { size: 36, cor: 'floresta' });
    }
    ctx.restore();
    const px = 30, pw = w - 60;
    // [13] quatro folhas de calendário; a quarta acende: a conferência
    if (k13 > 0 && k14 < 1) {
      ctx.save(); ctx.globalAlpha *= k13 * (1 - k14);
      for (let i = 0; i < 4; i++) {
        const x = px + i * (pw / 4) + 8, y = 120, on = i === 3 && tf(info, 1) > 0.9;
        E.ret(ctx, x, y, pw / 4 - 22, 170, { papel: on ? 'destaque' : 'superficie', r: 8, seed: 960 + i, sombra: true });
        E.ret(ctx, x, y, pw / 4 - 22, 38, { papel: 'apoioEscuro', r: 8, seed: 965 + i, sombra: false });
        texto(ctx, String(i + 1), x + (pw / 4 - 22) / 2, y + 128, { papel: 'numero', size: 60, cor: on ? 'floresta' : 'texto' });
      }
      texto(ctx, D('D20'), px + pw / 2, 390, { papel: 'titulo', size: 46 });
      ctx.restore();
    }
    // [14] a lupa do conselho sobre o dinheiro
    if (k14 > 0 && k15 < 1) {
      ctx.save(); ctx.globalAlpha *= k14 * (1 - k15);
      const mx = px + pw * 0.5, my = h / 2 + 20;
      for (let i = 0; i < 3; i++) E.circulo(ctx, mx + 70, my + 130 - i * 24, 60, { papel: 'destaque', seed: 970 + i, sombra: false, ry: 20 }); // a pilha de moedas
      texto(ctx, D('D33'), mx + 70, my + 92, { papel: 'numero', size: 44, cor: 'floresta' });
      const lx = U.lerp(mx - 120, mx + 40, U.clamp(tf(info, 2) / 1.4, 0, 1)), ly = my - 30;
      E.circulo(ctx, lx, ly, 82, { papel: 'apoio', seed: 975, sombra: true }); // a lente
      E.linha(ctx, [[lx + 58, ly + 58], [lx + 124, ly + 124]], { lw: 16, seed: 976 }); // o cabo
      texto(ctx, D('D30'), px + pw / 2, 84, { papel: 'titulo', size: 44 });
      ctx.restore();
    }
    // [15] a balança: os usuários de um lado, os outros três segmentos juntos do outro, e o braço reto
    if (k15 > 0) {
      ctx.save(); ctx.globalAlpha *= k15;
      const bx = px + pw / 2 - 30, by = 120, braco = 190;
      const inc = (1 - U.ease.outBack(U.clamp((tf(info, 3) - 0.3) / 1.0, 0, 1))) * 0.22; // começa torta e acerta
      E.poligono(ctx, [[bx - 56, h - 40], [bx + 56, h - 40], [bx, by]], { papel: 'apoioEscuro', seed: 980, sombra: false });
      const p1 = [bx - braco * Math.cos(inc), by - braco * Math.sin(inc)], p2 = [bx + braco * Math.cos(inc), by + braco * Math.sin(inc)];
      E.linha(ctx, [p1, p2], { lw: 9, seed: 981 });
      for (const [p, s2] of [[p1, -1], [p2, 1]]) {
        E.linha(ctx, [p, [p[0], p[1] + 96]], { lw: 3, seed: 982 + s2 });
        E.circulo(ctx, p[0], p[1] + 124, 96, { papel: s2 < 0 ? 'destaque' : 'apoio', seed: 984 + s2, sombra: false, ry: 26 });
        for (let i = 0; i < 3; i++) G.ellipse(ctx, p[0] - 52 + i * 52, p[1] + 90, 19, 20, { fill: PELE[(i + (s2 > 0 ? 2 : 0)) % 5], stroke: cor('tinta'), lw: 2.5, seed: 990 + i + s2 * 7 });
      }
      texto(ctx, D('D15'), p1[0], p1[1] + 214, { papel: 'titulo', size: 46 });
      [D('D16'), D('D17'), D('D18')].forEach((s, i) => texto(ctx, s, p2[0] + 20, p2[1] + 204 + i * 46, { size: 38 }));
      ctx.restore();
    }
  };
})();
