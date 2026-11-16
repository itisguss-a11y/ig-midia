// versão 5, só para testar o motor; a peça de verdade está no chat dela
// PRESEME · "Quantas vezes você usou o SUS hoje?" · desenho 4/5 · lanche, sal e salgadinho (os três da vigilância sanitária, já com nome)
(function () {
  const G = globalThis.G, S = globalThis.SUS;
  const { C, INK, L, R, GY, HAT, D, txt, hand, wid } = S;

  // ---------- 10h00 · o lanche: a lupa preta do rótulo ----------
  S.LENTE.lanche = [R - 190, 1085];
  S.CENA.lanche = (ctx, st) => {
    S.chao(ctx);
    const gy = GY;
    // um biscoito solto na mesa
    G.ellipse(ctx, L + 60, gy - 20, 44, 22, { fill: C.miolo, stroke: INK, lw: 5, seed: 360 });
    G.ellipse(ctx, L + 60, gy - 26, 27, 11, { fill: C.branco, stroke: INK, lw: 3, seed: 370 });
    // o pacote
    const px = L + 150, pw = 330, ph = 470, py = gy - ph;
    G.rrect(ctx, px, py, pw, ph, 22, { fill: C.coral, stroke: INK, lw: 7, seed: 201, hatch: { color: 'rgba(7,38,24,0.10)', gap: 12 } });
    G.poly(ctx, [[px, py + 34], [px + pw, py + 34]], { stroke: INK, lw: 4, seed: 202, closed: false });
    G.poly(ctx, [[px, py + ph - 34], [px + pw, py + ph - 34]], { stroke: INK, lw: 4, seed: 203, closed: false });
    G.decor(() => { // dizeres impressos no objeto: a conferência de texto do motor (qa) não os julga
      txt(ctx, 'BISCOITO', px + pw / 2, py + 330, { size: 46, color: C.branco, align: 'center' });
      txt(ctx, 'RECHEADO', px + pw / 2, py + 384, { size: 46, color: C.branco, align: 'center' });
    });
    G.ellipse(ctx, px + pw / 2, py + 230, 62, 44, { fill: C.miolo, stroke: INK, lw: 5, seed: 204 });
    G.ellipse(ctx, px + pw / 2, py + 222, 40, 22, { fill: C.branco, stroke: INK, lw: 3, seed: 205 });
    // o aviso da frente do pacote, como é na vida real: lupa + ALTO EM
    const ax = px + 34, ay = py + 62, aw = 262, ah = 96;
    G.rrect(ctx, ax, ay, aw, ah, 12, { fill: C.branco, stroke: C.noite, lw: 5, seed: 206, amp: 0.6 });
    G.ellipse(ctx, ax + 40, ay + 42, 21, 21, { stroke: C.noite, lw: 8, seed: 207, amp: 0.5 });
    G.line(ctx, [[ax + 55, ay + 58], [ax + 72, ay + 78]], { color: C.noite, lw: 10, seed: 208, amp: 0.4 });
    G.rrect(ctx, ax + 84, ay + 8, aw - 92, 34, 6, { fill: C.noite, stroke: null, lw: 0, seed: 209, amp: 0.4 });
    G.rrect(ctx, ax + 84, ay + 48, aw - 92, 40, 6, { fill: C.noite, stroke: null, lw: 0, seed: 210, amp: 0.4 });
    G.decor(() => {
      txt(ctx, 'ALTO EM', ax + 84 + (aw - 92) / 2, ay + 34, { size: 25, color: C.branco, align: 'center' });
      txt(ctx, 'AÇÚCAR', ax + 84 + (aw - 92) / 2, ay + 70, { size: 20, color: C.branco, align: 'center' });
      txt(ctx, 'ADICIONADO', ax + 84 + (aw - 92) / 2, ay + 86, { size: 15, color: C.branco, align: 'center' });
    });
    // a nossa lente: a regra por trás do aviso (a barra que passa do limite)
    const [lx, ly] = S.LENTE.lanche;
    S.lente(ctx, lx, ly, 205, (c) => {
      G.line(c, [[lx - 150, ly + 96], [lx + 150, ly + 96]], { color: C.papel, lw: 6, seed: 221 });
      G.rrect(c, lx - 118, ly + 16, 62, 80, 6, { fill: C.salvia, stroke: null, lw: 0, seed: 222 });
      G.rrect(c, lx - 30, ly - 118, 62, 214, 6, { fill: C.coral, stroke: null, lw: 0, seed: 223 });
      G.rrect(c, lx + 58, ly + 40, 62, 56, 6, { fill: C.salvia, stroke: null, lw: 0, seed: 224 });
      c.save(); c.setLineDash([16, 12]); c.strokeStyle = C.marca; c.lineWidth = 7; c.beginPath(); c.moveTo(lx - 170, ly - 40); c.lineTo(lx + 170, ly - 40); c.stroke(); c.restore();
      hand(c, D('D22'), lx + 92, ly - 54, { size: 46, color: C.marca, align: 'center' });
      hand(c, D('D23'), lx + 2, ly + 146, { size: 46, color: C.papel, align: 'center' });
    }, { k: st.kLente });
  };

  // ---------- 12h00 · o sal da cozinha: iodo contra o bócio ----------
  S.LENTE.sal = [R - 215, 1080];
  S.CENA.sal = (ctx, st) => {
    S.chao(ctx);
    // o pacote de sal, com os dizeres do pacote de verdade
    const sx = L + 10, sw = 270, sh = 360, sy = GY - sh;
    G.rrect(ctx, sx, sy, sw, sh, 18, { fill: C.branco, stroke: INK, lw: 7, seed: 801, hatch: HAT });
    G.rrect(ctx, sx, sy + 46, sw, 150, 0, { fill: C.folha, stroke: INK, lw: 5, seed: 802 });
    G.rrect(ctx, sx + 54, sy + 268, sw - 108, 52, 26, { fill: C.marca, stroke: INK, lw: 4, seed: 803 });
    G.decor(() => {
      txt(ctx, 'SAL', sx + sw / 2, sy + 158, { size: 100, color: C.branco, align: 'center' });
      txt(ctx, 'REFINADO', sx + sw / 2, sy + 246, { size: 34, align: 'center' });
      txt(ctx, 'IODADO', sx + sw / 2, sy + 306, { size: 30, align: 'center' });
    });
    // o saleiro
    const hx = L + 410, hy = GY;
    G.poly(ctx, [[hx - 54, hy - 156], [hx + 54, hy - 156], [hx + 66, hy - 6], [hx - 66, hy - 6]], { fill: C.branco, stroke: INK, lw: 6, seed: 805 });
    G.poly(ctx, [[hx - 51, hy - 92], [hx + 51, hy - 92], [hx + 60, hy - 12], [hx - 60, hy - 12]], { fill: C.papel, stroke: null, lw: 0, seed: 806 });
    G.rrect(ctx, hx - 60, hy - 204, 120, 54, 22, { fill: C.salvia, stroke: INK, lw: 6, seed: 807 });
    for (const dx of [-24, 0, 24]) G.ellipse(ctx, hx + dx, hy - 178, 5, 5, { fill: INK, stroke: null, lw: 0, seed: 810 + dx });
    // a lente: o bócio, o papo no pescoço que a falta de iodo dá
    const [lx, ly] = S.LENTE.sal;
    S.lente(ctx, lx, ly, 200, (c) => {
      const x = lx - 46;
      G.rrect(c, x - 150, ly + 104, 300, 150, 60, { fill: C.marca, stroke: null, lw: 0, seed: 811 });
      G.rrect(c, x - 36, ly - 6, 72, 130, 22, { fill: C.pele, stroke: null, lw: 0, seed: 812 });
      G.ellipse(c, x, ly - 82, 80, 88, { fill: C.pele, stroke: null, lw: 0, seed: 813 });
      G.poly(c, [[x - 84, ly - 92], [x - 62, ly - 166], [x + 8, ly - 180], [x + 70, ly - 156], [x + 84, ly - 96], [x + 44, ly - 132], [x - 30, ly - 126]], { fill: C.cabelo, stroke: null, lw: 0, seed: 814 });
      for (const dx of [-28, 28]) G.ellipse(c, x + dx, ly - 78, 7, 9, { fill: C.noite, stroke: null, lw: 0, seed: 815 + dx });
      G.line(c, [[x - 15, ly - 38], [x, ly - 32], [x + 15, ly - 38]], { color: C.noite, lw: 5, seed: 817 });
      G.ellipse(c, x, ly + 62, 62, 46, { fill: C.peleClara, stroke: C.coral, lw: 6, seed: 818 });
      // a seta e o nome
      G.line(c, [[lx + 128, ly + 6], [x + 74, ly + 50]], { color: C.marca, lw: 7, seed: 819 });
      G.line(c, [[x + 100, ly + 22], [x + 74, ly + 50], [x + 110, ly + 52]], { color: C.marca, lw: 7, seed: 820 });
      hand(c, D('D24'), lx + 112, ly - 12, { size: 60, color: C.marca, align: 'center' });
    }, { k: st.kLente });
  };

  // ---------- 16h00 · o salgadinho: a gordura trans que saiu ----------
  S.LENTE.salgadinho = [R - 215, 1085];
  S.CENA.salgadinho = (ctx, st) => {
    S.chao(ctx);
    // o pacote
    const bx = L + 100, bw = 320, bh = 440, by = GY - bh - 4;
    G.rrect(ctx, bx, by, bw, bh, 26, { fill: C.marca, stroke: INK, lw: 7, seed: 901, hatch: HAT });
    G.line(ctx, [[bx, by + 38], [bx + bw, by + 38]], { color: INK, lw: 4, seed: 902 });
    G.line(ctx, [[bx, by + bh - 38], [bx + bw, by + bh - 38]], { color: INK, lw: 4, seed: 903 });
    for (let i = 1; i < 10; i++) { G.line(ctx, [[bx + i * 32, by + 6], [bx + i * 32, by + 32]], { color: INK, lw: 3, seed: 904 + i }); G.line(ctx, [[bx + i * 32, by + bh - 32], [bx + i * 32, by + bh - 6]], { color: INK, lw: 3, seed: 920 + i }); }
    G.ellipse(ctx, bx + bw / 2, by + 176, 108, 84, { fill: C.branco, stroke: INK, lw: 5, seed: 940 });
    const tri = (x, y, a, seed) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); G.poly(ctx, [[-30, 22], [30, 22], [0, -30]], { fill: C.miolo, stroke: INK, lw: 4, seed }); ctx.restore(); };
    tri(bx + bw / 2 - 40, by + 168, 0.3, 941); tri(bx + bw / 2 + 30, by + 150, -0.5, 942); tri(bx + bw / 2 + 4, by + 206, 2.2, 943);
    G.decor(() => {
      txt(ctx, 'SALGADINHO', bx + bw / 2, by + 330, { size: 40, align: 'center' });
      hand(ctx, 'sabor queijo', bx + bw / 2, by + 378, { size: 44, align: 'center' });
    });
    // dois soltos na mesa
    tri(L + 40, GY - 22, 0.2, 944); tri(L + 470, GY - 22, -0.3, 945);
    // a lente: a lista de ingredientes, com a gordura trans riscada
    const [lx, ly] = S.LENTE.salgadinho;
    S.lente(ctx, lx, ly, 200, (c) => {
      G.rrect(c, lx - 146, ly - 140, 292, 204, 14, { fill: C.papel, stroke: null, lw: 0, seed: 951 });
      hand(c, 'ingredientes', lx - 122, ly - 90, { size: 48 });
      G.line(c, [[lx - 122, ly - 60], [lx + 96, ly - 60]], { color: INK, lw: 5, seed: 952 });
      G.line(c, [[lx - 122, ly - 30], [lx + 44, ly - 30]], { color: INK, lw: 5, seed: 953 });
      txt(c, D('D25'), lx - 122, ly + 30, { size: 36, weight: 700 });
      if (D('D25')) G.line(c, [[lx - 132, ly + 20], [lx - 112 + wid(c, D('D25'), 36, 'Inter', 700), ly + 16]], { color: C.coral, lw: 9, seed: 954 });
      hand(c, D('D26'), lx, ly + 136, { size: 62, color: C.marca, align: 'center' });
    }, { k: st.kLente });
  };
})();
