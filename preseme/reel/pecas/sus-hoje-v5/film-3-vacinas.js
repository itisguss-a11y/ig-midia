// versão 5, só para testar o motor; a peça de verdade está no chat dela
// PRESEME · "Quantas vezes você usou o SUS hoje?" · desenho 3/5 · braço (BCG), gotinha e agente
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, S = globalThis.SUS, SC = globalThis.SCORE;
  const { C, INK, L, R, GY, D, txt, hand } = S;

  // ---------- 07h20 · a marquinha da BCG no braço direito (vigilância epidemiológica, ainda sem nome) ----------
  S.LENTE.braco = [L + 330, 1085];
  S.CENA.braco = (ctx, st) => {
    S.chao(ctx);
    // o calouro, de frente: o braço direito dele fica do lado esquerdo da tela
    const px = R - 300, s = 1.25;
    Ch.person(ctx, { x: px, y: GY, pose: 'stand', s, eyes: 'normal', mouth: 'smile', look: -0.8, lookY: 0.3, style: S.CALOURO });
    G.ellipse(ctx, px - 92, GY - 384, 9, 8, { fill: C.peleClara, stroke: C.peleEscura, lw: 3, seed: 700 });
    // a lente sobre o braço (cabo para a esquerda): a marquinha de perto
    const [lx, ly] = S.LENTE.braco;
    S.lente(ctx, lx, ly, 205, (c) => {
      c.fillStyle = C.pele; c.fillRect(lx - 220, ly - 220, 440, 440);
      G.poly(c, [[lx - 230, ly - 230], [lx + 230, ly - 230], [lx + 230, ly - 100], [lx - 230, ly - 136]], { fill: C.salvia, stroke: INK, lw: 7, seed: 701 });
      G.line(c, [[lx - 230, ly - 156], [lx + 230, ly - 120]], { color: C.folha, lw: 8, seed: 702 });
      G.ellipse(c, lx - 6, ly - 22, 52, 44, { fill: C.peleClara, stroke: C.peleEscura, lw: 6, seed: 703 });
      G.ellipse(c, lx, ly - 24, 25, 20, { stroke: C.peleEscura, lw: 4, seed: 704 });
      // a etiqueta: para que serve a vacina
      const linhas = S.quebrar(c, D('D18'), 46, 300, 'Caveat', 700);
      if (linhas.length) {
        const h = 34 + linhas.length * 46;
        G.rrect(c, lx - 166, ly + 58, 332, h, 16, { fill: C.papel, stroke: INK, lw: 5, seed: 705 });
        linhas.forEach((l, i) => hand(c, l, lx, ly + 106 + i * 46, { size: 46, align: 'center' }));
      }
    }, { k: st.kLente, lado: -1 });
  };

  // ---------- na infância · a gotinha contra a paralisia infantil (vigilância epidemiológica, ainda sem nome) ----------
  S.LENTE.gotinha = [R - 215, 1085];
  S.CENA.gotinha = (ctx, st) => {
    S.chao(ctx);
    // o calouro quando era criança, de boca aberta
    const cx = L + 280, s = 0.84;
    Ch.person(ctx, { x: cx, y: GY, pose: 'stand', s, eyes: 'happy', mouth: 'open', lookY: -0.9, style: S.CRIANCA });
    // o braço de jaleco que segura o frasco
    const hx = cx + 6, hy = 930;
    G.line(ctx, [[-40, hy - 60], [hx - 34, hy]], { color: INK, lw: 84, seed: 721, amp: 0.6 });
    G.line(ctx, [[-40, hy - 60], [hx - 38, hy]], { color: C.branco, lw: 70, seed: 722, amp: 0.6 });
    G.ellipse(ctx, hx - 8, hy + 2, 38, 31, { fill: C.peleEscura, stroke: INK, lw: 5, seed: 723 });
    ctx.save(); ctx.translate(hx + 24, hy + 4); ctx.rotate(0.35);
    G.rrect(ctx, -22, -46, 44, 64, 12, { fill: C.branco, stroke: INK, lw: 5, seed: 724 });
    G.rrect(ctx, -22, -24, 44, 22, 0, { fill: C.coral, stroke: INK, lw: 3, seed: 725 });
    G.poly(ctx, [[-12, 18], [12, 18], [4, 44], [-4, 44]], { fill: C.branco, stroke: INK, lw: 4, seed: 726 });
    ctx.restore();
    // a gota cai do frasco até a boca, uma a cada duas batidas
    const p = (((st.t - st.c.t0) / (2 * SC.BEAT)) % 1 + 1) % 1, gy0 = hy + 62, gy1 = GY - 368 * s;
    ctx.save(); ctx.globalAlpha *= U.clamp((1 - p) / 0.15, 0, 1);
    G.ellipse(ctx, hx + 8, gy0 + (gy1 - gy0) * p * p, 9, 12, { fill: C.coral, stroke: INK, lw: 3, seed: 727 });
    ctx.restore();
    // a lente: o que a gotinha fez sumir
    const [lx, ly] = S.LENTE.gotinha;
    S.lente(ctx, lx, ly, 200, (c) => {
      G.rrect(c, lx - 134, ly - 150, 268, 216, 16, { fill: C.papel, stroke: null, lw: 0, seed: 731 });
      G.rrect(c, lx - 134, ly - 150, 268, 56, 12, { fill: C.coral, stroke: null, lw: 0, seed: 732 });
      for (const dx of [-72, 72]) G.rrect(c, lx + dx - 8, ly - 172, 16, 44, 8, { fill: C.papel, stroke: INK, lw: 3, seed: 733 + dx });
      txt(c, D('D19'), lx, ly + 30, { size: 96, align: 'center' });
      hand(c, D('D20'), lx, ly + 138, { size: 62, color: C.marca, align: 'center' });
    }, { k: st.kLente });
  };

  // ---------- 07h30 · o agente de combate às endemias e o mapa dos casos (vigilância epidemiológica; aqui ela ganha nome) ----------
  S.LENTE.agente = [R - 205, 1060];
  S.CENA.agente = (ctx, st) => {
    S.chao(ctx);
    const gy = GY;
    // muro e portão
    G.rrect(ctx, L - 90, gy - 290, 250, 290, 4, { fill: C.branco, stroke: INK, lw: 6, seed: 81, hatch: { color: 'rgba(23,64,44,0.16)', gap: 12 } });
    for (let i = 0; i < 5; i++) G.rrect(ctx, L + 176 + i * 46, gy - 320, 24, 320, 8, { fill: C.folha, stroke: INK, lw: 4, seed: 82 + i });
    G.line(ctx, [[L + 166, gy - 240], [L + 402, gy - 240]], { color: INK, lw: 8, seed: 88 });
    // vaso com pratinho
    const vx = R - 150;
    for (const [dx, dy] of [[-44, -230], [0, -275], [46, -225]]) G.poly(ctx, [[vx, gy - 112], [vx + dx - 24, gy + dy + 70], [vx + dx, gy + dy], [vx + dx + 24, gy + dy + 70]], { fill: C.folha, stroke: INK, lw: 5, seed: 93 + dx });
    G.poly(ctx, [[vx - 74, gy - 124], [vx + 74, gy - 124], [vx + 52, gy - 16], [vx - 52, gy - 16]], { fill: C.coral, stroke: INK, lw: 6, seed: 91 });
    G.rrect(ctx, vx - 98, gy - 20, 196, 24, 10, { fill: C.branco, stroke: INK, lw: 5, seed: 92 });
    // o agente, com a prancheta
    Ch.person(ctx, { x: L + 290, y: gy, pose: 'stand', s: 1.12, eyes: 'normal', mouth: 'smile', look: 0.6, handR: [L + 395, gy - 250], style: S.AGENTE });
    G.rrect(ctx, L + 372, gy - 322, 92, 124, 10, { fill: C.papel, stroke: INK, lw: 5, seed: 96 });
    G.rrect(ctx, L + 398, gy - 334, 40, 22, 6, { fill: C.folha, stroke: INK, lw: 3, seed: 97 });
    for (let i = 0; i < 3; i++) G.line(ctx, [[L + 388, gy - 284 + i * 28], [L + 448, gy - 284 + i * 28]], { color: INK, lw: 4, seed: 98 + i });
    // a lente sobre o vaso: o mapa, com um ponto por caso
    const [lx, ly] = S.LENTE.agente;
    S.lente(ctx, lx, ly, 200, (c) => {
      for (let i = -3; i <= 3; i++) { G.line(c, [[lx - 240, ly + i * 70 + 18], [lx + 240, ly + i * 70 - 10]], { color: C.folha, lw: 6, seed: 100 + i }); G.line(c, [[lx + i * 74 - 12, ly - 240], [lx + i * 74 + 12, ly + 240]], { color: C.folha, lw: 6, seed: 110 + i }); }
      const pts = [[-36, -40], [10, -68], [48, -30], [-8, 0], [36, 26], [-54, 30], [62, -76], [-96, -100], [120, 60], [-140, 96], [140, -130]];
      pts.forEach(([dx, dy], i) => G.ellipse(c, lx + dx, ly + dy, 14, 14, { fill: i < 7 ? C.coral : C.marca, stroke: null, lw: 0, seed: 120 + i }));
      G.ellipse(c, lx + 2, ly - 20, 108, 96, { stroke: C.marca, lw: 7, seed: 131 });
      hand(c, D('D21'), lx - 4, ly + 150, { size: 60, color: C.marca, align: 'center' });
    }, { k: st.kLente });
  };
})();
