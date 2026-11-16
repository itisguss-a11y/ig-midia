// PRESEME · exemplo-minimo · desenho 2 · as três cenas de teste (formas simples, nas cores da paleta). Não vai ao ar.
// abertura: um círculo de marca-texto que pulsa no fundo Floresta; meio: um carro que atravessa a rua da esquerda para
// a direita (o som do carro anda junto, mapa-do-som.json); fecho: um visto que se desenha.
(function () {
  const G = globalThis.G, U = globalThis.U, P = globalThis.PRESEME;
  const { C, INK, L, R, CX, TOP, BOT, W, H } = P;
  const CHAO = 1400;

  P.CENA.abertura = (ctx, st) => {
    ctx.fillStyle = C.floresta; ctx.fillRect(0, 0, W, H);
    const r = 230 * (1 + 0.06 * Math.sin(st.u * Math.PI * 6)) * U.ease.outBack(U.clamp(st.u * 4, 0, 1));
    G.ellipse(ctx, CX, 1060, r, r, { fill: C.marca, stroke: C.folha, lw: 10, seed: 3 });
    P.hand(ctx, P.D('D01'), CX, 1080, { size: 96, align: 'center' });
    P.titulo(ctx, st.it.n, { cor: C.papel });
  };

  P.CENA.meio = (ctx, st) => {
    ctx.fillStyle = C.papel; ctx.fillRect(0, 0, W, H);
    G.poly(ctx, [[-60, CHAO], [W + 60, CHAO], [W + 60, H + 60], [-60, H + 60]], { fill: C.salvia, stroke: null, lw: 0, seed: 6, hatch: { color: 'rgba(23,64,44,0.13)', gap: 13 } });
    G.line(ctx, [[-60, CHAO], [W + 60, CHAO]], { color: INK, lw: 8, seed: 5 });
    // o carro atravessa a tela durante a cena (o som "carroPassando" anda de -0,9 a 0,9 no mesmo tempo)
    const x = U.lerp(-260, W + 260, U.clamp((st.t - st.c.t0 - 0.4) / 4.0, 0, 1));
    G.rrect(ctx, x - 190, CHAO - 210, 380, 150, 40, { fill: C.coral, stroke: INK, lw: 7, seed: 11 });
    G.rrect(ctx, x - 110, CHAO - 290, 220, 100, 30, { fill: C.coral, stroke: INK, lw: 7, seed: 12 });
    G.rrect(ctx, x - 90, CHAO - 272, 80, 66, 12, { fill: C.branco, stroke: INK, lw: 4, seed: 13 });
    G.rrect(ctx, x + 10, CHAO - 272, 80, 66, 12, { fill: C.branco, stroke: INK, lw: 4, seed: 14 });
    for (const dx of [-110, 110]) G.ellipse(ctx, x + dx, CHAO - 50, 48, 48, { fill: C.noite, stroke: INK, lw: 5, seed: 15 + dx });
    P.bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  };

  P.CENA.fecho = (ctx, st) => {
    ctx.fillStyle = C.papel; ctx.fillRect(0, 0, W, H);
    const k = U.ease.outCubic(U.clamp((st.t - st.c.t0) / 1.2, 0, 1));
    const pts = [[CX - 200, 1080], [CX - 60, 1220], [CX + 230, 900]];
    const seg = k < 0.4 ? [pts[0], [U.lerp(pts[0][0], pts[1][0], k / 0.4), U.lerp(pts[0][1], pts[1][1], k / 0.4)]]
      : [pts[0], pts[1], [U.lerp(pts[1][0], pts[2][0], (k - 0.4) / 0.6), U.lerp(pts[1][1], pts[2][1], (k - 0.4) / 0.6)]];
    G.line(ctx, seg, { color: C.folha, lw: 46, seed: 21 });
    P.titulo(ctx, st.it.n);
  };
})();
