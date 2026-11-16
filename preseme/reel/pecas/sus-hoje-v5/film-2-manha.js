// versão 5, só para testar o motor; a peça de verdade está no chat dela
// PRESEME · "Quantas vezes você usou o SUS hoje?" · desenho 2/5 · abertura, água, pão e remédio
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, S = globalThis.SUS, TX = globalThis.TEXTOS;
  const { C, INK, L, R, TOP, CX, GY, HAT, D, txt, hand, wid } = S;

  // ---------- abertura: a pergunta [01], a resposta do calouro [02] e a tese [03] ----------
  S.CENA.abertura = (ctx, st) => {
    const t = st.t, f2 = st.c.itens.find((i) => i.n === 2), f3 = st.c.itens.find((i) => i.n === 3);
    const fala = f2 && t >= f2.t0, tese = f3 && t >= f3.t0;
    if (tese) S.titulo(ctx, 3, U.clamp((t - f3.t0) / 0.2, 0, 1)); else S.titulo(ctx, 1, 1);
    S.chao(ctx);
    // o primeiro segundo já tem movimento: o calouro entra pela esquerda (0,5 s) e o contador dá um pulo (aos 0,55 s)
    const u = t - st.c.t0;
    S.contador(ctx, 0, CX + 200, 1100, 1.2, U.pulse(u, 0.55, 7));
    Ch.person(ctx, { x: L + 200 - (1 - U.ease.outCubic(U.clamp(u / 0.5, 0, 1))) * 340, y: GY, pose: 'stand', s: 1.15, eyes: 'normal', mouth: 'smirk', gesture: fala ? 'shrug' : null, style: S.CALOURO });
    if (fala) {
      // cada frase da resposta numa linha; linha larga demais se quebra
      const partes = (TX[2].match(/[^.!?]+[.!?]*/g) || [TX[2]]).map((s) => s.trim()).filter(Boolean);
      const linhas = [].concat(...partes.map((s) => S.quebrar(ctx, s, 44, 470, 'Inter', 700)));
      ctx.save(); ctx.globalAlpha *= U.clamp((t - f2.t0) / 0.15, 0, 1);
      S.balao(ctx, linhas, L + 6, 804 - linhas.length * 57.2, L + 225, 872, 44);
      ctx.restore();
    }
    if (tese) {
      // a lente aparece pela primeira vez: é com ela que o filme vai olhar o dia
      const k = U.tween(t, f3.t0, f3.t0 + 0.45, 0, 1, U.ease.outBack);
      ctx.save(); ctx.translate(R + 6 + (1 - k) * 260, 1338 + (1 - k) * 260); ctx.rotate(-0.25);
      S.lente(ctx, 0, 0, 62, (c) => { G.line(c, [[-34, 12], [-10, 32], [36, -24]], { color: C.marca, lw: 10, seed: 3 }); });
      ctx.restore();
    }
  };

  // ---------- 06h10 · a água da torneira (vigilância ambiental) ----------
  S.LENTE.agua = [L + 610, 1120];
  S.CENA.agua = (ctx, st) => {
    S.chao(ctx);
    const hat = { color: 'rgba(23,64,44,0.18)', gap: 10 };
    // torneira
    G.rrect(ctx, L + 30, 990, 72, GY - 990, 22, { fill: C.branco, stroke: INK, lw: 6, seed: 51, hatch: hat });
    G.rrect(ctx, L + 30, 975, 330, 72, 30, { fill: C.branco, stroke: INK, lw: 6, seed: 52, hatch: hat });
    G.rrect(ctx, L + 290, 1010, 70, 84, 16, { fill: C.branco, stroke: INK, lw: 6, seed: 53, hatch: hat });
    G.rrect(ctx, L + 96, 940, 90, 40, 12, { fill: C.folha, stroke: INK, lw: 5, seed: 57 });
    // copo
    const gx = L + 325, gy = GY - 4;
    G.line(ctx, [[gx, 1098], [gx, 1250]], { color: C.salvia, lw: 24, seed: 54, amp: 2 });
    G.poly(ctx, [[gx - 128, gy - 250], [gx + 128, gy - 250], [gx + 98, gy], [gx - 98, gy]], { fill: C.branco, stroke: INK, lw: 7, seed: 55 });
    G.poly(ctx, [[gx - 116, gy - 160], [gx + 116, gy - 160], [gx + 91, gy - 9], [gx - 91, gy - 9]], { fill: C.salvia, stroke: null, lw: 0, seed: 56 });
    // a lente sobre o copo: o tubo de ensaio e a lista conferida
    const [lx, ly] = S.LENTE.agua;
    S.lente(ctx, lx, ly, 225, (c) => {
      c.save(); c.translate(lx - 78, ly + 4); c.rotate(-0.3);
      G.rrect(c, -37, -153, 74, 276, 37, { fill: C.papel, stroke: null, lw: 0, seed: 60 }); G.rrect(c, -30, -146, 60, 262, 30, { fill: C.folha, stroke: null, lw: 0, seed: 61 });
      G.rrect(c, -27, -10, 54, 122, 27, { fill: C.marca, stroke: null, lw: 0, seed: 62 });
      G.line(c, [[-46, -150], [46, -150]], { color: C.papel, lw: 9, seed: 63 });
      c.restore();
      G.rrect(c, lx + 22, ly - 128, 150, 200, 14, { fill: C.papel, stroke: C.papel, lw: 4, seed: 64 });
      G.rrect(c, lx + 64, ly - 144, 66, 30, 8, { fill: C.folha, stroke: null, lw: 0, seed: 65 });
      for (let i = 0; i < 3; i++) {
        const yy = ly - 74 + i * 50;
        G.line(c, [[lx + 40, yy], [lx + 54, yy + 14], [lx + 78, yy - 16]], { color: C.folha, lw: 8, seed: 66 + i });
        G.line(c, [[lx + 94, yy], [lx + 154, yy]], { color: INK, lw: 6, seed: 70 + i });
      }
      hand(c, D('D14'), lx - 10, ly + 168, { size: 58, color: C.marca, align: 'center' });
    }, { k: st.kLente });
  };

  // ---------- 06h30 · o pão: ferro e ácido fólico na farinha (vigilância sanitária, ainda sem nome) ----------
  S.LENTE.pao = [R - 215, 1080];
  S.CENA.pao = (ctx, st) => {
    S.chao(ctx);
    // o pacote de farinha, com os dizeres do pacote de verdade
    const fx = L + 6, fw = 250, fh = 410, fy = GY - fh;
    G.rrect(ctx, fx, fy, fw, fh, 14, { fill: C.branco, stroke: INK, lw: 7, seed: 501, hatch: HAT });
    G.line(ctx, [[fx, fy + 44], [fx + fw, fy + 44]], { color: INK, lw: 4, seed: 502 });
    G.rrect(ctx, fx + 20, fy + 86, fw - 40, 150, 10, { fill: C.marca, stroke: INK, lw: 4, seed: 503 });
    G.decor(() => { // dizeres impressos no objeto: a conferência de texto do motor (qa) não os julga
      txt(ctx, 'FARINHA', fx + fw / 2, fy + 150, { size: 42, align: 'center' });
      txt(ctx, 'DE TRIGO', fx + fw / 2, fy + 204, { size: 42, align: 'center' });
      txt(ctx, 'enriquecida com ferro', fx + fw / 2, fy + 284, { size: 20, weight: 700, align: 'center' });
      txt(ctx, 'e ácido fólico', fx + fw / 2, fy + 310, { size: 20, weight: 700, align: 'center' });
      txt(ctx, '1 kg', fx + fw / 2, fy + 372, { size: 28, align: 'center' });
    });
    // o prato e o pão francês
    const px = L + 440, py = GY - 14;
    G.ellipse(ctx, px, py, 190, 30, { fill: C.branco, stroke: INK, lw: 6, seed: 505 });
    G.ellipse(ctx, px, py - 80, 150, 72, { fill: C.miolo, stroke: INK, lw: 7, seed: 506, hatch: { color: 'rgba(7,38,24,0.12)', gap: 12 } });
    for (let i = -1; i <= 1; i++) G.line(ctx, [[px + i * 72 - 20, py - 122], [px + i * 72 + 20, py - 62]], { color: INK, lw: 6, seed: 508 + i });
    // a lente sobre o pão: o que foi posto na farinha
    const [lx, ly] = S.LENTE.pao;
    S.lente(ctx, lx, ly, 200, (c) => {
      const graos = [[-96, -100, 0.5], [44, -124, -0.4], [-14, -44, 0.2], [108, -50, 0.7], [-124, -6, -0.6]];
      graos.forEach(([dx, dy, a], i) => {
        c.save(); c.translate(lx + dx, ly + dy); c.rotate(a);
        G.ellipse(c, 0, 0, 24, 40, { fill: C.papel, stroke: null, lw: 0, seed: 510 + i });
        G.line(c, [[0, -28], [0, 28]], { color: C.miolo, lw: 4, seed: 520 + i });
        c.restore();
        G.ellipse(c, lx + dx + 16, ly + dy - 12, 12, 12, { fill: i % 2 ? C.coral : C.marca, stroke: null, lw: 0, seed: 530 + i });
      });
      G.ellipse(c, lx - 112, ly + 70, 13, 13, { fill: C.marca, stroke: null, lw: 0, seed: 541 });
      hand(c, D('D15'), lx - 86, ly + 88, { size: 56, color: C.marca });
      G.ellipse(c, lx - 112, ly + 128, 13, 13, { fill: C.coral, stroke: null, lw: 0, seed: 542 });
      hand(c, D('D16'), lx - 86, ly + 146, { size: 56, color: C.papel });
    }, { k: st.kLente });
  };

  // ---------- 07h00 · a caixa do remédio: Reg. MS (vigilância sanitária; aqui ela ganha nome) ----------
  S.LENTE.remedio = [R - 235, 1090];
  S.CENA.remedio = (ctx, st) => {
    S.chao(ctx);
    const bx = L + 10, bw = 520, bh = 330, by = GY - bh - 6;
    // a caixa, com tampa e lateral
    G.poly(ctx, [[bx + bw, by], [bx + bw + 44, by - 32], [bx + bw + 44, by + bh - 32], [bx + bw, by + bh]], { fill: C.salvia, stroke: INK, lw: 6, seed: 601 });
    G.poly(ctx, [[bx, by], [bx + 44, by - 32], [bx + bw + 44, by - 32], [bx + bw, by]], { fill: C.branco, stroke: INK, lw: 6, seed: 602 });
    G.rrect(ctx, bx, by, bw, bh, 6, { fill: C.branco, stroke: INK, lw: 7, seed: 603 });
    G.rrect(ctx, bx, by, bw, 62, 4, { fill: C.folha, stroke: INK, lw: 5, seed: 604 });
    G.decor(() => {
      txt(ctx, 'ANALGÉSICO', bx + 26, by + 176, { size: 56 });
      txt(ctx, '500 mg', bx + 26, by + 228, { size: 38, weight: 700 });
      txt(ctx, '20 comprimidos · uso oral · uso adulto', bx + 26, by + 268, { size: 20, weight: 700 });
    });
    G.rrect(ctx, bx + 26, by + 286, 96, 24, 12, { fill: C.coral, stroke: INK, lw: 3, seed: 605 });
    // o registro impresso na caixa, no canto de cima
    G.rrect(ctx, bx + bw - 262, by + 80, 248, 44, 8, { fill: C.branco, stroke: INK, lw: 3, seed: 606 });
    G.decor(() => txt(ctx, 'Reg. MS 1.0000.0000', bx + bw - 250, by + 111, { size: 22, weight: 700 }));
    // a lente sobre o registro
    const [lx, ly] = S.LENTE.remedio;
    S.lente(ctx, lx, ly, 200, (c) => {
      txt(c, 'Reg. MS', lx, ly - 64, { size: 78, color: C.papel, align: 'center' });
      txt(c, '1.0000.0000', lx, ly - 14, { size: 34, color: C.salvia, align: 'center', weight: 700 });
      c.save(); c.translate(lx, ly + 92); c.rotate(-0.1);
      G.rrect(c, -158, -46, 316, 92, 14, { stroke: C.marca, lw: 7, seed: 611 });
      G.line(c, [[-128, 2], [-110, 22], [-80, -22]], { color: C.marca, lw: 10, seed: 612 });
      hand(c, D('D17'), 28, 20, { size: 60, color: C.marca, align: 'center' });
      c.restore();
    }, { k: st.kLente });
  };
})();
